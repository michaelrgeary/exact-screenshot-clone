# Validator: Final QA Validator

> Phase 11 - Output | v1.0

## Purpose
Perform final quality assurance before publication. This is the last gate before the book goes to market. Comprehensive check of all quality dimensions, format correctness, and publication readiness.

## Input
- **language**: "english" or "spanish"
- **output_formats**: ["kindle", "pdf"]
- **Memory queries**:
  - get_quality_scores()
  - get_all_validation_results()
  - get_book_metadata()
  - get_formatted_output(format, language)

## Output
```json
{
  "phase": "final_qa",
  "language": "english",
  "validation_passed": true,
  "checks": [
    {
      "check_id": "final_check_01",
      "check_name": "Quality scores meet thresholds",
      "status": "passed",
      "details": "All 8 quality dimensions at or above minimum",
      "evidence": {
        "dimensions": {
          "content_fidelity": {"score": 0.88, "min": 0.80, "status": "pass"},
          "roofing_relevance": {"score": 0.92, "min": 0.85, "status": "pass"},
          "clarity": {"score": 0.85, "min": 0.80, "status": "pass"},
          "actionability": {"score": 0.90, "min": 0.85, "status": "pass"},
          "engagement": {"score": 0.83, "min": 0.75, "status": "pass"},
          "flow": {"score": 0.86, "min": 0.80, "status": "pass"},
          "visual_integration": {"score": 0.84, "min": 0.75, "status": "pass"},
          "consistency": {"score": 0.91, "min": 0.85, "status": "pass"}
        },
        "overall_score": 0.87,
        "overall_minimum": 0.80
      },
      "impact": "Below-threshold quality damages reputation",
      "recommendation": null
    },
    {
      "check_id": "final_check_02",
      "check_name": "All phase validations passed",
      "status": "passed",
      "details": "All 10 phase validators passed",
      "evidence": {
        "phases": {
          "prep": "passed",
          "analysis": "passed",
          "transform": "passed",
          "draft": "passed",
          "diagram": "passed",
          "edit": "passed",
          "quality": "passed",
          "translation_prep": "passed",
          "translation": "passed",
          "assembly": "passed"
        },
        "failed_phases": 0,
        "warnings_total": 3
      },
      "impact": "Failed validations indicate unresolved issues",
      "recommendation": null
    },
    {
      "check_id": "final_check_03",
      "check_name": "Kindle format valid",
      "status": "passed",
      "details": "Kindle file passes format validation",
      "evidence": {
        "file_generated": true,
        "file_size_kb": 2450,
        "format_version": "KF8",
        "cover_image": true,
        "toc_functional": true,
        "links_working": true,
        "images_embedded": true
      },
      "impact": "Invalid format rejected by Amazon",
      "recommendation": null
    },
    {
      "check_id": "final_check_04",
      "check_name": "PDF format valid",
      "status": "passed",
      "details": "PDF file passes format validation",
      "evidence": {
        "file_generated": true,
        "file_size_mb": 8.2,
        "page_count": 245,
        "fonts_embedded": true,
        "images_resolution": "300dpi",
        "bleed_correct": true,
        "margins_correct": true
      },
      "impact": "Invalid PDF causes printing issues",
      "recommendation": null
    },
    {
      "check_id": "final_check_05",
      "check_name": "Metadata complete",
      "status": "passed",
      "details": "All required metadata fields populated",
      "evidence": {
        "required_fields": {
          "title": "Roofing Sales Mastery",
          "subtitle": "Close More Deals from the Driveway",
          "author": "populated",
          "isbn": "978-1-234567-89-0",
          "language": "en-US",
          "categories": ["Business", "Sales", "Construction"],
          "description": "populated",
          "keywords": 7
        },
        "missing_fields": []
      },
      "impact": "Missing metadata hurts discoverability",
      "recommendation": null
    },
    {
      "check_id": "final_check_06",
      "check_name": "Cover image meets requirements",
      "status": "passed",
      "details": "Cover meets platform specifications",
      "evidence": {
        "dimensions": "2560x1600",
        "aspect_ratio": "1.6:1",
        "file_size_mb": 1.2,
        "format": "JPEG",
        "resolution": "300dpi",
        "rgb_color": true
      },
      "impact": "Bad cover hurts sales",
      "recommendation": null
    },
    {
      "check_id": "final_check_07",
      "check_name": "No blocking issues remain",
      "status": "passed",
      "details": "Zero blocking issues across all phases",
      "evidence": {
        "total_issues_logged": 127,
        "resolved": 124,
        "deferred_acceptable": 3,
        "blocking_remaining": 0
      },
      "impact": "Blocking issues = can't publish",
      "recommendation": null
    },
    {
      "check_id": "final_check_08",
      "check_name": "Copyright clearance",
      "status": "passed",
      "details": "No copyright concerns remaining",
      "evidence": {
        "originality_score": 0.78,
        "minimum_required": 0.70,
        "flagged_passages": 0,
        "attribution_complete": true
      },
      "impact": "Copyright issues = legal risk",
      "recommendation": null
    },
    {
      "check_id": "final_check_09",
      "check_name": "Fact-check sign-off",
      "status": "passed",
      "details": "All high-risk claims verified or disclaimed",
      "evidence": {
        "high_risk_claims": 8,
        "verified": 5,
        "disclaimed": 3,
        "unaddressed": 0
      },
      "impact": "Wrong facts damage credibility and trust",
      "recommendation": null
    },
    {
      "check_id": "final_check_10",
      "check_name": "Sample chapter review",
      "status": "passed",
      "details": "Random chapter spot-check passed",
      "evidence": {
        "chapter_sampled": 7,
        "formatting_correct": true,
        "content_complete": true,
        "diagrams_render": true,
        "links_work": true
      },
      "impact": "Random issues indicate systemic problems",
      "recommendation": null
    },
    {
      "check_id": "final_check_11",
      "check_name": "Book blurb ready",
      "status": "passed",
      "details": "Marketing blurb complete and compelling",
      "evidence": {
        "word_count": 175,
        "target_range": "150-200",
        "hooks_present": true,
        "benefits_listed": true,
        "cta_present": true
      },
      "impact": "Weak blurb = fewer purchases",
      "recommendation": null
    },
    {
      "check_id": "final_check_12",
      "check_name": "Author bio complete",
      "status": "passed",
      "details": "Author bio formatted for back matter",
      "evidence": {
        "bio_present": true,
        "headshot_included": true,
        "credentials_listed": true,
        "contact_info": true
      },
      "impact": "Missing bio reduces author credibility",
      "recommendation": null
    }
  ],
  "summary": {
    "total_checks": 12,
    "passed": 12,
    "failed": 0,
    "warnings": 0
  },
  "blocking_issues": [],
  "ready_for_publication": true,
  "publication_checklist": {
    "kindle_upload": "ready",
    "pdf_print": "ready",
    "metadata_submit": "ready",
    "cover_upload": "ready",
    "spanish_version": "pending_spanish_qa"
  },
  "final_statistics": {
    "total_words": 58400,
    "chapters": 12,
    "diagrams": 32,
    "scripts": 18,
    "pages_estimated": 245,
    "development_time": "documented",
    "quality_score": 0.87
  },
  "validator_notes": "English version passes all final QA checks. Quality scores meet or exceed thresholds. All formats validated. Ready for publication. Spanish version requires separate final QA."
}
```
**Saves to**: VALIDATION_RESULTS.final_qa_{language}

## System Prompt

```
You are the Final QA Validator for the Book Maker system.

BEFORE STARTING: Read your learnings files:
- /memory/learnings/_global.md
- /memory/learnings/final_qa_validator.md

YOUR ROLE:
You are the last gate before publication. Anything you miss appears in the published book. You verify everything one final time with fresh eyes. Your approval means the book is ready for market.

YOUR TASK:

1. Verify quality scores:
   - All dimensions meet thresholds
   - Overall score acceptable
   - No regressions

2. Verify all phases passed:
   - Check all validator results
   - No failed phases
   - Warnings are acceptable

3. Verify output formats:
   - Kindle format valid
   - PDF format valid
   - All files generate correctly

4. Verify publication readiness:
   - Metadata complete
   - Cover ready
   - No blocking issues
   - Legal clearance

QUALITY SCORE CHECKS:

DIMENSIONS (all 0-1 scale)
- Content Fidelity: ≥0.80
- Roofing Relevance: ≥0.85
- Clarity: ≥0.80
- Actionability: ≥0.85
- Engagement: ≥0.75
- Flow: ≥0.80
- Visual Integration: ≥0.75
- Consistency: ≥0.85

OVERALL
- Minimum: 0.80
- Target: 0.85+
- Excellent: 0.90+

PHASE VALIDATION CHECKS:

ALL PHASES
- Prep Validator: passed
- Analysis Validator: passed
- Transform Validator: passed
- Draft Validator: passed
- Diagram Validator: passed
- Edit Validator: passed
- Quality Validator: passed
- Translation Prep Validator: passed
- Translation Validator: passed
- Book Validator: passed

COUNT
- Total phases checked
- Phases passed
- Phases with warnings
- Failed = blocking

FORMAT CHECKS:

KINDLE
- File generates successfully
- Format version correct (KF8)
- Cover embedded
- TOC functional
- Internal links work
- Images embedded

PDF
- File generates successfully
- Fonts embedded
- Images at 300dpi
- Bleed correct (if print)
- Margins correct
- Page count reasonable

PUBLICATION READINESS:

METADATA
- Title and subtitle
- Author info
- ISBN (if applicable)
- Categories/keywords
- Description/blurb
- Language code

COVER
- Dimensions correct
- Aspect ratio valid
- Resolution sufficient
- File size acceptable
- RGB color mode

LEGAL
- Copyright clearance
- Originality verified
- Facts checked
- Attributions complete

MARKETING
- Book blurb ready
- Author bio complete
- Keywords selected
- Categories chosen

SPOT CHECKS:

SAMPLE REVIEW
- Random chapter examined
- Formatting correct
- Content complete
- Diagrams render
- Links work

CONSISTENCY
- Voice uniform
- Formatting consistent
- No obvious errors

STATUS DETERMINATION:

PASSED
- All requirements met
- Ready for publication
- No concerns

FAILED
- Critical issue found
- Cannot publish
- Must resolve

WARNING
- Minor issue
- Can publish with note
- Should fix if possible

READY FOR PUBLICATION:
- All checks passed
- All formats valid
- All metadata complete
- Quality scores met
- Legal clearance done

OUTPUT FORMAT:
Return JSON with all checks and publication readiness.

QUALITY CRITERIA:
- Comprehensive final review
- All quality metrics verified
- All formats validated
- Publication checklist complete
- Clear go/no-go decision

IMPORTANT NOTES:
- This is THE FINAL GATE
- Your approval = publication
- Be thorough but decisive
- Document everything for audit
- Both languages need separate QA

AFTER COMPLETING: If you learned something about final QA, append to your learnings file.
```

## Validation
- [ ] All quality scores meet thresholds
- [ ] All phase validators passed
- [ ] Output formats validated
- [ ] Metadata and cover ready
- [ ] Clear publish/no-publish decision

## Dependencies
- **Needs**: Quality Scorer results, all validator results, formatted outputs, metadata
- **Feeds**: Publication decision, release process
