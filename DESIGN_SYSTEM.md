# DESIGN_SYSTEM.md — Prof G Markets Newsletter

---

## 1. Design Identity

Bold, opinionated editorial newsletter design rooted in print/newspaper tradition with a modern digital sensibility. The palette — saturated green, warm amber, and stark black-on-white — evokes urgency and authority without corporate sterility. Decorative cartoon illustrations (question marks, eyeballs, alarm clocks) juxtapose with serious financial content to signal that the publication is smart but not stuffy.

---

## 2. Colour System

### Backgrounds
| Role | Hex | Where |
|---|---|---|
| `background-page` | `#FFFFFF` | Main email body, article content areas |
| `surface-elevated` | `#F7F7F7` | WTF IS content block, chart/data card |
| `background-header` | `#3C7A44` | Masthead full-width banner |
| `background-banner` | `#F2A833` | All section banners (TODAY'S NUMBER, TL;DR, WTF IS, MIA'S TAKE, SCOTT'S TAKE) |
| `background-dark` | `#1C1C2E` | Dark callout / embedded screenshot (phishing example) |

### Borders & Dividers
| Role | Hex | Where |
|---|---|---|
| `border-default` | `#E5E5E5` | Section dividers, chart card border |
| `border-card` | `#E0E0E0` | Data chart card outline |

### Text
| Role | Hex | Where |
|---|---|---|
| `text-primary` | `#1A1A1A` | All body copy |
| `text-inverse` | `#FFFFFF` | Masthead title, banner titles on amber, dark callout text |
| `text-muted` | `#999999` | "PROF G MEDIA" watermark, "Source: Yahoo Finance" caption |
| `text-accent` | `#3C7A44` | Hero number ("38,000") — matches brand green |

### Accent / Brand
| Role | Hex | Where |
|---|---|---|
| `accent-green` | `#3C7A44` | Header background, hero stat number |
| `accent-amber` | `#F2A833` | All section banners |
| `accent-green-hover` | `#2E6437` | *inferred* — darkened brand green for interactive elements |
| `accent-amber-hover` | `#D9911A` | *inferred* — darkened amber for interactive elements |

### Semantic (inferred — not shown)
| Role | Hex | Notes |
|---|---|---|
| `semantic-success` | `#3C7A44` | *inferred* — reuse brand green |
| `semantic-warning` | `#F2A833` | *inferred* — reuse brand amber |
| `semantic-error` | `#D94F3D` | *inferred* — standard red |
| `semantic-info` | `#3B82F6` | *inferred* — standard blue |

---

## 3. Typography

| Tier | Font Family | Size (px) | Size (rem) | Weight | Line Height | Letter Spacing |
|------|------------|-----------|------------|--------|-------------|----------------|
| Display | Bold condensed sans (system fallback: Impact, Arial Black) | 64 | 4rem | 900 | 1.0 | -0.02em |
| H1 (Masthead sub) | Bold italic sans | 20 | 1.25rem | 700 | 1.2 | 0.05em |
| H2 (Banner title) | Bold italic condensed sans | 36 | 2.25rem | 800 | 1.1 | 0.02em |
| H3 (Article heading) | Bold sans | 18 | 1.125rem | 700 | 1.3 | 0 |
| Hero Number | Bold sans | 56 | 3.5rem | 800 | 1.0 | -0.01em |
| Body | Regular sans | 15 | 0.9375rem | 400 | 1.6 | 0 |
| Body Bold | Bold sans | 15 | 0.9375rem | 700 | 1.6 | 0 |
| Body Italic | Italic sans | 15 | 0.9375rem | 400 | 1.6 | 0 |
| Caption | Regular sans | 12 | 0.75rem | 400 | 1.4 | 0 |
| Data Value | Regular sans | 15 | 0.9375rem | 400 | 1.5 | 0 |

**Font stack (email-safe):**
- Display/Banner: `'Anton', 'Impact', 'Arial Black', sans-serif`
- Body: `'Helvetica Neue', 'Arial', sans-serif`

> Note: The banner titles (WTF IS..., TODAY'S NUMBER, TL;DR, MIA'S TAKE, SCOTT'S TAKE) use bold italic styling. The "PROF G MARKETS" masthead uses an extremely heavy, wide display weight — Anton or a custom webfont loaded via `@import` in the email `<head>`.

---

## 4. Spacing Scale

Base unit: **8px**

```
base: 8px
xs:    4px   (0.5×)
sm:    8px   (1×)
md:   16px   (2×)
lg:   24px   (3×)
xl:   32px   (4×)
2xl:  48px   (6×)
3xl:  64px   (8×)
```

**Observed usage:**
- Body side padding: `24px` (lg)
- Paragraph gap: `16px` (md)
- Section gap (between major blocks): `32–48px` (xl–2xl)
- Banner height (amber/green blocks): `~72px` (padding ~16px top/bottom)
- Chart card internal padding: `20px` (deviates slightly — intentional tighter feel)
- Hero number block gap between stat and description: `16px` (md)

---

## 5. Shape & Elevation

| Context | Radius |
|---------|--------|
| Card (chart/data) | `4px` |
| Section Banner | `0px` (full-bleed) |
| Header/Masthead | `0px` (full-bleed) |
| Dark callout | `4px` |
| Avatar (author photo in banners) | `50%` (circular) |
| Button | `4px` *inferred* |
| Input | `4px` *inferred* |
| Badge/Pill | `2px` *inferred* |

**Shadows:**
No visible drop shadows — flat design throughout. Elevation is communicated through background colour change, not shadows.

- `sm`: none (flat)
- `md`: none (flat)
- Chart card uses a `1px solid #E0E0E0` border instead of shadow

---

## 6. Layout System

- **Email max-width:** `660px` (standard email rendering width)
- **Content max-width:** `612px` (660px minus 24px padding each side)
- **Column grid:** Single column. The hero number block uses an inline 2-column layout (stat number left ~35%, description text right ~65%)
- **Banner layout:** Full-width, 100% of container, no gutter
- **Masthead layout:** Full-width colour block, text centred or left-aligned
- **Content padding (sides):** `24px` left and right
- **Section vertical spacing:** `32px` between sections
- **Breakpoints:** Email is single-breakpoint — fluid below 660px, no explicit responsive columns *inferred*
- **Chart card:** Inset within content, no additional side margin beyond content padding

---

## 7. Component Catalog

---

**Masthead / Header**
- Purpose: Brand identification at top of every newsletter issue
- Structure:
  ```
  ┌─────────────────────────────────────────┐
  │  [GREEN BG]  PROF G  MARKETS            │
  │              NEWSLETTER EDITION         │
  └─────────────────────────────────────────┘
  ```
- Visual: `background-header` (#3C7A44), `text-inverse` (#FFFFFF), Display + H1 typography
- "PROF G" and "MARKETS" rendered as one line; "NEWSLETTER EDITION" below in bold italic
- Padding: 16px top/bottom, 24px sides
- Variants: Single variant observed
- States: Static (email component, no interactivity)

---

**Section Banner**
- Purpose: Visual separator and section label between content blocks
- Structure (title-only):
  ```
  ┌─────────────────────────────────────────┐
  │  [AMBER BG]  [decorative art]  TITLE    │
  └─────────────────────────────────────────┘
  ```
- Structure (contributor take — with photo):
  ```
  ┌─────────────────────────────────────────┐
  │  [AMBER BG]  ↙  SCOTT'S [photo] TAKE ↘ │
  └─────────────────────────────────────────┘
  ```
- Visual: `background-banner` (#F2A833), `text-primary` (#1A1A1A) for title text, H2 bold italic
- Decorative elements (question marks, eyeballs, alarm clocks, arrows) are black illustration overlays, unique per section
- Contributor photo is circular, embedded within banner title line
- Height: ~72px
- Variants:
  - `title-only` — TODAY'S NUMBER, WTF IS..., TL;DR
  - `contributor` — MIA'S TAKE, SCOTT'S TAKE (includes circular headshot)
- States: Static

---

**Hero Number Block**
- Purpose: Highlight the lead statistic for the issue
- Structure:
  ```
  ┌───────────────────┬─────────────────────┐
  │  38,000           │  Explanatory text   │
  │  [brand green,    │  in regular body    │
  │   56px bold]      │  typography         │
  └───────────────────┴─────────────────────┘
  ```
- Visual: White background, `text-accent` (#3C7A44) for number, `text-primary` for description, Body typography for description
- Number column: ~35% width; Description column: ~65% width
- Vertical alignment: top
- Padding: 24px all sides
- Variants: Single variant observed
- States: Static

---

**Article Section**
- Purpose: Main editorial content block
- Structure:
  ```
  ┌─────────────────────────────────────────┐
  │  Article Heading (H3, bold)             │
  │                                         │
  │  Body paragraph text. Inline **bold**   │
  │  and *italic* used for emphasis.        │
  │                                         │
  │  Additional paragraphs...               │
  └─────────────────────────────────────────┘
  ```
- Visual: `background-page` (#FFFFFF), H3 heading, Body text
- Padding: 24px sides, 16px between paragraphs, 24px top/bottom
- Bold inline: `font-weight: 700`, same size/colour
- Italic inline: `font-style: italic`, same size/colour
- Variants: Standard white background; slightly elevated (#F7F7F7) for WTF IS content
- States: Static

---

**TL;DR Numbered List**
- Purpose: Summary of issue topics as numbered list
- Structure:
  ```
  1. Has the rotation into "safe" stocks gone too far?
  2. The difference between being right and effective...
  3. The data center backlash has arrived
  ```
- Visual: `background-page` (#FFFFFF), `text-primary`, Body typography
- List number and text share same font weight (not bolded numbers)
- Line height: 1.6, gap between items: 8px
- Padding: 24px sides, 16px between items
- Variants: Single variant
- States: Static

---

**Data Chart Card**
- Purpose: Display comparative financial data with company logos
- Structure:
  ```
  ┌─────────────────────────────────────────┐
  │  PEG Ratio: Consumer Companies          │
  │  vs. SaaS Companies                     │
  │  Feb 2026                               │
  │                                         │
  │  [Logo]  Company Name     4.9x          │
  │  [Logo]  Company Name     4.8x          │
  │  ...                                    │
  │                                         │
  │  Source: Yahoo Finance    PROF G MEDIA  │
  └─────────────────────────────────────────┘
  ```
- Visual: `surface-elevated` (#F7F7F7), `border-card` (#E0E0E0) 1px solid, `border-radius: 4px`
- Title: H3 bold, ~18px; Subtitle: Body, regular; Date label: Caption
- Rows: Logo (~32px circle), company name (Body, regular), value (Body, regular) right-aligned
- Source line: Caption, `text-muted` (#999999) both sides
- Company logos rendered as circular images
- Variants: Single variant
- States: Static

---

**Dark Callout**
- Purpose: Embedded screenshot or dark-background emphasis block
- Visual: `background-dark` (#1C1C2E), `text-inverse` (#FFFFFF), Body typography
- Border-radius: 4px
- Padding: ~20px
- Used sparingly for embedded screenshots or pull quotes
- Variants: Single variant observed
- States: Static

---

## 8. Design Tokens

### CSS Custom Properties

```css
:root {
  /* ─── Colours ─── */
  --color-bg-page: #FFFFFF;
  --color-bg-surface: #F7F7F7;
  --color-bg-header: #3C7A44;
  --color-bg-banner: #F2A833;
  --color-bg-dark: #1C1C2E;

  --color-border-default: #E5E5E5;
  --color-border-card: #E0E0E0;

  --color-text-primary: #1A1A1A;
  --color-text-inverse: #FFFFFF;
  --color-text-muted: #999999;
  --color-text-accent: #3C7A44;

  --color-accent-green: #3C7A44;
  --color-accent-green-hover: #2E6437;
  --color-accent-amber: #F2A833;
  --color-accent-amber-hover: #D9911A;

  /* ─── Typography ─── */
  --font-family-display: 'Anton', 'Impact', 'Arial Black', sans-serif;
  --font-family-base: 'Helvetica Neue', 'Arial', sans-serif;

  --font-size-display: 64px;
  --font-size-h1: 20px;
  --font-size-h2: 36px;
  --font-size-h3: 18px;
  --font-size-hero-number: 56px;
  --font-size-body: 15px;
  --font-size-caption: 12px;

  --font-weight-regular: 400;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  --line-height-tight: 1.1;
  --line-height-heading: 1.3;
  --line-height-body: 1.6;

  /* ─── Spacing ─── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* ─── Radius ─── */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-full: 9999px;

  /* ─── Layout ─── */
  --layout-email-max: 660px;
  --layout-content-max: 612px;
  --layout-side-padding: 24px;
}
```

### Tailwind v4 `@theme` block

```css
@theme {
  /* ─── Colours ─── */
  --color-bg-page: #FFFFFF;
  --color-bg-surface: #F7F7F7;
  --color-bg-header: #3C7A44;
  --color-bg-banner: #F2A833;
  --color-bg-dark: #1C1C2E;

  --color-border-default: #E5E5E5;
  --color-border-card: #E0E0E0;

  --color-text-primary: #1A1A1A;
  --color-text-inverse: #FFFFFF;
  --color-text-muted: #999999;
  --color-text-accent: #3C7A44;

  --color-accent-green: #3C7A44;
  --color-accent-green-hover: #2E6437;
  --color-accent-amber: #F2A833;
  --color-accent-amber-hover: #D9911A;

  /* ─── Typography ─── */
  --font-family-display: 'Anton', 'Impact', 'Arial Black', sans-serif;
  --font-family-base: 'Helvetica Neue', 'Arial', sans-serif;

  --font-size-display: 64px;
  --font-size-h1: 20px;
  --font-size-h2: 36px;
  --font-size-h3: 18px;
  --font-size-hero-number: 56px;
  --font-size-body: 15px;
  --font-size-caption: 12px;

  --font-weight-regular: 400;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  --line-height-tight: 1.1;
  --line-height-heading: 1.3;
  --line-height-body: 1.6;

  /* ─── Spacing ─── */
  --spacing-xs:  4px;
  --spacing-sm:  8px;
  --spacing-md:  16px;
  --spacing-lg:  24px;
  --spacing-xl:  32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* ─── Radius ─── */
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-full: 9999px;
}
```

---

## 9. Implementation Notes

### Critical patterns to preserve
- **Full-bleed banners:** The amber and green section banners must span 100% width with zero border-radius. In email HTML use a full-width table row. In web, use a negative margin or `width: 100vw` breakout pattern if inside a constrained container.
- **Banner typography is italic AND condensed:** Standard `font-style: italic` on a wide font will not replicate this. Load Anton from Google Fonts (`font-style: italic` variant) or use a genuinely condensed bold italic face. Do not synthesise italic on a non-italic font.
- **Hero number colour = brand green:** The "38,000" stat is the same green as the header — do not use a separate accent colour for this.
- **Flat design — no shadows:** Every surface change is communicated via background colour, not `box-shadow`. Remove any default framework shadow utilities (Tailwind's `shadow-sm`, `shadow-md`) from cards.
- **Chart card uses border not shadow:** `border: 1px solid #E0E0E0` — do not substitute `ring` utilities which render differently at 1px.
- **Circular author photos:** The contributor headshot is embedded inline within the banner H2 line. Use `border-radius: 50%` with a fixed square image (e.g. 56×56px) floated/inline-flexed within the banner text.

### Priority implementation order
1. Colour tokens + typography scale
2. Masthead/Header component
3. Section Banner (title-only variant, then contributor variant)
4. Article Section (body text, inline bold/italic)
5. TL;DR Numbered List
6. Hero Number Block
7. Data Chart Card
8. Dark Callout

### Animations & transitions
None visible in the static screenshots. *Inferred:* hover states on any links should use `transition: color 150ms ease` and `transition: background-color 150ms ease`.

### Accessibility considerations
- Green (#3C7A44) on white (#FFFFFF): contrast ratio ~4.9:1 — passes AA for normal text (≥4.5:1), marginally fails AAA (≥7:1). Consider #2E6437 for body-size green text if AAA compliance required.
- Amber (#F2A833) on black (#1A1A1A): contrast ratio ~8.1:1 — passes AAA.
- White (#FFFFFF) on green (#3C7A44): contrast ratio ~4.9:1 — passes AA.
- No focus states visible (email context). For any web implementation, add visible `:focus-visible` outlines.
- Decorative banner illustrations should have `alt=""` (empty alt, decorative role).
- Author photos should have descriptive alt text (e.g. `alt="Scott Galloway"`).

### Email vs web implementation differences
- In email HTML, use `<table>` layouts for reliable rendering across clients. Max-width is enforced via a centered wrapper table at `width="660"`.
- For web implementation (this project's newsletter preview), replicate with CSS max-width and flexbox/grid — the component structure maps 1:1.
- Google Fonts in email: include `<link>` in `<head>` with Gmail/Apple Mail fallback to the system font stack defined in tokens.
