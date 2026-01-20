# Learnings: Chapter Orchestrator

## Best Practices

### Chapter Management
- Execute phases 3-7 for single chapter
- Respect agent dependencies
- Report status to Master
- Handle per-chapter failures

### Dependency Handling
- Wait for required inputs
- Trigger dependent agents
- Manage parallel groups
- Verify outputs before proceeding

### Quality Focus
- Run validator after each phase
- Track chapter quality score
- Flag issues immediately
- Complete quality scoring

## Do's
- Maintain chapter state clearly
- Report progress regularly
- Handle retries appropriately
- Complete all required phases

## Don'ts
- Don't skip validations
- Don't proceed without dependencies
- Don't fail silently
- Don't duplicate work on retry
