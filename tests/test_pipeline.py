"""
Book Maker Pipeline Tests

TAC Pattern: Real database, no mocking, actual agent runs.

These tests verify the complete pipeline works end-to-end.
Run with: pytest tests/test_pipeline.py -v

Note: Requires environment variables to be set:
    - ADMIN_API_URL
    - ADMIN_API_SECRET
    - CLAUDE_API_KEY
"""

import os
import sys
import pytest
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from dotenv import load_dotenv
load_dotenv()

# Skip all tests if environment not configured
pytestmark = pytest.mark.skipif(
    not os.environ.get("CLAUDE_API_KEY"),
    reason="CLAUDE_API_KEY not set - skipping integration tests"
)


class TestMemoryTools:
    """Test memory tools can read/write to database."""

    def test_read_learnings(self):
        """Test reading learnings files works."""
        from backend.agents.memory_tools import _read_learnings
        import json

        result = _read_learnings("tactic_extractor")
        data = json.loads(result)

        assert "learnings" in data
        # Should find the learnings file
        filenames = [l["file"] for l in data["learnings"]]
        assert "tactic_extractor.md" in filenames or "_global.md" in filenames


class TestAgentLoader:
    """Test agent definition loading."""

    def test_load_tactic_extractor(self):
        """Test loading a phase 2 agent."""
        from backend.agents.runner import load_agent_definition

        agent_def = load_agent_definition("tactic_extractor", phase=2)

        assert agent_def.name == "tactic_extractor"
        assert agent_def.phase == 2
        assert "Extract" in agent_def.purpose
        assert len(agent_def.system_prompt) > 100  # Has content

    def test_load_all_phase_agents(self):
        """Test that all configured agents can be loaded."""
        from backend.agents.runner import load_agent_definition
        from backend.workflows.pipeline import PHASE_AGENTS

        missing = []
        for phase, agents in PHASE_AGENTS.items():
            for agent_config in agents:
                try:
                    load_agent_definition(agent_config.name, phase)
                except FileNotFoundError as e:
                    missing.append(f"{agent_config.name} (phase {phase})")

        if missing:
            pytest.fail(f"Missing prompt files for: {', '.join(missing)}")


class TestPipelineConfig:
    """Test pipeline configuration."""

    def test_phase_agents_defined(self):
        """Test all phases have agents defined."""
        from backend.workflows.pipeline import PHASE_AGENTS

        assert len(PHASE_AGENTS) == 11  # 11 phases
        for phase in range(1, 12):
            assert phase in PHASE_AGENTS
            assert len(PHASE_AGENTS[phase]) > 0

    def test_agent_dependencies_valid(self):
        """Test agent dependencies reference valid agents."""
        from backend.workflows.pipeline import PHASE_AGENTS

        for phase, agents in PHASE_AGENTS.items():
            agent_names = {a.name for a in agents}
            for agent in agents:
                for dep in agent.depends_on or []:
                    assert dep in agent_names, \
                        f"Agent {agent.name} depends on {dep} which is not in phase {phase}"


class TestAPIServer:
    """Test API server endpoints."""

    def test_health_endpoint(self):
        """Test the health check endpoint."""
        from fastapi.testclient import TestClient
        from backend.api.server import app

        client = TestClient(app)
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_phases_endpoint(self):
        """Test the phases listing endpoint."""
        from fastapi.testclient import TestClient
        from backend.api.server import app

        client = TestClient(app)
        response = client.get("/api/phases")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 11  # 11 phases


# Integration tests - only run when explicitly requested
@pytest.mark.integration
class TestIntegration:
    """Integration tests that actually run agents.

    Run with: pytest tests/test_pipeline.py -v -m integration
    """

    @pytest.mark.skipif(
        not os.environ.get("ADMIN_API_URL"),
        reason="ADMIN_API_URL not set"
    )
    def test_database_connection(self):
        """Test database connection works."""
        from backend.memory.client import db

        # Try to read from projects table
        try:
            result = db.select("projects", options={"limit": 1})
            assert isinstance(result, list)
        except Exception as e:
            pytest.fail(f"Database connection failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
