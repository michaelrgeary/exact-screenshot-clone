"""
Book Maker Agents Module

TAC Pattern Implementation:
- One agent = One prompt file
- Agent reads input from memory
- Agent writes output to memory
- Pipeline just orchestrates which agents to run

Usage:
    from agents.runner import run_agent_sync
    from agents.memory_tools import MEMORY_TOOLS

    # Run a single agent
    result = run_agent_sync(
        agent_name="tactic_extractor",
        phase=2,
        project_id="uuid",
        chapter_id="uuid",
    )
"""

from .runner import run_agent_sync, run_agent, AgentResult, load_agent_definition
from .memory_tools import MEMORY_TOOLS, execute_tool

__all__ = [
    "run_agent_sync",
    "run_agent",
    "AgentResult",
    "load_agent_definition",
    "MEMORY_TOOLS",
    "execute_tool",
]
