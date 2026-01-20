"""
Book Maker Pipeline - Simple orchestration of agents.

Following the TAC pattern, this pipeline just:
1. Defines which agents run in each phase
2. Runs them in the correct order
3. Handles parallel vs sequential execution

The agents themselves handle reading input and writing output via memory tools.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import time

from ..agents.runner import run_agent_sync, AgentResult
from ..memory.client import db


# =============================================================================
# PHASE DEFINITIONS
# =============================================================================


@dataclass
class AgentConfig:
    """Configuration for running an agent."""
    name: str
    phase: int
    is_chapter_level: bool = False  # True if runs per chapter
    depends_on: List[str] = None  # Agents that must complete first

    def __post_init__(self):
        if self.depends_on is None:
            self.depends_on = []


# Define all agents by phase
PHASE_AGENTS: Dict[int, List[AgentConfig]] = {
    1: [  # Prep
        AgentConfig("format_converter", 1, is_chapter_level=False),
        AgentConfig("chapter_splitter", 1, is_chapter_level=False, depends_on=["format_converter"]),
        AgentConfig("structure_analyzer", 1, is_chapter_level=False, depends_on=["chapter_splitter"]),
        AgentConfig("style_guide_creator", 1, is_chapter_level=False, depends_on=["chapter_splitter"]),
        AgentConfig("relationship_mapper", 1, is_chapter_level=False, depends_on=["structure_analyzer"]),
    ],
    2: [  # Analysis - runs per chapter, can be parallel
        AgentConfig("tactic_extractor", 2, is_chapter_level=True),
        AgentConfig("story_extractor", 2, is_chapter_level=True),
        AgentConfig("quote_extractor", 2, is_chapter_level=True),
        AgentConfig("content_categorizer", 2, is_chapter_level=True, depends_on=["tactic_extractor"]),
        AgentConfig("cross_ref_identifier", 2, is_chapter_level=True, depends_on=["content_categorizer"]),
        AgentConfig("duplicate_detector", 2, is_chapter_level=False, depends_on=["tactic_extractor"]),  # Project level
    ],
    3: [  # Transform - runs per chapter, can be parallel
        AgentConfig("tactic_transformer", 3, is_chapter_level=True),
        AgentConfig("story_transformer", 3, is_chapter_level=True),
        AgentConfig("script_adapter", 3, is_chapter_level=True),
        AgentConfig("roofing_context_enricher", 3, is_chapter_level=True),
        AgentConfig("glossary_builder", 3, is_chapter_level=False),  # Project level
    ],
    4: [  # Writing - runs per chapter, SEQUENTIAL for continuity
        AgentConfig("chapter_outliner", 4, is_chapter_level=True),
        AgentConfig("section_writer", 4, is_chapter_level=True, depends_on=["chapter_outliner"]),
        AgentConfig("transition_writer", 4, is_chapter_level=True, depends_on=["section_writer"]),
        AgentConfig("example_generator", 4, is_chapter_level=True, depends_on=["section_writer"]),
        AgentConfig("summary_writer", 4, is_chapter_level=True, depends_on=["section_writer"]),
        AgentConfig("takeaways_writer", 4, is_chapter_level=True, depends_on=["summary_writer"]),
        AgentConfig("chapter_title_generator", 4, is_chapter_level=True, depends_on=["section_writer"]),
        AgentConfig("cross_ref_inserter", 4, is_chapter_level=True, depends_on=["section_writer"]),
    ],
    5: [  # Visual - runs per chapter, can be parallel
        AgentConfig("visual_opportunity_identifier", 5, is_chapter_level=True),
        AgentConfig("diagram_specifier", 5, is_chapter_level=True, depends_on=["visual_opportunity_identifier"]),
        AgentConfig("diagram_code_generator", 5, is_chapter_level=True, depends_on=["diagram_specifier"]),
        AgentConfig("diagram_placer", 5, is_chapter_level=True, depends_on=["diagram_code_generator"]),
        AgentConfig("caption_writer", 5, is_chapter_level=True, depends_on=["diagram_placer"]),
        AgentConfig("callout_generator", 5, is_chapter_level=True),
    ],
    6: [  # Editing - runs per chapter, can be parallel
        AgentConfig("grammar_checker", 6, is_chapter_level=True),
        AgentConfig("tone_consistency_checker", 6, is_chapter_level=True),
        AgentConfig("term_consistency_checker", 6, is_chapter_level=True),
        AgentConfig("fact_checker", 6, is_chapter_level=True),
        AgentConfig("flow_checker", 6, is_chapter_level=True),
        AgentConfig("clarity_editor", 6, is_chapter_level=True),
        AgentConfig("originality_checker", 6, is_chapter_level=True),
        AgentConfig("reading_level_analyzer", 6, is_chapter_level=True),
        AgentConfig("script_formatter", 6, is_chapter_level=True),
    ],
    7: [  # Quality
        AgentConfig("chapter_quality_scorer", 7, is_chapter_level=True),
        AgentConfig("quality_scorer", 7, is_chapter_level=False),  # Project level
    ],
    8: [  # Translation Prep
        AgentConfig("spanish_style_guide_creator", 8, is_chapter_level=False),
        AgentConfig("terminology_translator", 8, is_chapter_level=False),
    ],
    9: [  # Translation - runs per chapter, can be parallel
        AgentConfig("chapter_translator", 9, is_chapter_level=True),
        AgentConfig("diagram_text_translator", 9, is_chapter_level=True),
        AgentConfig("spanish_naturalizer", 9, is_chapter_level=True, depends_on=["chapter_translator"]),
        AgentConfig("spanish_proofreader", 9, is_chapter_level=True, depends_on=["spanish_naturalizer"]),
    ],
    10: [  # Assembly
        AgentConfig("front_matter_writer", 10, is_chapter_level=False),
        AgentConfig("back_matter_writer", 10, is_chapter_level=False),
        AgentConfig("toc_generator", 10, is_chapter_level=False),
        AgentConfig("index_generator", 10, is_chapter_level=False),
        AgentConfig("structure_assembler", 10, is_chapter_level=False),
    ],
    11: [  # Output
        AgentConfig("pdf_formatter", 11, is_chapter_level=False),
        AgentConfig("kindle_formatter", 11, is_chapter_level=False),
        AgentConfig("metadata_generator", 11, is_chapter_level=False),
        AgentConfig("book_blurb_writer", 11, is_chapter_level=False),
    ],
}


# =============================================================================
# PIPELINE RUNNER
# =============================================================================


class Pipeline:
    """
    Runs the Book Maker pipeline.

    Simple orchestration - agents handle their own I/O via memory tools.
    """

    def __init__(self, project_id: str, model: str = "claude-sonnet-4-20250514"):
        self.project_id = project_id
        self.model = model
        self.results: List[AgentResult] = []

    def get_chapters(self) -> List[Dict[str, Any]]:
        """Get all chapters for the project."""
        return db.select(
            "chapters",
            filters={"project_id.eq": self.project_id},
            options={"order": {"column": "chapter_number", "ascending": True}}
        )

    def run_agent(
        self,
        agent_config: AgentConfig,
        chapter_id: Optional[str] = None,
    ) -> AgentResult:
        """Run a single agent."""
        print(f"  Running: {agent_config.name}" + (f" (chapter {chapter_id[:8]})" if chapter_id else ""))

        result = run_agent_sync(
            agent_name=agent_config.name,
            phase=agent_config.phase,
            project_id=self.project_id,
            chapter_id=chapter_id,
            model=self.model,
        )

        self.results.append(result)

        status = "OK" if result.success else "FAILED"
        print(f"    {status} - {result.duration_ms}ms, {result.tool_calls} tools")

        return result

    def run_phase(self, phase: int, parallel_chapters: bool = True) -> bool:
        """
        Run all agents in a phase.

        Args:
            phase: Phase number (1-11)
            parallel_chapters: Whether to run chapter-level agents in parallel

        Returns:
            True if all agents succeeded
        """
        agents = PHASE_AGENTS.get(phase, [])
        if not agents:
            print(f"No agents defined for phase {phase}")
            return True

        print(f"\n{'='*60}")
        print(f"Phase {phase}")
        print(f"{'='*60}")

        chapters = self.get_chapters() if any(a.is_chapter_level for a in agents) else []

        # Group agents by their dependencies
        completed_agents = set()
        all_success = True

        while len(completed_agents) < len(agents):
            # Find agents ready to run (dependencies met)
            ready = [
                a for a in agents
                if a.name not in completed_agents
                and all(dep in completed_agents for dep in a.depends_on)
            ]

            if not ready:
                print("ERROR: Circular dependency detected!")
                return False

            for agent_config in ready:
                if agent_config.is_chapter_level:
                    # Run for each chapter
                    print(f"\n{agent_config.name} (per-chapter)")
                    for chapter in chapters:
                        result = self.run_agent(agent_config, chapter["id"])
                        if not result.success:
                            all_success = False
                else:
                    # Run once (project level)
                    print(f"\n{agent_config.name} (project-level)")
                    result = self.run_agent(agent_config)
                    if not result.success:
                        all_success = False

                completed_agents.add(agent_config.name)

        return all_success

    def run(
        self,
        start_phase: int = 1,
        end_phase: int = 11,
    ) -> bool:
        """
        Run the complete pipeline.

        Args:
            start_phase: Phase to start from (default: 1)
            end_phase: Phase to end at (default: 11)

        Returns:
            True if all phases succeeded
        """
        start_time = time.time()

        print(f"\n{'#'*60}")
        print(f"# Book Maker Pipeline")
        print(f"# Project: {self.project_id}")
        print(f"# Phases: {start_phase} to {end_phase}")
        print(f"{'#'*60}")

        all_success = True

        for phase in range(start_phase, end_phase + 1):
            success = self.run_phase(phase)
            if not success:
                print(f"\nPhase {phase} failed - stopping pipeline")
                all_success = False
                break

        duration = int(time.time() - start_time)

        print(f"\n{'='*60}")
        print(f"Pipeline {'COMPLETED' if all_success else 'FAILED'}")
        print(f"Duration: {duration}s")
        print(f"Total agents run: {len(self.results)}")
        print(f"Successful: {sum(1 for r in self.results if r.success)}")
        print(f"Failed: {sum(1 for r in self.results if not r.success)}")
        print(f"{'='*60}")

        return all_success


# =============================================================================
# PUBLIC API
# =============================================================================


def run_pipeline(
    project_id: str,
    start_phase: int = 1,
    end_phase: int = 11,
    model: str = "claude-sonnet-4-20250514",
) -> bool:
    """
    Run the Book Maker pipeline.

    Args:
        project_id: Project ID
        start_phase: Phase to start from
        end_phase: Phase to end at
        model: Model to use

    Returns:
        True if successful
    """
    pipeline = Pipeline(project_id, model)
    return pipeline.run(start_phase, end_phase)


def run_phase(
    project_id: str,
    phase: int,
    model: str = "claude-sonnet-4-20250514",
) -> bool:
    """
    Run a single phase.

    Args:
        project_id: Project ID
        phase: Phase number
        model: Model to use

    Returns:
        True if successful
    """
    pipeline = Pipeline(project_id, model)
    return pipeline.run_phase(phase)


def run_single_agent(
    project_id: str,
    agent_name: str,
    phase: int,
    chapter_id: Optional[str] = None,
    model: str = "claude-sonnet-4-20250514",
) -> AgentResult:
    """
    Run a single agent.

    Args:
        project_id: Project ID
        agent_name: Agent name
        phase: Phase number
        chapter_id: Optional chapter ID
        model: Model to use

    Returns:
        AgentResult
    """
    return run_agent_sync(
        agent_name=agent_name,
        phase=phase,
        project_id=project_id,
        chapter_id=chapter_id,
        model=model,
    )


# =============================================================================
# CLI
# =============================================================================


def main():
    """CLI for running the pipeline."""
    import argparse

    parser = argparse.ArgumentParser(description="Run Book Maker pipeline")
    parser.add_argument("--project-id", required=True, help="Project ID")
    parser.add_argument("--start-phase", type=int, default=1, help="Phase to start from")
    parser.add_argument("--end-phase", type=int, default=11, help="Phase to end at")
    parser.add_argument("--phase", type=int, help="Run single phase")
    parser.add_argument("--agent", help="Run single agent")
    parser.add_argument("--chapter-id", help="Chapter ID (for single agent)")
    parser.add_argument("--model", default="claude-sonnet-4-20250514", help="Model to use")
    parser.add_argument("--list", action="store_true", help="List all agents")

    args = parser.parse_args()

    if args.list:
        print("\nBook Maker Agents by Phase:")
        print("=" * 60)
        for phase, agents in PHASE_AGENTS.items():
            print(f"\nPhase {phase}:")
            for agent in agents:
                level = "chapter" if agent.is_chapter_level else "project"
                deps = f" (after: {', '.join(agent.depends_on)})" if agent.depends_on else ""
                print(f"  - {agent.name} [{level}]{deps}")
        return

    if args.agent:
        # Run single agent
        phase = args.phase or 1  # Default to phase 1 if not specified
        result = run_single_agent(
            project_id=args.project_id,
            agent_name=args.agent,
            phase=phase,
            chapter_id=args.chapter_id,
            model=args.model,
        )
        print(f"\nAgent: {result.agent_name}")
        print(f"Success: {result.success}")
        print(f"Duration: {result.duration_ms}ms")
        if result.output:
            print(f"\nOutput:\n{result.output}")
        if result.error:
            print(f"\nError: {result.error}")
    elif args.phase:
        # Run single phase
        success = run_phase(args.project_id, args.phase, args.model)
        import sys
        sys.exit(0 if success else 1)
    else:
        # Run full pipeline
        success = run_pipeline(
            args.project_id,
            args.start_phase,
            args.end_phase,
            args.model,
        )
        import sys
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
