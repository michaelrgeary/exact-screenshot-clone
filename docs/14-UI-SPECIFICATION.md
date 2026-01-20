# UI Specification for Book Maker

## Overview

Book Maker is a web application that transforms generic sales books into roofing-specific sales books. The UI provides pipeline control, progress monitoring, content review, and manual override capabilities.

---

## Authentication

### Login Screen (Unauthenticated Landing Page)

**Route:** `/` (redirects to `/login` if not authenticated)

**Layout:**
- Centered card on simple background
- Company/app logo at top
- Clean, professional appearance

**Elements:**
- Logo: "Book Maker" with subtle book/roof icon
- Email input field
- Password input field
- "Log In" button (primary)
- "Forgot Password?" link (secondary)
- Error message area (for invalid credentials)

**Behavior:**
- All other routes redirect here if not authenticated
- On successful login → redirect to `/dashboard`
- Failed login → show error message, don't clear fields
- Session persists (remember login)

**No public pages** - Everything requires authentication.

---

## Main Navigation

After login, show persistent navigation:

**Top Navigation Bar:**
- Logo (left) - clicks to dashboard
- Navigation links (center):
  - Dashboard
  - Projects
  - Library
  - Settings
- User menu (right):
  - User avatar/name
  - Dropdown: Profile, Log Out

**Mobile:** Hamburger menu

---

## Screen Specifications

### 1. Dashboard (`/dashboard`)

**Purpose:** Overview of all projects and system status

**Layout:**
- Welcome message with user's name
- Quick stats row
- Active projects list
- Recent activity feed

**Components:**

**Stats Row (4 cards):**
| Stat | Example |
|------|---------|
| Active Projects | 2 |
| Chapters in Progress | 8 |
| Completed Books | 5 |
| Average Quality Score | 0.87 |

**Active Projects Section:**
- Card for each active project showing:
  - Book title
  - Progress bar (% complete)
  - Current phase (e.g., "Phase 4: Writing - Chapter 5")
  - Status indicator (running/paused/error)
  - "View" button
- "New Project" button (prominent)

**Recent Activity Feed:**
- Timestamped list of recent events
- "Chapter 3 completed quality scoring (0.89)"
- "Phase 2 validation passed"
- "Error in Chapter 5 - awaiting review"
- Link to relevant project/chapter

---

### 2. Projects List (`/projects`)

**Purpose:** Manage all book transformation projects

**Layout:**
- Header with "Projects" title and "New Project" button
- Filter/sort options
- Project cards or table view

**Project Card Shows:**
- Source book title
- Target title (roofing version)
- Status badge (Draft, Running, Paused, Complete, Error)
- Progress: "7 of 12 chapters complete"
- Quality score (if available)
- Last updated timestamp
- Actions: View, Pause/Resume, Delete

**Filters:**
- Status: All, Active, Completed, Error
- Sort: Recent, Alphabetical, Progress

---

### 3. New Project (`/projects/new`)

**Purpose:** Start a new book transformation

**Layout:** Multi-step wizard

**Step 1: Upload Source**
- Drag-and-drop zone for book file
- Supported formats: EPUB, PDF, MOBI, TXT
- File name display after upload
- "Continue" button

**Step 2: Configure**
- Target book title (editable, pre-filled suggestion)
- Target domain: "Roofing" (default, could support others later)
- Output languages: Checkboxes for English, Spanish (both default checked)
- Output formats: Checkboxes for Kindle, PDF Print, PDF Screen
- "Continue" button

**Step 3: Review & Start**
- Summary of settings
- Estimated processing time (if calculable)
- Mode selection:
  - Testing Mode (pause after each phase for review)
  - Supervised Mode (run automatically, notify on issues)
  - Autonomous Mode (fully automatic)
- "Start Processing" button

**After start:** Redirect to project detail page

---

### 4. Project Detail (`/projects/:id`)

**Purpose:** Monitor and control a single project

**Layout:**
- Header with book title, status, controls
- Tabbed content area

**Header:**
- Back arrow to projects list
- Book title (source → target)
- Status badge
- Control buttons: Pause, Resume, Stop, Restart
- Quality score (overall)

**Tabs:**

#### Tab: Overview
- Visual pipeline progress (11 phases shown)
- Current phase highlighted
- Phases color-coded: Complete (green), Current (blue), Pending (gray), Error (red)
- Click phase → expands to show agents in that phase

#### Tab: Chapters
- Table of all chapters:
  | # | Title | Status | Phase | Quality | Actions |
  |---|-------|--------|-------|---------|---------|
  | 1 | The First Impression | Complete | 7 | 0.89 | View, Edit |
  | 2 | Building Trust | In Progress | 4 | - | View |
  | 3 | Handling Objections | Pending | - | - | - |
- Click chapter → goes to chapter detail

#### Tab: Quality
- Quality scores visualization
- Bar chart of chapter scores
- Dimension breakdown (8 dimensions)
- Trend line across chapters
- Flags for chapters below threshold

#### Tab: Outputs
- Available only when project complete
- Download buttons for each output:
  - English Kindle (EPUB)
  - English PDF (Print)
  - English PDF (Screen)
  - Spanish Kindle (EPUB)
  - Spanish PDF (Print)
  - Spanish PDF (Screen)
- Metadata preview
- Book blurbs (English, Spanish)

#### Tab: Logs
- Real-time log feed
- Filter by: Phase, Agent, Severity (Info, Warning, Error)
- Search logs
- Export logs button

---

### 5. Chapter Detail (`/projects/:id/chapters/:num`)

**Purpose:** Review and edit a single chapter

**Layout:**
- Header with chapter number, title, status
- Tabbed content area

**Header:**
- Back to project
- "Chapter 5: Handling Price Objections"
- Status badge
- Quality score for this chapter
- "Edit" toggle button

**Tabs:**

#### Tab: Content
- Full chapter text (rendered markdown)
- Diagrams shown inline
- Callouts highlighted
- Edit mode: Rich text editor to modify content

#### Tab: Analysis
- Extracted tactics (from Phase 2)
- Stories found
- Quotes extracted
- Cross-references identified

#### Tab: Transformation
- Side-by-side: Original tactic → Roofing version
- Glossary terms used
- Stories transformed

#### Tab: Diagrams
- All diagrams for this chapter
- Thumbnail grid
- Click to expand
- Edit diagram spec button
- Regenerate button

#### Tab: Quality
- 8-dimension score breakdown
- Radar chart visualization
- Specific feedback per dimension
- "Request Re-evaluation" button

#### Tab: Issues
- List of issues found during editing
- Status: Open, Resolved, Ignored
- Severity: Critical, High, Medium, Low
- Resolution notes
- "Resolve" action buttons

**Edit Mode:**
When "Edit" toggle is on:
- Content becomes editable
- Save/Cancel buttons appear
- Changes tracked
- On save: Content updated, triggers re-validation

---

### 6. Library (`/library`)

**Purpose:** Manage reusable assets

**Tabs:**

#### Tab: Glossary
- Table of all roofing terms
- English term, Spanish term, Definition
- Add, Edit, Delete terms
- Import/Export CSV

#### Tab: Style Guides
- List of style guides created
- View/Edit each
- Duplicate for new project

#### Tab: Diagram Templates
- Saved diagram specifications
- Preview thumbnails
- Reuse in projects

---

### 7. Settings (`/settings`)

**Purpose:** System and user configuration

**Sections:**

#### Profile
- Name, email
- Change password
- Avatar upload

#### Preferences
- Default processing mode
- Email notifications on/off
- Notification triggers (errors only, phase complete, etc.)

#### API Configuration
- Claude API key (masked)
- Model selection (claude-3-opus, claude-3-sonnet)
- Rate limiting settings

#### Quality Thresholds
- Overall minimum score (default 0.80)
- Per-dimension minimums
- Auto-retry settings

#### Danger Zone
- Delete account
- Export all data

---

## Modals & Overlays

### Confirmation Modal
Used for destructive actions (delete, stop project):
- Warning icon
- Clear message: "Are you sure you want to delete this project?"
- Cancel button (secondary)
- Confirm button (danger/red)

### Override Modal
When agent output needs manual override:
- Shows agent name and output
- Displays validation errors
- Text area to edit output
- "Accept Original" button
- "Save Override" button
- "Request Re-run" button

### Error Detail Modal
When clicking on an error:
- Error message
- Stack trace (collapsible)
- Agent context
- Retry button
- Skip button (with warning)
- Contact support link

---

## Real-Time Updates

The following should update in real-time (WebSocket or polling):

- Dashboard active projects progress
- Project detail pipeline status
- Chapter status changes
- Log feed
- Quality scores when calculated

**Visual indicators:**
- Spinning indicator for "processing"
- Green pulse for "just completed"
- Red pulse for "error occurred"

---

## Responsive Design

**Breakpoints:**
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

**Mobile Considerations:**
- Hamburger navigation
- Cards stack vertically
- Tables become card lists
- Pipeline view scrolls horizontally
- Edit mode may be limited (view-only suggested)

---

## Color Scheme & Styling

**Suggestion (adjust to preference):**

| Element | Color |
|---------|-------|
| Primary (buttons, links) | Blue (#2563EB) |
| Success | Green (#16A34A) |
| Warning | Amber (#D97706) |
| Error | Red (#DC2626) |
| Background | Light gray (#F9FAFB) |
| Cards | White |
| Text | Dark gray (#111827) |
| Secondary text | Medium gray (#6B7280) |

**Typography:**
- Headings: Inter or similar sans-serif
- Body: System font stack
- Code/technical: Mono font

---

## Component Library

Use a standard component library for consistency:
- **Recommended:** Tailwind CSS + shadcn/ui
- Or: Chakra UI, Radix UI

**Key Components Needed:**
- Button (primary, secondary, danger, ghost)
- Input, Textarea, Select
- Card
- Table
- Tabs
- Modal
- Progress bar
- Badge/Tag
- Toast notifications
- Dropdown menu
- File upload zone
- Loading spinner
- Empty state

---

## API Endpoints Needed

The UI will need these backend endpoints:

### Auth
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`

### Projects
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/start`
- `POST /projects/:id/pause`
- `POST /projects/:id/resume`
- `POST /projects/:id/stop`

### Chapters
- `GET /projects/:id/chapters`
- `GET /projects/:id/chapters/:num`
- `PUT /projects/:id/chapters/:num`
- `POST /projects/:id/chapters/:num/revalidate`

### Pipeline
- `GET /projects/:id/status`
- `GET /projects/:id/logs`
- `GET /projects/:id/quality`

### Library
- `GET /glossary`
- `POST /glossary`
- `PUT /glossary/:id`
- `DELETE /glossary/:id`

### Outputs
- `GET /projects/:id/outputs`
- `GET /projects/:id/outputs/:format`

### Settings
- `GET /settings`
- `PUT /settings`

---

## User Flows

### Flow 1: First-Time User
1. Land on login page
2. Log in
3. See empty dashboard
4. Click "New Project"
5. Upload book, configure, start
6. Watch progress on project detail

### Flow 2: Check Progress
1. Log in
2. Dashboard shows active project
3. Click project card
4. View pipeline progress
5. Check quality scores
6. Review any errors

### Flow 3: Manual Override
1. Receive notification of issue
2. Go to project → chapter with issue
3. View issue details
4. Edit content or accept/override
5. Save changes
6. Pipeline continues

### Flow 4: Download Complete Book
1. Project shows "Complete"
2. Go to Outputs tab
3. Click download for desired format
4. File downloads

---

## Error States

**Empty States:**
- No projects: "No projects yet. Create your first book transformation!"
- No chapters: "Chapters will appear here once processing begins"
- No outputs: "Outputs will be available when processing completes"

**Error States:**
- API error: Toast notification + retry option
- Upload failed: Error message in upload zone
- Processing error: Highlighted in pipeline view + log entry

**Loading States:**
- Skeleton loaders for cards/tables
- Spinner for buttons during action
- Progress bar for file uploads

---

## Security Considerations

- All routes require authentication (except /login)
- Session timeout after inactivity (configurable)
- API key stored securely (never shown in full)
- CSRF protection on forms
- Rate limiting on login attempts

---

## Future Enhancements (Out of Scope for V1)

- Multi-user / team support
- Role-based permissions
- Multiple simultaneous projects
- Custom domain support
- White-labeling
- API access for integrations
- Batch processing
- Template books
