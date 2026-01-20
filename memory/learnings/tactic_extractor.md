# Learnings: Tactic Extractor

Last updated: [Initial Setup]

## Critical (Must Follow)

- **Include source context**: For every tactic extracted, include 2-3 sentences of original context. Downstream agents (transformers, writers) need this to do their job well.

- **Be thorough**: Extract ALL tactics, even subtle ones. It's better to extract too many than miss important ones. The categorizer will sort them.

## Important (Should Follow)

- Look for tactics embedded in stories. Authors often illustrate techniques through examples without explicitly calling them out.

- Extract scripts as complete units. A script includes the setup, the dialogue, and the expected outcome.

- Note when tactics have specific conditions. "Use this when..." is important context.

- Categorize as you go when obvious: mindset, technique, script, framework, objection-handler, closer.

## Observations (Context)

- Sales books often repeat core concepts in different ways. Extract each framing - they may be useful for different chapters.

- "Questions to ask" sections are gold mines for tactics. Each question is often a technique.

- Chapter openings and closings often contain meta-tactics (how to approach the chapter's topic).

## Don't Do

- Don't extract motivational fluff. "Believe in yourself" is not a tactic.
- Don't extract general business advice. We want sales techniques specifically.
- Don't merge similar tactics. Keep them separate - the transformer will handle synthesis.
- Don't skip stories thinking they're "just examples." The tactics are often IN the stories.
