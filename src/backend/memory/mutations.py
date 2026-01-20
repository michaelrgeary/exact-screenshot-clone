from typing import Dict, Any, List, Optional
from datetime import datetime
from .client import db


# Project mutations
def update_project_status(project_id: str, status: str, current_phase: Optional[int] = None) -> None:
    """Update project status and optionally current phase."""
    data = {"status": status, "updated_at": datetime.utcnow().isoformat()}
    if current_phase is not None:
        data["current_phase"] = current_phase
    db.update("projects", data=data, filters={"id.eq": project_id})


def update_project_quality_score(project_id: str, score: float) -> None:
    """Update overall project quality score."""
    db.update(
        "projects",
        data={"overall_quality_score": score, "updated_at": datetime.utcnow().isoformat()},
        filters={"id.eq": project_id}
    )


# Chapter mutations
def create_chapters(project_id: str, chapters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multiple chapters for a project."""
    for ch in chapters:
        ch["project_id"] = project_id
    result = db.insert("chapters", data=chapters)
    return result if isinstance(result, list) else [result]


def update_chapter(chapter_id: str, data: Dict[str, Any]) -> None:
    """Update a chapter with arbitrary data."""
    data["updated_at"] = datetime.utcnow().isoformat()
    db.update("chapters", data=data, filters={"id.eq": chapter_id})


def update_chapter_status(chapter_id: str, status: str, current_phase: Optional[int] = None) -> None:
    """Update chapter status and optionally current phase."""
    data = {"status": status, "updated_at": datetime.utcnow().isoformat()}
    if current_phase is not None:
        data["current_phase"] = current_phase
    db.update("chapters", data=data, filters={"id.eq": chapter_id})


def update_chapter_content(chapter_id: str, field: str, content: str) -> None:
    """Update a specific content field of a chapter."""
    db.update(
        "chapters",
        data={field: content, "updated_at": datetime.utcnow().isoformat()},
        filters={"id.eq": chapter_id}
    )


# Tactics mutations
def create_tactic(project_id: str, chapter_id: str, tactic: Dict[str, Any]) -> Dict[str, Any]:
    """Create a tactic."""
    tactic["project_id"] = project_id
    tactic["chapter_id"] = chapter_id
    result = db.insert("tactics", data=tactic)
    return result[0] if isinstance(result, list) else result


def create_tactics_batch(tactics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multiple tactics at once."""
    result = db.insert("tactics", data=tactics)
    return result if isinstance(result, list) else [result]


# Glossary mutations
def create_glossary_term(project_id: str, term: Dict[str, Any]) -> Dict[str, Any]:
    """Create a glossary term."""
    term["project_id"] = project_id
    result = db.insert("glossary", data=term)
    return result[0] if isinstance(result, list) else result


def create_glossary_batch(project_id: str, terms: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multiple glossary terms."""
    for term in terms:
        term["project_id"] = project_id
    result = db.insert("glossary", data=terms)
    return result if isinstance(result, list) else [result]


# Diagram mutations
def create_diagram(chapter_id: str, diagram: Dict[str, Any]) -> Dict[str, Any]:
    """Create a diagram."""
    diagram["chapter_id"] = chapter_id
    result = db.insert("diagrams", data=diagram)
    return result[0] if isinstance(result, list) else result


def update_diagram(diagram_id: str, data: Dict[str, Any]) -> None:
    """Update a diagram."""
    db.update("diagrams", data=data, filters={"id.eq": diagram_id})


# Quality mutations
def create_quality_score(chapter_id: str, scores: Dict[str, Any]) -> Dict[str, Any]:
    """Create a quality score record for a chapter."""
    scores["chapter_id"] = chapter_id
    result = db.insert("quality_scores", data=scores)
    return result[0] if isinstance(result, list) else result


# Issues mutations
def create_issue(chapter_id: str, issue: Dict[str, Any]) -> Dict[str, Any]:
    """Create an issue for a chapter."""
    issue["chapter_id"] = chapter_id
    result = db.insert("issues", data=issue)
    return result[0] if isinstance(result, list) else result


def resolve_issue(issue_id: str, resolution: str) -> None:
    """Resolve an issue."""
    db.update(
        "issues",
        data={
            "status": "resolved",
            "resolution": resolution,
            "resolved_at": datetime.utcnow().isoformat()
        },
        filters={"id.eq": issue_id}
    )


# Pipeline logging
def log_pipeline_event(
    project_id: str,
    phase: int,
    agent_name: str,
    log_level: str,
    message: str,
    chapter_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """Log a pipeline event."""
    data = {
        "project_id": project_id,
        "phase": phase,
        "agent_name": agent_name,
        "log_level": log_level,
        "message": message
    }
    if chapter_id:
        data["chapter_id"] = chapter_id
    if details:
        data["details"] = details
    db.insert("pipeline_logs", data=data)


# Output files
def create_output_file(project_id: str, format: str, language: str, file_path: str, file_size: int) -> Dict[str, Any]:
    """Record an output file."""
    result = db.insert("output_files", data={
        "project_id": project_id,
        "format": format,
        "language": language,
        "file_path": file_path,
        "file_size": file_size
    })
    return result[0] if isinstance(result, list) else result
