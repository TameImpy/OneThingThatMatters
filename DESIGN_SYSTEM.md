# DESIGN_SYSTEM.md
## One Thing That Matters Newsletter — Design System
### Reference: Prof G Markets editorial style · Adapted palette for OTTM

---

## 1. Design Identity

Bold, opinionated editorial newsletter design in the tradition of high-energy American print magazines. The dominant visual gesture is the **full-bleed coloured section banner** with oversized condensed italic type — it signals a hard editorial cut between sections, like a magazine chapter break. Content sections are deliberately plain (white, no ornamentation) so the weight falls entirely on the banner moments. The overall mood is confident, slightly loud, and unapologetically typographic. The Prof G reference uses amber + forest green; OTTM replaces these with **coral (#E8522E)** for banners and **sky blue (#0EA5E9)** for accents, and removes the cartoon illustrations in favour of clean typographic banners.

---

## 2. Colour System

### Reference palette (Prof G source)
| Role | Hex | Usage |
|------|-----|-------|
| `brand-green` | `#3C8A3C` | Header masthead background, stat numbers |
| `banner-amber` | `#F5B731` | All section banner backgrounds |
| `text-primary` | `#1A1A1A` | All body copy |
| `text-inverse` | `#FFFFFF` | Text on green/amber backgrounds |
| `bg-page` | `#FFFFFF` | Email body, content sections |
| `bg-surface-alt` | `#F5F5F5` | Subtle data card / chart backgrounds |
| `border-subtle` | `#E8E8E8` | Dividers, chart card borders |

### OTTM adapted palette (implement this)
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#111827` | Header masthead bg, footer bg, near-black body text |
| `accent` | `#E8522E` | All section banner backgrounds (replaces amber) |
| `sky` | `#0EA5E9` | Score badges, stat numbers, CTA links (replaces green) |
| `bg-page` | `#FFFFFF` | Email body background (pure white, not off-white) |
| `bg-surface` | `#FFFFFF` | Content section backgrounds |
| `bg-surface-alt` | `#F5F5F5` | Subtle inset card backgrounds (e.g. data tables) |
| `border-subtle` | `#E8E8E8` | Dividers, inset card borders |
| `text-primary` | `#1A1A1A` | All body copy |
| `text-muted` | `#6B7280` | Captions, dates, authors, secondary lines |
| `text-inverse` | `#FFFFFF` | Text on ink/accent backgrounds |

**Critical note:** Do NOT use an off-white page background (#F3F4F6). The reference is **pure white** — the editorial impact comes from the full-bleed amber/coral banners punching against a clean white page. The previous implementation used a warm gray background which dulled the effect.

---

## 3. Typography

| Tier | Font Family | Size (px) | Size (rem) | Weight | Line Height | Letter Spacing |
|------|------------|-----------|------------|--------|-------------|----------------|
| Masthead brand | 'Barlow Condensed', Impact, sans-serif | 48 | 3rem | 900 | 1.0 | -0.02em |
| Masthead sub | Georgia, serif | 13 | 0.8125rem | 400 | 1.4 | 0.08em |
| **Banner label** | **'Barlow Condensed', Impact, sans-serif** | **36** | **2.25rem** | **900** | **1.0** | **-0.01em** |
| Section H2 | Georgia, serif | 18 | 1.125rem | 700 | 1.35 | 0 |
| Body | Georgia, serif | 16 | 1rem | 400 | 1.7 | 0 |
| Body bold | Georgia, serif | 16 | 1rem | 700 | 1.7 | 0 |
| Body italic | Georgia, serif | 16 | 1rem | 400 | 1.7 | 0 |
| Stat/number | 'Barlow Condensed', Impact, sans-serif | 44 | 2.75rem | 900 | 1.0 | -0.02em |
| Caption/muted | Georgia, serif | 13 | 0.8125rem | 400 | 1.5 | 0 |
| Label/meta | sans-serif | 11 | 0.6875rem | 700 | 1.2 | 0.12em |

### The banner label — this is the most critical element

The section banners in Prof G use a **heavy condensed italic** typeface. Observed characteristics:
- Extremely compressed horizontal width (~55–65% of normal)
- Black/900 weight — very thick stroke
- Italic angle (~10–15°)
- ALL CAPS
- No letter spacing (slightly negative)

**For HTML email implementation — add to `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,900&display=swap" rel="stylesheet">
```
Then apply:
```css
font-family: 'Barlow Condensed', Impact, 'Arial Narrow', sans-serif;
font-weight: 900;
font-style: italic;
font-size: 36px;
text-transform: uppercase;
letter-spacing: -0.01em;
line-height: 1;
color: #FFFFFF;
```

**Fallback chain:** Barlow Condensed (Google Font, renders in Gmail webmail) → Impact (web-safe, upright but heavy/acceptable) → Arial Narrow → sans-serif.

**Do NOT use:** Small tracked caps (e.g. `font-size:11px; letter-spacing:0.18em`). That was the previous implementation's critical error — it produced an effect nothing like the reference.

---

## 4. Spacing Scale

Base unit: **8px**

```
4px   — xs     hairline gaps, badge padding vertical
8px   — sm     caption padding, tight inline gaps
12px  — sm+    (not primary scale step)
16px  — md     paragraph gap, content vertical padding unit
18px  — banner-v  banner top/bottom padding (observed)
24px  — lg     content section padding (vertical)
28px  — header-v  masthead top/bottom padding (observed)
32px  — xl     content section horizontal padding, page edge
48px  — 2xl    not explicitly used — no large dead space in reference
```

**Key observations:**
- **Zero gap between banner row and the content row below it** — they are flush
- Paragraph `margin-bottom: 16px` consistently throughout content sections
- The last element before a CTA link: `margin-bottom: 10px`

---

## 5. Shape & Elevation

| Context | Radius |
|---------|--------|
| Section banner | 0px — sharp, full-bleed |
| Masthead | 0px — sharp |
| Content section | 0px — sharp |
| Footer | 0px — sharp |
| Score badge/pill | 999px — fully rounded |
| Inset data card | 4px |
| Image (art block) | 0px — full bleed |

**No shadows anywhere.** The design is completely flat. Do not add `box-shadow` to any element. Visual hierarchy is achieved solely through colour fields and typography weight.

---

## 6. Layout System

- **Email max-width:** 600px
- **Outer wrapper:** 100% width `<table>`, `align="center"`, `background: #FFFFFF`
- **Inner table:** `width="600"` with `max-width: 600px`
- **Content horizontal padding:** 32px left/right on content `<td>` elements (leaves 536px content width)
- **Column grid:** Single column only — no multi-column layout anywhere
- **Banner rows:** Full-width — zero horizontal padding, text centred with `text-align: center`
- **No outer card container** — sections stack directly as table rows with no outer border or border-radius wrapping the whole email

```
┌─────────────────────────── 600px ──────────────────────────────┐
│ [INK #111827 — full width]  MASTHEAD                           │
├────────────────────────────────────────────────────────────────┤
│ [WHITE — full width image]  ART BLOCK (if present)             │
│ [WHITE — 32px padding]  art caption                            │
├────────────────────────────────────────────────────────────────┤
│ [CORAL #E8522E — full width, centred]  ◆  STORY OF THE WEEK   │
├────────────────────────────────────────────────────────────────┤
│ [WHITE — 32px padding]  story content                          │
├────────────────────────────────────────────────────────────────┤
│ [CORAL — full width]  ◆  WATCH                                 │
├────────────────────────────────────────────────────────────────┤
│ [WHITE — 32px padding]  watch content                          │
├────────────────────────────────────────────────────────────────┤
│ [CORAL — full width]  ◆  READ                                  │
├────────────────────────────────────────────────────────────────┤
│ [WHITE — 32px padding]  read content                           │
├────────────────────────────────────────────────────────────────┤
│ [CORAL — full width]  ◆  RESEARCH                              │
├────────────────────────────────────────────────────────────────┤
│ [WHITE — 32px padding]  research content                       │
├────────────────────────────────────────────────────────────────┤
│ [INK #111827 — full width]  FOOTER                             │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Component Catalog

---

### Masthead Header

**Purpose:** Brand identification and issue date
**Structure:**
```
[INK background — full 600px width]
  ONE THING THAT MATTERS        ← Barlow Condensed 900 italic, 48px, white, ALL CAPS
  Tuesday, 25 February 2026     ← Georgia, 13px, #6B7280
```
**Visual properties:**
- Background: `#111827`
- Padding: `28px 32px`
- Text-align: center
- No border, no radius, no shadow
- Brand name: `font-family:'Barlow Condensed',Impact,sans-serif; font-weight:900; font-style:italic; font-size:48px; color:#FFFFFF; text-transform:uppercase; letter-spacing:-0.02em; line-height:1`
- Date: `font-family:Georgia,serif; font-size:13px; color:#6B7280; margin:8px 0 0 0`

---

### Section Banner ← THE DEFINING COMPONENT

**Purpose:** Hard full-bleed visual break between editorial sections
**Visual properties:**
- Background: `#E8522E` (coral accent)
- Padding: `18px 32px`
- Text-align: center
- **No border, no radius, no shadow**
- Label: `font-family:'Barlow Condensed',Impact,sans-serif; font-weight:900; font-style:italic; font-size:36px; color:#FFFFFF; text-transform:uppercase; letter-spacing:-0.01em; line-height:1; margin:0`
- Prefix character: `◆` + non-breaking space before label text

**HTML pattern:**
```html
<tr>
  <td style="background:#E8522E;padding:18px 32px;text-align:center;">
    <p style="font-family:'Barlow Condensed',Impact,'Arial Narrow',sans-serif;font-weight:900;font-style:italic;font-size:36px;color:#FFFFFF;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;margin:0;">
      &#9670;&nbsp; WATCH
    </p>
  </td>
</tr>
```

**OTTM section labels:**
| Section | Banner text |
|---------|-------------|
| stories_of_past_candidates | `◆  STORY OF THE WEEK` |
| watch_candidates | `◆  WATCH` |
| ai_news_top5 | `◆  READ` |
| ai_paper_candidates | `◆  RESEARCH` |

---

### Content Section

**Purpose:** Article body content following a section banner
**Structure:**
```
[WHITE background, flush against banner above]
  [Score badge — sky pill, if fit_score present]
  Title (Georgia bold 18px)
  Secondary/muted line (Georgia italic 13px, #6B7280)
  Body paragraphs (Georgia 16px, 1.7 line-height, margin-bottom 16px each)
  [Thumbnail image if applicable]
  CTA link (sky, underlined, 14px)
```
**Visual properties:**
- Background: `#FFFFFF`
- Padding: `24px 32px`
- **No card border, no border-radius, no shadow** — content sits directly on white
- Flush to banner above (zero gap)

---

### Score Badge

**Purpose:** Display fit_score as a coloured pill above the title
**Visual properties:**
- Background: `#0EA5E9`
- Text: `#FFFFFF`, 11px, weight 700, letter-spacing 0.04em
- Padding: `3px 10px`
- Border-radius: `999px`
- Display: `inline-block`
- Margin-bottom: `10px`

**HTML:**
```html
<span style="display:inline-block;background:#0EA5E9;color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:0.04em;padding:3px 10px;border-radius:999px;margin-bottom:10px;">8/10</span>
```

---

### Art Block

**Purpose:** Daily art image with caption, sits between masthead and first content section
**Structure:**
```
[full-bleed image — 600px wide, max-height 260px, object-fit:cover]
[WHITE row — 32px padding]  Caption text — Artist name
```
**Visual properties:**
- Image: `width:100%; display:block; max-height:260px; object-fit:cover`
- No border, no radius on image
- Caption row: `padding:8px 32px; font-family:Georgia,serif; font-size:13px; font-style:italic; color:#6B7280`

---

### CTA Link

**Purpose:** Primary action link at bottom of each content section
**Visual properties:**
- `font-family:Georgia,serif; font-size:14px; color:#0EA5E9; text-decoration:underline`
- Format: `→ Watch on YouTube` / `→ Read the article` / `→ Read the paper`
- Plain inline link — no button treatment, no background

---

### Footer

**Purpose:** Unsubscribe link and attribution
**Visual properties:**
- Background: `#111827`
- Padding: `20px 32px`
- Text: `font-size:12px; color:#6B7280; text-align:center`
- Unsubscribe `<a>` uses `color:#6B7280` (same muted color, no bright link color in footer)

---

## 8. Design Tokens

### CSS Custom Properties
```css
:root {
  /* Colours */
  --color-ink: #111827;
  --color-accent: #E8522E;
  --color-sky: #0EA5E9;
  --color-bg-page: #FFFFFF;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-alt: #F5F5F5;
  --color-border-subtle: #E8E8E8;
  --color-text-primary: #1A1A1A;
  --color-text-muted: #6B7280;
  --color-text-inverse: #FFFFFF;

  /* Typography */
  --font-display: 'Barlow Condensed', Impact, 'Arial Narrow', sans-serif;
  --font-body: Georgia, 'Times New Roman', serif;

  --font-size-masthead: 48px;
  --font-size-banner: 36px;
  --font-size-h2: 18px;
  --font-size-body: 16px;
  --font-size-cta: 14px;
  --font-size-caption: 13px;
  --font-size-badge: 11px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-banner-v: 18px;
  --space-content-v: 24px;
  --space-header-v: 28px;
  --space-content-h: 32px;

  /* Radius */
  --radius-none: 0px;
  --radius-badge: 999px;
  --radius-inset: 4px;
}
```

### Tailwind v4 `@theme` block
```css
@theme {
  --color-ink: #111827;
  --color-accent: #E8522E;
  --color-sky-brand: #0EA5E9;
  --color-bg-surface-alt: #F5F5F5;
  --color-border-subtle: #E8E8E8;
  --color-text-primary: #1A1A1A;
  --color-text-muted: #6B7280;
  --font-display: 'Barlow Condensed', Impact, 'Arial Narrow', sans-serif;
  --font-body: Georgia, 'Times New Roman', serif;
}
```

---

## 9. Implementation Notes

### #1 Priority: fix the banner font size

The existing implementation uses `font-size:11px; letter-spacing:0.18em` — this must be replaced with `font-size:36px; font-weight:900; font-style:italic; font-family:'Barlow Condensed',Impact,sans-serif; text-transform:uppercase`. This is the root cause of the design looking unchanged.

### #2 Priority: add Google Fonts import to email HTML

In `renderNewsletterHTML()` in `lib/resend.ts`, add inside `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,900&display=swap" rel="stylesheet">
```
Gmail webmail renders this. Other clients fall back to Impact — acceptable.

### #3 Priority: remove card borders and off-white background

- Email body background: `#FFFFFF` not `#F3F4F6`
- Content sections: no `border:1px solid #E5E7EB`, no inner card `<table>`, no `border-radius`
- Each content section is a single `<tr><td style="background:#FFFFFF; padding:24px 32px">` — no nested table

### #4 Priority: flush banner-to-content stacking

No spacer rows between banner `<tr>` and content `<tr>`. The outer table must have `cellspacing="0" cellpadding="0"` and each `<td>` controls its own padding.

### NewsletterPreview.tsx: use inline styles for banner

Tailwind does not have a condensed-900-italic utility. The `SectionBanner` React component must use inline styles:
```tsx
<div style={{ background: '#E8522E', padding: '18px 32px', textAlign: 'center' }}>
  <p style={{
    fontFamily: "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif",
    fontWeight: 900,
    fontStyle: 'italic',
    fontSize: '36px',
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
    lineHeight: 1,
    color: '#FFFFFF',
    margin: 0,
  }}>◆ {label}</p>
</div>
```

For the Google Font to load in the browser preview, add this to `app/layout.tsx` or `app/globals.css`:
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,900&display=swap" rel="stylesheet">
```

### Body font: Georgia (email-safe serif)

The reference uses a serif body font. Georgia is email-safe and visually correct. Use `font-family:Georgia,'Times New Roman',serif` for all body copy in the email HTML.

### Paragraph spacing pattern

Every `<p>` in content sections: `style="font-size:16px;font-family:Georgia,'Times New Roman',serif;color:#1A1A1A;line-height:1.7;margin:0 0 16px 0;"` — the `margin-bottom:16px` creates the paragraph rhythm seen in the reference.

### Accessibility
- Coral `#E8522E` on white: ~3.9:1 contrast — passes WCAG AA for large text (≥18px bold). Banner text at 36px bold passes.
- Sky `#0EA5E9` on white: ~2.9:1 — use only for badges (small but white-on-sky passes at 11px bold) and underlined links.
- `#6B7280` on white: ~4.6:1 — passes AA for body text.

### No animations or transitions

This is a static email template. No hover effects, no transitions, no JavaScript.
