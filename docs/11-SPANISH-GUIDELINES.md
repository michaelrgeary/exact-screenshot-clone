# Spanish Translation Guidelines

## Overview

This document establishes the standards for translating the English roofing sales book into Spanish. Consistency in terminology, tone, and style is critical for a professional publication.

---

## Target Dialect

**Neutral Latin American Spanish**

The translation targets a broad Latin American audience, avoiding region-specific slang or idioms. This dialect is widely understood across Mexico, Central America, and South America.

### Dialect Guidelines

- Use "ustedes" for "you all" (not "vosotros")
- Use "tú" for informal singular "you" (not "vos")
- Avoid Mexican-specific slang (e.g., "chido", "padre")
- Avoid Argentine/Uruguayan specific forms (voseo)
- Prefer neutral terms over regional variants

---

## Terminology Consistency

### Roofing Terms

All roofing terminology is pre-translated in the GLOSSARY table before chapter translation begins. Translators MUST use these terms consistently.

| English | Spanish | Notes |
|---------|---------|-------|
| Roof | Techo | Primary term |
| Shingles | Tejas de asfalto | Or "tejas" in context |
| Flashing | Tapajuntas | Or "botaguas" |
| Gutter | Canalón | Or "canal" |
| Downspout | Bajante | |
| Ridge | Cumbrera | |
| Eave | Alero | |
| Fascia | Fascia | Often kept in English |
| Soffit | Sofito | |
| Underlayment | Fieltro / Membrana | Context-dependent |
| Ice dam | Barrera de hielo | |
| Ventilation | Ventilación | |
| Estimate | Presupuesto | Or "cotización" |
| Quote | Cotización | |
| Warranty | Garantía | |
| Homeowner | Propietario | Or "dueño de casa" |

### Sales Terms

| English | Spanish | Notes |
|---------|---------|-------|
| Close (the sale) | Cerrar (la venta) | |
| Prospect | Prospecto | Or "cliente potencial" |
| Lead | Prospecto | Context determines choice |
| Objection | Objeción | |
| Follow-up | Seguimiento | |
| Referral | Referido/Referencia | |
| Upsell | Venta adicional | |
| Commission | Comisión | |
| Door-to-door | Puerta a puerta | |
| Pitch | Presentación | Never "lanzamiento" for sales |

---

## Tone and Voice

### Voice Characteristics

Match the English book's voice:
- **Conversational**: Write as if speaking to a colleague
- **Authoritative but approachable**: Expert sharing knowledge, not lecturing
- **Action-oriented**: Focus on what the reader can DO
- **Encouraging**: Build confidence without being preachy

### Formality Level

- Use "tú" (informal) when addressing the reader directly
- This maintains the coaching/mentoring tone of the original
- Exception: In sample scripts for customer interactions, use "usted"

### Examples

**Too formal (avoid)**:
"Usted debe considerar cuidadosamente las objeciones del cliente..."

**Correct (conversational, action-oriented)**:
"Cuando escuches una objeción, no te pongas a la defensiva. En cambio, haz esto..."

---

## Script Translation

### Customer-Facing Scripts

When translating sales scripts intended for use with customers:
- Use "usted" (formal) for the salesperson addressing the customer
- Maintain the natural flow of spoken Spanish
- Adapt idioms to equivalent Spanish expressions
- Test scripts by reading aloud - they should sound natural

### Example Script Translation

**English**:
```
"I hear you, Mr. Johnson. Price is definitely something to consider.
But let me ask you this - if you could protect your family from the
next big storm, would that peace of mind be worth it?"
```

**Spanish**:
```
"Lo entiendo, señor Johnson. El precio definitivamente es algo para considerar.
Pero permítame preguntarle: si pudiera proteger a su familia de la próxima
tormenta grande, ¿valdría la pena esa tranquilidad?"
```

---

## Length Expectations

Spanish text is typically 10-20% longer than English equivalent:
- Accept this natural expansion
- Do NOT artificially compress to match English length
- If a chapter is significantly longer (>25%), review for unnecessary verbosity

---

## Cultural Adaptations

### Weather References

- Maintain storm/weather examples (hurricanes, hail, etc.)
- These apply across Latin America
- Avoid region-specific weather patterns unless from original

### Currency

- Keep dollar amounts from English version
- Many Latin American roofing markets deal in USD
- Add clarification if helpful: "5,000 dólares"

### Measurements

- Keep original measurements (feet, inches, squares)
- Roofing industry in Latin America often uses these
- Can add metric equivalents in parentheses if helpful

### Cultural References

- American business references usually translate well
- Sports analogies may need adaptation (baseball → fútbol if appropriate)
- Holiday references should remain neutral

---

## Common Mistakes to Avoid

### False Friends

| English | Wrong Spanish | Correct Spanish |
|---------|---------------|-----------------|
| Actually | Actualmente | En realidad |
| Eventually | Eventualmente | Finalmente |
| Argument | Argumento | Discusión |
| Sensible | Sensible | Razonable |
| Realize | Realizar | Darse cuenta |

### Literal Translations to Avoid

- "Make a decision" → NOT "hacer una decisión" → USE "tomar una decisión"
- "Have a meeting" → NOT "tener una reunión" → USE "tener una reunión" (OK) or "reunirse"
- "Take time" → NOT "tomar tiempo" → USE "llevar tiempo" or "tomarse el tiempo"

---

## Diagram and Caption Translation

### Caption Style

- Match English caption length where possible
- Keep captions action-oriented
- Use infinitives for instructional captions

**English**: "How to handle price objections"
**Spanish**: "Cómo manejar objeciones de precio"

### Diagram Text

- Shorter is better (limited space in diagrams)
- Use standard abbreviations where accepted
- Maintain left-to-right reading flow

---

## Quality Checks

### Pre-Translation

1. Review Spanish glossary for accuracy
2. Confirm style guide is understood
3. Check for any unclear English passages

### During Translation

1. Maintain glossary term consistency
2. Check that scripts sound natural aloud
3. Preserve emphasis and callouts

### Post-Translation

1. Native speaker review
2. Read aloud for naturalness
3. Verify glossary compliance
4. Check length proportionality (10-20% expansion)
5. Confirm no untranslated English fragments

---

## Translator Notes Format

When a translator needs to flag something:

```json
{
  "chapter": 5,
  "section": "Opening Story",
  "issue_type": "cultural_adaptation",
  "original_text": "It was like hitting a home run...",
  "proposed_translation": "Fue como meter un gol decisivo...",
  "note": "Changed baseball reference to soccer for broader cultural relevance"
}
```

---

## Spanish Style Guide Creator Agent

The Spanish Style Guide Creator agent will produce a detailed style guide specific to each book based on:
- The English style guide
- The translated glossary
- These general guidelines

That agent's output becomes the authoritative style reference for all translation agents.
