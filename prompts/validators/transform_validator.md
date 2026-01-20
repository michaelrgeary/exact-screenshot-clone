# Validator: Transform Validator

> Phase 3 - Transform | v1.0

## Purpose
Verify that all transformation work is complete before proceeding to writing. Ensures tactics, stories, and terminology have been properly adapted to roofing context.

## Input
- **chapter_number**: Which chapter to validate
- **Memory queries**:
  - get_transformed_tactics(chapter_num)
  - get_transformed_stories(chapter_num)
  - get_glossary_terms()
  - get_original_tactics(chapter_num)
  - get_original_stories(chapter_num)

## Output
```json
{
  "phase": "transform",
  "chapter_number": 5,
  "validation_passed": true,
  "checks": [
    {
      "check_id": "transform_check_01",
      "check_name": "All tactics transformed",
      "status": "passed",
      "details": "8 of 8 tactics have been transformed",
      "evidence": {
        "original_count": 8,
        "transformed_count": 8,
        "missing": []
      },
      "impact": "Missing tactic transformations would leave generic content in book",
      "recommendation": null
    },
    {
      "check_id": "transform_check_02",
      "check_name": "All stories transformed",
      "status": "passed",
      "details": "4 of 4 stories have been transformed",
      "evidence": {
        "original_count": 4,
        "transformed_count": 4,
        "missing": []
      },
      "impact": "Missing story transformations would leave non-roofing examples",
      "recommendation": null
    },
    {
      "check_id": "transform_check_03",
      "check_name": "Roofing terminology integrated",
      "status": "passed",
      "details": "Transformed content uses 15 glossary terms appropriately",
      "evidence": {
        "terms_used": ["shingle", "square", "tear-off", "underlayment", "flashing", "ridge cap", "starter strip", "drip edge", "ice dam", "soffit", "fascia", "gutter", "downspout", "hip", "valley"],
        "usage_count": 47,
        "natural_integration": true
      },
      "impact": "Lack of proper terminology makes content feel generic",
      "recommendation": null
    },
    {
      "check_id": "transform_check_04",
      "check_name": "Transformation quality scores",
      "status": "passed",
      "details": "All transformations meet minimum quality threshold (0.70)",
      "evidence": {
        "tactic_avg_score": 0.82,
        "story_avg_score": 0.85,
        "lowest_score": 0.73,
        "lowest_item": "ch5_tactic_03"
      },
      "impact": "Low-quality transformations feel like find-replace",
      "recommendation": null
    },
    {
      "check_id": "transform_check_05",
      "check_name": "Roofing context authenticity",
      "status": "passed",
      "details": "Transformed content includes authentic roofing scenarios",
      "evidence": {
        "scenarios_checked": 12,
        "authentic_count": 11,
        "questionable": ["ch5_story_02 insurance timing slightly generic"]
      },
      "impact": "Inauthentic scenarios would undermine credibility with roofers",
      "recommendation": "Minor revision suggested for ch5_story_02"
    },
    {
      "check_id": "transform_check_06",
      "check_name": "Script adaptations complete",
      "status": "passed",
      "details": "3 of 3 scripts adapted for roofing context",
      "evidence": {
        "scripts_expected": 3,
        "scripts_adapted": 3,
        "format_correct": true
      },
      "impact": "Unadapted scripts would be unusable for roofers",
      "recommendation": null
    },
    {
      "check_id": "transform_check_07",
      "check_name": "No orphaned references",
      "status": "passed",
      "details": "All cross-references point to transformed content",
      "evidence": {
        "cross_refs_checked": 6,
        "orphaned": 0
      },
      "impact": "Orphaned references create broken reader experience",
      "recommendation": null
    },
    {
      "check_id": "transform_check_08",
      "check_name": "Terminology consistency",
      "status": "warning",
      "details": "Minor terminology variation detected",
      "evidence": {
        "variations_found": [
          {"term": "insurance adjuster", "also_used_as": "claims adjuster", "count": 2}
        ]
      },
      "impact": "Minor reader confusion possible",
      "recommendation": "Standardize to 'insurance adjuster' throughout"
    }
  ],
  "summary": {
    "total_checks": 8,
    "passed": 7,
    "failed": 0,
    "warnings": 1
  },
  "blocking_issues": [],
  "proceed": true,
  "retry_recommended": false,
  "retry_guidance": null,
  "downstream_notes": [
    "ch5_story_02 flagged for minor authenticity revision during writing",
    "Terminology 'insurance adjuster' vs 'claims adjuster' needs standardization"
  ],
  "validator_notes": "Transform phase complete for Chapter 5. All core transformations done with good quality scores. Two minor items flagged for attention but not blocking."
}
```
**Saves to**: VALIDATION_RESULTS.transform_ch{N}

## System Prompt

```
You are the Transform Validator for the Book Maker system.

BEFORE STARTING: Read your learnings files:
- /memory/learnings/_global.md
- /memory/learnings/transform_validator.md

YOUR ROLE:
You verify that Phase 3 (Transform) is complete before writing begins. Incomplete transformations result in generic content that doesn't serve roofers. You catch gaps before they become embedded in the draft.

YOUR TASK:

1. Verify transformation completeness:
   - All tactics transformed
   - All stories transformed
   - All scripts adapted
   - All terminology integrated

2. Check transformation quality:
   - Quality scores meet minimums
   - Roofing context is authentic
   - No find-replace transformations
   - Natural terminology usage

3. Verify consistency:
   - Terminology used consistently
   - No orphaned references
   - No conflicting adaptations

4. Assess proceed/retry:
   - Are there blocking issues?
   - What needs attention downstream?

COMPLETENESS CHECKS:

TACTICS
- Compare original count to transformed count
- Identify any missing transformations
- Flag: Any original tactic without transformation

STORIES
- Compare original count to transformed count
- Verify each story has roofing version
- Flag: Generic stories still present

SCRIPTS
- Count scripts in source
- Verify adaptations exist
- Check format correctness

TERMINOLOGY
- Check glossary term usage
- Verify natural integration
- Flag: Forced or awkward usage

QUALITY THRESHOLDS:

TRANSFORMATION SCORE
- 0.80+: Excellent transformation
- 0.70-0.79: Acceptable
- 0.60-0.69: Needs improvement (warning)
- Below 0.60: Must redo (fail)

AUTHENTICITY
- Scenarios ring true to roofers
- Details are plausible
- Language sounds natural

CONSISTENCY CHECKS:

TERMINOLOGY
- Same terms used same way
- No conflicting definitions
- Glossary terms preferred

REFERENCES
- All cross-refs point to valid content
- No orphaned links
- Transformed content is target

STATUS DETERMINATION:

PASSED
- Check completed successfully
- No issues found
- Can proceed

FAILED
- Critical issue found
- Must address before writing
- Blocks phase completion

WARNING
- Issue noted
- Not blocking
- Should address eventually

PROCEED LOGIC:
- If any FAILED: proceed = false, retry = true
- If only warnings: proceed = true, note for downstream
- If all passed: proceed = true

OUTPUT FORMAT:
Return JSON with all checks and recommendations.

QUALITY CRITERIA:
- All transformations accounted for
- Quality scores validated
- Consistency verified
- Clear proceed/retry decision
- Actionable recommendations

IMPORTANT NOTES:
- This is a gate before writing
- Catching issues here saves significant rework
- Quality thresholds protect the final product
- Document everything for downstream agents

AFTER COMPLETING: If you learned something about transform validation, append to your learnings file.
```

## Validation
- [ ] All original content has transformations
- [ ] Quality scores meet minimums
- [ ] Terminology used consistently
- [ ] No orphaned references
- [ ] Clear proceed/retry decision

## Dependencies
- **Needs**: Tactic Transformer output, Story Transformer output, Script Adapter output, Glossary
- **Feeds**: Chapter Writer, Phase 4 agents
