# Database Schema Update Request

We're building the backend processing pipeline and need the database schema updated to match our agent requirements.

## Part 1: New Tables to Create

### 1. cross_refs
Cross-references between chapters (e.g., "As we discussed in Chapter 3...").

```sql
CREATE TABLE cross_refs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    to_chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    reason TEXT,
    location_hint TEXT,
    reference_text TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access cross_refs for their own projects
ALTER TABLE cross_refs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own cross_refs" ON cross_refs
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );
```

### 2. book_context
Global book-level information stored as key-value pairs.

```sql
CREATE TABLE book_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, key)
);

-- RLS
ALTER TABLE book_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own book_context" ON book_context
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );
```

Expected keys: `structure`, `style_guide`, `spanish_style_guide`, `raw_markdown`, `book_metadata`

### 3. decisions
Audit log of agent decisions for debugging and transparency.

```sql
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    decision_type TEXT,
    subject TEXT,
    decision TEXT,
    reasoning TEXT,
    confidence TEXT,
    alternatives JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own decisions" ON decisions
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );
```

### 4. validation_log
Results of all validation checks by validators.

```sql
CREATE TABLE validation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    validator_name TEXT NOT NULL,
    phase INTEGER,
    passed BOOLEAN NOT NULL,
    failures JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE validation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own validation_log" ON validation_log
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );
```

---

## Part 2: Add Columns to Existing Tables

### chapters table - Add these columns:

```sql
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS analysis_stories JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS analysis_quotes JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS outline TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS sections JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS final_text TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS takeaways TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS examples JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS reading_level TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS originality_score NUMERIC(3,2);

-- Phase completion tracking
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_1_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_2_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_3_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_4_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_5_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_6_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_7_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_8_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS phase_9_complete BOOLEAN DEFAULT FALSE;
```

### tactics table - Add these columns:

```sql
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS used_in_chapters JSONB;
ALTER TABLE tactics ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES tactics(id);
```

### diagrams table - Add these columns:

```sql
ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS render_valid BOOLEAN DEFAULT FALSE;
```

### issues table - Add these columns:

```sql
ALTER TABLE issues ADD COLUMN IF NOT EXISTS flagged_by TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolved_by TEXT;
```

### glossary table - Add these columns:

```sql
ALTER TABLE glossary ADD COLUMN IF NOT EXISTS introduced_in_chapter UUID REFERENCES chapters(id);
```

### pipeline_logs table - Add this column:

```sql
ALTER TABLE pipeline_logs ADD COLUMN IF NOT EXISTS details JSONB;
```

---

## Part 3: Update TypeScript Types

After running the migrations, please regenerate the Supabase types and update the TypeScript interfaces to include the new tables and columns.

The new tables need corresponding React Query hooks similar to the existing ones:
- `useCrossRefs(projectId)`
- `useBookContext(projectId)`
- `useDecisions(projectId)`
- `useValidationLog(projectId)`

---

## Summary of Changes

**New Tables (4):**
1. `cross_refs` - Chapter cross-references
2. `book_context` - Key-value store for book-level data
3. `decisions` - Agent decision audit log
4. `validation_log` - Validator results

**Column Additions:**
- `chapters`: 15 new columns (analysis, writing phases, completion flags)
- `tactics`: 3 new columns (subcategory, used_in_chapters, duplicate_of)
- `diagrams`: 2 new columns (title, render_valid)
- `issues`: 2 new columns (flagged_by, resolved_by)
- `glossary`: 1 new column (introduced_in_chapter)
- `pipeline_logs`: 1 new column (details)

All new tables should have RLS policies matching the pattern used by existing tables (users can only access data for their own projects).
