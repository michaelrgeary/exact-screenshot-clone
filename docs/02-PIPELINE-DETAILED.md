# Detailed Pipeline Specification

## Phase 1: Preparation (Run Once)

**Purpose**: Convert raw book to workable format, analyze structure, establish baselines.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 1 | Format Converter | Raw book file (Kindle/ePub/PDF) | Clean markdown text | CHAPTERS.original_text |
| 2 | Chapter Splitter | Full markdown text | Individual chapter files | CHAPTERS (creates rows) |
| 3 | Structure Analyzer | Full book text | TOC, themes, structure doc | BOOK_CONTEXT |
| 4 | Relationship Mapper | Structure doc + chapters | Chapter relationship map | BOOK_CONTEXT |
| 5 | Style Guide Creator | Sample chapters | Style guide document | STYLE_GUIDE |
| V | Prep Validator | All Phase 1 outputs | PASS/FAIL + issues | VALIDATION_LOG |

**Exit Criteria**: All chapters extracted, structure documented, style guide created.

---

## Phase 2: Analysis (Per Chapter, Parallel)

**Purpose**: Extract all valuable content from each source chapter.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 6 | Tactic Extractor | Chapter text | List of sales tactics | TACTICS |
| 7 | Story Extractor | Chapter text | Stories/examples/cases | CHAPTERS.analysis |
| 8 | Quote Extractor | Chapter text | Key quotes, memorable lines | CHAPTERS.analysis |
| 9 | Content Categorizer | Tactics list | Categorized tactics | TACTICS.category |
| 10 | Cross-Ref Identifier | Chapter + structure | Cross-reference opportunities | CROSS_REFS |
| 11 | Duplicate Detector | All tactics + stories | Duplicate/overlap flags | TACTICS.duplicate_of |
| V | Analysis Validator | All Phase 2 outputs | PASS/FAIL + issues | VALIDATION_LOG |

**Dependencies**:
- Tactic Extractor runs first
- Story/Quote Extractors can run parallel with Tactic Extractor
- Categorizer needs Tactic Extractor complete
- Cross-Ref Identifier needs Categorizer complete
- Duplicate Detector runs after all extractors complete

**Exit Criteria**: All tactics extracted and categorized, stories identified, cross-refs mapped, duplicates flagged.

---

## Phase 3: Transformation (Per Chapter, Parallel)

**Purpose**: Convert generic sales content to roofing-specific content.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 12 | Tactic Transformer | Tactics + roofing context | Roofing-contextualized tactics | TACTICS.roofing_context |
| 13 | Story Transformer | Stories + roofing context | Roofing scenarios | CHAPTERS.transformed |
| 14 | Script Adapter | Scripts + roofing context | Roofing sales scripts | CHAPTERS.transformed |
| 15 | Glossary Builder | New roofing terms | Term definitions | GLOSSARY |
| 16 | Roofing Context Enricher | Transformed content | Enhanced roofing details | CHAPTERS.enriched |
| V | Transform Validator | All Phase 3 outputs | PASS/FAIL + issues | VALIDATION_LOG |

**Exit Criteria**: All content transformed to roofing context, glossary populated.

---

### === SNAPSHOT V1 CREATED ===

At this point, create a snapshot of all memory. Phases 4+ run sequentially and can reference previous chapters.

---

## Phase 4: Writing (Per Chapter, Sequential)

**Purpose**: Write the new roofing sales chapter.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 17 | Chapter Outliner | Transformed content + summaries | Chapter outline | CHAPTERS.outline |
| 18 | Section Writer | Outline + tactics (loops per section) | Section text | CHAPTERS.sections[] |
| 19 | Transition Writer | Sections | Polished transitions | CHAPTERS.draft |
| 20 | Summary Writer | Draft | Chapter summary | CHAPTERS.summary |
| 21 | Cross-Ref Inserter | Draft + CROSS_REFS | Draft with references | CHAPTERS.draft |
| 22 | Chapter Title Generator | Draft content | Final chapter title | CHAPTERS.title |
| 23 | Example Generator | Draft + tactics | Additional examples | CHAPTERS.examples |
| 24 | Takeaways Writer | Draft | Key takeaways section | CHAPTERS.takeaways |
| V | Draft Validator | Complete draft | PASS/FAIL + issues | VALIDATION_LOG |

**Why Sequential**: Each chapter can reference summaries of previous chapters. Chapter 5 can say "As we discussed in Chapter 3..."

**Exit Criteria**: Complete draft with summary, takeaways, and cross-references.

---

## Phase 5: Visual Enhancement (Per Chapter)

**Purpose**: Add diagrams and visuals where they add value.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 25 | Visual Opportunity Identifier | Chapter draft | List of visual opportunities | DIAGRAMS (placeholder) |
| 26 | Callout Generator | Chapter draft | Callout box content | CALLOUTS |
| 27 | Diagram Specifier | Opportunity | Detailed diagram spec | DIAGRAMS.specification |
| 28 | Diagram Placer | Draft + diagrams | Placement locations | DIAGRAMS.placement |
| 29 | Diagram Code Generator | Spec | Rough.js HTML/JS code | DIAGRAMS.code |
| 30 | Diagram Renderer | Code | PNG/SVG image file | DIAGRAMS.file_path |
| 31 | Caption Writer | Diagram + context | Caption text | DIAGRAMS.caption_en |
| V | Diagram Validator | All diagrams for chapter | PASS/FAIL + issues | VALIDATION_LOG |

**Note**: Diagram Renderer is a TOOL (headless browser), not an LLM agent.

**Exit Criteria**: All diagrams created, validated, captioned, and placed.

---

## Phase 6: Editing (Per Chapter)

**Purpose**: Polish the chapter to publication quality.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 32 | Clarity Editor | Draft | Clarified text | CHAPTERS.edited |
| 33 | Term Consistency Checker | Draft + GLOSSARY | Term issues | ISSUES |
| 34 | Tone Consistency Checker | Draft + STYLE_GUIDE | Tone issues | ISSUES |
| 35 | Fact Checker | Draft (roofing claims) | Fact issues | ISSUES |
| 36 | Grammar Checker | Draft | Grammar fixes | CHAPTERS.edited |
| 37 | Flow Checker | Draft | Flow issues | ISSUES |
| 38 | Script Formatter | Draft scripts | Formatted scripts | CHAPTERS.edited |
| 39 | Reading Level Analyzer | Draft | Reading level score | CHAPTERS.reading_level |
| 40 | Originality Checker | Draft + source | Originality score | CHAPTERS.originality |
| V | Edit Validator | Edited chapter | PASS/FAIL + issues | VALIDATION_LOG |

**Issue Resolution** (embedded in Phase 6):

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 41 | Issue Processor | All issues | Prioritized issue list | ISSUES.processed |
| 42 | Issue Resolver | Issues + draft | Resolved draft | CHAPTERS.edited |

**Exit Criteria**: All issues resolved, grammar clean, reading level appropriate.

---

## Phase 7: Quality (Per Chapter)

**Purpose**: Score the chapter and determine if it meets publication standards.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 43 | Quality Scorer | Final chapter | Quality score + breakdown | CHAPTERS.quality |

**Quality Dimensions** (8 total):
- Content Fidelity (15%, min 0.80)
- Roofing Relevance (15%, min 0.85)
- Clarity (12%, min 0.80)
- Actionability (15%, min 0.85)
- Engagement (10%, min 0.75)
- Flow (10%, min 0.80)
- Visual Integration (8%, min 0.75)
- Consistency (15%, min 0.85)

**Exit Criteria**: Quality score ≥ 0.80 overall, all dimensions meet minimums.

---

## Phase 8: Translation Prep (Once)

**Purpose**: Prepare for consistent Spanish translation.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 44 | Terminology Translator | GLOSSARY (all terms) | Spanish terms | GLOSSARY.spanish_term |
| 45 | Spanish Style Guide Creator | STYLE_GUIDE | Spanish style guide | STYLE_GUIDE_ES |
| V | Translation Prep Validator | Spanish glossary + style | PASS/FAIL + issues | VALIDATION_LOG |

**Exit Criteria**: All terms translated, Spanish style guide ready.

---

## Phase 9: Translation (Per Chapter, Parallel)

**Purpose**: Translate each chapter to Spanish.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 46 | Chapter Translator | Chapter + Spanish glossary | Spanish chapter | CHAPTERS.spanish_text |
| 47 | Spanish Naturalizer | Spanish chapter | Natural-sounding Spanish | CHAPTERS.spanish_text |
| 48 | Diagram Text Translator | DIAGRAMS.caption_en | Spanish captions | DIAGRAMS.caption_es |
| 49 | Spanish Proofreader | Spanish chapter | Proofread text | CHAPTERS.spanish_text |
| V | Translation Validator | Spanish chapter | PASS/FAIL + issues | VALIDATION_LOG |

**Note**: Can run in parallel because Spanish glossary is pre-built.

**Exit Criteria**: All chapters translated, naturalized, and proofread.

---

## Phase 10: Book Assembly (Once per Language)

**Purpose**: Compile all chapters into complete manuscript.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 50 | Structure Assembler | All chapter metadata | Book structure file | BOOK |
| 51 | TOC Generator | Chapter titles + structure | Table of contents | BOOK.toc |
| 52 | Front Matter Writer | Book context | Intro, how to use | BOOK.front_matter |
| 53 | Back Matter Writer | Book context | Conclusion, resources | BOOK.back_matter |
| 54 | Index Generator | All chapters | Searchable index | BOOK.index |
| 55 | File Concatenator | All chapter files | Single manuscript | BOOK.manuscript |
| V | Book Validator | Complete manuscript | PASS/FAIL + issues | VALIDATION_LOG |

**Note**: File Concatenator is a TOOL, not an LLM agent.

**Exit Criteria**: Complete English and Spanish manuscripts ready for formatting.

---

## Phase 11: Final Output (Once)

**Purpose**: Generate publishable files.

| Step | Agent | Input | Output | Saves To |
|------|-------|-------|--------|----------|
| 56 | Kindle Formatter | Manuscripts | .mobi/.epub files | OUTPUT/ |
| 57 | PDF Formatter | Manuscripts | PDF files | OUTPUT/ |
| 58 | Metadata Generator | Book info | Metadata files | OUTPUT/ |
| 59 | Book Blurb Writer | Book context | Marketing blurbs | OUTPUT/blurbs |
| V | Final QA Validator | All output files | Final QA report | VALIDATION_LOG |

**Exit Criteria**: All formats generated, validated, and ready for publishing.

---

## Validation & Quality Summary

| Validator | Runs | Checks |
|-----------|------|--------|
| Prep Validator | Once | Chapters extracted, structure complete |
| Analysis Validator | Per chapter | Tactics found, categorized |
| Transform Validator | Per chapter | Content transformed, glossary updated |
| Draft Validator | Per chapter | Word count, summary, no placeholders |
| Diagram Validator | Per chapter | Diagrams render, have captions |
| Edit Validator | Per chapter | Issues resolved, grammar clean |
| Quality Scorer | Per chapter | 8 dimensions, 0.80 minimum |
| Translation Prep Validator | Once | Terms translated, style guide ready |
| Translation Validator | Per chapter | Consistent terms, proportional length |
| Book Validator | Once per language | TOC matches, cross-refs work |
| Final QA Validator | Once | Files generate, metadata complete |

---

## Error Handling

| Failure Type | Retry? | Max Retries | Action on Exhaust |
|--------------|--------|-------------|-------------------|
| Transient (API error) | Yes, auto | 3 | Log, alert |
| Validation fail | Yes, with feedback | 2 | STOP pipeline |
| Quality below threshold | Yes, with feedback | 1 | STOP, flag for review |
| Hard failure (exception) | No | 0 | STOP immediately |

**Circuit Breaker**: If same agent fails on 3+ chapters, STOP entire pipeline and alert.
