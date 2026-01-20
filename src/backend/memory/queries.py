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


def get_chapters_by_phase(project_id: str, phase: int, complete: bool = True) -> List[Dict[str, Any]]:
    """Get chapters that have completed (or not) a specific phase."""
    phase_field = f"phase_{phase}_complete"
    return db.select(
        "chapters",
        filters={"project_id.eq": project_id, f"{phase_field}.eq": complete},
        options={"order": {"column": "chapter_number", "ascending": True}}
    )


# Tactics queries
def get_project_tactics(project_id: str) -> List[Dict[str, Any]]:
    """Get all tactics for a project."""
    return db.select("tactics", filters={"project_id.eq": project_id})


def get_chapter_tactics(chapter_id: str) -> List[Dict[str, Any]]:
    """Get tactics for a specific chapter."""
    return db.select("tactics", filters={"chapter_id.eq": chapter_id})


def get_tactics_by_category(project_id: str, category: str) -> List[Dict[str, Any]]:
    """Get tactics filtered by category."""
    return db.select(
        "tactics",
        filters={"project_id.eq": project_id, "category.eq": category}
    )


def get_non_duplicate_tactics(project_id: str) -> List[Dict[str, Any]]:
    """Get tactics that are not duplicates."""
    return db.select(
        "tactics",
        filters={"project_id.eq": project_id, "duplicate_of.is": None}
    )


# Glossary queries
def get_glossary(project_id: str) -> List[Dict[str, Any]]:
    """Get glossary terms for a project."""
    return db.select("glossary", filters={"project_id.eq": project_id})


def get_glossary_term(project_id: str, term: str) -> Optional[Dict[str, Any]]:
    """Get a specific glossary term."""
    return db.select_single(
        "glossary",
        filters={"project_id.eq": project_id, "english_term.eq": term}
    )


def get_spanish_glossary(project_id: str) -> List[Dict[str, Any]]:
    """Get glossary terms that have Spanish translations."""
    return db.select(
        "glossary",
        filters={"project_id.eq": project_id, "spanish_term.neq": None}
    )


# Diagram queries
def get_chapter_diagrams(chapter_id: str) -> List[Dict[str, Any]]:
    """Get diagrams for a chapter."""
    return db.select("diagrams", filters={"chapter_id.eq": chapter_id})


def get_valid_diagrams(chapter_id: str) -> List[Dict[str, Any]]:
    """Get diagrams that have been validated."""
    return db.select(
        "diagrams",
        filters={"chapter_id.eq": chapter_id, "render_valid.eq": True}
    )


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


def get_open_issues(chapter_id: str) -> List[Dict[str, Any]]:
    """Get unresolved issues for a chapter."""
    return db.select(
        "issues",
        filters={"chapter_id.eq": chapter_id, "status.eq": "open"}
    )


def get_issues_by_severity(chapter_id: str, severity: str) -> List[Dict[str, Any]]:
    """Get issues filtered by severity."""
    return db.select(
        "issues",
        filters={"chapter_id.eq": chapter_id, "severity.eq": severity}
    )


# Cross-reference queries
def get_cross_refs_from(chapter_id: str) -> List[Dict[str, Any]]:
    """Get cross-references originating from a chapter."""
    return db.select("cross_refs", filters={"from_chapter_id.eq": chapter_id})


def get_cross_refs_to(chapter_id: str) -> List[Dict[str, Any]]:
    """Get cross-references pointing to a chapter."""
    return db.select("cross_refs", filters={"to_chapter_id.eq": chapter_id})


def get_project_cross_refs(project_id: str) -> List[Dict[str, Any]]:
    """Get all cross-references for a project."""
    return db.select("cross_refs", filters={"project_id.eq": project_id})


def get_verified_cross_refs(project_id: str) -> List[Dict[str, Any]]:
    """Get verified cross-references."""
    return db.select(
        "cross_refs",
        filters={"project_id.eq": project_id, "verified.eq": True}
    )


# Book context queries
def get_book_context(project_id: str, key: str) -> Optional[Dict[str, Any]]:
    """Get a specific book context value."""
    return db.select_single(
        "book_context",
        filters={"project_id.eq": project_id, "key.eq": key}
    )


def get_all_book_context(project_id: str) -> List[Dict[str, Any]]:
    """Get all book context entries for a project."""
    return db.select("book_context", filters={"project_id.eq": project_id})


def get_style_guide(project_id: str) -> Optional[str]:
    """Get the style guide for a project."""
    result = get_book_context(project_id, "style_guide")
    return result.get("value") if result else None


def get_book_structure(project_id: str) -> Optional[str]:
    """Get the book structure for a project."""
    result = get_book_context(project_id, "structure")
    return result.get("value") if result else None


def get_spanish_style_guide(project_id: str) -> Optional[str]:
    """Get the Spanish style guide for a project."""
    result = get_book_context(project_id, "spanish_style_guide")
    return result.get("value") if result else None


# Decision queries
def get_chapter_decisions(chapter_id: str) -> List[Dict[str, Any]]:
    """Get all decisions made for a chapter."""
    return db.select(
        "decisions",
        filters={"chapter_id.eq": chapter_id},
        options={"order": {"column": "created_at", "ascending": True}}
    )


def get_agent_decisions(project_id: str, agent_name: str) -> List[Dict[str, Any]]:
    """Get all decisions made by a specific agent."""
    return db.select(
        "decisions",
        filters={"project_id.eq": project_id, "agent_name.eq": agent_name}
    )


# Validation log queries
def get_chapter_validations(chapter_id: str) -> List[Dict[str, Any]]:
    """Get all validation results for a chapter."""
    return db.select(
        "validation_log",
        filters={"chapter_id.eq": chapter_id},
        options={"order": {"column": "created_at", "ascending": False}}
    )


def get_phase_validations(project_id: str, phase: int) -> List[Dict[str, Any]]:
    """Get validation results for a specific phase."""
    return db.select(
        "validation_log",
        filters={"project_id.eq": project_id, "phase.eq": phase}
    )


def get_failed_validations(project_id: str) -> List[Dict[str, Any]]:
    """Get all failed validations for a project."""
    return db.select(
        "validation_log",
        filters={"project_id.eq": project_id, "passed.eq": False}
    )


# Previous chapter summaries (for continuity)
def get_previous_chapter_summaries(project_id: str, before_chapter: int) -> List[Dict[str, Any]]:
    """Get summaries of chapters before a given chapter number."""
    return db.select(
        "chapters",
        filters={"project_id.eq": project_id, "chapter_number.lt": before_chapter},
        options={"order": {"column": "chapter_number", "ascending": True}}
    )


def get_all_chapter_summaries(project_id: str) -> List[Dict[str, Any]]:
    """Get summaries of all chapters."""
    return db.select(
        "chapters",
        filters={"project_id.eq": project_id},
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


def get_chapter_logs(chapter_id: str) -> List[Dict[str, Any]]:
    """Get pipeline logs for a specific chapter."""
    return db.select(
        "pipeline_logs",
        filters={"chapter_id.eq": chapter_id},
        options={"order": {"column": "created_at", "ascending": False}}
    )


def get_agent_logs(project_id: str, agent_name: str) -> List[Dict[str, Any]]:
    """Get logs for a specific agent."""
    return db.select(
        "pipeline_logs",
        filters={"project_id.eq": project_id, "agent_name.eq": agent_name},
        options={"order": {"column": "created_at", "ascending": False}}
    )


# Output files queries
def get_project_outputs(project_id: str) -> List[Dict[str, Any]]:
    """Get output files for a project."""
    return db.select("output_files", filters={"project_id.eq": project_id})


def get_outputs_by_format(project_id: str, format: str) -> List[Dict[str, Any]]:
    """Get output files by format."""
    return db.select(
        "output_files",
        filters={"project_id.eq": project_id, "format.eq": format}
    )


def get_outputs_by_language(project_id: str, language: str) -> List[Dict[str, Any]]:
    """Get output files by language."""
    return db.select(
        "output_files",
        filters={"project_id.eq": project_id, "language.eq": language}
    )
