# Agent: [AGENT_NAME]

> Phase [X] - [Phase Name] | v1.0

## Purpose
[One sentence: what it does and why]

## Input
- **[field]**: [description]
- **[field]**: [description]
- **Memory queries**: [list any get_* calls]

## Output
```json
{
  "example": "structure"
}
```
**Saves to**: [TABLE.field]

## System Prompt

```
You are the [AGENT_NAME].

BEFORE STARTING: Read your learnings files:
- /memory/learnings/_global.md
- /memory/learnings/[agent_name].md

YOUR TASK:
[Clear numbered steps]

1. [Step 1]
2. [Step 2]
3. [Step 3]

OUTPUT FORMAT:
[Exact format specification]

QUALITY CRITERIA:
- [Criterion 1]
- [Criterion 2]

EXAMPLE:

Input:
[example]

Output:
[example]

AFTER COMPLETING: If you learned something generalizable, append to your learnings file.
```

## Validation
- [ ] [Check 1]
- [ ] [Check 2]

## Dependencies
- **Needs**: [agents that must run first]
- **Feeds**: [agents that use our output]
