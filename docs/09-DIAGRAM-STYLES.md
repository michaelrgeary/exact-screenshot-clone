# Diagram Style Guide

## Overview

All diagrams in the Book Maker system use **Rough.js** to create a hand-drawn, sketchy aesthetic. This style is approachable, memorable, and stands out from typical corporate graphics.

## Visual Style

### The Look We're Going For

- Hand-drawn lines (wobbly, imperfect)
- Sketch-style fills
- Handwriting-style fonts (Caveat)
- Paper-like backgrounds
- Warm, friendly colors

### Why This Style?

1. **Memorable**: Stands out from polished corporate graphics
2. **Approachable**: Feels like notes, not a textbook
3. **Authentic**: Matches the practical, in-the-field tone of roofing sales
4. **Scannable**: Clear hierarchy, easy to read quickly

---

## Diagram Types

### 1. Funnel
**Use For**: Sales processes, qualification stages, conversion paths

```
Wide at top, narrow at bottom
Each stage labeled
Annotations on the side
```

### 2. Process Flow
**Use For**: Step-by-step procedures, inspection process, sales call flow

```
Circles or boxes connected by arrows
Numbered steps
Start → Action → Action → End
```

### 3. Comparison (Good vs Bad)
**Use For**: Contrasting approaches, right vs wrong way

```
Two columns side by side
Red/X on left (bad)
Green/✓ on right (good)
Bullet points in each
```

### 4. Framework (Letter Boxes)
**Use For**: Acronyms, methodologies (LAER, SPIN, etc.)

```
Large letters in boxes
Labels below each
Connected by arrows
```

### 5. Pyramid
**Use For**: Hierarchies, building blocks, priority levels

```
Triangle shape
Widest at bottom (foundation)
Narrowest at top (goal)
Labels in each tier
```

### 6. Timeline
**Use For**: Customer journey, project phases, follow-up schedules

```
Horizontal line
Points/circles along the line
Labels above and below
```

### 7. Matrix (2x2)
**Use For**: Prioritization, categorization, decision-making

```
Two axes (labeled)
Four quadrants
Each quadrant named and described
```

### 8. Checklist
**Use For**: Pre-call prep, equipment lists, qualification criteria

```
Icon boxes with labels
Checkbox squares
Grid layout
```

---

## Technical Specifications

### Canvas Size
- Standard: 600px × 400px
- Wide (timeline): 750px × 180px
- Tall (pyramid/funnel): 500px × 350px

### Colors

```javascript
const colors = {
  // Primary palette
  blue: { light: '#e3f2fd', medium: '#64b5f6', dark: '#1976d2' },
  green: { light: '#e8f5e9', medium: '#66bb6a', dark: '#2e7d32' },
  red: { light: '#ffebee', medium: '#ef5350', dark: '#c62828' },
  orange: { light: '#fff3e0', medium: '#ffa726', dark: '#e65100' },

  // Neutrals
  gray: { light: '#f5f5f5', medium: '#9e9e9e', dark: '#424242' },

  // Background
  paper: '#fffef9',

  // Text
  text: '#2c3e50',
  textLight: '#7f8c8d'
};
```

### Rough.js Settings

```javascript
// Standard shape
rc.rectangle(x, y, width, height, {
  fill: colors.blue.light,
  fillStyle: 'solid',
  stroke: colors.blue.dark,
  strokeWidth: 2,
  roughness: 1.8  // 1.5-2.5 for hand-drawn feel
});

// Circle
rc.circle(x, y, diameter, {
  fill: colors.green.light,
  fillStyle: 'solid',
  stroke: colors.green.dark,
  strokeWidth: 2.5,
  roughness: 1.8
});

// Line/Arrow
rc.line(x1, y1, x2, y2, {
  stroke: colors.gray.dark,
  strokeWidth: 2,
  roughness: 1.5
});
```

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap');

/* Titles */
.title {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  font-weight: 700;
}

/* Labels */
.label {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  font-weight: 500;
}

/* Small text */
.caption {
  font-family: 'Caveat', cursive;
  font-size: 16px;
  font-weight: 400;
}
```

---

## File Structure

```
/diagrams/
├── roughjs_examples.html      # Reference implementations
├── chapter_01/
│   ├── diagram_01_funnel.html
│   ├── diagram_01_funnel.png
│   └── diagram_01_funnel.svg
├── chapter_02/
│   └── ...
└── templates/
    ├── funnel_template.html
    ├── process_template.html
    ├── comparison_template.html
    └── ...
```

---

## Generation Process

1. **Visual Opportunity Identifier** reviews chapter, suggests diagram types
2. **Diagram Specifier** creates detailed spec (type, content, labels)
3. **Diagram Code Generator** writes Rough.js HTML/JS code
4. **Diagram Renderer** (tool) executes code, saves PNG/SVG
5. **Diagram Validator** checks quality (renders? legible? matches spec?)
6. **Caption Writer** writes caption for the diagram

---

## Quality Checklist

Before a diagram is approved:

- [ ] Renders without JavaScript errors
- [ ] Text is legible (not too small, not overlapping)
- [ ] Colors are consistent with palette
- [ ] Rough.js roughness applied (not too clean)
- [ ] Content matches specification
- [ ] Appropriate diagram type for the content
- [ ] Has a caption that explains the diagram
- [ ] File saved in correct chapter folder

---

## Example: Full Diagram Code

See `/diagrams/roughjs_examples.html` for complete working examples of all diagram types.
