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
def create_chapter(project_id: str, chapter_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a single chapter."""
    chapter_data["project_id"] = project_id
    result = db.insert("chapters", data=chapter_data)
    return result[0] if isinstance(result, list) else result


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


def mark_chapter_phase_complete(chapter_id: str, phase: int) -> None:
    """Mark a phase as complete for a chapter."""
    phase_field = f"phase_{phase}_complete"
    db.update(
        "chapters",
        data={phase_field: True, "updated_at": datetime.utcnow().isoformat()},
        filters={"id.eq": chapter_id}
    )


def update_chapter_analysis(chapter_id: str, stories: List[Dict], quotes: List[Dict]) -> None:
    """Update chapter analysis results."""
    db.update(
        "chapters",
        data={
            "analysis_stories": stories,
            "analysis_quotes": quotes,
            "updated_at": datetime.utcnow().isoformat()
        },
        filters={"id.eq": chapter_id}
    )


def update_chapter_outline(chapter_id: str, outline: str, sections: List[Dict]) -> None:
    """Update chapter outline and sections."""
    db.update(
        "chapters",
        data={
            "outline": outline,
            "sections": sections,
            "updated_at": datetime.utcnow().isoformat()
        },
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


def update_tactic(tactic_id: str, data: Dict[str, Any]) -> None:
    """Update a tactic."""
    db.update("tactics", data=data, filters={"id.eq": tactic_id})


def mark_tactic_duplicate(tactic_id: str, duplicate_of: str) -> None:
    """Mark a tactic as a duplicate of another."""
    db.update("tactics", data={"duplicate_of": duplicate_of}, filters={"id.eq": tactic_id})


def update_tactic_usage(tactic_id: str, used_in_chapters: List[str]) -> None:
    """Update which chapters use this tactic."""
    db.update("tactics", data={"used_in_chapters": used_in_chapters}, filters={"id.eq": tactic_id})


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


def update_glossary_spanish(term_id: str, spanish_term: str, spanish_definition: Optional[str] = None) -> None:
    """Add Spanish translation to a glossary term."""
    data = {"spanish_term": spanish_term}
    if spanish_definition:
        data["spanish_definition"] = spanish_definition
    db.update("glossary", data=data, filters={"id.eq": term_id})


# Diagram mutations
def create_diagram(chapter_id: str, diagram: Dict[str, Any]) -> Dict[str, Any]:
    """Create a diagram."""
    diagram["chapter_id"] = chapter_id
    result = db.insert("diagrams", data=diagram)
    return result[0] if isinstance(result, list) else result


def update_diagram(diagram_id: str, data: Dict[str, Any]) -> None:
    """Update a diagram."""
    db.update("diagrams", data=data, filters={"id.eq": diagram_id})


def mark_diagram_valid(diagram_id: str, valid: bool = True) -> None:
    """Mark a diagram as render-valid or invalid."""
    db.update("diagrams", data={"render_valid": valid}, filters={"id.eq": diagram_id})


def update_diagram_captions(diagram_id: str, caption_en: str, caption_es: Optional[str] = None) -> None:
    """Update diagram captions."""
    data = {"caption_en": caption_en}
    if caption_es:
        data["caption_es"] = caption_es
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
    issue["status"] = issue.get("status", "open")
    result = db.insert("issues", data=issue)
    return result[0] if isinstance(result, list) else result


def flag_issue(
    chapter_id: str,
    issue_type: str,
    severity: str,
    description: str,
    location: str,
    flagged_by: str
) -> Dict[str, Any]:
    """Flag a new issue found by an agent."""
    issue = {
        "chapter_id": chapter_id,
        "issue_type": issue_type,
        "severity": severity,
        "description": description,
        "location": location,
        "flagged_by": flagged_by,
        "status": "open"
    }
    result = db.insert("issues", data=issue)
    return result[0] if isinstance(result, list) else result


def resolve_issue(issue_id: str, resolution: str, resolved_by: str) -> None:
    """Resolve an issue."""
    db.update(
        "issues",
        data={
            "status": "resolved",
            "resolution": resolution,
            "resolved_by": resolved_by,
            "resolved_at": datetime.utcnow().isoformat()
        },
        filters={"id.eq": issue_id}
    )


def ignore_issue(issue_id: str, reason: str, ignored_by: str) -> None:
    """Mark an issue as ignored."""
    db.update(
        "issues",
        data={
            "status": "ignored",
            "resolution": reason,
            "resolved_by": ignored_by,
            "resolved_at": datetime.utcnow().isoformat()
        },
        filters={"id.eq": issue_id}
    )


# Cross-reference mutations
def create_cross_ref(
    project_id: str,
    from_chapter_id: str,
    to_chapter_id: str,
    reason: str,
    location_hint: Optional[str] = None
) -> Dict[str, Any]:
    """Create a cross-reference between chapters."""
    data = {
        "project_id": project_id,
        "from_chapter_id": from_chapter_id,
        "to_chapter_id": to_chapter_id,
        "reason": reason,
        "verified": False
    }
    if location_hint:
        data["location_hint"] = location_hint
    result = db.insert("cross_refs", data=data)
    return result[0] if isinstance(result, list) else result


def verify_cross_ref(cross_ref_id: str, reference_text: str) -> None:
    """Verify a cross-reference and set its text."""
    db.update(
        "cross_refs",
        data={"verified": True, "reference_text": reference_text},
        filters={"id.eq": cross_ref_id}
    )


def delete_cross_ref(cross_ref_id: str) -> None:
    """Delete a cross-reference."""
    db.delete("cross_refs", filters={"id.eq": cross_ref_id})


# Book context mutations
def set_book_context(project_id: str, key: str, value: str) -> Dict[str, Any]:
    """Set a book context value (upsert)."""
    existing = db.select(
        "book_context",
        filters={"project_id.eq": project_id, "key.eq": key}
    )
    if existing:
        db.update(
            "book_context",
            data={"value": value, "updated_at": datetime.utcnow().isoformat()},
            filters={"project_id.eq": project_id, "key.eq": key}
        )
        return existing[0]
    else:
        result = db.insert("book_context", data={
            "project_id": project_id,
            "key": key,
            "value": value
        })
        return result[0] if isinstance(result, list) else result


def save_style_guide(project_id: str, style_guide: str) -> None:
    """Save the style guide for a project."""
    set_book_context(project_id, "style_guide", style_guide)


def save_book_structure(project_id: str, structure: str) -> None:
    """Save the book structure for a project."""
    set_book_context(project_id, "structure", structure)


def save_spanish_style_guide(project_id: str, style_guide: str) -> None:
    """Save the Spanish style guide for a project."""
    set_book_context(project_id, "spanish_style_guide", style_guide)


def save_raw_markdown(project_id: str, markdown: str) -> None:
    """Save the raw markdown for a project."""
    set_book_context(project_id, "raw_markdown", markdown)


# Decision mutations
def log_decision(
    project_id: str,
    agent_name: str,
    decision_type: str,
    subject: str,
    decision: str,
    reasoning: str,
    confidence: str = "high",
    chapter_id: Optional[str] = None,
    alternatives: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Log an agent decision for audit purposes."""
    data = {
        "project_id": project_id,
        "agent_name": agent_name,
        "decision_type": decision_type,
        "subject": subject,
        "decision": decision,
        "reasoning": reasoning,
        "confidence": confidence
    }
    if chapter_id:
        data["chapter_id"] = chapter_id
    if alternatives:
        data["alternatives"] = alternatives
    result = db.insert("decisions", data=data)
    return result[0] if isinstance(result, list) else result


# Validation log mutations
def log_validation(
    project_id: str,
    validator_name: str,
    phase: int,
    passed: bool,
    failures: Optional[List[Dict]] = None,
    chapter_id: Optional[str] = None
) -> Dict[str, Any]:
    """Log a validation result."""
    data = {
        "project_id": project_id,
        "validator_name": validator_name,
        "phase": phase,
        "passed": passed
    }
    if chapter_id:
        data["chapter_id"] = chapter_id
    if failures:
        data["failures"] = failures
    result = db.insert("validation_log", data=data)
    return result[0] if isinstance(result, list) else result


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
