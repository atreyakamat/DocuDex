# Frontend Design Document
## AI-Powered Document Management System

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Design Lead:** Frontend Team  
**Status:** Draft for Development

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Design System](#2-visual-design-system)
3. [Component Architecture](#3-component-architecture)
4. [Page Layouts & Wireframes](#4-page-layouts--wireframes)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design Strategy](#6-responsive-design-strategy)
7. [Accessibility Guidelines](#7-accessibility-guidelines)
8. [Performance Optimization](#8-performance-optimization)
9. [Animation & Motion](#9-animation--motion)
10. [Frontend Technical Specifications](#10-frontend-technical-specifications)

---

## 1. Design Philosophy

### 1.1 Core Design Principles

**Clarity Over Complexity**
- Every interface element serves a clear purpose
- Remove unnecessary decoration and chrome
- Prioritize content and user goals over visual flourishes
- Information hierarchy guides user attention naturally

**Trust Through Transparency**
- Document handling happens visibly with clear feedback
- System status always visible (uploading, processing, complete)
- No black boxesâ€”users understand what's happening and why
- Clear data usage and privacy messaging

**Efficiency First**
- Minimize clicks and cognitive load
- Smart defaults reduce decision-making
- Common actions accessible within 1-2 clicks
- Keyboard shortcuts for power users

**Inclusive by Default**
- Accessible to users of all abilities
- Supports multiple languages and scripts
- Works on low-end devices and slow networks
- Designed for varying levels of digital literacy

### 1.2 Brand Identity

**Brand Personality:**
- Professional yet approachable
- Trustworthy and secure
- Intelligent but not intimidating
- Indian in spirit, global in execution

**Brand Values:**
- **Empowerment:** Technology that serves users, not vice versa
- **Simplicity:** Complex backend, simple frontend
- **Trust:** Security and privacy as non-negotiables
- **Innovation:** AI-first thinking applied thoughtfully

**Tone of Voice:**
- Clear and direct (not corporate jargon)
- Helpful and supportive (not condescending)
- Confident but humble (acknowledge when uncertain)
- Conversational yet professional

---

## 2. Visual Design System

### 2.1 Color Palette

**Primary Colors**

```css
/* Brand Primary - Trust & Intelligence */
--primary-600: #2563EB; /* Primary brand color */
--primary-500: #3B82F6; /* Interactive elements */
--primary-400: #60A5FA; /* Hover states */
--primary-300: #93C5FD; /* Subtle backgrounds */

/* Secondary - Warmth & Approachability */
--secondary-600: #D97706; /* Accent color */
--secondary-500: #F59E0B; /* Highlights */
--secondary-400: #FBBF24; /* Gentle emphasis */
```

**Semantic Colors**

```css
/* Success - Positive actions & confirmations */
--success-600: #059669;
--success-500: #10B981;
--success-400: #34D399;
--success-bg: #D1FAE5; /* Backgrounds */

/* Warning - Attention needed */
--warning-600: #D97706;
--warning-500: #F59E0B;
--warning-400: #FBBF24;
--warning-bg: #FEF3C7;

/* Error - Problems & alerts */
--error-600: #DC2626;
--error-500: #EF4444;
--error-400: #F87171;
--error-bg: #FEE2E2;

/* Info - Informational messages */
--info-600: #2563EB;
--info-500: #3B82F6;
--info-400: #60A5FA;
--info-bg: #DBEAFE;
```

**Neutral Colors**

```css
/* Grays - Text, borders, backgrounds */
--gray-900: #111827; /* Primary text */
--gray-800: #1F2937; /* Secondary headings */
--gray-700: #374151; /* Body text */
--gray-600: #4B5563; /* Muted text */
--gray-500: #6B7280; /* Placeholder text */
--gray-400: #9CA3AF; /* Disabled text */
--gray-300: #D1D5DB; /* Borders */
--gray-200: #E5E7EB; /* Dividers */
--gray-100: #F3F4F6; /* Subtle backgrounds */
--gray-50: #F9FAFB; /* Canvas background */

/* Absolute */
--white: #FFFFFF;
--black: #000000;
```

### 2.2 Typography

**Font Families**

```css
/* Primary Font - UI & Body Text */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 
                'Segoe UI', 'Roboto', 'Helvetica', sans-serif;

/* Secondary Font - Headings (Optional) */
--font-heading: 'Poppins', 'Inter', sans-serif;

/* Monospace - Code & Technical Content */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', 
             'Courier New', monospace;

/* Indian Language Support */
--font-devanagari: 'Noto Sans Devanagari', sans-serif;
--font-tamil: 'Noto Sans Tamil', sans-serif;
```

**Type Scale**

```css
/* Display - Hero sections, marketing */
--text-display-2xl: 4.5rem;   /* 72px */
--text-display-xl: 3.75rem;   /* 60px */
--text-display-lg: 3rem;      /* 48px */

/* Headings */
--text-h1: 2.25rem;   /* 36px */
--text-h2: 1.875rem;  /* 30px */
--text-h3: 1.5rem;    /* 24px */
--text-h4: 1.25rem;   /* 20px */
--text-h5: 1.125rem;  /* 18px */

/* Body */
--text-lg: 1.125rem;  /* 18px - Large body */
--text-base: 1rem;    /* 16px - Default body */
--text-sm: 0.875rem;  /* 14px - Small text */
--text-xs: 0.75rem;   /* 12px - Captions */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

**Typography Usage Guidelines:**

- **Headings:** Use semibold (600) or bold (700) weight
- **Body text:** 16px minimum, 1.5 line-height for readability
- **Small text:** 14px minimum (WCAG AA compliance)
- **Line length:** 45-75 characters for optimal readability
- **Paragraph spacing:** 1.5em between paragraphs

### 2.3 Spacing System

**8-Point Grid**

All spacing follows 8px increments for visual consistency:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

**Usage Guidelines:**
- Component internal padding: 16px (space-4) standard
- Vertical rhythm: 24px (space-6) between sections
- Card padding: 24-32px (space-6 to space-8)
- Button padding: 12px horizontal, 8px vertical (space-3, space-2)
- Page margins: 24px mobile, 48px desktop (space-6, space-12)

### 2.4 Elevation & Shadows

**Shadow Levels**

```css
/* Elevation System */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 
             0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 
             0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 
             0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 
             0 10px 10px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15);

/* Focus Ring */
--shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.5);
```

**Elevation Hierarchy:**
- **Level 0:** Base canvas (no shadow)
- **Level 1:** Cards, list items (shadow-sm)
- **Level 2:** Dropdowns, tooltips (shadow-md)
- **Level 3:** Modals, dialogs (shadow-lg)
- **Level 4:** Notifications (shadow-xl)

### 2.5 Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius-md: 0.375rem; /* 6px - Buttons, inputs */
--radius-lg: 0.5rem;   /* 8px - Cards */
--radius-xl: 0.75rem;  /* 12px - Large containers */
--radius-2xl: 1rem;    /* 16px - Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### 2.6 Iconography

**Icon System: Lucide Icons**

- **Size Scale:** 16px, 20px, 24px, 32px, 48px
- **Stroke Width:** 2px (consistent across all icons)
- **Style:** Outline style for consistency
- **Usage:**
  - 16px: Inline with text, dense UIs
  - 20px: Standard UI icons
  - 24px: Primary actions, headers
  - 32px: Feature highlights
  - 48px: Empty states, onboarding

**Custom Icons for Documents:**
- PDF: Red color accent
- Word: Blue color accent
- Excel: Green color accent
- Image: Purple color accent
- Generic: Gray color

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
App
â”œâ”€â”€ Layout Components
â”‚   â”œâ”€â”€ Header (Navigation, Search, User Menu)
â”‚   â”œâ”€â”€ Sidebar (Navigation, Quick Actions)
â”‚   â”œâ”€â”€ Main Content Area
â”‚   â””â”€â”€ Footer (Links, Legal)
â”‚
â”œâ”€â”€ Page Components
â”‚   â”œâ”€â”€ Dashboard
â”‚   â”œâ”€â”€ DocumentList
â”‚   â”œâ”€â”€ DocumentDetail
â”‚   â”œâ”€â”€ Upload
â”‚   â”œâ”€â”€ Search
â”‚   â”œâ”€â”€ Workflows
â”‚   â”œâ”€â”€ Settings
â”‚   â””â”€â”€ Profile
â”‚
â”œâ”€â”€ Feature Components
â”‚   â”œâ”€â”€ DocumentCard
â”‚   â”œâ”€â”€ DocumentViewer
â”‚   â”œâ”€â”€ AIClassificationResult
â”‚   â”œâ”€â”€ ExpiryAlert
â”‚   â”œâ”€â”€ ShareDialog
â”‚   â”œâ”€â”€ WorkflowWizard
â”‚   â””â”€â”€ VoiceInterface
â”‚
â””â”€â”€ Base Components (Design System)
    â”œâ”€â”€ Button
    â”œâ”€â”€ Input
    â”œâ”€â”€ Select
    â”œâ”€â”€ Checkbox
    â”œâ”€â”€ Radio
    â”œâ”€â”€ Toggle
    â”œâ”€â”€ Card
    â”œâ”€â”€ Modal
    â”œâ”€â”€ Tooltip
    â”œâ”€â”€ Toast
    â”œâ”€â”€ Badge
    â”œâ”€â”€ Avatar
    â”œâ”€â”€ Tabs
    â”œâ”€â”€ Dropdown
    â””â”€â”€ Pagination
```

### 3.2 Core Component Specifications

#### Button Component

**Variants:**
```jsx
// Primary - Main CTAs
<Button variant="primary" size="md">Upload Document</Button>

// Secondary - Secondary actions
<Button variant="secondary" size="md">Cancel</Button>

// Outline - Tertiary actions
<Button variant="outline" size="md">Learn More</Button>

// Ghost - Subtle actions
<Button variant="ghost" size="md">Skip</Button>

// Danger - Destructive actions
<Button variant="danger" size="md">Delete</Button>
```

**Sizes:**
- `xs`: 28px height, 12px font, 12px padding
- `sm`: 32px height, 14px font, 14px padding
- `md`: 40px height, 16px font, 16px padding
- `lg`: 48px height, 18px font, 20px padding
- `xl`: 56px height, 20px font, 24px padding

**States:**
- Default
- Hover (slightly darker, shadow increase)
- Active (pressed appearance)
- Disabled (50% opacity, no interaction)
- Loading (spinner replacing icon, disabled state)

**Accessibility:**
- Minimum touch target: 44x44px (WCAG)
- Focus visible indicator (outline)
- ARIA labels for icon-only buttons
- Keyboard navigation support

#### Input Component

**Types:**
```jsx
// Text Input
<Input type="text" label="Document Name" placeholder="Enter name..." />

// Email
<Input type="email" label="Email Address" />

// Password (with visibility toggle)
<Input type="password" label="Password" showToggle />

// Search (with icon and clear button)
<Input type="search" placeholder="Search documents..." icon={SearchIcon} />

// Textarea
<Textarea label="Description" rows={4} />
```

**States:**
- Default
- Focus (border color change, glow)
- Error (red border, error message below)
- Success (green border, success icon)
- Disabled (grayed out)

**Features:**
- Floating labels (Material Design style)
- Character count (for limited inputs)
- Helper text below input
- Error message display
- Prefix/suffix icons

#### Card Component

```jsx
<Card>
  <CardHeader>
    <CardTitle>Document Title</CardTitle>
    <CardActions>
      <IconButton icon={MoreIcon} />
    </CardActions>
  </CardHeader>
  
  <CardBody>
    <DocumentThumbnail />
    <Metadata />
  </CardBody>
  
  <CardFooter>
    <Button>View</Button>
    <Button>Download</Button>
  </CardFooter>
</Card>
```

**Variants:**
- Default (with border)
- Elevated (with shadow)
- Flat (no border or shadow)
- Interactive (hover effects, clickable)

#### Modal Component

```jsx
<Modal isOpen={isOpen} onClose={handleClose} size="lg">
  <ModalHeader>
    <ModalTitle>Upload Document</ModalTitle>
    <ModalClose />
  </ModalHeader>
  
  <ModalBody>
    {/* Content */}
  </ModalBody>
  
  <ModalFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Upload</Button>
  </ModalFooter>
</Modal>
```

**Sizes:**
- `sm`: 400px max-width
- `md`: 600px max-width
- `lg`: 800px max-width
- `xl`: 1000px max-width
- `full`: 90vw max-width

**Features:**
- Backdrop blur effect
- Click outside to close (configurable)
- Escape key to close
- Focus trap (accessibility)
- Scroll behavior (body or modal)

### 3.3 Document-Specific Components

#### DocumentCard

Visual representation of a document in list/grid views.

**Layout:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [Thumbnail]  â”‚  Title      â”‚ â† 1st row
â”‚               â”‚  Type Badge â”‚
â”‚               â”‚  Date       â”‚ â† 2nd row
â”‚               â”‚  [Actions]  â”‚ â† 3rd row
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Information Display:**
- Thumbnail (document preview or type icon)
- Document name (truncated if long)
- Document type badge
- Upload/modified date
- File size
- Expiry indicator (if applicable)
- Quick actions (view, download, share, delete)

**States:**
- Default
- Hover (lift effect, actions visible)
- Selected (checkbox checked, border highlight)
- Processing (loading overlay)

#### AIClassificationBadge

Shows AI classification result with confidence indicator.

**Visual Design:**
```
[Icon] Document Type (95% confident)
       â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       Confidence bar (color-coded)
```

**Confidence Colors:**
- High (>85%): Green
- Medium (70-85%): Yellow
- Low (<70%): Red (prompts user review)

#### ExpiryCountdown

Visual indicator for document expiry timeline.

**Design:**
```
âš ï¸ Expires in 23 days
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
[==========>      ] 76%
```

**Color Coding:**
- Green: >60 days remaining
- Yellow: 30-60 days
- Orange: 15-30 days
- Red: <15 days or expired

---

## 4. Page Layouts & Wireframes

### 4.1 Dashboard Layout

**Desktop Layout (1440px):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [Logo]  Search...              [Notifications] [Profile]    â”‚ â† Header (64px)
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚         â”‚                                                     â”‚
â”‚  Sidebarâ”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ (240px) â”‚  â”‚  Welcome back, Priya!                       â”‚ â”‚
â”‚         â”‚  â”‚  Quick Actions: [Upload] [Search] [Process] â”‚ â”‚
â”‚  [Home] â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚  [Docs] â”‚                                                   â”‚
â”‚  [Searchâ”‚  â”Œâ”€â”€â”€â”€ Document Health â”€â”€â”€â”€â”€â”                    â”‚
â”‚  [Workflowâ”‚  Total: 47  Expiring: 3                        â”‚
â”‚  [Settingsâ”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                  â”‚
â”‚         â”‚                                                   â”‚
â”‚         â”‚  â”Œâ”€â”€â”€â”€ Expiring Soon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚         â”‚  â”‚ [Doc Card] [Doc Card] [Doc Card]         â”‚  â”‚
â”‚         â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚         â”‚                                                   â”‚
â”‚         â”‚  â”Œâ”€â”€â”€â”€ Recent Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚         â”‚  â”‚ [Doc Card] [Doc Card] [Doc Card] [+More]â”‚   â”‚
â”‚         â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚         â”‚                                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Mobile Layout (375px):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [â˜°] AI Docs  [ðŸ”] [ðŸ‘¤] â”‚ â† Header
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                         â”‚
â”‚ Hi Priya! ðŸ‘‹           â”‚
â”‚ [Upload] [Search]       â”‚
â”‚                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Document Health         â”‚
â”‚ Total: 47 | Expiring: 3â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                         â”‚
â”‚ âš ï¸ Expiring Soon        â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ [Document Card 1] â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ [Document Card 2] â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Recent Documents        â”‚
â”‚ [Card] [Card] [Card]   â”‚
â”‚                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.2 Document List Layout

**View Options:**
- Grid View (default): 3-4 columns of cards
- List View: Table-like single column
- Compact View: Dense list with minimal info

**Grid View (Desktop):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [Doc]  â”‚  [Doc]  â”‚  [Doc]  â”‚  [Doc]  â”‚
â”‚  Card   â”‚  Card   â”‚  Card   â”‚  Card   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Doc]  â”‚  [Doc]  â”‚  [Doc]  â”‚  [Doc]  â”‚
â”‚  Card   â”‚  Card   â”‚  Card   â”‚  Card   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

     [1] [2] [3] ... [15]  â† Pagination
```

**List View (Desktop):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [âœ“] [Icon] Document Name  â”‚ Type â”‚ Date â”‚ [Actions]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [âœ“] [Icon] Document Name  â”‚ Type â”‚ Date â”‚ [Actions]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [âœ“] [Icon] Document Name  â”‚ Type â”‚ Date â”‚ [Actions]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Filtering & Sorting Sidebar:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filters          â”‚
â”‚                  â”‚
â”‚ Document Type    â”‚
â”‚ â˜ Identity       â”‚
â”‚ â˜ Financial      â”‚
â”‚ â˜ Educational    â”‚
â”‚                  â”‚
â”‚ Date Range       â”‚
â”‚ [From] â†’ [To]    â”‚
â”‚                  â”‚
â”‚ Status           â”‚
â”‚ â˜ Active         â”‚
â”‚ â˜ Expiring Soon  â”‚
â”‚ â˜ Expired        â”‚
â”‚                  â”‚
â”‚ [Apply] [Clear]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.3 Document Upload Interface

**Upload Modal:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Upload Documents                      [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                            â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚     â”‚                                â”‚    â”‚
â”‚     â”‚    ðŸ“ Drag files here          â”‚    â”‚
â”‚     â”‚       or                       â”‚    â”‚
â”‚     â”‚    [Browse Files]              â”‚    â”‚
â”‚     â”‚                                â”‚    â”‚
â”‚     â”‚  Supported: PDF, JPG, PNG,    â”‚    â”‚
â”‚     â”‚  DOCX (Max 50MB)               â”‚    â”‚
â”‚     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                            â”‚
â”‚  Or upload via:                            â”‚
â”‚  [ðŸ“· Camera] [ðŸ“§ Email] [ðŸ’¬ WhatsApp]     â”‚
â”‚                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚               [Cancel]  [Upload]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Upload Progress:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Uploading 3 Documents                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                            â”‚
â”‚  âœ“ Passport.pdf (2.3 MB)         Complete â”‚
â”‚  âŸ³ BankStatement.pdf (4.1 MB)     65%     â”‚
â”‚    [===============>      ]                â”‚
â”‚  â¸ Degree.pdf (1.8 MB)            Paused  â”‚
â”‚                                            â”‚
â”‚  Processing: Analyzing documents...        â”‚
â”‚                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                         [Cancel] [Done]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.4 Document Detail View

**Layout:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â† Back to Documents                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                        â”‚                            â”‚
â”‚   [Document Preview]   â”‚  Passport                  â”‚
â”‚        (70%)          â”‚  [ðŸ‡®ðŸ‡³ Identity Document]   â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  Extracted Information:    â”‚
â”‚   [Zoom] [Download]    â”‚  â€¢ Name: Priya Sharma     â”‚
â”‚   [Share] [Print]      â”‚  â€¢ Passport No: K1234567  â”‚
â”‚                        â”‚  â€¢ Issue Date: 15/03/2020 â”‚
â”‚                        â”‚  â€¢ Expiry: 14/03/2030     â”‚
â”‚                        â”‚  â€¢ DOB: 12/08/1995        â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  âš ï¸ Expires in 1,450 days â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  AI Classification:        â”‚
â”‚                        â”‚  Passport (98% confident) â”‚
â”‚                        â”‚  [Report Issue]           â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  Tags: #personal #travel  â”‚
â”‚                        â”‚  Folder: Identity Docs    â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  Uploaded: 23 Jan 2026    â”‚
â”‚                        â”‚  File Size: 2.3 MB        â”‚
â”‚                        â”‚                            â”‚
â”‚                        â”‚  [Edit] [Delete]          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 4.5 Workflow Wizard Interface

**Step-by-Step Flow:**

```
Step 1 of 7: Select Process
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Choose the process you want to complete: â”‚
â”‚                                            â”‚
â”‚  ðŸ  Home Loan Application                 â”‚
â”‚  ðŸ“ Company Incorporation                 â”‚
â”‚  ðŸ›‚ Passport Renewal                      â”‚
â”‚  ðŸŽ“ University Admission                  â”‚
â”‚  [View All Processes]                      â”‚
â”‚                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                    [Cancel]  [Next â†’]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Step 2 of 7: Required Documents
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  For Home Loan, you need:                 â”‚
â”‚                                            â”‚
â”‚  âœ“ Identity Proof (Passport) - Available  â”‚
â”‚  âœ“ Address Proof (Aadhaar) - Available    â”‚
â”‚  âœ“ Income Proof (Salary Slips) - Availableâ”‚
â”‚  âœ— Bank Statements (6 months) - Missing   â”‚
â”‚  âœ— Property Documents - Missing            â”‚
â”‚                                            â”‚
â”‚  [Upload Missing Documents]                â”‚
â”‚                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚             [â† Back]         [Next â†’]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Step 7 of 7: Review & Submit
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Review your application:                  â”‚
â”‚                                            â”‚
â”‚  Personal Information:                     â”‚
â”‚  â€¢ Name: Priya Sharma                     â”‚
â”‚  â€¢ PAN: ABCDE1234F                        â”‚
â”‚  â€¢ Contact: +91-98765-43210               â”‚
â”‚                                            â”‚
â”‚  Attached Documents: 5                     â”‚
â”‚  â€¢ Passport.pdf                           â”‚
â”‚  â€¢ Aadhaar.pdf                            â”‚
â”‚  â€¢ Salary_Slips.pdf                       â”‚
â”‚  â€¢ Bank_Statement.pdf                     â”‚
â”‚  â€¢ Property_Docs.pdf                      â”‚
â”‚                                            â”‚
â”‚  Submitting to: HDFC Bank, SBI, ICICI     â”‚
â”‚                                            â”‚
â”‚  â˜ I agree to terms and conditions        â”‚
â”‚                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚             [â† Back]         [Submit ðŸš€]   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 5. Interaction Patterns

### 5.1 Micro-interactions

**Button Hover:**
- Smooth color transition (150ms)
- Slight scale increase (1.02x)
- Shadow depth increase
- Cursor: pointer

**Card Hover:**
- Lift effect (translateY -4px, 200ms)
- Shadow increase (sm â†’ md)
- Border color brighten
- Actions fade in

**Input Focus:**
- Border color change (primary color)
- Subtle glow effect (box-shadow)
- Label color change (if floating label)

**Toggle Animation:**
- Smooth slide (200ms ease-out)
- Background color transition
- Optional haptic feedback (mobile)

### 5.2 Loading States

**Skeleton Screens:**

Use for initial page loads instead of spinners:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â–“â–“â–“â–“â–“â–“â–“â–“â–“â–“â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚ â† Title skeleton
â”‚ â–“â–“â–“â–“â–“â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚ â† Subtitle skeleton
â”‚                          â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â–“ â”‚ â”‚â–“â–“â–“â–“â–“â–“â–“ â”‚  â”‚ â† Card skeletons
â”‚ â”‚â–“â–“â–“â–‘â–‘â–‘â–‘â”‚ â”‚â–“â–“â–“â–‘â–‘â–‘â–‘â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Progress Indicators:**

- Determinate: When progress is knowable (file upload)
- Indeterminate: When duration unknown (AI processing)
- Circular: For contained spaces (button loading)
- Linear: For full-width operations (page loading)

**Optimistic UI Updates:**

Apply changes immediately, rollback if fails:
- Document deletion: Remove from list immediately, restore if error
- Starring document: Update UI instantly, sync in background
- Tagging: Show new tag immediately

### 5.3 Toast Notifications

**Placement:** Top-right corner (desktop), top-center (mobile)

**Types:**

```
âœ“ Success: "Document uploaded successfully"
  (Green background, checkmark icon, 3s auto-dismiss)

âš  Warning: "Document expires in 7 days"
  (Yellow background, warning icon, 5s auto-dismiss)

âœ— Error: "Upload failed. Please try again"
  (Red background, X icon, dismissible)

â„¹ Info: "Processing document... (30% complete)"
  (Blue background, info icon, dismissible)
```

**Features:**
- Stack vertically (max 3 visible)
- Slide-in animation
- Dismiss on click, swipe (mobile), or auto-timeout
- Action button option ("Undo", "Retry", "View")

### 5.4 Empty States

**Purpose:** Guide users when no content exists

**Components:**
- Illustration (friendly, relevant)
- Heading (what's missing)
- Description (why it matters)
- Primary action (how to fix)

**Example - No Documents:**

```
      [Illustration: Folder with search icon]
      
      No documents yet
      
      Upload your first document to get started
      with AI-powered management
      
      [Upload Document] [Learn More]
```

---

## 6. Responsive Design Strategy

### 6.1 Breakpoints

```css
/* Mobile First Approach */
/* Base styles: 320px+ (Mobile) */

@media (min-width: 640px) {  /* sm - Large Mobile */
  /* Adjust typography, spacing */
}

@media (min-width: 768px) {  /* md - Tablet Portrait */
  /* Introduce 2-column layouts */
  /* Show sidebar */
}

@media (min-width: 1024px) { /* lg - Tablet Landscape / Small Desktop */
  /* 3-column grid layouts */
  /* Full sidebar with labels */
}

@media (min-width: 1280px) { /* xl - Desktop */
  /* 4-column grid layouts */
  /* Maximum content width */
}

@media (min-width: 1536px) { /* 2xl - Large Desktop */
  /* Extra whitespace, not wider content */
}
```

### 6.2 Mobile-Specific Patterns

**Bottom Navigation (Mobile):**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         â”‚
â”‚   Content Area          â”‚
â”‚                         â”‚
â”‚                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [ðŸ ] [ðŸ“] [+] [ðŸ”] [ðŸ‘¤]â”‚ â† Fixed Bottom Nav
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Mobile Actions:**
- Swipe gestures (swipe-to-delete, swipe-to-archive)
- Pull-to-refresh for document list
- Long-press for context menus
- Bottom sheets for mobile modals

**Touch Targets:**
- Minimum: 44x44px (WCAG AAA)
- Recommended: 48x48px
- Spacing between targets: 8px minimum

### 6.3 Tablet Optimization

**Hybrid Layout (768px - 1024px):**

- Collapsible sidebar (icon + label)
- 2-3 column document grid
- Modal dialogs at 80% screen width
- Landscape: Desktop-like experience
- Portrait: Mobile-enhanced experience

---

## 7. Accessibility Guidelines

### 7.1 WCAG 2.1 Level AA Compliance

**Color Contrast:**
- Normal text (16px): 4.5:1 minimum
- Large text (24px): 3:1 minimum
- UI components: 3:1 minimum
- Test all color combinations

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Logical tab order (top-left to bottom-right)
- Visible focus indicators (2px outline, high contrast)
- Skip links ("Skip to main content")
- Keyboard shortcuts with visual hints

**Screen Reader Support:**
- Semantic HTML (nav, main, article, section)
- ARIA labels for icon buttons
- ARIA live regions for dynamic content
- ARIA expanded/collapsed for accordions
- Alt text for all images

**Form Accessibility:**
- Labels associated with inputs (for/id)
- Required field indication (visual + aria-required)
- Error messages (aria-invalid, aria-describedby)
- Grouped inputs (fieldset, legend)

### 7.2 Internationalization (i18n)

**Text Direction:**
- LTR: English, Hindi, most languages
- RTL: Future (Arabic, Urdu support)
- Flip layouts programmatically

**Date/Time Formatting:**
- Locale-aware (India: DD/MM/YYYY)
- Time zones (IST default)

**Number Formatting:**
- Indian numbering system (Lakh, Crore)
- Currency (â‚¹ symbol, correct placement)

---

## 8. Performance Optimization

### 8.1 Core Web Vitals Targets

**Largest Contentful Paint (LCP):** <2.5s
- Strategy: Optimize images, lazy load below fold

**First Input Delay (FID):** <100ms
- Strategy: Minimize JavaScript, code splitting

**Cumulative Layout Shift (CLS):** <0.1
- Strategy: Reserved space for images, fixed dimensions

### 8.2 Frontend Performance Strategies

**Code Splitting:**
- Route-based splitting (each page separate bundle)
- Component lazy loading (modals, heavy components)
- Vendor bundle separation

**Image Optimization:**
- WebP format with JPEG fallback
- Responsive images (srcset, sizes)
- Lazy loading (native loading="lazy")
- Blurhash placeholders

**Caching Strategy:**
- Service Worker for offline support
- Cache static assets (1 year expiry)
- Cache API responses (5 minutes)
- Invalidate on version change

**Bundle Size:**
- Target: <200KB initial bundle (gzipped)
- Tree shaking to remove unused code
- Analyze with webpack-bundle-analyzer

---

## 9. Animation & Motion

### 9.1 Animation Principles

**Purpose-Driven:**
- Provide feedback (button pressed)
- Guide attention (new notification)
- Establish relationships (modal from button)
- Express brand personality

**Performance:**
- Use transforms (translateX, scale) over position
- Use opacity over visibility
- Hardware-accelerated (will-change, transform)
- 60fps target (16ms per frame)

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.2 Standard Animations

**Durations:**
- Instant: 0ms (immediate feedback)
- Fast: 100ms (micro-interactions)
- Normal: 200-300ms (most transitions)
- Slow: 400-500ms (modals, page transitions)

**Easing Functions:**
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);        /* Accelerating */
--ease-out: cubic-bezier(0, 0, 0.2, 1);       /* Decelerating */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bounce */
```

**Page Transitions:**
- Fade: Simple opacity change
- Slide: Directional movement (left/right)
- Scale: Zoom in/out effect
- Duration: 300ms

---

## 10. Frontend Technical Specifications

### 10.1 Technology Stack

**Framework:** React 18+ with TypeScript
- Why: Component reusability, strong ecosystem, type safety

**Styling:** Tailwind CSS + CSS Modules
- Tailwind: Utility-first rapid development
- CSS Modules: Complex component styles

**State Management:** 
- Local: React useState, useReducer
- Global: Zustand (lightweight alternative to Redux)
- Server State: TanStack Query (React Query)

**Routing:** React Router v6
- File-based routing structure
- Protected routes with authentication

**Form Management:** React Hook Form
- Why: Performance (uncontrolled components)
- Validation: Zod schema validation

**HTTP Client:** Axios
- Interceptors for auth tokens
- Request/response transformers
- Error handling centralized

**File Uploads:** react-dropzone
- Drag-and-drop support
- File validation
- Multiple file selection

**PDF Viewing:** react-pdf
- Document preview in-app
- Page navigation
- Zoom controls

**Notifications:** react-hot-toast
- Simple, customizable
- Auto-dismiss configuration

**Icons:** Lucide React
- Tree-shakeable
- Consistent stroke width
- 1000+ icons

### 10.2 Folder Structure

```
src/
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ images/
â”‚   â”œâ”€â”€ icons/
â”‚   â””â”€â”€ fonts/
â”‚
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                    # Base components
â”‚   â”‚   â”œâ”€â”€ Button/
â”‚   â”‚   â”œâ”€â”€ Input/
â”‚   â”‚   â”œâ”€â”€ Card/
â”‚   â”‚   â””â”€â”€ Modal/
â”‚   â”‚
â”‚   â”œâ”€â”€ layout/                # Layout components
â”‚   â”‚   â”œâ”€â”€ Header/
â”‚   â”‚   â”œâ”€â”€ Sidebar/
â”‚   â”‚   â””â”€â”€ Footer/
â”‚   â”‚
â”‚   â””â”€â”€ features/              # Feature-specific
â”‚       â”œâ”€â”€ DocumentCard/
â”‚       â”œâ”€â”€ DocumentViewer/
â”‚       â”œâ”€â”€ AIClassification/
â”‚       â””â”€â”€ WorkflowWizard/
â”‚
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ Dashboard/
â”‚   â”œâ”€â”€ Documents/
â”‚   â”œâ”€â”€ Upload/
â”‚   â”œâ”€â”€ Search/
â”‚   â””â”€â”€ Settings/
â”‚
â”œâ”€â”€ hooks/                     # Custom React hooks
â”‚   â”œâ”€â”€ useAuth.ts
â”‚   â”œâ”€â”€ useDocuments.ts
â”‚   â””â”€â”€ useUpload.ts
â”‚
â”œâ”€â”€ services/                  # API services
â”‚   â”œâ”€â”€ api.ts
â”‚   â”œâ”€â”€ auth.service.ts
â”‚   â”œâ”€â”€ document.service.ts
â”‚   â””â”€â”€ workflow.service.ts
â”‚
â”œâ”€â”€ store/                     # Global state
â”‚   â”œâ”€â”€ authStore.ts
â”‚   â””â”€â”€ uiStore.ts
â”‚
â”œâ”€â”€ utils/                     # Helper functions
â”‚   â”œâ”€â”€ formatters.ts
â”‚   â”œâ”€â”€ validators.ts
â”‚   â””â”€â”€ constants.ts
â”‚
â”œâ”€â”€ types/                     # TypeScript types
â”‚   â”œâ”€â”€ document.types.ts
â”‚   â”œâ”€â”€ user.types.ts
â”‚   â””â”€â”€ api.types.ts
â”‚
â”œâ”€â”€ styles/
â”‚   â”œâ”€â”€ globals.css
â”‚   â””â”€â”€ variables.css
â”‚
â”œâ”€â”€ App.tsx
â””â”€â”€ main.tsx
```

### 10.3 Performance Checklist

**Build Optimization:**
- [ ] Code splitting implemented
- [ ] Tree shaking enabled
- [ ] Minification enabled (production)
- [ ] Source maps (development only)
- [ ] Bundle size < 200KB gzipped

**Runtime Optimization:**
- [ ] Lazy loading for routes
- [ ] Image lazy loading
- [ ] Virtualized lists (react-window)
- [ ] Memoization (React.memo, useMemo)
- [ ] Debounced inputs

**Network Optimization:**
- [ ] HTTP/2 enabled
- [ ] Gzip compression
- [ ] CDN for static assets
- [ ] API response caching
- [ ] Prefetching critical resources

---

## Appendix: Design Tokens Export

```javascript
// tokens.js - Design system tokens
export const tokens = {
  colors: {
    primary: {
      600: '#2563EB',
      500: '#3B82F6',
      400: '#60A5FA',
      300: '#93C5FD',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    neutral: {
      900: '#111827',
      700: '#374151',
      500: '#6B7280',
      300: '#D1D5DB',
      100: '#F3F4F6',
    },
  },
  
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
  },
  
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};
```

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** February 23, 2026
- **Design Team:** Frontend Design Lead
- **Review Status:** Ready for Development

**Approval:**
- [ ] Design Lead
- [ ] Frontend Tech Lead
- [ ] Product Manager
- [ ] UX Researcher

---

*This design document will evolve based on user testing, technical constraints, and stakeholder feedback throughout the development cycle.*