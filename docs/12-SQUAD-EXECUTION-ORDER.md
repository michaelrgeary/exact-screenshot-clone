# Squad Execution Order

Complete specification of agent squads, execution order, dependencies, and parallelization rules.

---

## Quick Reference: Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MASTER ORCHESTRATOR                          │
│                    (Controls entire pipeline)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: PREP (Book-Level, Sequential)                             │
│  Format Converter → Chapter Splitter → Structure Analyzer →          │
│  Relationship Mapper → Style Guide Creator → [PREP VALIDATOR]        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: ANALYSIS (Book-Level, Mixed)                              │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐       │
│  │ Tactic      │   │ Story        │   │ Quote               │       │
│  │ Extractor   │   │ Extractor    │   │ Extractor           │       │
│  └──────┬──────┘   └──────────────┘   └─────────────────────┘       │
│         │ (parallel)     (parallel)          (parallel)              │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Content Categorizer → Cross-Ref Identifier → Duplicate Det. │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                    → [ANALYSIS VALIDATOR]                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASES 3-7: PER-CHAPTER PROCESSING                                 │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Chapter 1        │  │ Chapter 2        │  │ Chapter N        │   │
│  │ (Ch. Orchestrator)│  │ (Ch. Orchestrator)│  │ (Ch. Orchestrator)│   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│         │                      │                      │              │
│         └──────────────────────┴──────────────────────┘              │
│                    (Can run in parallel)                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 8: TRANSLATION PREP (Book-Level, Sequential)                 │
│  Terminology Translator → Spanish Style Guide Creator →             │
│  [TRANSLATION PREP VALIDATOR]                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 9: TRANSLATION (Per-Chapter, Parallel)                       │
│  For each chapter:                                                   │
│  Chapter Translator → Spanish Naturalizer → Spanish Proofreader     │
│  + Diagram Text Translator (parallel)                               │
│  → [TRANSLATION VALIDATOR]                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 10: ASSEMBLY (Book-Level, Sequential)                        │
│  Front Matter Writer ─┐                                              │
│  Back Matter Writer  ─┼→ Structure Assembler → TOC Generator →      │
│  Index Generator     ─┘  [BOOK VALIDATOR]                           │
│  (parallel)               (sequential)                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 11: OUTPUT (Book-Level, Parallel then Sequential)            │
│  ┌─────────────────┐  ┌─────────────────┐                           │
│  │ Kindle Formatter│  │ PDF Formatter   │  (parallel)               │
│  └────────┬────────┘  └────────┬────────┘                           │
│           └────────────────────┘                                     │
│                      │                                               │
│           Metadata Generator → Book Blurb Writer →                   │
│           [FINAL QA VALIDATOR]                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Prep Squad

**Scope**: Entire book (runs once)
**Execution**: Sequential (each step depends on previous)
**Orchestrator**: Master Orchestrator

### Execution Order

```
Step 1: Format Converter
    │   Input: Raw book file (Kindle/EPUB/PDF)
    │   Output: Clean markdown text
    ▼
Step 2: Chapter Splitter
    │   Input: Full markdown text
    │   Output: Individual chapter files + chapter count
    ▼
Step 3: Structure Analyzer
    │   Input: All chapters
    │   Output: Book structure, themes, relationships
    ▼
Step 4: Relationship Mapper
    │   Input: Structure analysis + chapters
    │   Output: Chapter dependency map, cross-ref opportunities
    ▼
Step 5: Style Guide Creator
    │   Input: Sample chapters
    │   Output: Voice, tone, formatting rules
    ▼
VALIDATION: Prep Validator
    │   Checks: All chapters extracted, structure complete
    ▼
PROCEED TO PHASE 2
```

### Dependencies
| Agent | Depends On | Must Complete Before |
|-------|------------|---------------------|
| Format Converter | (none) | Chapter Splitter |
| Chapter Splitter | Format Converter | Structure Analyzer |
| Structure Analyzer | Chapter Splitter | Relationship Mapper |
| Relationship Mapper | Structure Analyzer | Style Guide Creator |
| Style Guide Creator | All above | Prep Validator |

---

## Phase 2: Analysis Squad

**Scope**: Entire book (runs once, but processes chapters)
**Execution**: Mixed (some parallel, some sequential)
**Orchestrator**: Master Orchestrator

### Execution Order

```
┌────────────────────────────────────────────────────────────────┐
│ PARALLEL GROUP 1 (can run simultaneously)                      │
│                                                                │
│   Tactic Extractor ─────┐                                      │
│   Story Extractor  ─────┼───▶ (all extract from chapters)      │
│   Quote Extractor  ─────┘                                      │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ SEQUENTIAL GROUP (must run in order)                           │
│                                                                │
│   Step 4: Content Categorizer                                  │
│       │   Input: Extracted tactics                             │
│       │   Output: Categorized tactics by type/stage            │
│       ▼                                                        │
│   Step 5: Cross-Ref Identifier                                 │
│       │   Input: Categorized tactics + book structure          │
│       │   Output: Cross-reference opportunities                │
│       ▼                                                        │
│   Step 6: Duplicate Detector                                   │
│       │   Input: All tactics, stories across chapters          │
│       │   Output: Duplicates to consolidate                    │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
              VALIDATION: Analysis Validator
                          │
              PROCEED TO PHASE 3
```

### Dependencies
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Tactic Extractor | (none) | Story, Quote Extractors |
| Story Extractor | (none) | Tactic, Quote Extractors |
| Quote Extractor | (none) | Tactic, Story Extractors |
| Content Categorizer | Tactic Extractor | (none) |
| Cross-Ref Identifier | Content Categorizer | (none) |
| Duplicate Detector | All Extractors | (none) |

---

## Phases 3-7: Per-Chapter Processing

**Scope**: Each chapter independently
**Execution**: Chapters can run in parallel; agents within chapter are mostly sequential
**Orchestrator**: Chapter Orchestrator (one per chapter)

### Chapter Orchestrator Flow

```
CHAPTER ORCHESTRATOR (for Chapter N)
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: TRANSFORM SQUAD                                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PARALLEL GROUP                                               ││
│  │   Tactic Transformer ──┬──▶ (all transform simultaneously)  ││
│  │   Story Transformer  ──┤                                    ││
│  │   Script Adapter     ──┘                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ SEQUENTIAL                                                   ││
│  │   Glossary Builder (adds new terms)                         ││
│  │   Roofing Context Enricher (adds authentic details)         ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│              TRANSFORM VALIDATOR                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: WRITING SQUAD                                         │
│                                                                  │
│  Step 1: Chapter Outliner                                       │
│      │   Create detailed section outline                        │
│      ▼                                                          │
│  Step 2: Section Writer (loops for each section)                │
│      │   Write each section based on outline                    │
│      ▼                                                          │
│  Step 3: Transition Writer                                      │
│      │   Polish transitions between sections                    │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PARALLEL GROUP                                               ││
│  │   Example Generator ───┬──▶ (can run simultaneously)        ││
│  │   Summary Writer     ───┤                                   ││
│  │   Takeaways Writer   ───┘                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  Step 7: Cross-Ref Inserter                                     │
│      │   Add cross-references to other chapters                 │
│      ▼                                                          │
│  Step 8: Chapter Title Generator                                │
│      │   Create compelling chapter title                        │
│      ▼                                                          │
│              DRAFT VALIDATOR                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: VISUAL SQUAD                                          │
│                                                                  │
│  Step 1: Visual Opportunity Identifier                          │
│      │   Find places that benefit from diagrams                 │
│      ▼                                                          │
│  Step 2: Callout Generator                                      │
│      │   Identify pro tips, warnings, sidebars                  │
│      ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ FOR EACH DIAGRAM:                                            ││
│  │   Diagram Specifier → Diagram Code Generator →               ││
│  │   Caption Writer (sequential per diagram)                    ││
│  │                                                              ││
│  │   Note: Multiple diagrams can process in parallel            ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  Step 5: Diagram Placer                                         │
│      │   Determine optimal placement in text                    │
│      ▼                                                          │
│              DIAGRAM VALIDATOR                                   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: EDITING SQUAD                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PARALLEL GROUP 1 (style/consistency checks)                  ││
│  │   Clarity Editor        ───┐                                 ││
│  │   Term Consistency Checker ─┼──▶ (run simultaneously)        ││
│  │   Tone Consistency Checker ─┘                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PARALLEL GROUP 2 (content checks)                            ││
│  │   Fact Checker    ───┐                                       ││
│  │   Grammar Checker ───┼──▶ (run simultaneously)               ││
│  │   Flow Checker    ───┘                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PARALLEL GROUP 3 (format/quality checks)                     ││
│  │   Script Formatter      ───┐                                 ││
│  │   Reading Level Analyzer ───┼──▶ (run simultaneously)        ││
│  │   Originality Checker   ───┘                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                      │
│                          ▼                                      │
│  SEQUENTIAL: Issue Resolution                                    │
│      Issue Processor → Issue Resolver                            │
│                          │                                      │
│              EDIT VALIDATOR                                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 7: QUALITY SQUAD                                         │
│                                                                  │
│  Quality Scorer                                                  │
│      │   Score all 8 dimensions                                 │
│      │   Determine pass/fail                                    │
│      ▼                                                          │
│  IF score < 0.80: Flag for improvement, may retry editing       │
│  IF score ≥ 0.80: Chapter complete, ready for translation       │
└─────────────────────────────────────────────────────────────────┘
                          │
              CHAPTER COMPLETE
              Report to Master Orchestrator
```

### Phase 3 Transform Squad Details
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Tactic Transformer | Analysis complete | Story, Script |
| Story Transformer | Analysis complete | Tactic, Script |
| Script Adapter | Analysis complete | Tactic, Story |
| Glossary Builder | Transformers | (none) |
| Roofing Context Enricher | Glossary Builder | (none) |

### Phase 4 Writing Squad Details
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Chapter Outliner | Transform complete | (none) |
| Section Writer | Chapter Outliner | (none) |
| Transition Writer | Section Writer | (none) |
| Example Generator | Transition Writer | Summary, Takeaways |
| Summary Writer | Transition Writer | Example, Takeaways |
| Takeaways Writer | Transition Writer | Example, Summary |
| Cross-Ref Inserter | All above | (none) |
| Chapter Title Generator | Cross-Ref Inserter | (none) |

### Phase 5 Visual Squad Details
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Visual Opportunity Identifier | Draft complete | (none) |
| Callout Generator | Visual Opp. ID | (none) |
| Diagram Specifier | Visual Opp. ID | Other diagrams |
| Diagram Code Generator | Diagram Specifier | Other diagrams |
| Caption Writer | Diagram Code Gen | Other diagrams |
| Diagram Placer | All diagrams | (none) |

### Phase 6 Editing Squad Details
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Clarity Editor | Draft complete | Term, Tone Checkers |
| Term Consistency Checker | Draft complete | Clarity, Tone |
| Tone Consistency Checker | Draft complete | Clarity, Term |
| Fact Checker | Group 1 complete | Grammar, Flow |
| Grammar Checker | Group 1 complete | Fact, Flow |
| Flow Checker | Group 1 complete | Fact, Grammar |
| Script Formatter | Group 2 complete | Reading, Originality |
| Reading Level Analyzer | Group 2 complete | Script, Originality |
| Originality Checker | Group 2 complete | Script, Reading |
| Issue Processor | Group 3 complete | (none) |
| Issue Resolver | Issue Processor | (none) |

---

## Phase 8: Translation Prep Squad

**Scope**: Entire book (runs once)
**Execution**: Sequential
**Orchestrator**: Master Orchestrator

### Execution Order

```
Step 1: Terminology Translator
    │   Input: Full English glossary (all 47+ terms)
    │   Output: Spanish translations with usage notes
    ▼
Step 2: Spanish Style Guide Creator
    │   Input: English style guide + terminology
    │   Output: Spanish voice, tone, formality rules
    ▼
VALIDATION: Translation Prep Validator
    │   Checks: All terms translated, style guide complete
    ▼
PROCEED TO PHASE 9
```

---

## Phase 9: Translation Squad

**Scope**: Each chapter independently
**Execution**: Chapters can run in parallel; agents within chapter sequential
**Orchestrator**: Master Orchestrator (no chapter orchestrator needed)

### Execution Order (Per Chapter)

```
Step 1: Chapter Translator
    │   Input: English chapter + terminology + style guide
    │   Output: Draft Spanish chapter
    ▼
Step 2: Spanish Naturalizer
    │   Input: Draft Spanish chapter
    │   Output: Naturalized Spanish (sounds native)
    ▼
Step 3: Spanish Proofreader
    │   Input: Naturalized chapter
    │   Output: Proofread, error-free Spanish
    ▼
PARALLEL: Diagram Text Translator
    │   Input: Diagram text elements
    │   Output: Spanish diagram text
    │   (Can run alongside main translation pipeline)
    ▼
VALIDATION: Translation Validator
    │   Checks: Terminology consistent, natural expression
    ▼
CHAPTER TRANSLATION COMPLETE
```

### Dependencies
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Chapter Translator | Trans. Prep complete | Other chapters |
| Spanish Naturalizer | Chapter Translator | (none) |
| Spanish Proofreader | Spanish Naturalizer | (none) |
| Diagram Text Translator | Chapter Translator | Naturalizer, Proofreader |

---

## Phase 10: Assembly Squad

**Scope**: Entire book (runs once per language)
**Execution**: Mixed (some parallel, some sequential)
**Orchestrator**: Master Orchestrator

### Execution Order

```
┌────────────────────────────────────────────────────────────────┐
│ PARALLEL GROUP (can write simultaneously)                      │
│                                                                │
│   Front Matter Writer ─────┐                                   │
│   Back Matter Writer  ─────┼───▶ (independent content)         │
│   Index Generator     ─────┘                                   │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
Step 4: Structure Assembler
    │   Input: All chapters + front/back matter
    │   Output: Complete book structure
    ▼
Step 5: TOC Generator
    │   Input: Book structure
    │   Output: Formatted table of contents
    ▼
VALIDATION: Book Validator
    │   Checks: All chapters present, cross-refs valid
    ▼
PROCEED TO PHASE 11
```

### Dependencies
| Agent | Depends On | Can Parallel With |
|-------|------------|-------------------|
| Front Matter Writer | All chapters complete | Back Matter, Index |
| Back Matter Writer | All chapters complete | Front Matter, Index |
| Index Generator | All chapters complete | Front Matter, Back Matter |
| Structure Assembler | Front, Back, Index | (none) |
| TOC Generator | Structure Assembler | (none) |

---

## Phase 11: Output Squad

**Scope**: Entire book (runs once, produces multiple outputs)
**Execution**: Mixed
**Orchestrator**: Master Orchestrator

### Execution Order

```
┌────────────────────────────────────────────────────────────────┐
│ PARALLEL GROUP 1 (format simultaneously)                       │
│                                                                │
│   Kindle Formatter (English) ─────┐                            │
│   Kindle Formatter (Spanish) ─────┤                            │
│   PDF Formatter (English)    ─────┼──▶ (independent formats)   │
│   PDF Formatter (Spanish)    ─────┘                            │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
Step 2: Metadata Generator
    │   Input: Book info
    │   Output: Publishing metadata for all platforms
    ▼
Step 3: Book Blurb Writer
    │   Input: Book content summaries
    │   Output: Marketing copy
    ▼
VALIDATION: Final QA Validator
    │   Checks: All files valid, quality scores met
    ▼
PIPELINE COMPLETE
```

---

## Parallelization Rules Summary

### Can Run in Parallel
| Level | Items |
|-------|-------|
| Chapters | All 12+ chapters through Phases 3-7 |
| Extractors | Tactic, Story, Quote Extractors |
| Transformers | Tactic, Story, Script Transformers |
| Writers | Example, Summary, Takeaways Writers |
| Diagrams | Multiple diagrams within a chapter |
| Editors Group 1 | Clarity, Term, Tone Checkers |
| Editors Group 2 | Fact, Grammar, Flow Checkers |
| Editors Group 3 | Script, Reading, Originality Checkers |
| Translation | Chapters can translate in parallel |
| Assembly Writers | Front Matter, Back Matter, Index |
| Formatters | Kindle and PDF (per language) |

### Must Run Sequentially
| Dependency Chain | Reason |
|-----------------|--------|
| Format Converter → Chapter Splitter | Need text before splitting |
| Extractors → Content Categorizer → Cross-Ref → Duplicate | Each builds on previous |
| Chapter Outliner → Section Writer → Transition Writer | Writing order matters |
| Editing Groups 1 → 2 → 3 | Groups catch different issues |
| Issue Processor → Issue Resolver | Must know issues before fixing |
| Chapter Translator → Naturalizer → Proofreader | Each refines previous |
| Structure Assembler → TOC Generator | Need structure for TOC |

---

## Error Handling & Retry Rules

### Per-Agent Retries
| Failure Type | Max Retries | Action |
|--------------|-------------|--------|
| Transient (API) | 3 | Exponential backoff |
| Validation Fail | 2 | Retry with feedback |
| Quality Fail | 1 | Retry with guidance |
| Hard Error | 0 | Stop, escalate |

### Chapter-Level Handling
- If chapter fails 3+ agents: Mark chapter failed, continue others
- If 3+ chapters fail: Stop pipeline, alert human

### Phase-Level Handling
- If validator fails: Retry specific failing agents
- If validator fails twice: Stop, require human review

---

## Checkpoint / Resume Points

After each phase completion, checkpoint is saved:
1. After Phase 1: Book parsed, ready for analysis
2. After Phase 2: Analysis complete, ready for transform
3. After Phase 3 (per chapter): Transform complete
4. After Phase 4 (per chapter): Draft complete
5. After Phase 5 (per chapter): Visuals complete
6. After Phase 6 (per chapter): Editing complete
7. After Phase 7 (per chapter): Quality scored
8. After Phase 8: Translation ready
9. After Phase 9 (per chapter): Translation complete
10. After Phase 10: Book assembled
11. After Phase 11: Outputs generated

Pipeline can resume from any checkpoint on failure.
