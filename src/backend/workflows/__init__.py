"""
Book Maker Workflows Module

TAC Pattern: Simple orchestration of agents.
- The pipeline defines WHICH agents run
- The agents handle WHAT they do (via their prompt files)
- Agents read/write via memory tools

Usage:
    from workflows.pipeline import run_pipeline, run_phase, run_single_agent

    # Run complete pipeline
    run_pipeline(project_id)

    # Run single phase
    run_phase(project_id, phase=2)

    # Run single agent
    run_single_agent(project_id, "tactic_extractor", phase=2, chapter_id=chapter_id)
"""

from .pipeline import run_pipeline, run_phase, run_single_agent, PHASE_AGENTS

__all__ = [
    "run_pipeline",
    "run_phase",
    "run_single_agent",
    "PHASE_AGENTS",
]
