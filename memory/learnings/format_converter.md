# Learnings: Format Converter

## Best Practices

### Input Handling
- Always detect encoding before processing (UTF-8, Latin-1, etc.)
- Strip DRM markers if present in Kindle files
- Preserve paragraph breaks but normalize excessive whitespace
- Handle special characters (em-dashes, curly quotes) consistently

### Output Quality
- Output clean markdown with consistent heading levels
- Use `#` for chapter titles, `##` for sections
- Preserve emphasis (bold, italic) as markdown
- Convert tables to markdown table format
- Keep block quotes as `>` prefixed text

### Common Issues
- PDF files may have line breaks mid-sentence - rejoin carefully
- EPUB chapter breaks may not align with actual chapters
- Kindle files sometimes have navigation artifacts - strip these
- Watch for headers/footers repeating on every page

## Do's
- Validate output is valid markdown
- Preserve the author's intentional formatting
- Log any conversion issues for human review
- Keep a mapping of original page numbers if available

## Don'ts
- Don't guess at unclear formatting - flag it
- Don't lose any content during conversion
- Don't introduce markdown syntax errors
- Don't split paragraphs that belong together
