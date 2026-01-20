import os
from pathlib import Path
from typing import Dict, Any, Optional
import re

# Base path for prompts and learnings
PROMPTS_DIR = Path(__file__).parent.parent.parent.parent / "prompts"
LEARNINGS_DIR = Path(__file__).parent.parent.parent.parent / "memory" / "learnings"


def load_prompt(phase: str, agent_name: str) -> str:
    """Load an agent's prompt from the prompts directory."""
    prompt_path = PROMPTS_DIR / phase / f"{agent_name}.md"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt not found: {prompt_path}")
    return prompt_path.read_text()


def load_learnings(agent_name: str) -> str:
    """Load an agent's learnings file."""
    learnings_path = LEARNINGS_DIR / f"{agent_name}.md"
    if learnings_path.exists():
        return learnings_path.read_text()
    return ""


def load_global_learnings() -> str:
    """Load global learnings that apply to all agents."""
    global_path = LEARNINGS_DIR / "_global.md"
    if global_path.exists():
        return global_path.read_text()
    return ""


def parse_prompt_sections(prompt_text: str) -> Dict[str, str]:
    """Parse a prompt file into sections (Purpose, Input, Output, etc.)."""
    sections = {}
    current_section = None
    current_content = []

    for line in prompt_text.split('\n'):
        if line.startswith('## '):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = line[3:].strip().lower().replace(' ', '_')
            current_content = []
        else:
            current_content.append(line)

    if current_section:
        sections[current_section] = '\n'.join(current_content).strip()

    return sections


def extract_output_schema(prompt_text: str) -> Optional[str]:
    """Extract the JSON output schema from a prompt."""
    # Look for JSON code blocks in the Output section
    output_match = re.search(r'## Output.*?```json\s*(.*?)\s*```', prompt_text, re.DOTALL | re.IGNORECASE)
    if output_match:
        return output_match.group(1)
    return None
