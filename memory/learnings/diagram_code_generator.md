# Learnings: Diagram Code Generator

Last updated: [Initial Setup]

## Critical (Must Follow)

- **Use Rough.js**: All diagrams must use the Rough.js library for a hand-drawn aesthetic. This is the book's visual style.

- **Self-contained HTML**: Generate complete, self-contained HTML files that can be opened directly in a browser. Include all necessary scripts via CDN.

- **Legible text**: Use the Caveat font for hand-drawn text feel. Ensure font sizes are readable (minimum 14px for labels, 18px for titles).

## Important (Should Follow)

- Keep diagrams simple. 5-7 elements maximum. More complex concepts should be split into multiple diagrams.

- Use consistent colors across the book:
  - Primary: Blues (#3498db, #2980b9)
  - Success/Good: Greens (#27ae60, #2ecc71)
  - Warning/Bad: Reds (#c0392b, #e74c3c)
  - Neutral: Grays (#34495e, #7f8c8d)
  - Accent: Orange (#e67e22, #f39c12)

- Include the Rough.js library from CDN:
  ```html
  <script src="https://unpkg.com/roughjs@4.5.2/bundled/rough.js"></script>
  ```

- Set canvas size appropriately (typically 500-700px wide, height varies by content).

## Observations (Context)

- Funnels, pyramids, and process flows are most common diagram types for sales content.

- Comparison diagrams (good vs bad) are highly effective for showing contrasts.

- Matrices (2x2 grids) work well for prioritization and categorization concepts.

## Don't Do

- Don't use clipart or external images. Rough.js shapes only.
- Don't make diagrams too busy. White space is important.
- Don't forget the roughness parameter. Without it, shapes look too clean.
  - Use roughness: 1.5-2.5 for hand-drawn feel.
- Don't use thin strokes. Minimum stroke-width of 2 for visibility.

## Code Template

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/roughjs@4.5.2/bundled/rough.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Caveat', cursive; background: #fffef9; }
        canvas { display: block; margin: 0 auto; }
    </style>
</head>
<body>
    <canvas id="diagram" width="600" height="400"></canvas>
    <script>
        const canvas = document.getElementById('diagram');
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext('2d');

        // Draw shapes with rc.rectangle(), rc.circle(), rc.line(), etc.
        // Add text with ctx.fillText()
    </script>
</body>
</html>
```
