# Book Maker: AI-Powered Book Transformation System

## What This Project Does

Takes a generic sales book and transforms it into a roofing-specific sales book, complete with:
- Roofing-contextualized tactics and examples
- Custom diagrams in hand-drawn style (Rough.js with Caveat font)
- Full Spanish translation
- Multiple output formats (Kindle, ePub, PDF, print-ready)

## Core Architecture

### The Three Pillars

1. **Memory System** - Persistent database (SQLite/PostgreSQL) that all agents read/write to
2. **Orchestration** - Master Orchestrator + Chapter Orchestrators managing the pipeline
3. **Specialized Agents** - 57 micro-agents + 10 validators + 2 tools = 69 total components

### Key Design Decisions

- **One agent, one task, one output** - Hyper-focused agents are easier to debug, test, and improve
- **Agents query memory, not carry context** - Avoids token limit issues as book grows
- **Self-maintaining learnings** - Agents read/write their own learnings files (`/memory/learnings/{agent_name}.md`)
- **Parallel where possible, sequential where necessary** - Phases 1-3 parallel, Phase 4+ sequential
- **Quality gating** - 8-dimension quality scoring with 0.80 minimum threshold

## Component Summary

| Category | Agents | Validators | Tools |
|----------|--------|------------|-------|
| Orchestration | 2 | - | - |
| Prep | 5 | 1 | - |
| Analysis | 6 | 1 | - |
| Transform | 5 | 1 | - |
| Writing | 8 | 1 | - |
| Visual | 6 | 1 | 1 |
| Editing | 9 | 1 | - |
| Issue Resolution | 2 | - | - |
| Quality | 1 | - | - |
| Translation Prep | 2 | 1 | - |
| Translation | 4 | 1 | - |
| Assembly | 5 | 1 | 1 |
| Output | 4 | 1 | - |
| **TOTAL** | **57** | **10** | **2** |

**Grand Total: 69 components**

## Pipeline Phases

```
INPUT: Generic Sales Book (Kindle/ePub/PDF)
           │
           ▼
    PHASE 1: PREPARATION (once)
    - Format Converter, Chapter Splitter, Structure Analyzer
    - Relationship Mapper, Style Guide Creator
           │
           ▼
    PHASE 2: ANALYSIS (per chapter, parallel)
    - Tactic/Story/Quote Extractors
    - Content Categorizer, Cross-Ref Identifier, Duplicate Detector
           │
           ▼
    PHASE 3: TRANSFORMATION (per chapter, parallel)
    - Tactic/Story Transformers, Script Adapter
    - Glossary Builder, Roofing Context Enricher
           │
           ▼
    ══════════════════════════════════════════
    SNAPSHOT V1 CREATED - Sequential from here
    ══════════════════════════════════════════
           │
           ▼
    PHASE 4: WRITING (per chapter, sequential)
    - Chapter Outliner, Section Writer, Transition Writer
    - Summary Writer, Cross-Ref Inserter
    - Chapter Title Generator, Example Generator, Takeaways Writer
           │
           ▼
    PHASE 5: VISUAL ENHANCEMENT (per chapter)
    - Visual Opportunity Identifier, Callout Generator
    - Diagram Specifier, Diagram Placer
    - Diagram Code Generator, Caption Writer
           │
           ▼
    PHASE 6: EDITING (per chapter)
    - Clarity Editor, Term/Tone Consistency Checkers
    - Fact Checker, Grammar Checker, Flow Checker
    - Script Formatter, Reading Level Analyzer, Originality Checker
           │
           ▼
    PHASE 7: QUALITY (per chapter)
    - Quality Scorer (8 dimensions, 0.80 minimum)
           │
           ▼
    PHASE 8: TRANSLATION PREP (once)
    - Terminology Translator, Spanish Style Guide Creator
           │
           ▼
    PHASE 9: TRANSLATION (per chapter, parallel)
    - Chapter Translator, Spanish Naturalizer
    - Diagram Text Translator, Spanish Proofreader
           │
           ▼
    PHASE 10: ASSEMBLY (once per language)
    - Structure Assembler, TOC Generator
    - Front Matter Writer, Back Matter Writer, Index Generator
           │
           ▼
    PHASE 11: FINAL OUTPUT (once)
    - Kindle Formatter, PDF Formatter
    - Metadata Generator, Book Blurb Writer
           │
           ▼
OUTPUT: Roofing Sales Book (EN) + Roofing Sales Book (ES)
```

## Quality Dimensions

The Quality Scorer evaluates chapters on 8 dimensions:

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

**Overall minimum: 0.80 (weighted average)**

## Automation Modes

1. **Testing Mode** - Human reviews after each phase, can edit/adjust
2. **Supervised Mode** - Runs automatically, human spot-checks
3. **Autonomous Mode** - Fully hands-off, human only sees final output

## Technology Stack

- **Backend**: Python + FastAPI
- **Database**: SQLite or PostgreSQL (Memory System)
- **AI**: Anthropic Claude API
- **Diagrams**: Rough.js (hand-drawn style) with Caveat font
- **Frontend**: Lovable (planned)
- **Hosting**: Railway/Render (planned)

## Project Structure

```
Book Maker/
├── docs/                    # Project documentation (12 files)
├── memory/                  # Memory system files
│   └── learnings/          # Agent learning files (global + per-agent)
├── prompts/                 # Agent prompt files (69 files)
│   ├── orchestrators/      # Master + Chapter orchestrators
│   ├── phase_01_prep/      # Preparation agents
│   ├── phase_02_analysis/  # Analysis agents
│   ├── phase_03_transform/ # Transform agents
│   ├── phase_04_writing/   # Writing agents
│   ├── phase_05_visual/    # Visual agents
│   ├── phase_06_editing/   # Editing agents
│   ├── phase_07_quality/   # Quality scorer
│   ├── phase_08_translation_prep/  # Translation prep agents
│   ├── phase_09_translation/       # Translation agents
│   ├── phase_10_assembly/  # Assembly agents
│   ├── phase_11_output/    # Output agents
│   ├── issue_resolution/   # Issue processing agents
│   └── validators/         # All validators
├── diagrams/               # Diagram examples and templates
└── src/                    # Source code (to be built)
```

## Documentation Index

1. `01-PROJECT-OVERVIEW.md` - This file
2. `02-PIPELINE-DETAILED.md` - Phase-by-phase breakdown with agents
3. `03-MEMORY-SYSTEM.md` - Database schema and queries
4. `04-LEARNING-SYSTEM.md` - How agents improve over time
5. `05-AGENT-REGISTRY-v2.md` - Complete agent list with status
6. `06-DIAGRAM-SYSTEM.md` - Rough.js diagram specifications
7. `07-ERROR-HANDLING.md` - Retry logic and circuit breakers
8. `08-QUALITY-METRICS.md` - Scoring dimensions and thresholds
9. `09-ORCHESTRATION.md` - How orchestrators manage the pipeline
10. `10-ROOFING-CONTEXT.md` - Industry-specific knowledge base
11. `11-SPANISH-GUIDELINES.md` - Translation standards
12. `12-SQUAD-EXECUTION-ORDER.md` - Detailed execution order per phase
