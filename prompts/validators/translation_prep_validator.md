# Validator: Translation Prep Validator

> Phase 8 - Translation Prep | v1.0

## Purpose
Verify that all translation preparation is complete before actual translation begins. Ensures terminology translations are defined, Spanish style guide is ready, and content is translation-ready.

## Input
- **chapter_number**: Which chapter to validate (or "book" for book-wide)
- **Memory queries**:
  - get_terminology_translations()
  - get_spanish_style_guide()
  - get_chapter_content(chapter_num)
  - get_glossary_terms()

## Output
```json
{
  "phase": "translation_prep",
  "chapter_number": 5,
  "validation_passed": true,
  "checks": [
    {
      "check_id": "trans_prep_check_01",
      "check_name": "Terminology translations complete",
      "status": "passed",
      "details": "All 47 roofing terms have Spanish translations",
      "evidence": {
        "glossary_terms": 47,
        "translations_defined": 47,
        "missing": [],
        "regional_variants_noted": true
      },
      "impact": "Missing terminology translations cause inconsistent translation",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_02",
      "check_name": "Spanish style guide complete",
      "status": "passed",
      "details": "Style guide covers all required sections",
      "evidence": {
        "sections_required": ["voice", "formality", "regional_spanish", "idioms", "formatting"],
        "sections_present": 5,
        "missing_sections": [],
        "quality": "comprehensive"
      },
      "impact": "Incomplete style guide causes inconsistent translation",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_03",
      "check_name": "Regional Spanish specified",
      "status": "passed",
      "details": "US Latino Spanish defined as target",
      "evidence": {
        "target_dialect": "US Latino Spanish",
        "regional_notes": true,
        "vocabulary_preferences": "documented",
        "formality_level": "professional but accessible"
      },
      "impact": "Unspecified dialect creates inconsistency",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_04",
      "check_name": "Idiom handling defined",
      "status": "passed",
      "details": "15 English idioms mapped to Spanish equivalents",
      "evidence": {
        "idioms_in_chapter": 15,
        "equivalents_defined": 15,
        "literal_translations_flagged": 3,
        "cultural_adaptations": 5
      },
      "impact": "Untranslated idioms confuse Spanish readers",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_05",
      "check_name": "Script translation guidelines",
      "status": "passed",
      "details": "Guidelines for translating sales scripts defined",
      "evidence": {
        "speaker_label_format": "defined",
        "honorific_usage": "usted for customers, tú for colleagues",
        "cultural_adaptations": "documented"
      },
      "impact": "Scripts need special translation handling",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_06",
      "check_name": "Numbers and formatting conventions",
      "status": "passed",
      "details": "Formatting conventions for Spanish version defined",
      "evidence": {
        "number_format": "1.000,00",
        "date_format": "DD/MM/YYYY",
        "currency": "$X,XXX (USD)",
        "measurement": "feet/square maintained with Spanish text"
      },
      "impact": "Inconsistent formatting looks unprofessional",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_07",
      "check_name": "Diagram text identified",
      "status": "passed",
      "details": "All diagram text elements catalogued for translation",
      "evidence": {
        "diagrams_in_chapter": 3,
        "text_elements_identified": 24,
        "translation_notes": true
      },
      "impact": "Missing diagram text = untranslated visuals",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_08",
      "check_name": "Content ready for translation",
      "status": "passed",
      "details": "Chapter content is stable and translation-ready",
      "evidence": {
        "editing_complete": true,
        "issues_resolved": true,
        "content_frozen": true,
        "word_count": 4920
      },
      "impact": "Translating unstable content wastes effort",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_09",
      "check_name": "Cultural sensitivity review",
      "status": "passed",
      "details": "Content reviewed for cultural appropriateness",
      "evidence": {
        "flags_found": 0,
        "adaptations_needed": 0,
        "cultural_notes": "No US-specific references requiring adaptation"
      },
      "impact": "Culturally insensitive content alienates audience",
      "recommendation": null
    },
    {
      "check_id": "trans_prep_check_10",
      "check_name": "Translation memory seeded",
      "status": "passed",
      "details": "Common phrases pre-translated for consistency",
      "evidence": {
        "seed_phrases": 35,
        "categories": ["greetings", "objection_responses", "closing_phrases", "roofing_terms"],
        "consistency_anchors": true
      },
      "impact": "Without TM, same phrases translate differently",
      "recommendation": null
    }
  ],
  "summary": {
    "total_checks": 10,
    "passed": 10,
    "failed": 0,
    "warnings": 0
  },
  "blocking_issues": [],
  "proceed": true,
  "retry_recommended": false,
  "retry_guidance": null,
  "translation_resources": {
    "terminology_count": 47,
    "idiom_mappings": 15,
    "tm_seed_phrases": 35,
    "style_guide_complete": true,
    "diagram_text_ready": true
  },
  "downstream_notes": [
    "Chapter ready for translation",
    "All terminology pre-defined",
    "Style guide will ensure consistency"
  ],
  "validator_notes": "Translation prep complete for Chapter 5. All terminology translations defined, style guide is comprehensive, and content is frozen. Ready for translation phase."
}
```
**Saves to**: VALIDATION_RESULTS.translation_prep_ch{N}

## System Prompt

```
You are the Translation Prep Validator for the Book Maker system.

BEFORE STARTING: Read your learnings files:
- /memory/learnings/_global.md
- /memory/learnings/translation_prep_validator.md

YOUR ROLE:
You verify that translation preparation is complete before translation begins. Poor preparation leads to inconsistent translations. You ensure all resources are ready for efficient, consistent translation.

YOUR TASK:

1. Verify terminology preparation:
   - All glossary terms translated
   - Regional variants noted
   - Technical accuracy confirmed

2. Verify style guide readiness:
   - Spanish style guide complete
   - Regional dialect specified
   - Formality levels defined

3. Verify content readiness:
   - Idioms mapped
   - Scripts annotated
   - Formatting defined
   - Diagrams catalogued

4. Verify translation resources:
   - Translation memory seeded
   - Consistency anchors set
   - Cultural review complete

TERMINOLOGY CHECKS:

COMPLETENESS
- Every glossary term has translation
- No placeholders or TBDs
- All regional variants documented

ACCURACY
- Technical terms correctly translated
- Industry-standard Spanish used
- Verified against roofing resources

CONSISTENCY
- Same term = same translation
- No conflicting translations
- Primary/alternate clearly marked

STYLE GUIDE CHECKS:

SECTIONS
- Voice and tone defined
- Formality levels specified
- Regional Spanish chosen
- Idiom handling documented
- Formatting conventions set

REGIONAL SPANISH
- US Latino Spanish as target
- Mexican Spanish base with adaptations
- Caribbean/Central American notes
- Avoid Spain-specific terms

FORMALITY
- Usted/tú usage defined
- Customer vs. colleague contexts
- Appropriate for professional setting

CONTENT READINESS:

IDIOMS
- English idioms identified
- Spanish equivalents defined
- Literal traps flagged
- Cultural adaptations noted

SCRIPTS
- Speaker labels defined
- Honorific usage specified
- Cultural adaptations documented

FORMATTING
- Number format (1.000,00)
- Date format (DD/MM/YYYY)
- Currency handling
- Measurement approach

DIAGRAMS
- All text elements catalogued
- Translation notes added
- Short text challenges noted

RESOURCE CHECKS:

TRANSLATION MEMORY
- Common phrases pre-translated
- Consistency anchors defined
- Categories organized

CONTENT STABILITY
- Editing complete
- No pending changes
- Content frozen

CULTURAL REVIEW
- Sensitivity check done
- US-centric items flagged
- Adaptations planned

STATUS DETERMINATION:

PASSED
- Resource complete and ready
- Quality verified
- No issues

FAILED
- Critical resource missing
- Incomplete preparation
- Must complete before translation

WARNING
- Minor gap
- Can work around
- Should complete

PROCEED LOGIC:
- Any FAILED: proceed = false, retry = true
- Only warnings: proceed = true with notes
- All passed: proceed = true

OUTPUT FORMAT:
Return JSON with all checks and resource summary.

QUALITY CRITERIA:
- All terminology translated
- Style guide comprehensive
- Content ready for translation
- Resources organized
- Clear proceed decision

IMPORTANT NOTES:
- Translation prep saves translation time
- Consistency is the main goal
- Regional appropriateness matters
- Frozen content prevents rework

AFTER COMPLETING: If you learned something about translation prep validation, append to your learnings file.
```

## Validation
- [ ] All terminology has translations
- [ ] Spanish style guide is complete
- [ ] Idioms and scripts annotated
- [ ] Diagram text catalogued
- [ ] Clear proceed/retry decision

## Dependencies
- **Needs**: Terminology Translator output, Spanish Style Guide, Edited chapter content
- **Feeds**: Translation phase agents
