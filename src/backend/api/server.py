"""
Book Maker API Server

Exposes HTTP endpoints for the frontend to trigger pipeline operations.
This is the bridge between the Lovable frontend and the Python backend.
"""

from __future__ import annotations

import asyncio
import threading
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..config import config
from ..memory.client import db, AdminAPIError
from ..memory.mutations import (
    update_project_status,
    log_pipeline_event,
)
from ..memory.queries import (
    get_project,
    get_project_chapters,
)
from ..workflows.pipeline import (
    run_pipeline,
    run_phase,
    run_single_agent,
    PHASE_AGENTS,
)


# =============================================================================
# SCHEMAS
# =============================================================================


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"


class PipelineAction(str, Enum):
    START = "start"
    PAUSE = "pause"
    RESUME = "resume"
    STOP = "stop"
    RESTART = "restart"


class StartPipelineRequest(BaseModel):
    start_phase: int = 1
    end_phase: int = 11
    model: str = "claude-sonnet-4-20250514"


class RunPhaseRequest(BaseModel):
    phase: int
    model: str = "claude-sonnet-4-20250514"


class RunAgentRequest(BaseModel):
    agent_name: str
    phase: int
    chapter_id: Optional[str] = None
    model: str = "claude-sonnet-4-20250514"


class PipelineStatusResponse(BaseModel):
    project_id: str
    status: str
    current_phase: int
    total_chapters: int
    completed_chapters: int
    is_running: bool


class AgentInfo(BaseModel):
    name: str
    phase: int
    is_chapter_level: bool
    depends_on: List[str]


class PhaseInfo(BaseModel):
    phase: int
    agents: List[AgentInfo]


# =============================================================================
# APP SETUP
# =============================================================================


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Book Maker API",
        description="API for triggering book transformation pipeline operations",
        version="1.0.0",
    )

    # Configure CORS for frontend access
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict to your frontend domain
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()

# Track running pipelines
_running_pipelines: Dict[str, threading.Thread] = {}
_pipeline_executor = ThreadPoolExecutor(max_workers=4)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================


def _log_event(
    project_id: str,
    phase: int,
    agent_name: str,
    level: str,
    message: str,
    chapter_id: Optional[str] = None,
) -> None:
    """Log a pipeline event to the database."""
    try:
        log_pipeline_event(
            project_id=project_id,
            phase=phase,
            agent_name=agent_name,
            log_level=level,
            message=message,
            chapter_id=chapter_id,
        )
    except Exception as e:
        print(f"Failed to log event: {e}")


def _run_pipeline_background(
    project_id: str,
    start_phase: int,
    end_phase: int,
    model: str,
) -> None:
    """Run the pipeline in a background thread."""
    try:
        _log_event(
            project_id, start_phase, "pipeline",
            "info", f"Starting pipeline from phase {start_phase} to {end_phase}"
        )

        success = run_pipeline(
            project_id=project_id,
            start_phase=start_phase,
            end_phase=end_phase,
            model=model,
        )

        if success:
            update_project_status(project_id, "completed", current_phase=end_phase)
            _log_event(
                project_id, end_phase, "pipeline",
                "info", "Pipeline completed successfully"
            )
        else:
            update_project_status(project_id, "error")
            _log_event(
                project_id, 0, "pipeline",
                "error", "Pipeline failed"
            )

    except Exception as e:
        update_project_status(project_id, "error")
        _log_event(
            project_id, 0, "pipeline",
            "error", f"Pipeline exception: {str(e)}"
        )
    finally:
        # Remove from running pipelines
        _running_pipelines.pop(project_id, None)


def _run_phase_background(
    project_id: str,
    phase: int,
    model: str,
) -> None:
    """Run a single phase in a background thread."""
    try:
        _log_event(
            project_id, phase, "pipeline",
            "info", f"Starting phase {phase}"
        )

        success = run_phase(
            project_id=project_id,
            phase=phase,
            model=model,
        )

        if success:
            _log_event(
                project_id, phase, "pipeline",
                "info", f"Phase {phase} completed successfully"
            )
        else:
            update_project_status(project_id, "error")
            _log_event(
                project_id, phase, "pipeline",
                "error", f"Phase {phase} failed"
            )

    except Exception as e:
        update_project_status(project_id, "error")
        _log_event(
            project_id, phase, "pipeline",
            "error", f"Phase exception: {str(e)}"
        )
    finally:
        _running_pipelines.pop(project_id, None)


# =============================================================================
# HEALTH & INFO ENDPOINTS
# =============================================================================


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "config_loaded": config is not None,
    }


@app.get("/api/phases", response_model=List[PhaseInfo])
async def list_phases():
    """List all phases and their agents."""
    phases = []
    for phase_num, agents in PHASE_AGENTS.items():
        phase_info = PhaseInfo(
            phase=phase_num,
            agents=[
                AgentInfo(
                    name=a.name,
                    phase=a.phase,
                    is_chapter_level=a.is_chapter_level,
                    depends_on=a.depends_on or [],
                )
                for a in agents
            ]
        )
        phases.append(phase_info)
    return phases


# =============================================================================
# PROJECT ENDPOINTS
# =============================================================================


@app.get("/api/projects/{project_id}/status", response_model=PipelineStatusResponse)
async def get_project_status(project_id: str):
    """Get the current status of a project's pipeline."""
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        chapters = get_project_chapters(project_id)
        completed = sum(1 for ch in chapters if ch.get("status") == "completed")

        return PipelineStatusResponse(
            project_id=project_id,
            status=project.get("status", "draft"),
            current_phase=project.get("current_phase", 0),
            total_chapters=len(chapters),
            completed_chapters=completed,
            is_running=project_id in _running_pipelines,
        )
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{project_id}/start")
async def start_pipeline(
    project_id: str,
    request: StartPipelineRequest,
    background_tasks: BackgroundTasks,
):
    """Start the pipeline for a project."""
    # Check if already running
    if project_id in _running_pipelines:
        raise HTTPException(status_code=409, detail="Pipeline is already running")

    # Verify project exists
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Update status to running
    try:
        update_project_status(project_id, "running", current_phase=request.start_phase)
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Start pipeline in background
    thread = threading.Thread(
        target=_run_pipeline_background,
        args=(project_id, request.start_phase, request.end_phase, request.model),
        daemon=True,
    )
    _running_pipelines[project_id] = thread
    thread.start()

    return {
        "status": "started",
        "project_id": project_id,
        "start_phase": request.start_phase,
        "end_phase": request.end_phase,
    }


@app.post("/api/projects/{project_id}/pause")
async def pause_pipeline(project_id: str):
    """Pause a running pipeline."""
    if project_id not in _running_pipelines:
        raise HTTPException(status_code=409, detail="Pipeline is not running")

    # Note: For true pause functionality, the pipeline would need to check
    # the project status periodically. For now, we just update the status.
    try:
        update_project_status(project_id, "paused")
        _log_event(project_id, 0, "pipeline", "info", "Pipeline paused by user")
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "paused", "project_id": project_id}


@app.post("/api/projects/{project_id}/resume")
async def resume_pipeline(project_id: str):
    """Resume a paused pipeline."""
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.get("status") != "paused":
            raise HTTPException(status_code=409, detail="Project is not paused")

        update_project_status(project_id, "running")
        _log_event(project_id, 0, "pipeline", "info", "Pipeline resumed by user")
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "resumed", "project_id": project_id}


@app.post("/api/projects/{project_id}/stop")
async def stop_pipeline(project_id: str):
    """Stop a running pipeline."""
    try:
        update_project_status(project_id, "draft")
        _log_event(project_id, 0, "pipeline", "info", "Pipeline stopped by user")
        _running_pipelines.pop(project_id, None)
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "stopped", "project_id": project_id}


# =============================================================================
# PHASE ENDPOINTS
# =============================================================================


@app.post("/api/projects/{project_id}/phases/{phase}")
async def run_project_phase(
    project_id: str,
    phase: int,
    request: RunPhaseRequest = None,
):
    """Run a single phase for a project."""
    model = request.model if request else "claude-sonnet-4-20250514"

    # Check if already running
    if project_id in _running_pipelines:
        raise HTTPException(status_code=409, detail="Pipeline is already running")

    # Verify project exists
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Update status
    try:
        update_project_status(project_id, "running", current_phase=phase)
    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Run phase in background
    thread = threading.Thread(
        target=_run_phase_background,
        args=(project_id, phase, model),
        daemon=True,
    )
    _running_pipelines[project_id] = thread
    thread.start()

    return {
        "status": "started",
        "project_id": project_id,
        "phase": phase,
    }


# =============================================================================
# AGENT ENDPOINTS
# =============================================================================


@app.post("/api/projects/{project_id}/agents/{agent_name}")
async def run_agent(
    project_id: str,
    agent_name: str,
    request: RunAgentRequest,
):
    """Run a single agent for a project."""
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        _log_event(
            project_id, request.phase, agent_name,
            "info", f"Running agent {agent_name}"
        )

        result = run_single_agent(
            project_id=project_id,
            agent_name=agent_name,
            phase=request.phase,
            chapter_id=request.chapter_id,
            model=request.model,
        )

        if result.success:
            _log_event(
                project_id, request.phase, agent_name,
                "info", f"Agent completed in {result.duration_ms}ms"
            )
        else:
            _log_event(
                project_id, request.phase, agent_name,
                "error", f"Agent failed: {result.error}"
            )

        return {
            "success": result.success,
            "agent_name": result.agent_name,
            "duration_ms": result.duration_ms,
            "input_tokens": result.input_tokens,
            "output_tokens": result.output_tokens,
            "tool_calls": result.tool_calls,
            "output": result.output,
            "error": result.error,
        }

    except AdminAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# =============================================================================
# RUN SERVER
# =============================================================================


def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the API server."""
    import uvicorn
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_server()
