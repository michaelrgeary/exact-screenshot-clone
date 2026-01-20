# Learning System Specification

## Overview

Agents maintain their own knowledge through simple markdown files. Before each task, an agent reads its learnings file. After completing work, it can append new learnings for future runs.

## Core Principle

**Agents are self-improving.** They read what previous runs learned, and contribute their own insights.

---

## File Structure

```
/memory/learnings/
├── _global.md                    # Universal rules for ALL agents
├── format_converter.md
├── chapter_splitter.md
├── structure_analyzer.md
├── relationship_mapper.md
├── style_guide_creator.md
├── tactic_extractor.md
├── story_extractor.md
├── quote_extractor.md
├── content_categorizer.md
├── crossref_identifier.md
├── tactic_transformer.md
├── story_transformer.md
├── script_adapter.md
├── glossary_builder.md
├── chapter_outliner.md
├── section_writer.md
├── transition_writer.md
├── summary_writer.md
├── crossref_inserter.md
├── visual_opportunity_identifier.md
├── diagram_specifier.md
├── diagram_code_generator.md
├── diagram_validator.md
├── caption_writer.md
├── clarity_editor.md
├── term_consistency_checker.md
├── tone_consistency_checker.md
├── fact_checker.md
├── grammar_checker.md
├── flow_checker.md
├── issue_aggregator.md
├── issue_resolver.md
├── chapter_quality_scorer.md
├── chapter_translator.md
├── idiom_localizer.md
├── diagram_text_translator.md
├── flow_reviewer.md
├── spanish_proofreader.md
└── ... (one per agent type)
```

---

## Learnings File Format

```markdown
# Learnings: [Agent Name]

Last updated: [Date] by [Source]

## Critical (Must Follow)

These are non-negotiable rules discovered through experience.

- **[Short title]**: [Detailed explanation of what to do/not do]
- **[Short title]**: [Detailed explanation]

## Important (Should Follow)

Strong recommendations that improve output quality.

- [Learning]
- [Learning]

## Observations (Context)

Helpful context that informs decisions but isn't prescriptive.

- [Observation]
- [Observation]

## Don't Do

Anti-patterns to avoid.

- [What not to do and why]
- [What not to do and why]

---
Added by [Chapter N] run ([Date]):
- [New learning]

Added by [Source] ([Date]):
- [New learning]
```

---

## Example: _global.md

```markdown
# Global Learnings

Last updated: 2024-01-15

These apply to ALL agents in the Book Maker system.

## Critical (Must Follow)

- **Roofing terminology**: Always use terms from the glossary. Check before
  inventing new terms. Consistency across the book is essential.

- **Tone**: This book is for working roofers. Keep language practical and
  direct. Avoid academic or overly formal phrasing.

- **Insurance context**: Roofing sales often involves insurance claims.
  This is a key differentiator from other sales contexts. When in doubt,
  think about how this applies to storm damage and insurance adjusters.

## Important (Should Follow)

- When referencing other chapters, use format: "As we covered in Chapter X..."
  not "See Chapter X" or "Chapter X discusses..."

- Examples should feel realistic. Real neighborhoods, realistic damage
  scenarios, believable homeowner concerns.

## Observations (Context)

- The target reader is likely a sales rep at a roofing company, not the
  owner. They're looking for practical scripts and techniques.

- Readers may be reading on phones between appointments. Keep paragraphs
  short and scannable.

## Don't Do

- Don't use car sales examples. Transform them to roofing.
- Don't assume reader has read previous chapters when writing summaries.
- Don't use overly complex diagrams. Simple and clear is better.
```

---

## Example: section_writer.md

```markdown
# Learnings: Section Writer

Last updated: 2024-01-15 by Quality Scorer

## Critical (Must Follow)

- **ALWAYS end with a conclusion or transition**: Every section must end with
  either a clear conclusion sentence OR a transition that bridges to the next
  topic. This has caused multiple validation failures.

- **Setup context for scripts**: When including a sales script, always
  provide 2-3 sentences of context explaining WHEN to use this script.
  The situation matters as much as the words.

## Important (Should Follow)

- Keep sections between 400-800 words. Shorter feels rushed, longer loses
  attention.

- Use the roofing scenario as the framing device. Start with the situation
  ("You're on the roof with the homeowner...") then teach the technique.

- Include at least one specific example per section. Abstract advice doesn't
  stick.

## Observations (Context)

- Sections about scripts tend to run longer than sections about mindset.
  This is fine - scripts need more detail.

- The "feel-felt-found" technique appears frequently. It's a foundational
  framework in this book.

## Don't Do

- Don't just list tactics. Weave them into a narrative.
- Don't end a section mid-thought. Always close the loop.
- Don't start sections with "In this section, we will..." - just dive in.

---
Added by Chapter 3 run (2024-01-14):
- When writing about objection handling, structure as: objection → wrong
  response → why it fails → right response → why it works.

Added by Chapter 5 run (2024-01-15):
- "Money aside" sections need extra care. Lead with value before discussing
  any financing options.

Added by Quality Scorer (2024-01-15):
- [PATTERN] Transitions have been flagged as weak in 3/5 chapters.
  Put extra effort into ending each section with a sentence that bridges
  to the next topic naturally.
```

---

## How Agents Use Learnings

### Every Agent Prompt Includes This Wrapper:

```
You are the [Agent Name].

BEFORE STARTING YOUR TASK:
1. Read /memory/learnings/_global.md for universal guidelines
2. Read /memory/learnings/[agent_type].md for your specific learnings

Incorporate these learnings into your work. They represent hard-won
knowledge from previous runs. Pay special attention to "Critical" items.

YOUR CORE TASK:
[Agent-specific instructions]

AFTER COMPLETING YOUR TASK:
If you discovered something that would help future runs of this agent,
append it to your learnings file using this format:

---
Added by Chapter [N] run ([Date]):
- [Your learning]

Only add learnings that are:
- Generalizable (not just about this specific chapter)
- Actionable (tells future agent what to DO)
- Not already covered in the file
```

### Agent Execution Flow:

```
1. AGENT STARTS

2. READ LEARNINGS
   ├── read_file("/memory/learnings/_global.md")
   └── read_file("/memory/learnings/{agent_type}.md")

3. DO TASK
   (informed by learnings)

4. DECIDE IF NEW LEARNING
   └── "Did I discover something generalizable?"

5. IF YES, APPEND LEARNING
   └── append_to_file("/memory/learnings/{agent_type}.md", new_learning)

6. RETURN OUTPUT
```

---

## Who Writes Learnings

### 1. The Agent Itself (After Work)

Most common source. Agent notices something during execution.

```
Section Writer finishes Chapter 7...

Thinks: "I kept having to add context before scripts. This isn't in my
learnings file. Future runs should know this."

Appends:
---
Added by Chapter 7 run (2024-01-16):
- When the outline specifies a "script", always write 2-3 sentences of
  situational context before the dialogue. Scripts without context are
  useless.
```

### 2. Quality Scorer (Pattern Detection)

Notices recurring weaknesses across chapters.

```
Quality Scorer finishes Chapter 5...

Reviews: "Chapter 3, 4, and 5 all had 'transitions' as a weakness."

Appends to section_writer.md:
---
Added by Quality Scorer (2024-01-15):
- [PATTERN DETECTED] Transitions have been flagged as weak in multiple
  chapters. This is a priority area. End each section with a clear
  bridge to the next topic.
```

### 3. Validators (Repeated Errors)

Notices same validation failure happening repeatedly.

```
Draft Validator sees third "missing conclusion" error...

Appends to section_writer.md:
---
Added by Draft Validator (2024-01-15):
- [VALIDATION PATTERN] Sections frequently fail validation for missing
  conclusions. This is now in Critical section. NEVER submit a section
  without a proper ending.
```

### 4. Humans (Direct Teaching)

Via the override interface.

```
Human reviews Chapter 4, sees problem with terminology...

Adds via dashboard:
---
Added by Human Override (2024-01-15):
- "Takeaway" in this book means "takeaway close" (a sales technique),
  NOT "key takeaway" (a summary). Extract these as closing tactics.
```

---

## Learning Lifecycle

```
LEARNING CREATED
       │
       ▼
┌─────────────────┐
│ Active in File  │ ──► Agents read and follow it
└────────┬────────┘
         │
         │ Periodic review (between books or on-demand)
         ▼
┌─────────────────┐
│ Human Reviews   │ ──► Clean up, consolidate, remove outdated
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cleaned File    │ ──► Ready for next book
└─────────────────┘
```

---

## Maintenance

### Between Books

Human (or optional cleanup agent) reviews learnings files:
- Remove book-specific learnings that won't generalize
- Consolidate similar learnings
- Promote frequently-useful learnings to "Critical"
- Demote rarely-relevant learnings to "Observations"
- Archive learnings that are now baked into base prompts

### Conflict Resolution

If learnings contradict each other:
- Higher section wins (Critical > Important > Observations)
- More recent wins if same section
- Human can mark as "superseded by" another learning

### File Size Management

If a learnings file gets too long (>50 learnings):
- Review and consolidate
- Move highly stable learnings into base prompt
- Archive old observations that haven't been useful

---

## Bootstrapping New Books

When starting a new book transformation:

1. **Keep global learnings** - Most still apply
2. **Keep agent technique learnings** - "How to write sections" generalizes
3. **Clear book-specific learnings** - Terminology, specific chapter notes
4. **Archive old learnings** - Move to `/memory/learnings/archive/[book_name]/`

This way, the system gets smarter over time across multiple books.
