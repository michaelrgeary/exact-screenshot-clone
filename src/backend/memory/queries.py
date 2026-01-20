from typing import Optional, List, Dict, Any
from .client import db


# Project queries
def get_project(project_id: str) -> Dict[str, Any]:
    """Get a project by ID."""
    return db.select_single("projects", filters={"id.eq": project_id})


def get_project_chapters(project_id: str) -> List[Dict[str, Any]]:
    """Get all chapters for a project, ordered by chapter_number."""
    return db.select(
        "chapters",
        filters={"project_id.eq": project_id},
        options={"order": {"column": "chapter_number", "ascending": True}}
    )


# Chapter queries
def get_chapter(chapter_id: str) -> Dict[str, Any]:
    """Get a chapter by ID."""
    return db.select_single("chapters", filters={"id.eq": chapter_id})


def get_chapter_by_number(project_id: str, chapter_number: int) -> Dict[str, Any]:
    """Get a chapter by project ID and chapter number."""
    return db.select_single(
        "chapters",
        filters={"project_id.eq": project_id, "chapter_number.eq": chapter_number}
    )


# Tactics queries
def get_project_tactics(project_id: str) -> List[Dict[str, Any]]:
    """Get all tactics for a project."""
    return db.select("tactics", filters={"project_id.eq": project_id})


def get_chapter_tactics(chapter_id: str) -> List[Dict[str, Any]]:
    """Get tactics for a specific chapter."""
    return db.select("tactics", filters={"chapter_id.eq": chapter_id})


# Glossary queries
def get_glossary(project_id: str) -> List[Dict[str, Any]]:
    """Get glossary terms for a project."""
    return db.select("glossary", filters={"project_id.eq": project_id})


# Diagram queries
def get_chapter_diagrams(chapter_id: str) -> List[Dict[str, Any]]:
    """Get diagrams for a chapter."""
    return db.select("diagrams", filters={"chapter_id.eq": chapter_id})


# Quality queries
def get_chapter_quality(chapter_id: str) -> Optional[Dict[str, Any]]:
    """Get most recent quality score for a chapter."""
    results = db.select(
        "quality_scores",
        filters={"chapter_id.eq": chapter_id},
        options={
            "order": {"column": "created_at", "ascending": False},
            "limit": 1
        }
    )
    return results[0] if results else None


# Issues queries
def get_chapter_issues(chapter_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get issues for a chapter, optionally filtered by status."""
    filters = {"chapter_id.eq": chapter_id}
    if status:
        filters["status.eq"] = status
    return db.select("issues", filters=filters)


# Previous chapter summaries (for continuity)
def get_previous_chapter_summaries(project_id: str, before_chapter: int) -> List[Dict[str, Any]]:
    """Get summaries of chapters before a given chapter number."""
    return db.select(
        "chapters",
        filters={"project_id.eq": project_id, "chapter_number.lt": before_chapter},
        options={"order": {"column": "chapter_number", "ascending": True}}
    )


# Pipeline logs queries
def get_project_logs(project_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Get recent pipeline logs for a project."""
    return db.select(
        "pipeline_logs",
        filters={"project_id.eq": project_id},
        options={
            "order": {"column": "created_at", "ascending": False},
            "limit": limit
        }
    )


# Output files queries
def get_project_outputs(project_id: str) -> List[Dict[str, Any]]:
    """Get output files for a project."""
    return db.select("output_files", filters={"project_id.eq": project_id})
