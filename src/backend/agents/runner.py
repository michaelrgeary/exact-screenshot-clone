"""
Agent Runner - The core of the TAC pattern: One agent, one prompt, one task, one output.

The Agent Runner:
1. Loads an agent's prompt file
2. Gives the agent memory tools (read/write database)
3. Runs the agent to completion
4. The agent handles its own input/output via memory tools

Usage:
    from agents.runner import run_agent

    # Run a single agent
    result = await run_agent(
        agent_name="tactic_extractor",
        phase=2,
        project_id="uuid",
        chapter_id="uuid",  # Optional, for chapter-level agents
    )
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
import anthropic

from ..config import config
from .memory_tools import MEMORY_TOOLS, execute_tool


# =============================================================================
# AGENT DEFINITION
# =============================================================================


@dataclass
class AgentDefinition:
    """Definition of an agent loaded from a prompt file."""
    name: str
    phase: int
    purpose: str
    system_prompt: str
    input_description: str
    output_description: str
    saves_to: str
    validation_checks: List[str]
    depends_on: List[str]
    prompt_file: str


@dataclass
class AgentResult:
    """Result of running an agent."""
    success: bool
    agent_name: str
    output: Optional[str] = None
    error: Optional[str] = None
    duration_ms: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    tool_calls: int = 0


# =============================================================================
# PROMPT LOADER
# =============================================================================


# Phase number to directory name mapping
PHASE_DIRECTORIES = {
    1: "phase_01_prep",
    2: "phase_02_analysis",
    3: "phase_03_transform",
    4: "phase_04_writing",
    5: "phase_05_visual",
    6: "phase_06_editing",
    7: "phase_07_quality",
    8: "phase_08_translation_prep",
    9: "phase_09_translation",
    10: "phase_10_assembly",
    11: "phase_11_output",
}


def load_agent_definition(agent_name: str, phase: int) -> AgentDefinition:
    """
    Load an agent definition from its prompt file.

    Args:
        agent_name: Name of the agent (e.g., "tactic_extractor")
        phase: Phase number (1-11)

    Returns:
        AgentDefinition with all agent info
    """
    # Get the directory for this phase
    phase_dir = PHASE_DIRECTORIES.get(phase)
    if not phase_dir:
        raise ValueError(f"Invalid phase number: {phase}. Must be 1-11.")

    # Look for the prompt file
    prompt_file = Path(f"prompts/{phase_dir}/{agent_name}.md")

    if not prompt_file.exists():
        raise FileNotFoundError(
            f"Prompt file not found for agent: {agent_name} "
            f"(expected at {prompt_file})"
        )

    content = prompt_file.read_text()

    # Parse the prompt file
    purpose = _extract_section(content, "## Purpose", "##")
    input_desc = _extract_section(content, "## Input", "##")
    output_desc = _extract_section(content, "## Output", "##")
    system_prompt = _extract_system_prompt(content)
    saves_to = _extract_saves_to(content)
    validation = _extract_validation(content)
    depends_on = _extract_dependencies(content)

    return AgentDefinition(
        name=agent_name,
        phase=phase,
        purpose=purpose.strip(),
        system_prompt=system_prompt,
        input_description=input_desc.strip(),
        output_description=output_desc.strip(),
        saves_to=saves_to,
        validation_checks=validation,
        depends_on=depends_on,
        prompt_file=str(prompt_file),
    )


def _extract_section(content: str, start_marker: str, end_marker: str) -> str:
    """Extract a section from markdown content."""
    if start_marker not in content:
        return ""
    start = content.index(start_marker) + len(start_marker)
    # Find next section or end
    remaining = content[start:]
    end = len(remaining)
    for marker in ["## ", "---"]:
        if marker in remaining:
            pos = remaining.index(marker)
            if pos < end:
                end = pos
    return remaining[:end].strip()


def _extract_system_prompt(content: str) -> str:
    """Extract the system prompt from markdown content."""
    if "## System Prompt" not in content:
        return ""

    start = content.index("## System Prompt")
    section = content[start:]

    # Find content between ``` blocks
    if "```" not in section:
        return ""

    first_fence = section.index("```")
    # Skip the language identifier if present (e.g., ```python)
    newline = section.index("\n", first_fence)
    second_fence = section.index("```", newline)

    return section[newline + 1:second_fence].strip()


def _extract_saves_to(content: str) -> str:
    """Extract the 'Saves to' information."""
    for line in content.split("\n"):
        if "**Saves to**:" in line or "Saves to:" in line:
            return line.split(":", 1)[1].strip()
    return ""


def _extract_validation(content: str) -> List[str]:
    """Extract validation checks."""
    checks = []
    in_validation = False
    for line in content.split("\n"):
        if "## Validation" in line:
            in_validation = True
            continue
        if in_validation:
            if line.startswith("##"):
                break
            if "- [ ]" in line or "- [x]" in line:
                check = line.replace("- [ ]", "").replace("- [x]", "").strip()
                if check:
                    checks.append(check)
    return checks


def _extract_dependencies(content: str) -> List[str]:
    """Extract dependencies."""
    deps = []
    if "## Dependencies" in content:
        start = content.index("## Dependencies")
        section = content[start:start + 500]
        for line in section.split("\n"):
            if "**Needs**:" in line:
                deps_text = line.split(":", 1)[1].strip()
                deps = [d.strip() for d in deps_text.split(",")]
    return deps


# =============================================================================
# AGENT RUNNER
# =============================================================================


class AgentRunner:
    """
    Runs a single agent with memory tools.

    The agent:
    1. Reads its learnings
    2. Reads its input from memory
    3. Performs its task
    4. Writes its output to memory
    """

    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        if config is None:
            raise RuntimeError("Config not initialized")
        self.client = anthropic.Anthropic(api_key=config.claude_api_key)
        self.model = model

    def run(
        self,
        agent_def: AgentDefinition,
        project_id: str,
        chapter_id: Optional[str] = None,
        additional_context: Optional[str] = None,
    ) -> AgentResult:
        """
        Run an agent to completion.

        Args:
            agent_def: The agent definition
            project_id: Project ID for memory operations
            chapter_id: Optional chapter ID for chapter-level agents
            additional_context: Optional additional context to include

        Returns:
            AgentResult with success status and output
        """
        start_time = time.time()
        tool_calls = 0
        input_tokens = 0
        output_tokens = 0

        # Build the initial message
        initial_message = self._build_initial_message(
            agent_def, project_id, chapter_id, additional_context
        )

        # Build the full system prompt
        system_prompt = self._build_system_prompt(agent_def, project_id, chapter_id)

        messages = [{"role": "user", "content": initial_message}]

        try:
            # Run the agent loop
            while True:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=8192,
                    system=system_prompt,
                    tools=MEMORY_TOOLS,
                    messages=messages,
                )

                # Track usage
                if hasattr(response, "usage"):
                    input_tokens += response.usage.input_tokens
                    output_tokens += response.usage.output_tokens

                # Process the response
                assistant_content = []
                final_text = ""

                for block in response.content:
                    if block.type == "text":
                        final_text = block.text
                        assistant_content.append({
                            "type": "text",
                            "text": block.text
                        })
                    elif block.type == "tool_use":
                        tool_calls += 1
                        assistant_content.append({
                            "type": "tool_use",
                            "id": block.id,
                            "name": block.name,
                            "input": block.input
                        })

                # Add assistant message
                messages.append({"role": "assistant", "content": assistant_content})

                # If there are tool calls, execute them
                tool_uses = [b for b in response.content if b.type == "tool_use"]
                if tool_uses:
                    tool_results = []
                    for tool_use in tool_uses:
                        result = execute_tool(tool_use.name, tool_use.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": tool_use.id,
                            "content": result
                        })
                    messages.append({"role": "user", "content": tool_results})
                else:
                    # No more tool calls, agent is done
                    break

                # Safety limit
                if tool_calls > 100:
                    return AgentResult(
                        success=False,
                        agent_name=agent_def.name,
                        error="Too many tool calls (>100)",
                        duration_ms=int((time.time() - start_time) * 1000),
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        tool_calls=tool_calls,
                    )

            duration_ms = int((time.time() - start_time) * 1000)

            return AgentResult(
                success=True,
                agent_name=agent_def.name,
                output=final_text,
                duration_ms=duration_ms,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                tool_calls=tool_calls,
            )

        except Exception as e:
            return AgentResult(
                success=False,
                agent_name=agent_def.name,
                error=str(e),
                duration_ms=int((time.time() - start_time) * 1000),
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                tool_calls=tool_calls,
            )

    def _build_system_prompt(
        self,
        agent_def: AgentDefinition,
        project_id: str,
        chapter_id: Optional[str],
    ) -> str:
        """Build the full system prompt for the agent."""
        return f"""
{agent_def.system_prompt}

## Memory Tools Available
You have access to memory tools to read your input and write your output:

READ TOOLS:
- memory_read_project: Read project data
- memory_read_chapter: Read a chapter's data
- memory_read_chapters: Read all chapters for a project
- memory_read_book_context: Read book context (style_guide, structure, raw_markdown)
- memory_read_tactics: Read tactics
- memory_read_glossary: Read glossary
- memory_read_learnings: Read your learnings files

WRITE TOOLS:
- memory_write_chapter: Update chapter data
- memory_write_book_context: Save book context
- memory_write_tactic: Save a tactic
- memory_write_tactics_batch: Save multiple tactics
- memory_write_glossary_term: Save a glossary term
- memory_log_decision: Log a decision you made
- memory_flag_issue: Flag an issue you found
- memory_append_learnings: Add a new learning

## Context
- Project ID: {project_id}
- Chapter ID: {chapter_id or 'N/A (project-level agent)'}

## Instructions
1. FIRST, use memory_read_learnings to read your learnings file
2. Then, use the appropriate read tools to get your input data
3. Perform your task as described in your system prompt
4. Use write tools to save your output to memory
5. If you learn something valuable, use memory_append_learnings to save it
6. End with a brief summary of what you accomplished
"""

    def _build_initial_message(
        self,
        agent_def: AgentDefinition,
        project_id: str,
        chapter_id: Optional[str],
        additional_context: Optional[str],
    ) -> str:
        """Build the initial user message to start the agent."""
        msg = f"""You are the {agent_def.name} agent.

Your purpose: {agent_def.purpose}

Your task:
1. Read your learnings using memory_read_learnings
2. Read your input data from memory using the appropriate read tools
3. Perform your analysis/transformation
4. Write your output using the appropriate write tools
5. Summarize what you did

Project ID: {project_id}
"""
        if chapter_id:
            msg += f"Chapter ID: {chapter_id}\n"

        if additional_context:
            msg += f"\nAdditional Context:\n{additional_context}\n"

        msg += "\nBegin by reading your learnings, then proceed with your task."

        return msg


# =============================================================================
# PUBLIC API
# =============================================================================


async def run_agent(
    agent_name: str,
    phase: int,
    project_id: str,
    chapter_id: Optional[str] = None,
    model: str = "claude-sonnet-4-20250514",
    additional_context: Optional[str] = None,
) -> AgentResult:
    """
    Run a single agent.

    This is the main entry point for running an agent following the TAC pattern:
    - One agent
    - One prompt (from the prompt file)
    - One task
    - One output (to memory)

    Args:
        agent_name: Name of the agent (e.g., "tactic_extractor")
        phase: Phase number (1-11)
        project_id: Project ID
        chapter_id: Optional chapter ID for chapter-level agents
        model: Claude model to use
        additional_context: Optional additional context

    Returns:
        AgentResult with success status and summary
    """
    # Load the agent definition from its prompt file
    agent_def = load_agent_definition(agent_name, phase)

    # Run the agent
    runner = AgentRunner(model=model)
    return runner.run(
        agent_def=agent_def,
        project_id=project_id,
        chapter_id=chapter_id,
        additional_context=additional_context,
    )


def run_agent_sync(
    agent_name: str,
    phase: int,
    project_id: str,
    chapter_id: Optional[str] = None,
    model: str = "claude-sonnet-4-20250514",
    additional_context: Optional[str] = None,
) -> AgentResult:
    """
    Synchronous version of run_agent.

    Args:
        Same as run_agent

    Returns:
        AgentResult
    """
    agent_def = load_agent_definition(agent_name, phase)
    runner = AgentRunner(model=model)
    return runner.run(
        agent_def=agent_def,
        project_id=project_id,
        chapter_id=chapter_id,
        additional_context=additional_context,
    )


# =============================================================================
# CLI
# =============================================================================


def main():
    """CLI for running a single agent."""
    import argparse

    parser = argparse.ArgumentParser(description="Run a Book Maker agent")
    parser.add_argument("agent_name", help="Agent name (e.g., tactic_extractor)")
    parser.add_argument("--phase", type=int, required=True, help="Phase number (1-11)")
    parser.add_argument("--project-id", required=True, help="Project ID")
    parser.add_argument("--chapter-id", help="Chapter ID (for chapter-level agents)")
    parser.add_argument("--model", default="claude-sonnet-4-20250514", help="Model to use")

    args = parser.parse_args()

    print(f"Running agent: {args.agent_name}")
    print(f"Phase: {args.phase}")
    print(f"Project: {args.project_id}")
    if args.chapter_id:
        print(f"Chapter: {args.chapter_id}")

    result = run_agent_sync(
        agent_name=args.agent_name,
        phase=args.phase,
        project_id=args.project_id,
        chapter_id=args.chapter_id,
        model=args.model,
    )

    print(f"\n{'='*50}")
    print(f"Success: {result.success}")
    print(f"Duration: {result.duration_ms}ms")
    print(f"Tokens: {result.input_tokens} in, {result.output_tokens} out")
    print(f"Tool calls: {result.tool_calls}")

    if result.success:
        print(f"\nOutput:\n{result.output}")
    else:
        print(f"\nError: {result.error}")

    import sys
    sys.exit(0 if result.success else 1)


if __name__ == "__main__":
    main()
