# Learnings: Master Orchestrator

## Best Practices

### Pipeline Management
- Execute phases in correct order
- Checkpoint after each phase
- Handle failures gracefully
- Log all decisions

### Error Handling
- Retry transient failures (3x)
- Escalate persistent failures
- Don't lose completed work
- Document all errors

### Quality Gates
- Validate after each phase
- Block if thresholds not met
- Allow human override
- Track quality trends

## Do's
- Maintain clear status at all times
- Create detailed run logs
- Enable resume from any checkpoint
- Balance parallelization and resources

## Don'ts
- Don't proceed past failed validations
- Don't lose work on failures
- Don't over-parallelize
- Don't skip checkpoints
