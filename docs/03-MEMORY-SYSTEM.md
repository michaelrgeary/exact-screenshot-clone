# Memory System Specification

## Overview

The Memory System is the shared brain that allows single-task agents to work together without carrying context. Agents query what they need, do their task, and write results back.

## Core Principles

1. **Agents don't carry context** - They query the memory system
2. **Single source of truth** - All agents read/write to the same place
3. **Versioned and snapshotted** - Can resume from any point
4. **Append-only where possible** - Reduces conflicts in parallel execution

---

## Database Tables

### CHAPTERS

Primary table tracking each chapter through the pipeline.

```sql
CREATE TABLE chapters (
    id INTEGER PRIMARY KEY,
    chapter_number INTEGER NOT NULL,
    title TEXT,

    -- Original content
    original_text TEXT,

    -- Analysis phase outputs
    analysis_stories TEXT,      -- JSON array
    analysis_quotes TEXT,       -- JSON array

    -- Transformation phase outputs
    transformed_content TEXT,

    -- Writing phase outputs
    outline TEXT,
    sections TEXT,              -- JSON array of section texts
    draft TEXT,
    summary TEXT,

    -- Editing phase outputs
    edited_text TEXT,
    final_text TEXT,

    -- Translation
    spanish_text TEXT,

    -- Quality
    quality_score REAL,
    quality_breakdown TEXT,     -- JSON object
    quality_recommendations TEXT,

    -- Status tracking
    status TEXT,                -- current phase
    phase_1_complete BOOLEAN DEFAULT FALSE,
    phase_2_complete BOOLEAN DEFAULT FALSE,
    phase_3_complete BOOLEAN DEFAULT FALSE,
    phase_4_complete BOOLEAN DEFAULT FALSE,
    phase_5_complete BOOLEAN DEFAULT FALSE,
    phase_6_complete BOOLEAN DEFAULT FALSE,
    phase_7_complete BOOLEAN DEFAULT FALSE,
    phase_8_complete BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TACTICS

All sales tactics extracted and transformed.

```sql
CREATE TABLE tactics (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,

    -- Source
    source_chapter INTEGER REFERENCES chapters(id),
    source_quote TEXT,
    original_context TEXT,

    -- Categorization
    category TEXT,              -- mindset, technique, script, framework, etc.
    subcategory TEXT,

    -- Transformation
    roofing_context TEXT,
    roofing_example TEXT,

    -- Usage tracking
    used_in_chapters TEXT,      -- JSON array of chapter IDs

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### GLOSSARY

Roofing and sales terminology.

```sql
CREATE TABLE glossary (
    id INTEGER PRIMARY KEY,
    term TEXT NOT NULL UNIQUE,
    definition TEXT,

    -- Context
    introduced_in_chapter INTEGER REFERENCES chapters(id),
    usage_notes TEXT,

    -- Translation
    spanish_term TEXT,
    spanish_definition TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### CROSS_REFS

Cross-references between chapters.

```sql
CREATE TABLE cross_refs (
    id INTEGER PRIMARY KEY,
    from_chapter INTEGER REFERENCES chapters(id),
    to_chapter INTEGER REFERENCES chapters(id),

    -- Context
    reason TEXT,                -- why this reference exists
    location_hint TEXT,         -- where in the chapter to insert
    reference_text TEXT,        -- actual text like "As we discussed in Chapter 3..."

    -- Validation
    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DIAGRAMS

All diagrams and visuals.

```sql
CREATE TABLE diagrams (
    id INTEGER PRIMARY KEY,
    chapter INTEGER REFERENCES chapters(id),

    -- Specification
    diagram_type TEXT,          -- funnel, matrix, timeline, process, comparison, etc.
    title TEXT,
    specification TEXT,         -- JSON with full diagram spec

    -- Generated files
    code TEXT,                  -- Rough.js HTML/JS code
    file_path TEXT,             -- path to rendered image

    -- Captions
    caption_en TEXT,
    caption_es TEXT,

    -- Placement
    placement_location TEXT,    -- after which section/paragraph

    -- Validation
    render_valid BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DECISIONS

Audit log of agent decisions.

```sql
CREATE TABLE decisions (
    id INTEGER PRIMARY KEY,
    agent_name TEXT NOT NULL,
    chapter INTEGER REFERENCES chapters(id),

    -- Decision details
    decision_type TEXT,         -- include, exclude, categorize, transform, etc.
    subject TEXT,               -- what was decided on
    decision TEXT,              -- what was chosen
    reasoning TEXT,             -- why
    confidence TEXT,            -- high, medium, low
    alternatives TEXT,          -- JSON array of other options considered

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ISSUES

Problems found during editing.

```sql
CREATE TABLE issues (
    id INTEGER PRIMARY KEY,
    chapter INTEGER REFERENCES chapters(id),

    -- Issue details
    issue_type TEXT,            -- term, tone, fact, grammar, flow
    severity TEXT,              -- critical, major, minor
    description TEXT,
    location TEXT,              -- where in the chapter

    -- Resolution
    flagged_by TEXT,            -- which agent
    resolved BOOLEAN DEFAULT FALSE,
    resolution TEXT,
    resolved_by TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
```

### VALIDATION_LOG

Results of all validation checks.

```sql
CREATE TABLE validation_log (
    id INTEGER PRIMARY KEY,
    validator_name TEXT NOT NULL,
    chapter INTEGER REFERENCES chapters(id),  -- NULL for book-level
    phase INTEGER,

    -- Result
    passed BOOLEAN NOT NULL,
    failures TEXT,              -- JSON array of specific failures

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### RETRY_LOG

Track all retries for debugging.

```sql
CREATE TABLE retry_log (
    id INTEGER PRIMARY KEY,
    agent_name TEXT NOT NULL,
    chapter INTEGER REFERENCES chapters(id),

    -- Retry details
    attempt_number INTEGER,
    failure_type TEXT,          -- transient, validation, quality
    failure_message TEXT,
    feedback_given TEXT,

    -- Outcome
    outcome TEXT,               -- success, fail

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PROMPT_VERSIONS

Track prompt evolution (for reference, actual prompts in files).

```sql
CREATE TABLE prompt_versions (
    id INTEGER PRIMARY KEY,
    agent_type TEXT NOT NULL,
    version_number INTEGER,

    -- Content
    prompt_file_path TEXT,      -- path to .md file
    changes_summary TEXT,

    -- Performance tracking
    chapters_used_on TEXT,      -- JSON array
    avg_quality_score REAL,
    validation_pass_rate REAL,
    retry_rate REAL,

    -- Status
    active BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BOOK_CONTEXT

Global book-level information.

```sql
CREATE TABLE book_context (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example entries:
-- key: "structure", value: JSON with TOC, themes, chapter relationships
-- key: "style_guide", value: full style guide text
-- key: "spanish_style_guide", value: Spanish style guide
-- key: "snapshot_v1_at", value: timestamp of Phase 3 completion
```

---

## Memory Tools (Agent Interface)

Agents interact with memory through these tools:

### Read Tools

```python
# Chapters
get_chapter(chapter_num) -> Chapter
get_chapter_summary(chapter_num) -> str
get_all_chapter_summaries() -> List[Summary]
get_previous_section_ending(chapter_num, section_num) -> str

# Tactics
get_tactics_for_chapter(chapter_num) -> List[Tactic]
search_tactics(query) -> List[Tactic]
get_tactics_by_category(category) -> List[Tactic]

# Glossary
get_glossary() -> List[Term]
get_term(term) -> Term | None

# Cross-references
get_refs_for_chapter(chapter_num) -> List[CrossRef]
get_refs_to_chapter(chapter_num) -> List[CrossRef]

# Context
get_book_structure() -> Structure
get_style_guide() -> str
get_spanish_glossary() -> List[Term]

# Diagrams
get_diagrams_for_chapter(chapter_num) -> List[Diagram]
```

### Write Tools

```python
# Chapters
save_chapter_field(chapter_num, field, value)
update_chapter_status(chapter_num, status)

# Tactics
save_tactic(tactic) -> id
update_tactic(id, fields)

# Glossary
add_glossary_term(term, definition)
add_spanish_term(term, spanish_term, spanish_definition)

# Cross-references
save_cross_ref(from_ch, to_ch, reason, location_hint)
mark_ref_verified(ref_id)

# Diagrams
save_diagram_spec(chapter, type, spec) -> id
save_diagram_file(id, file_path)
save_diagram_caption(id, caption_en, caption_es)

# Decisions
log_decision(agent, chapter, type, subject, decision, reasoning, confidence)

# Issues
flag_issue(chapter, type, severity, description, location, flagged_by)
resolve_issue(id, resolution, resolved_by)
```

---

## Versioning & Snapshots

### Automatic Snapshots

Created at phase boundaries:
- `SNAPSHOT_PHASE_1` - After Prep complete
- `SNAPSHOT_PHASE_3` - After all Transform complete (critical - parallel→sequential transition)
- `SNAPSHOT_PHASE_7` - After English book assembled
- `SNAPSHOT_PHASE_10` - After Spanish book assembled

### Snapshot Contents

Each snapshot includes:
- Full database dump
- All learnings files
- All prompt files
- All generated diagram files

### Resume Capability

```python
resume_from_snapshot(snapshot_name)
# Restores database state
# Pipeline continues from next incomplete step

resume_from_chapter(chapter_num, phase)
# Restores to last good state for that chapter
# Re-runs from specified phase
```

---

## Synchronization Rules

### Parallel Phases (1-3)

- Each chapter writes to its own rows only
- Append-only tables (TACTICS, GLOSSARY) - no conflicts
- No cross-chapter reads during these phases

### Sequential Phases (4+)

- Chapters process in order
- Each chapter can read summaries of all previous chapters
- After each chapter completes, its summary is available to next

### Locking

- Chapter text fields: locked per chapter (only one agent writes at a time)
- Glossary: append-only, no locks needed
- Tactics: append-only, no locks needed
- Cross-refs: append-only, verified flag updated by single agent

---

## Query Efficiency

### Indexes

```sql
CREATE INDEX idx_tactics_chapter ON tactics(source_chapter);
CREATE INDEX idx_tactics_category ON tactics(category);
CREATE INDEX idx_glossary_term ON glossary(term);
CREATE INDEX idx_crossrefs_from ON cross_refs(from_chapter);
CREATE INDEX idx_crossrefs_to ON cross_refs(to_chapter);
CREATE INDEX idx_diagrams_chapter ON diagrams(chapter);
CREATE INDEX idx_issues_chapter ON issues(chapter);
CREATE INDEX idx_issues_resolved ON issues(resolved);
CREATE INDEX idx_decisions_agent ON decisions(agent_name);
```

### Summary Caching

Chapter summaries are stored directly in chapters table - no need to regenerate. Updated once by Summary Writer, read many times.
