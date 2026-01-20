# Quality Scoring System

## Overview

Every chapter is scored after editing is complete. The Quality Scorer evaluates 8 dimensions on a 0.00-1.00 scale and provides actionable feedback. A minimum overall score of 0.80 is required to proceed to translation.

---

## Scoring Dimensions

### 1. Content Fidelity (Weight: 15%, Minimum: 0.80)
**Question**: Did we capture the core tactics from the original?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | All key tactics captured, nothing important lost |
| 0.80-0.89 | Most tactics captured, minor omissions |
| 0.70-0.79 | Core tactics present but some gaps |
| 0.60-0.69 | Significant tactics missing |
| Below 0.60 | Failed to capture the chapter's value |

### 2. Roofing Relevance (Weight: 15%, Minimum: 0.85)
**Question**: Does the roofing context feel authentic?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | A roofer would find this immediately useful and realistic |
| 0.80-0.89 | Solid roofing context, minor gaps in authenticity |
| 0.70-0.79 | Generic sales with roofing examples bolted on |
| 0.60-0.69 | Roofing context feels forced or unrealistic |
| Below 0.60 | Would confuse or alienate a roofing professional |

### 3. Clarity (Weight: 12%, Minimum: 0.80)
**Question**: Is it easy to understand?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Crystal clear, no confusion possible |
| 0.80-0.89 | Clear with minor ambiguities |
| 0.70-0.79 | Understandable but requires re-reading |
| 0.60-0.69 | Confusing sections, jargon without explanation |
| Below 0.60 | Unclear what the chapter is trying to convey |

### 4. Actionability (Weight: 15%, Minimum: 0.85)
**Question**: Can the reader DO something with this?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Clear steps, scripts, or frameworks they can use tomorrow |
| 0.80-0.89 | Mostly actionable with some abstract sections |
| 0.70-0.79 | Mix of actionable and theoretical |
| 0.60-0.69 | More theory than practice |
| Below 0.60 | No clear actions to take |

### 5. Engagement (Weight: 10%, Minimum: 0.75)
**Question**: Is it interesting to read?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Compelling stories, hard to put down |
| 0.80-0.89 | Engaging with occasional dry spots |
| 0.70-0.79 | Adequate but not exciting |
| 0.60-0.69 | Dry, feels like a textbook |
| Below 0.60 | Boring, would not finish reading |

### 6. Flow (Weight: 10%, Minimum: 0.80)
**Question**: Does it read smoothly from start to finish?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Seamless transitions, logical progression |
| 0.80-0.89 | Good flow with minor bumps |
| 0.70-0.79 | Some abrupt transitions or jumps |
| 0.60-0.69 | Disjointed, sections feel disconnected |
| Below 0.60 | Chaotic organization |

### 7. Visual Integration (Weight: 8%, Minimum: 0.75)
**Question**: Do diagrams add value?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Diagrams perfectly clarify complex concepts |
| 0.80-0.89 | Good visuals, well-placed |
| 0.70-0.79 | Visuals present but could be better |
| 0.60-0.69 | Visuals feel forced or unhelpful |
| Below 0.60 | Missing obvious visual opportunities or visuals confuse |

### 8. Consistency (Weight: 15%, Minimum: 0.85)
**Question**: Does it match the rest of the book?

| Score | Meaning |
|-------|---------|
| 0.90-1.00 | Perfectly consistent tone, terms, style |
| 0.80-0.89 | Consistent with minor variations |
| 0.70-0.79 | Some inconsistencies in terminology or tone |
| 0.60-0.69 | Noticeable style shifts |
| Below 0.60 | Feels like a different book |

---

## Quality Tiers

| Overall Score | Tier | Description |
|---------------|------|-------------|
| 0.90-1.00 | Excellent | Exceeds expectations, publication-ready, model for other chapters |
| 0.80-0.89 | Good | Meets standards, publication-ready, room for enhancement |
| 0.70-0.79 | Acceptable | Minimum viable, may proceed with notes, should improve if possible |
| 0.60-0.69 | Needs Work | Below standards, must improve before proceeding |
| Below 0.60 | Significant Issues | Cannot proceed, requires major revision |

---

## Scoring Output Format

```json
{
  "chapter_number": 5,
  "quality_score_id": "qs_ch5_001",
  "overall_score": 0.87,
  "minimum_threshold": 0.80,
  "passes_threshold": true,
  "dimension_scores": {
    "content_fidelity": {
      "score": 0.88,
      "weight": 0.15,
      "weighted_score": 0.132,
      "minimum": 0.80,
      "passes": true,
      "assessment": "Core sales concepts from source accurately conveyed",
      "evidence": {
        "tactics_preserved": "8 of 8",
        "key_concepts_intact": true,
        "no_significant_omissions": true
      },
      "improvement_notes": null
    }
    // ... other dimensions
  },
  "quality_tier": {
    "tier": "Good",
    "range": "0.80-0.89",
    "description": "Meets publication standards with room for enhancement"
  },
  "strengths": [
    "Excellent roofing-specific adaptation (0.92)",
    "Strong consistency with style guide (0.91)",
    "Highly actionable content (0.90)"
  ],
  "areas_for_improvement": [
    "Engagement could be enhanced with additional story in middle section",
    "One transition could be smoother"
  ],
  "blocking_issues": [],
  "ready_for_translation": true
}
```

---

## Thresholds and Actions

| Overall Score | Action |
|---------------|--------|
| 0.90+ | Mark as exemplar. Note what made it excellent. |
| 0.80 - 0.89 | Pass. Proceed to translation. |
| 0.70 - 0.79 | Pass with note. Proceed but flag for potential revision later. |
| Below 0.70 | **STOP**. Retry with feedback. If still fails, flag for human review. |

| Dimension Score | Action |
|-----------------|--------|
| Below minimum | Flag that specific dimension for targeted improvement in retry |

---

## Score Calculation

The overall score is a weighted average:

```
overall_score = Σ(dimension_score × weight)

Where weights are:
- Content Fidelity: 0.15
- Roofing Relevance: 0.15
- Clarity: 0.12
- Actionability: 0.15
- Engagement: 0.10
- Flow: 0.10
- Visual Integration: 0.08
- Consistency: 0.15

Total weights: 1.00
```

---

## Pattern Detection

The Quality Scorer also looks for patterns across chapters:

### Cross-Chapter Analysis

After scoring each chapter, compare to previous chapters:

```python
# Example pattern detection logic
if weakness in ["transitions", "section transitions", "flow between sections"]:
    if count_similar_weakness(book, "transitions") >= 3:
        add_learning(
            agent="section_writer",
            learning="[PATTERN] Transitions flagged as weak in multiple chapters. Priority area.",
            priority="important"
        )
        add_learning(
            agent="transition_writer",
            learning="[PATTERN] Section transitions are a book-wide issue. Extra attention needed.",
            priority="critical"
        )
```

### Patterns to Detect

- Same weakness appearing in 3+ chapters
- Specific agent's output consistently scoring lower
- Dimension that's always weakest (e.g., "engagement" always lowest)
- Quality trending down over chapters (fatigue?)
- Quality trending up (learning working?)

### Pattern Actions

When a pattern is detected:
1. Log to DECISIONS table
2. Write to relevant agent's learnings file
3. Optionally trigger human notification

---

## Comparison Metrics

### Book Running Average

Track average score across completed chapters:

```
Chapter 1: 0.82
Chapter 2: 0.85
Chapter 3: 0.87
Chapter 4: 0.84
Chapter 5: 0.88

Running Average: 0.852
```

### Chapter Comparison

For each new chapter, show:
- Overall vs. average: "+0.03 above average"
- Each dimension vs. average
- Rank: "3rd highest so far"

---

## Quality Score Storage

```sql
-- In QUALITY_SCORES table
CREATE TABLE quality_scores (
    id TEXT PRIMARY KEY,
    chapter_number INTEGER,
    overall_score REAL,
    passes_threshold BOOLEAN,
    dimension_scores TEXT,  -- JSON
    strengths TEXT,         -- JSON array
    improvements TEXT,      -- JSON array
    blocking_issues TEXT,   -- JSON array
    ready_for_translation BOOLEAN,
    scored_at TIMESTAMP
);

-- In BOOK_CONTEXT
quality_running_average REAL,
quality_dimension_averages TEXT,  -- JSON of per-dimension averages
quality_patterns_detected TEXT,   -- JSON of patterns found
```

---

## Retry Behavior

If chapter scores below threshold:

### First Retry

```
RETRY PROMPT ADDITIONS:

Your previous output scored 0.68 overall, below the 0.80 threshold.

Specific weaknesses:
- Roofing Relevance (0.72, min 0.85): The examples felt generic, not specific to roofing
- Flow (0.75, min 0.80): Transitions between sections 2-3 and 4-5 were abrupt

Recommendations:
- Add a specific roofing scenario to sections 2 and 4
- Write explicit transition sentences at the end of sections 2 and 4

Please address these specific issues in your revision.
```

### If Retry Still Fails

- STOP pipeline
- Flag for human review
- Log full context:
  - Original output
  - Retry output
  - Scores and feedback for both
  - Agent's learnings file at time of failure

Human must either:
1. Fix manually and continue
2. Adjust agent's prompt/learnings
3. Accept lower quality and override
