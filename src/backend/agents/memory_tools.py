"""
Memory Tools - Tools that agents use to read from and write to the memory system.

These tools are given to each agent so they can:
- Read their input from the database
- Read learnings and context
- Write their output to the database
- Log decisions

Each tool maps to a database operation via the Edge Function.
"""

from typing import Any, Dict, List, Optional
import json
from ..memory.client import db, AdminAPIError


# =============================================================================
# TOOL DEFINITIONS (for Claude tool_use)
# =============================================================================

MEMORY_TOOLS = [
    {
        "name": "memory_read_project",
        "description": "Read project data including status, metadata, and configuration.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID (UUID)"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "memory_read_chapter",
        "description": "Read a chapter's data including content, analysis results, and status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "chapter_id": {
                    "type": "string",
                    "description": "The chapter ID (UUID)"
                }
            },
            "required": ["chapter_id"]
        }
    },
    {
        "name": "memory_read_chapters",
        "description": "Read all chapters for a project, ordered by chapter number.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID (UUID)"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "memory_read_book_context",
        "description": "Read book-level context like style guide, structure, or raw markdown.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "key": {
                    "type": "string",
                    "description": "Context key: 'style_guide', 'structure', 'raw_markdown', 'spanish_style_guide', 'relationships'"
                }
            },
            "required": ["project_id", "key"]
        }
    },
    {
        "name": "memory_read_tactics",
        "description": "Read tactics for a project or chapter.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "chapter_id": {
                    "type": "string",
                    "description": "Optional: filter to specific chapter"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "memory_read_glossary",
        "description": "Read glossary terms for a project.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "memory_read_learnings",
        "description": "Read learnings files for an agent. Always read _global.md and agent-specific learnings.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "The agent name (e.g., 'tactic_extractor')"
                }
            },
            "required": ["agent_name"]
        }
    },
    {
        "name": "memory_write_chapter",
        "description": "Write/update chapter data. Use for analysis results, content, status updates.",
        "input_schema": {
            "type": "object",
            "properties": {
                "chapter_id": {
                    "type": "string",
                    "description": "The chapter ID"
                },
                "data": {
                    "type": "object",
                    "description": "Fields to update (e.g., analysis_stories, analysis_quotes, status)"
                }
            },
            "required": ["chapter_id", "data"]
        }
    },
    {
        "name": "memory_write_book_context",
        "description": "Write book-level context (style guide, structure, etc).",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "key": {
                    "type": "string",
                    "description": "Context key"
                },
                "value": {
                    "type": "string",
                    "description": "The value to store"
                }
            },
            "required": ["project_id", "key", "value"]
        }
    },
    {
        "name": "memory_write_tactic",
        "description": "Write a new tactic to the database.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "chapter_id": {
                    "type": "string",
                    "description": "The source chapter ID"
                },
                "tactic": {
                    "type": "object",
                    "description": "Tactic data: name, type, category, description, source_quote, etc."
                }
            },
            "required": ["project_id", "chapter_id", "tactic"]
        }
    },
    {
        "name": "memory_write_tactics_batch",
        "description": "Write multiple tactics at once.",
        "input_schema": {
            "type": "object",
            "properties": {
                "tactics": {
                    "type": "array",
                    "description": "Array of tactics, each with project_id, chapter_id, and tactic data"
                }
            },
            "required": ["tactics"]
        }
    },
    {
        "name": "memory_write_glossary_term",
        "description": "Write a glossary term.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "term": {
                    "type": "object",
                    "description": "Term data: english_term, definition, usage_notes, etc."
                }
            },
            "required": ["project_id", "term"]
        }
    },
    {
        "name": "memory_log_decision",
        "description": "Log an agent decision for audit trail.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "string",
                    "description": "The project ID"
                },
                "agent_name": {
                    "type": "string",
                    "description": "Name of the agent making the decision"
                },
                "decision_type": {
                    "type": "string",
                    "description": "Type: include, exclude, categorize, transform, etc."
                },
                "subject": {
                    "type": "string",
                    "description": "What the decision is about"
                },
                "decision": {
                    "type": "string",
                    "description": "The decision made"
                },
                "reasoning": {
                    "type": "string",
                    "description": "Why this decision was made"
                },
                "confidence": {
                    "type": "string",
                    "description": "Confidence level: high, medium, low"
                },
                "chapter_id": {
                    "type": "string",
                    "description": "Optional: chapter ID if decision is chapter-specific"
                }
            },
            "required": ["project_id", "agent_name", "decision_type", "subject", "decision", "reasoning"]
        }
    },
    {
        "name": "memory_flag_issue",
        "description": "Flag an issue found during processing.",
        "input_schema": {
            "type": "object",
            "properties": {
                "chapter_id": {
                    "type": "string",
                    "description": "The chapter ID"
                },
                "issue_type": {
                    "type": "string",
                    "description": "Type: term, tone, fact, grammar, flow"
                },
                "severity": {
                    "type": "string",
                    "description": "Severity: critical, major, minor"
                },
                "description": {
                    "type": "string",
                    "description": "Description of the issue"
                },
                "location": {
                    "type": "string",
                    "description": "Where in the chapter"
                },
                "flagged_by": {
                    "type": "string",
                    "description": "Which agent flagged this"
                }
            },
            "required": ["chapter_id", "issue_type", "severity", "description", "location", "flagged_by"]
        }
    },
    {
        "name": "memory_append_learnings",
        "description": "Append a new learning to an agent's learnings file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "The agent name"
                },
                "learning": {
                    "type": "string",
                    "description": "The learning to append"
                },
                "context": {
                    "type": "string",
                    "description": "Context (e.g., 'Chapter 3 run')"
                }
            },
            "required": ["agent_name", "learning"]
        }
    }
]


# =============================================================================
# TOOL IMPLEMENTATIONS
# =============================================================================


def execute_tool(tool_name: str, tool_input: Dict[str, Any]) -> str:
    """
    Execute a memory tool and return the result as a string.

    Args:
        tool_name: Name of the tool to execute
        tool_input: Input parameters for the tool

    Returns:
        JSON string with the result
    """
    try:
        if tool_name == "memory_read_project":
            return _read_project(tool_input["project_id"])

        elif tool_name == "memory_read_chapter":
            return _read_chapter(tool_input["chapter_id"])

        elif tool_name == "memory_read_chapters":
            return _read_chapters(tool_input["project_id"])

        elif tool_name == "memory_read_book_context":
            return _read_book_context(tool_input["project_id"], tool_input["key"])

        elif tool_name == "memory_read_tactics":
            return _read_tactics(
                tool_input["project_id"],
                tool_input.get("chapter_id")
            )

        elif tool_name == "memory_read_glossary":
            return _read_glossary(tool_input["project_id"])

        elif tool_name == "memory_read_learnings":
            return _read_learnings(tool_input["agent_name"])

        elif tool_name == "memory_write_chapter":
            return _write_chapter(tool_input["chapter_id"], tool_input["data"])

        elif tool_name == "memory_write_book_context":
            return _write_book_context(
                tool_input["project_id"],
                tool_input["key"],
                tool_input["value"]
            )

        elif tool_name == "memory_write_tactic":
            return _write_tactic(
                tool_input["project_id"],
                tool_input["chapter_id"],
                tool_input["tactic"]
            )

        elif tool_name == "memory_write_tactics_batch":
            return _write_tactics_batch(tool_input["tactics"])

        elif tool_name == "memory_write_glossary_term":
            return _write_glossary_term(
                tool_input["project_id"],
                tool_input["term"]
            )

        elif tool_name == "memory_log_decision":
            return _log_decision(tool_input)

        elif tool_name == "memory_flag_issue":
            return _flag_issue(tool_input)

        elif tool_name == "memory_append_learnings":
            return _append_learnings(
                tool_input["agent_name"],
                tool_input["learning"],
                tool_input.get("context", "")
            )

        else:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    except AdminAPIError as e:
        return json.dumps({"error": f"Database error: {e.message}"})
    except Exception as e:
        return json.dumps({"error": f"Tool error: {str(e)}"})


# =============================================================================
# READ IMPLEMENTATIONS
# =============================================================================


def _read_project(project_id: str) -> str:
    result = db.select_single("projects", filters={"id.eq": project_id})
    return json.dumps(result if result else {"error": "Project not found"})


def _read_chapter(chapter_id: str) -> str:
    result = db.select_single("chapters", filters={"id.eq": chapter_id})
    return json.dumps(result if result else {"error": "Chapter not found"})


def _read_chapters(project_id: str) -> str:
    result = db.select(
        "chapters",
        filters={"project_id.eq": project_id},
        options={"order": {"column": "chapter_number", "ascending": True}}
    )
    return json.dumps({"chapters": result})


def _read_book_context(project_id: str, key: str) -> str:
    result = db.select_single(
        "book_context",
        filters={"project_id.eq": project_id, "key.eq": key}
    )
    if result:
        return json.dumps({"key": key, "value": result.get("value")})
    return json.dumps({"key": key, "value": None})


def _read_tactics(project_id: str, chapter_id: Optional[str] = None) -> str:
    filters = {"project_id.eq": project_id}
    if chapter_id:
        filters["chapter_id.eq"] = chapter_id
    result = db.select("tactics", filters=filters)
    return json.dumps({"tactics": result})


def _read_glossary(project_id: str) -> str:
    result = db.select("glossary", filters={"project_id.eq": project_id})
    return json.dumps({"glossary": result})


def _read_learnings(agent_name: str) -> str:
    """Read learnings from filesystem."""
    from pathlib import Path

    learnings = []

    # Global learnings
    global_path = Path("memory/learnings/_global.md")
    if global_path.exists():
        learnings.append({
            "file": "_global.md",
            "content": global_path.read_text()
        })

    # Agent-specific learnings
    agent_path = Path(f"memory/learnings/{agent_name}.md")
    if agent_path.exists():
        learnings.append({
            "file": f"{agent_name}.md",
            "content": agent_path.read_text()
        })

    return json.dumps({"learnings": learnings})


# =============================================================================
# WRITE IMPLEMENTATIONS
# =============================================================================


def _write_chapter(chapter_id: str, data: Dict[str, Any]) -> str:
    from datetime import datetime
    data["updated_at"] = datetime.utcnow().isoformat()
    result = db.update("chapters", data=data, filters={"id.eq": chapter_id})
    return json.dumps({"success": True, "updated": len(result)})


def _write_book_context(project_id: str, key: str, value: str) -> str:
    from datetime import datetime

    # Check if exists
    existing = db.select_single(
        "book_context",
        filters={"project_id.eq": project_id, "key.eq": key}
    )

    if existing:
        db.update(
            "book_context",
            data={"value": value, "updated_at": datetime.utcnow().isoformat()},
            filters={"project_id.eq": project_id, "key.eq": key}
        )
        return json.dumps({"success": True, "action": "updated"})
    else:
        db.insert("book_context", data={
            "project_id": project_id,
            "key": key,
            "value": value
        })
        return json.dumps({"success": True, "action": "created"})


def _write_tactic(project_id: str, chapter_id: str, tactic: Dict[str, Any]) -> str:
    tactic["project_id"] = project_id
    tactic["chapter_id"] = chapter_id
    result = db.insert("tactics", data=tactic)
    return json.dumps({"success": True, "tactic_id": result[0].get("id") if result else None})


def _write_tactics_batch(tactics: List[Dict[str, Any]]) -> str:
    if not tactics:
        return json.dumps({"success": True, "count": 0})
    result = db.insert("tactics", data=tactics)
    return json.dumps({"success": True, "count": len(result) if isinstance(result, list) else 1})


def _write_glossary_term(project_id: str, term: Dict[str, Any]) -> str:
    term["project_id"] = project_id
    result = db.insert("glossary", data=term)
    return json.dumps({"success": True, "term_id": result[0].get("id") if result else None})


def _log_decision(data: Dict[str, Any]) -> str:
    result = db.insert("decisions", data={
        "project_id": data["project_id"],
        "agent_name": data["agent_name"],
        "decision_type": data["decision_type"],
        "subject": data["subject"],
        "decision": data["decision"],
        "reasoning": data["reasoning"],
        "confidence": data.get("confidence", "high"),
        "chapter_id": data.get("chapter_id"),
        "alternatives": data.get("alternatives", [])
    })
    return json.dumps({"success": True})


def _flag_issue(data: Dict[str, Any]) -> str:
    result = db.insert("issues", data={
        "chapter_id": data["chapter_id"],
        "issue_type": data["issue_type"],
        "severity": data["severity"],
        "description": data["description"],
        "location": data["location"],
        "flagged_by": data["flagged_by"],
        "status": "open"
    })
    return json.dumps({"success": True, "issue_id": result[0].get("id") if result else None})


def _append_learnings(agent_name: str, learning: str, context: str) -> str:
    """Append learning to filesystem."""
    from pathlib import Path
    from datetime import datetime

    learnings_path = Path(f"memory/learnings/{agent_name}.md")
    learnings_path.parent.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    entry = f"\n\n---\nAdded {timestamp}"
    if context:
        entry += f" ({context})"
    entry += f":\n- {learning}"

    if learnings_path.exists():
        with open(learnings_path, "a") as f:
            f.write(entry)
    else:
        with open(learnings_path, "w") as f:
            f.write(f"# Learnings: {agent_name}\n{entry}")

    return json.dumps({"success": True})


# =============================================================================
# EXPORTS
# =============================================================================


__all__ = [
    "MEMORY_TOOLS",
    "execute_tool",
]
