# Validator Template

> Reference template for creating phase validators

## Common Validator Structure

All validators share this core structure:

```json
{
  "phase": "[phase_name]",
  "chapter_number": "[N or null for book-wide]",
  "validation_passed": true|false,
  "checks": [
    {
      "check_id": "[phase]_check_01",
      "check_name": "Descriptive name",
      "status": "passed|failed|warning",
      "details": "What was checked and result",
      "evidence": "Specific data supporting the result",
      "impact": "What failing this means",
      "recommendation": "How to fix if failed"
    }
  ],
  "summary": {
    "total_checks": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0
  },
  "blocking_issues": [],
  "proceed": true|false,
  "retry_recommended": true|false,
  "retry_guidance": "If retry recommended, what to focus on",
  "validator_notes": "Overall assessment"
}
```

## Check Status Definitions

**PASSED**: Check completed successfully, no issues found
**FAILED**: Critical issue that must be addressed before proceeding
**WARNING**: Issue noted but not blocking; should be addressed eventually

## Proceed Logic

```
IF any check.status == "failed":
  proceed = false
  retry_recommended = true
ELSE IF warnings > 3:
  proceed = true with caution
  note concerns for downstream
ELSE:
  proceed = true
```

## Validator Responsibilities

1. **Verify completeness**: All expected outputs present
2. **Check quality thresholds**: Outputs meet minimum standards
3. **Validate relationships**: Outputs consistent with each other
4. **Flag anomalies**: Unusual patterns or potential problems
5. **Document evidence**: Specific data for each check

## Common Check Types

- **Presence check**: Does X exist?
- **Count check**: Are there enough of X?
- **Threshold check**: Is X above/below limit?
- **Consistency check**: Does X match Y?
- **Format check**: Is X structured correctly?
- **Range check**: Is X within expected bounds?

---

# List of Validators

| Validator | Phase | Purpose |
|-----------|-------|---------|
| Prep Validator | 1 - Prep | Verify book is properly split and structured |
| Analysis Validator | 2 - Analysis | Verify all content extracted |
| Transform Validator | 3 - Transform | Verify transformations are complete |
| Draft Validator | 4 - Writing | Verify chapter drafts are complete |
| Diagram Validator | 5 - Visual | Verify diagrams are specified and renderable |
| Edit Validator | 6 - Editing | Verify all edits applied |
| Translation Prep Validator | 8 - Trans Prep | Verify Spanish prep is complete |
| Translation Validator | 9 - Translation | Verify translations are complete |
| Book Validator | 10 - Assembly | Verify book structure is correct |
| Final QA Validator | 11 - Output | Final check before publish |
