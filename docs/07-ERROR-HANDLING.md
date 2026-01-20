# Error Handling & Retry System

## Error Categories

### 1. Transient Failures
**What**: API errors, timeouts, rate limits, network issues
**Examples**:
- "API rate limit exceeded"
- "Request timeout"
- "Service temporarily unavailable"

**Handling**:
- Retry: Yes, automatically
- Max Retries: 3
- Backoff: Exponential (1s → 5s → 30s)
- Action: Log and continue after success

### 2. Validation Failures
**What**: Output doesn't meet structural requirements
**Examples**:
- "Section missing conclusion"
- "No tactics extracted"
- "Cross-reference points to non-existent chapter"

**Handling**:
- Retry: Yes, with feedback
- Max Retries: 2
- Feedback: Include validation error in next attempt's prompt
- Action: If still fails after 2 retries → STOP pipeline

### 3. Quality Failures
**What**: Output below quality threshold
**Examples**:
- "Overall quality score 5.2 (below 6.0 threshold)"
- "Roofing relevance score 4 (below 5 dimension threshold)"

**Handling**:
- Retry: Yes, with targeted feedback
- Max Retries: 1
- Feedback: Include specific weaknesses and recommendations
- Action: If still fails → STOP, flag for human review

### 4. Hard Failures
**What**: Agent produces unusable output or code exception
**Examples**:
- Empty response
- Malformed JSON when JSON expected
- Exception in tool execution
- Diagram code that crashes renderer

**Handling**:
- Retry: No
- Action: STOP immediately, log full context

---

## Retry With Feedback

When an agent fails validation, the retry includes the failure information:

### Example: Section Writer Validation Failure

**Attempt 1**:
```
Input: Outline section 3, previous ending, tactics
Output: [Section text that ends abruptly]
Validation: FAIL - "Section must end with conclusion or transition"
```

**Attempt 2**:
```
Input: Outline section 3, previous ending, tactics

PREVIOUS ATTEMPT FAILED
───────────────────────
Error: Section must end with conclusion or transition

Your previous output ended at:
"...and that's how you handle the price objection."

This ending is too abrupt. Please ensure this attempt includes
a proper conclusion that either:
1. Summarizes the key point of the section, OR
2. Transitions to the next topic

───────────────────────

[Original input continues...]
```

**Attempt 2 Output**: [Section with proper conclusion]
**Validation**: PASS

---

## Circuit Breaker

Prevents burning through API calls on a systematically broken agent.

### Trigger Conditions

Circuit breaker trips if:
- Same agent type fails on 3+ different chapters
- Same validation error occurs 5+ times across any agents
- Quality score below threshold on 3+ consecutive chapters

### Circuit Breaker Actions

When tripped:
1. STOP entire pipeline immediately
2. Log: "Circuit breaker tripped: [agent_name] failing consistently"
3. Dump: All failure logs for that agent
4. Alert: Notify human (email, dashboard, etc.)
5. Block: Pipeline cannot resume until human intervenes

### Human Resolution

Human must:
1. Review failure logs
2. Identify root cause (prompt issue? edge case? data problem?)
3. Fix the prompt or learnings file
4. Clear the circuit breaker
5. Resume pipeline (optionally from checkpoint)

---

## Retry Logging

Every retry is logged for debugging and pattern detection:

```sql
CREATE TABLE retry_log (
    id INTEGER PRIMARY KEY,
    agent_name TEXT NOT NULL,
    chapter INTEGER,

    -- Retry details
    attempt_number INTEGER,
    failure_type TEXT,          -- transient, validation, quality
    failure_message TEXT,
    feedback_given TEXT,        -- what we told the agent on retry

    -- Outcome
    outcome TEXT,               -- success, fail

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Retry Log Analysis

Periodically analyze retry logs to find:
- Agents that retry frequently (prompt needs work)
- Common validation failures (add to learnings)
- Time-of-day patterns (API issues?)

---

## Checkpointing

### Automatic Checkpoints

Created at:
- After each agent completes successfully
- After each phase completes
- At snapshot boundaries (Phase 3 → 4)

### Checkpoint Data

Each checkpoint stores:
- Agent name and chapter
- Memory system state (or diff from previous)
- Learnings files state
- Prompt versions in use

### Resume Points

```python
# Resume from last good state for specific chapter
resume_from_chapter(chapter_num=8, phase="writing")

# Resume entire pipeline from snapshot
resume_from_snapshot("SNAPSHOT_PHASE_3")

# Resume from specific agent within chapter
resume_from_agent(chapter_num=8, agent="section_writer", section=3)
```

---

## Error Escalation Path

```
AGENT FAILS
    │
    ├─► Transient? ─► Retry (up to 3x) ─► Success? ─► Continue
    │                                  └─► Fail ─► STOP + Alert
    │
    ├─► Validation? ─► Retry with feedback (up to 2x) ─► Success? ─► Continue
    │                                                 └─► Fail ─► STOP + Alert
    │
    ├─► Quality? ─► Retry with feedback (1x) ─► Success? ─► Continue
    │                                        └─► Fail ─► STOP + Human Review
    │
    └─► Hard Failure? ─► STOP + Log Full Context + Alert


AFTER ANY STOP:
    │
    ├─► Check circuit breaker conditions
    │   └─► Tripped? ─► Block pipeline, require human fix
    │
    └─► Log to retry_log table
```

---

## Alerting

### Alert Channels

Configure based on mode:

| Mode | Alert Method |
|------|--------------|
| Testing | Dashboard popup (immediate) |
| Supervised | Dashboard + Email |
| Autonomous | Email + SMS for critical |

### Alert Content

```
PIPELINE ALERT
═══════════════════════════════════════════════════════════

Status: STOPPED
Reason: Validation failure after 2 retries

Agent: Section Writer
Chapter: 8
Phase: Writing

Error: Section must end with conclusion or transition

Attempts:
  #1: Failed - "...and that's how you handle the price objection."
  #2: Failed - "...remember, it's about value not price."

Actions Needed:
  1. Review Section Writer learnings file
  2. Check if this section has unusual requirements
  3. Either fix prompt or manually complete section

Resume Command:
  resume_from_agent(chapter=8, agent="section_writer", section=3)

═══════════════════════════════════════════════════════════
```

---

## Recovery Procedures

### For Transient Failures (Post-Alert)

1. Check API status at Anthropic
2. Check rate limits
3. Wait and retry, or increase backoff
4. Resume from checkpoint

### For Validation Failures (Post-Alert)

1. Review the specific validation error
2. Look at agent's learnings file - is this case covered?
3. Either:
   - Add learning to handle this case
   - Fix the validator if it's too strict
   - Manually complete the output
4. Resume from checkpoint

### For Quality Failures (Post-Alert)

1. Review the quality scores and weaknesses
2. Look at agent's output - is it actually bad or is scorer wrong?
3. Either:
   - Improve agent's prompt/learnings
   - Adjust quality thresholds
   - Accept lower quality (override)
4. Resume from checkpoint

### For Circuit Breaker (Post-Alert)

1. This is a systemic issue - don't just retry
2. Review ALL failures for this agent
3. Identify root cause:
   - Prompt too vague?
   - Missing learnings?
   - Data format unexpected?
   - Validator too strict?
4. Fix root cause
5. Test on 1-2 chapters manually
6. Clear circuit breaker
7. Resume pipeline
