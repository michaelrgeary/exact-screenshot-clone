# Agent: [AGENT_NAME]

> **Phase**: [Phase number and name]
> **Type**: Agent | Validator | Tool
> **Version**: 1.0
> **Last Updated**: [Date]

---

## Purpose

[One clear sentence describing what this agent does and why it exists.]

---

## Input

### Required
| Field | Type | Description |
|-------|------|-------------|
| [field_name] | string/json/file | [What this input is] |

### Optional
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| [field_name] | string/json | [What this input is] | [default] |

### From Memory System
```
[List queries this agent makes]
- get_chapter(chapter_num)
- get_glossary()
- etc.
```

---

## Output

### Format
```json
{
  "field_1": "description",
  "field_2": ["array", "of", "items"],
  "field_3": {
    "nested": "object"
  }
}
```

### Saves To
| Destination | Field | Description |
|-------------|-------|-------------|
| [TABLE] | [field] | [What is saved] |

---

## System Prompt

```
You are the [AGENT_NAME] for the Book Maker system.

## Your Role
[2-3 sentences about what you do and why it matters]

## Your Task
[Step-by-step instructions for what to do]

1. First, read your learnings files:
   - /memory/learnings/_global.md
   - /memory/learnings/[agent_name].md

2. [Step 2]

3. [Step 3]

4. [Continue as needed]

## Input You Will Receive
[Describe the input format]

## Output You Must Produce
[Describe the exact output format with example structure]

## Quality Criteria
Your output will be validated against these criteria:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

## Examples

### Example Input:
[Show a realistic example input]

### Example Output:
[Show the expected output for that input]

## Important Notes
- [Any special considerations]
- [Edge cases to handle]
- [Common mistakes to avoid]

## After Completing Your Task
If you discovered something that would help future runs of this agent, append it to your learnings file:
---
Added by Chapter [N] run ([Date]):
- [Your learning]
```

---

## Validation Criteria

The output will be checked for:

| Check | Requirement | Failure Action |
|-------|-------------|----------------|
| [Check 1] | [What must be true] | [What happens if fails] |
| [Check 2] | [What must be true] | [What happens if fails] |

---

## Dependencies

### Depends On (must complete first)
- [Agent Name] - needs its [output field]
- [Agent Name] - needs its [output field]

### Depended On By (waits for this agent)
- [Agent Name] - uses our [output field]

---

## Error Handling

### Common Errors
| Error | Cause | Resolution |
|-------|-------|------------|
| [Error type] | [Why it happens] | [How to fix] |

### Retry Behavior
- **Transient failures**: Retry up to 3x with exponential backoff
- **Validation failures**: Retry up to 2x with feedback
- **Quality failures**: Retry 1x with targeted feedback

---

## Performance Notes

- **Typical runtime**: [X seconds/minutes]
- **Token usage**: ~[X]k input, ~[X]k output
- **Parallelizable**: Yes/No - [reason]

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial version |
