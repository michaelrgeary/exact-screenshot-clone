# Claude Code Implementation Guide

This document provides Claude Code with everything needed to understand and implement the Book Maker system.

---

## Quick Start

### What This Project Does

Book Maker transforms a generic sales book into a roofing-specific sales book by:
1. Extracting sales tactics, stories, and scripts from the source
2. Transforming them with roofing industry context
3. Writing new chapters with the transformed content
4. Adding hand-drawn style diagrams (Rough.js)
5. Translating to Spanish
6. Outputting Kindle and PDF formats

### Project Structure

```
Book Maker/
├── docs/                    # Read these to understand the system
├── memory/
│   └── learnings/          # Agent best practices (70 files)
├── prompts/                 # Agent definitions (73 files)
│   ├── orchestrators/      # Master + Chapter orchestrators
│   ├── phase_01_prep/      # through phase_11_output/
│   ├── issue_resolution/
│   └── validators/         # 10 validators
├── diagrams/               # Rough.js examples
└── src/                    # TO BE BUILT
```

---

## Document Reading Order

When starting work on this project, read in this order:

1. **01-PROJECT-OVERVIEW.md** - Architecture and key decisions
2. **12-SQUAD-EXECUTION-ORDER.md** - When each agent runs (CRITICAL)
3. **03-MEMORY-SYSTEM.md** - Database schema agents query/write
4. **05-AGENT-REGISTRY-v2.md** - Complete list of 69 components

For specific tasks:
- Building an agent: Read its prompt file + learnings file
- Building orchestration: Read `02-PIPELINE-DETAILED.md` + orchestrator prompts
- Building validators: Read `06-QUALITY-SCORING.md` + validator prompts
- Building diagram system: Read `09-DIAGRAM-STYLES.md` + visual phase prompts

---

## How Agents Work

### Agent Definition Structure

Each agent is defined in `/prompts/{phase}/{agent_name}.md` with:

```markdown
# Agent: [Name]

## Purpose
What this agent does

## Input
What data it receives (from memory or previous agents)

## Output
JSON schema of what it produces

## System Prompt
The actual LLM prompt to use

## Validation
What must be true for output to be valid

## Dependencies
Which agents must run before/after this one
```

### Agent Execution Pattern

```python
# Pseudocode for running any agent
def run_agent(agent_name, input_data):
    # 1. Load agent definition
    prompt = load_prompt(f"/prompts/{phase}/{agent_name}.md")

    # 2. Load learnings
    learnings = load_learnings(f"/memory/learnings/{agent_name}.md")
    global_learnings = load_learnings("/memory/learnings/_global.md")

    # 3. Query memory for needed data
    memory_data = query_memory(prompt.memory_queries)

    # 4. Construct full prompt
    full_prompt = f"""
    {prompt.system_prompt}

    LEARNINGS:
    {global_learnings}
    {learnings}

    INPUT:
    {input_data}
    {memory_data}

    OUTPUT FORMAT:
    {prompt.output_schema}
    """

    # 5. Call Claude API
    response = claude.complete(full_prompt)

    # 6. Validate output
    validate(response, prompt.validation_rules)

    # 7. Save to memory
    save_to_memory(response, prompt.saves_to)

    return response
```

---

## Execution Order Reference

### Phase 1: Prep (Sequential)
```
Format Converter → Chapter Splitter → Structure Analyzer →
Relationship Mapper → Style Guide Creator → Prep Validator
```

### Phase 2: Analysis (Mixed)
```
[Tactic Extractor, Story Extractor, Quote Extractor] (parallel)
    ↓
Content Categorizer → Cross-Ref Identifier → Duplicate Detector
    ↓
Analysis Validator
```

### Phases 3-7: Per Chapter (Via Chapter Orchestrator)
```
Transform Squad → Writing Squad → Visual Squad → Editing Squad → Quality Scorer
```

Each chapter can run in parallel with other chapters.

### Phase 8-11: Book Level
```
Translation Prep → Translation (parallel per chapter) →
Assembly → Output → Final QA
```

---

## Memory System Summary

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| CHAPTERS | Chapter content through pipeline | original_text, transformed, draft, edited, spanish_text |
| TACTICS | Extracted and transformed tactics | description, category, roofing_context |
| GLOSSARY | Roofing terminology | english_term, spanish_term, definition |
| DIAGRAMS | Visual elements | specification, code, caption_en, caption_es |
| ISSUES | Editing issues | severity, status, resolution |
| QUALITY_SCORES | Chapter scores | dimension_scores, overall_score |

### Key Queries

```python
# Examples of what agents query
get_chapter_content(chapter_num)
get_transformed_tactics(chapter_num)
get_glossary()
get_style_guide()
get_previous_chapter_summaries()
get_diagrams_for_chapter(chapter_num)
```

---

## Building the Backend

### Recommended Implementation Order

1. **Memory System** (`src/memory/`)
   - `database.py` - SQLite connection, schema creation
   - `queries.py` - Implement all query functions from `03-MEMORY-SYSTEM.md`
   - `snapshots.py` - Checkpoint/restore functionality

2. **Agent Framework** (`src/agents/`)
   - `base.py` - Base Agent class with common functionality
   - `loader.py` - Load prompt and learnings files
   - Individual agent implementations (mostly just prompt loading)

3. **Orchestration** (`src/orchestration/`)
   - `chapter.py` - Chapter Orchestrator (runs phases 3-7 for one chapter)
   - `master.py` - Master Orchestrator (runs full pipeline)

4. **Tools** (`src/tools/`)
   - `diagram_renderer.py` - Headless browser + Rough.js
   - `file_concatenator.py` - Combine chapters into manuscript

5. **API** (`src/api/`)
   - FastAPI endpoints for control and status

### Base Agent Class

```python
class BaseAgent:
    def __init__(self, agent_name: str):
        self.name = agent_name
        self.prompt = self.load_prompt()
        self.learnings = self.load_learnings()

    def load_prompt(self) -> AgentPrompt:
        # Load from /prompts/{phase}/{name}.md
        pass

    def load_learnings(self) -> str:
        # Load from /memory/learnings/{name}.md + _global.md
        pass

    def query_memory(self) -> dict:
        # Execute queries defined in prompt
        pass

    def run(self, input_data: dict) -> dict:
        # Construct prompt, call Claude, validate, save
        pass

    def validate_output(self, output: dict) -> bool:
        # Check against validation rules
        pass

    def save_to_memory(self, output: dict):
        # Write to appropriate tables
        pass
```

---

## Quality Thresholds

Overall chapter must score ≥ 0.80 to proceed:

| Dimension | Weight | Minimum |
|-----------|--------|---------|
| Content Fidelity | 15% | 0.80 |
| Roofing Relevance | 15% | 0.85 |
| Clarity | 12% | 0.80 |
| Actionability | 15% | 0.85 |
| Engagement | 10% | 0.75 |
| Flow | 10% | 0.80 |
| Visual Integration | 8% | 0.75 |
| Consistency | 15% | 0.85 |

---

## Error Handling

| Error Type | Retry? | Max | Action on Exhaust |
|------------|--------|-----|-------------------|
| API/Transient | Yes | 3 | Log, continue |
| Validation Fail | Yes (with feedback) | 2 | Stop phase |
| Quality Fail | Yes (with guidance) | 1 | Stop, flag |
| Hard Error | No | 0 | Stop immediately |

**Circuit Breaker**: If same agent fails on 3+ chapters, stop pipeline.

---

## Testing Strategy

1. **Single Agent Test**: Run one agent with mock input, verify output
2. **Phase Test**: Run full phase, verify validator passes
3. **Chapter Test**: Process one chapter through phases 3-7
4. **Full Pipeline Test**: Process entire book in Testing Mode

---

## Key Files to Reference

| Need | Read |
|------|------|
| Full agent list | `/docs/05-AGENT-REGISTRY-v2.md` |
| Execution order | `/docs/12-SQUAD-EXECUTION-ORDER.md` |
| Database schema | `/docs/03-MEMORY-SYSTEM.md` |
| Quality scoring | `/docs/06-QUALITY-SCORING.md` |
| Error handling | `/docs/07-ERROR-HANDLING.md` |
| Diagram specs | `/docs/09-DIAGRAM-STYLES.md` |
| Spanish translation | `/docs/11-SPANISH-GUIDELINES.md` |
| Any agent | `/prompts/{phase}/{agent}.md` + `/memory/learnings/{agent}.md` |

---

## What Claude Code Should Build

### Phase 1: Core Infrastructure
```
src/
├── memory/
│   ├── __init__.py
│   ├── database.py      # SQLite schema + connection
│   ├── queries.py       # All query functions
│   └── snapshots.py     # Checkpoint system
├── agents/
│   ├── __init__.py
│   ├── base.py          # BaseAgent class
│   └── loader.py        # Prompt/learnings loading
└── config.py            # Configuration
```

### Phase 2: Orchestration
```
src/
├── orchestration/
│   ├── __init__.py
│   ├── master.py        # Master Orchestrator
│   ├── chapter.py       # Chapter Orchestrator
│   └── validators.py    # Validation runners
```

### Phase 3: Tools & API
```
src/
├── tools/
│   ├── __init__.py
│   ├── diagram_renderer.py
│   └── file_concatenator.py
├── api/
│   ├── __init__.py
│   └── main.py          # FastAPI app
```

---

## Important Notes

1. **Prompts are the source of truth** - Each agent's prompt file defines exactly what it does
2. **Learnings evolve** - Agents append to their learnings files as they learn
3. **Memory is shared** - All agents read/write to the same database
4. **Validators gate progress** - Must pass validation to proceed
5. **Quality is non-negotiable** - 0.80 minimum score required
6. **Both languages matter** - English and Spanish are equal priority

---

## Questions for Human

Before starting implementation, clarify:

1. Do you have the source sales book ready for testing?
2. What Claude API model should be used? (claude-3-opus, claude-3-sonnet, etc.)
3. Any specific technology preferences for the backend?
4. Should we start with SQLite and migrate to PostgreSQL later?
5. What's the priority: get one chapter working first, or scaffold the whole system?
