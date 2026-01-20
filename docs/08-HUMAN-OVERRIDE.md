# Human Override Interface

## Overview

The system supports three modes with different levels of human involvement. The override interface allows humans to intervene, correct, and teach the system.

---

## Operating Modes

### 1. Testing Mode (Human in Loop)

**Purpose**: First runs, calibrating prompts, building confidence

**Behavior**:
- Pipeline pauses after each agent completes
- Human reviews output before continuing
- All override actions available
- Maximum visibility, maximum control

**Use When**:
- First time processing a book type
- After major prompt changes
- Debugging specific issues

### 2. Supervised Mode (Spot-Check)

**Purpose**: Building confidence, transitioning to autonomous

**Behavior**:
- Pipeline runs automatically
- Human gets notification after each chapter completes
- Human can pause or intervene at any time
- Quality scores visible in real-time

**Use When**:
- Second or third run with this setup
- Confident in prompts but want oversight
- Training new team members on the system

### 3. Autonomous Mode (Hands Off)

**Purpose**: Production runs

**Behavior**:
- Pipeline runs completely automatically
- Human only notified on:
  - Failures (errors, validation fails)
  - Quality flags (below threshold)
  - Completion (book is done)
- No pauses for review

**Use When**:
- Proven setup that works reliably
- Time-constrained runs
- Batch processing multiple books

---

## Override Actions

### APPROVE
**Available In**: Testing mode
**What It Does**: Accept current output, continue to next step
**When To Use**: Output is good, move on

### REJECT
**Available In**: Testing, Supervised
**What It Does**: Stop pipeline, flag for investigation
**When To Use**: Output is unusable, need to investigate

### EDIT
**Available In**: Testing, Supervised, Autonomous (on flag)
**What It Does**: Directly modify the output in memory
**Logged As**: "Human override at [timestamp]: changed X to Y"
**When To Use**: Minor fixes, faster than re-running

### RETRY WITH FEEDBACK
**Available In**: Testing, Supervised
**What It Does**: Re-run the agent with additional guidance
**Logged As**: Manual retry with feedback
**When To Use**: Agent was close but missed something specific

### ADJUST PROMPT
**Available In**: Testing, Supervised
**What It Does**: Edit agent's base prompt or learnings file
**Logged As**: Prompt change with before/after diff
**When To Use**: Systemic issue that will affect all chapters

### SKIP AGENT
**Available In**: Testing, Supervised
**What It Does**: Mark agent as skipped for this chapter
**Requirements**: Must provide manual output OR mark as "not needed"
**Logged As**: "Agent [X] skipped by human for chapter [Y]"
**When To Use**: Edge case where agent isn't appropriate

### FORCE RETRY
**Available In**: All modes
**What It Does**: Re-run any agent, optionally with guidance
**Logged As**: Manual retry requested
**When To Use**: "It can do better" or after fixing a prompt

### INJECT CONTENT
**Available In**: All modes
**What It Does**: Add content directly to memory (glossary term, cross-ref, etc.)
**Logged As**: "Human injection at [timestamp]"
**When To Use**: Adding knowledge the agents missed

### ADD LEARNING
**Available In**: All modes
**What It Does**: Append to agent's learnings file
**Logged As**: Learning added by human
**When To Use**: Teaching the system something generalizable

---

## Dashboard Interface

### Main View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BOOK MAKER                                         Mode: [TESTING ▼]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BOOK: "Sales Secrets to Roofing Success"           Status: IN PROGRESS    │
│  Source: "The Ultimate Sales Machine" by Chet Holmes                       │
│                                                                             │
│  Progress: ████████░░░░░░░░░░░░ 8/15 chapters complete                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CURRENT: Chapter 9 - Phase 4 (Writing)                                    │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  [✓] Chapter Outliner ────────────────────────────── Complete              │
│  [✓] Section Writer (1/5) ────────────────────────── Complete              │
│  [✓] Section Writer (2/5) ────────────────────────── Complete              │
│  [►] Section Writer (3/5) ────────────────────────── In Progress...        │
│  [ ] Section Writer (4/5)                                                   │
│  [ ] Section Writer (5/5)                                                   │
│  [ ] Transition Writer                                                      │
│  [ ] Summary Writer                                                         │
│  [ ] Cross-Ref Inserter                                                     │
│  [ ] Draft Validator                                                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  QUALITY SCORES (Completed Chapters)                                        │
│                                                                             │
│  Ch 1: 7.8 ████████░░  Ch 5: 8.1 ████████░░                                │
│  Ch 2: 8.2 ████████░░  Ch 6: 7.6 ████████░░                                │
│  Ch 3: 7.5 ████████░░  Ch 7: 8.4 ████████░░                                │
│  Ch 4: 8.0 ████████░░  Ch 8: 7.9 ████████░░                                │
│                                                                             │
│  Average: 7.94                                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [PAUSE] [RESUME] [VIEW LOGS] [MEMORY BROWSER] [SETTINGS]                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Output View (Testing Mode)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AGENT OUTPUT: Section Writer (Section 3 of 5)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT                                                        [EXPAND ▼]   │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Outline: "Section 3: Handling the 'I need to think about it' obj..."  │ │
│  │ Previous ending: "...and that's when the real conversation begins."   │ │
│  │ Relevant tactics: [feel-felt-found], [takeaway close], [urgency]      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  OUTPUT                                                       [EDIT]       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ## Handling "I Need to Think About It"                                │ │
│  │                                                                        │ │
│  │ When a homeowner says "I need to think about it," they're rarely      │ │
│  │ actually thinking about YOUR proposal. What they're really saying     │ │
│  │ is one of three things:                                               │ │
│  │                                                                        │ │
│  │ 1. "I'm not convinced this is urgent"                                 │ │
│  │ 2. "I'm worried about the price"                                      │ │
│  │ 3. "I need to talk to my spouse"                                      │ │
│  │                                                                        │ │
│  │ Your job is to figure out which one it is...                          │ │
│  │                                                                        │ │
│  │ [Content continues - 487 words]                                       │ │
│  │                                                                        │ │
│  │ When you master this response, you'll find that "I need to think      │ │
│  │ about it" becomes the beginning of a deeper conversation, not the     │ │
│  │ end of one.                                                            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ [APPROVE]  [EDIT]  [REJECT]  [RETRY WITH FEEDBACK]                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  AGENT PROMPT                                           [VIEW] [EDIT]      │
│  LEARNINGS FILE                                         [VIEW] [EDIT]      │
│  DECISION LOG                                           [VIEW]             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Memory Browser

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MEMORY BROWSER                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌────────────────────────────────────────────────────┐   │
│  │ TABLES      │  │ GLOSSARY (47 terms)                    [+ ADD]    │   │
│  │             │  │                                                    │   │
│  │ ▸ Chapters  │  │ ┌────────────────┬─────────────────────────────┐  │   │
│  │ ▾ Glossary  │  │ │ Term           │ Definition                  │  │   │
│  │ ▸ Tactics   │  │ ├────────────────┼─────────────────────────────┤  │   │
│  │ ▸ CrossRefs │  │ │ Contingency    │ Agreement where payment     │  │   │
│  │ ▸ Diagrams  │  │ │ Agreement      │ depends on insurance...     │  │   │
│  │ ▸ Decisions │  │ ├────────────────┼─────────────────────────────┤  │   │
│  │ ▸ Issues    │  │ │ Storm Chaser   │ Derogatory term for         │  │   │
│  │             │  │ │                │ disreputable roofers...     │  │   │
│  │             │  │ ├────────────────┼─────────────────────────────┤  │   │
│  │ LEARNINGS   │  │ │ Adjuster       │ Insurance company rep       │  │   │
│  │             │  │ │ Meeting        │ who assesses damage...      │  │   │
│  │ ▸ _global   │  │ └────────────────┴─────────────────────────────┘  │   │
│  │ ▸ section_  │  │                                                    │   │
│  │   writer    │  │ [EDIT SELECTED]  [DELETE]  [EXPORT]               │   │
│  │ ▸ tactic_   │  │                                                    │   │
│  │   extractor │  │                                                    │   │
│  │ ...         │  │                                                    │   │
│  └─────────────┘  └────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Add Learning Dialog

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADD LEARNING                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Target Agent: [Section Writer           ▼]                                │
│                                                                             │
│  Priority:     ( ) Critical  (•) Important  ( ) Observation                │
│                                                                             │
│  Learning:                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ When writing about objection handling, always structure as:           │ │
│  │ 1. The objection                                                      │ │
│  │ 2. The WRONG response (and why it fails)                             │ │
│  │ 3. The RIGHT response (and why it works)                             │ │
│  │                                                                        │ │
│  │ This contrast makes the right approach more memorable.                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Context (why you're adding this):                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Chapter 5's objection handling section was good but could be more     │ │
│  │ impactful with contrast. Saw this pattern in the original book.       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                    [CANCEL]  [ADD LEARNING]                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Override Logging

All overrides are logged for audit and learning:

```sql
CREATE TABLE override_log (
    id INTEGER PRIMARY KEY,
    override_type TEXT,         -- approve, reject, edit, retry, etc.
    agent_name TEXT,
    chapter INTEGER,

    -- Details
    original_content TEXT,      -- what was there before (for edits)
    new_content TEXT,           -- what it became (for edits)
    feedback TEXT,              -- guidance given (for retries)
    reason TEXT,                -- human explanation

    -- Metadata
    human_user TEXT,            -- who did it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Keyboard Shortcuts (Dashboard)

| Key | Action |
|-----|--------|
| `A` | Approve current output |
| `R` | Reject current output |
| `E` | Edit current output |
| `F` | Retry with feedback |
| `L` | Add learning |
| `P` | Pause pipeline |
| `Space` | Resume pipeline |
| `M` | Open memory browser |
| `?` | Show help |

---

## API Endpoints (For Automation)

```
POST /override/approve
POST /override/reject
POST /override/edit
POST /override/retry
POST /override/skip
POST /override/inject
POST /override/add-learning

GET /status
GET /chapter/{n}/output
GET /agent/{name}/learnings
PUT /agent/{name}/learnings
GET /memory/{table}

POST /pipeline/pause
POST /pipeline/resume
POST /pipeline/resume-from/{checkpoint}
```
