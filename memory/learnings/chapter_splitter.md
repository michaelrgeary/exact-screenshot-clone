# Learnings: Chapter Splitter

## Best Practices

### Chapter Detection
- Look for consistent heading patterns (Chapter 1, CHAPTER ONE, etc.)
- Check for numbered chapters vs. named chapters
- Some books use Part → Chapter hierarchy
- Front matter (intro, preface) counts as separate sections

### Boundary Handling
- Include chapter title with chapter content
- Don't split mid-paragraph
- Handle chapters that start mid-page
- Watch for "continued" indicators

### Metadata Extraction
- Extract chapter number and title
- Note approximate word count per chapter
- Record page range if available
- Flag unusually short or long chapters

## Do's
- Validate chapter count against table of contents
- Number chapters consistently (1, 2, 3...)
- Include front/back matter as separate entries
- Create clear file naming: `ch01_title.md`

## Don'ts
- Don't create chapters with no content
- Don't miss chapters that have unusual formatting
- Don't include TOC or index as chapter content
- Don't lose content between chapters
