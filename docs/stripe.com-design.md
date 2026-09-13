---
version: beta
name: Rekan Tes Teal
description: A bright, confident practice-platform system built on deep teal and warm orange, with bold flat typography and thin functional hairlines instead of gradients.
colors:
  primary: "#105C78"
  secondary: "#D8E3E7"
  accent: "#F68B1F"
  neutral: "#F7F9FA"
  surface: "#FFFFFF"
  on-surface: "#12242B"
  error: "#E02E2E"
typography:
  headline-display:
    fontFamily: "Geist"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline-section:
    fontFamily: "Geist"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline-sm:
    fontFamily: "Geist"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Geist"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  body-md:
    fontFamily: "Geist"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Geist"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0px"
  label-md:
    fontFamily: "Geist"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Geist Mono"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0px"
rounded:
  sm: 4px
  md: 6px
  full: 9999px
spacing:
  xs: 6px
  sm: 14px
  md: 24px
  lg: 36px
  xl: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "0px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "0px 24px"
    height: "48px"
    border: "1px solid {colors.secondary}"
  button-secondary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "24px"
    border: "1px solid {colors.secondary}"
  table-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    border: "1px solid {colors.secondary}"
    padding: "16px 20px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Rekan Tes Teal

## Overview
This system replaced an early Stripe-inspired violet draft. It keeps Stripe's core discipline — bright canvas, flat surfaces, confident type — but trades the violet/gradient identity for a two-color pairing that reads as trustworthy and energetic without needing illustration: a deep, stable teal carries the brand, and a warm orange is spent in one deliberate place at a time. Nothing in the system relies on gradients, glow, or decorative artwork; hierarchy comes entirely from weight, color fill, and spacing.

The product is a bank-recruitment test practice platform, so the design should look like it belongs to that world — exam timing, multiple-choice answers, a syllabus of subjects — rather than a generic SaaS template. Prefer a real example (an actual sample question, a real subject breakdown) over an abstract stat card or icon grid.

## Colors
- **Primary (#105C78):** Deep teal. The brand color — buttons, links, headings, section fills. Confident and stable rather than loud; it can carry large solid areas (a full-width CTA band) without feeling aggressive.
- **Secondary (#D8E3E7):** Primary at low opacity, used only for hairlines — card outlines, dividers, button borders. Never used as a fill on its own.
- **Accent (#F68B1F):** Warm orange. Spent sparingly and specifically: hover states, the one number or timer that should catch the eye, a single decorative shape. If more than one element on a screen is orange, that's a sign the accent is being used as decoration instead of emphasis.
- **Neutral (#F7F9FA):** Near-white cool background for quiet bands (a specs strip, a section separator) that need to sit behind white cards without disappearing into them.
- **Surface (#FFFFFF):** Base surface for cards, headers, and buttons.
- **On-surface (#12242B):** Near-black text with a slight cool cast. Used at full opacity for headings and primary copy; drop to 60–80% opacity for secondary text rather than switching to a separate gray.
- **Error (#E02E2E):** Reserved for validation and destructive states only.

## Typography
Geist (variable) is the only typeface, for display and body alike — no serif or slab pairing. Headlines are bold and tight, not light and airy: `headline-display` and `headline-section` both sit at weight 700 with negative tracking, because this system reads as direct and confident rather than editorial-quiet. Body text stays at regular weight 400 for readability; labels and buttons step up to 600 so controls read as controls. `Geist Mono` appears only where digits need to line up — a timer, a step number — never as a decorative typeface choice.

Don't reach for uppercase, letter-spaced "eyebrow" labels above headings. It was tried and reads as templated — a heading should be able to stand on its own without a small colored kicker line introducing it.

## Layout
Centered content column, generous horizontal margins, the same rhythm as before. The difference is in what fills the sections: build each one around one concrete, subject-specific artifact (a real sample question, a real syllabus row) rather than an abstract feature-icon grid. If a section could be reskinned for a completely different product by swapping the copy alone, redesign it — it's structurally generic.

Keep the page shorter than feels natural at first draft. One short sentence beats one long paragraph; a single-line specs strip beats a four-card icon grid repeating the same three facts. If a paragraph is being trimmed and a sentence still feels like it's explaining rather than stating, cut again.

## Elevation & Depth
Fully flat — no shadows, no gradients, no illustration. Depth comes only from a 1px hairline at `{colors.secondary}` (primary at ~20% opacity) and from solid color fills sitting next to white. This is a firmer rule than the original Stripe reference: that system allowed soft shadows and gradient art; this one doesn't reach for either. A flat orange or teal square is the ceiling for decoration.

## Shapes
Tighter and more square than the original reference: `rounded.sm` (4px) for every button, input, and interactive control; `rounded.md` (6px) for cards and framed panels; `rounded.full` only for true pills — status badges and circular icon/number chips, not for grouping content (a list of subjects is a table, not a row of pill chips).

Rollout note: this shape system (4/6px radii, teal hairlines) is fully in place on the landing page. The rest of the app (auth forms, catalog, account, admin) has been repainted with the same color tokens but still uses its earlier, softer shapes (`rounded-full`, `rounded-xl`, `rounded-2xl`, neutral-black borders) — a shape pass to bring those in line is separate follow-up work, not done here.

## Components
`button-primary` is teal fill, white text, `rounded.sm`, 48px tall, centered via flex rather than manually balanced padding. Its hover doesn't just deepen the teal — it swaps to the orange accent, which is the system's one deliberate hue-shift interaction and shouldn't be copied onto other hover states. `button-secondary` is a white button with a teal hairline border and teal text; on hover it inverts to a solid teal fill with white text, giving it real affordance instead of sitting as a pale ghost button.

Cards are white with a `{colors.secondary}` hairline border and `rounded.md` corners — no shadow. `table-row` is the pattern for any list of comparable items with a label and a short description (subjects, order history rows): a bordered container with hairline dividers between rows, not a grid of pill chips or icon cards. `badge` (solid teal pill, white text) is reserved for real status/metadata — "Ilustrasi", an order status — not for restating a heading as decoration.

Numbered steps (`01 / 02 / 03`) are only justified when the content is an actual sequence with a real order — a checkout-then-do-then-review flow. Don't add numbering to a list that has no inherent order just for visual rhythm.

The hero's sample-question card is a deliberate exception to "no fake screenshots": there's no real question-answering UI to screenshot yet (that's RT-012, not built), and no image-generation tool is available in this environment. A disclosed illustrative mockup ("Ilustrasi tampilan, bukan soal ujian resmi") beats an abstract stat card here, but the moment RT-012 ships a real subtest UI, replace this mockup with an actual screenshot rather than keeping the hand-built one.

## Copy Rules
Audited against `.agents/skills/design-taste-frontend`; these are the rules that actually applied and what they caught on this page.

- **No em dash (`—`) anywhere the user can see it** — headline, body, button, caption, `<title>`, meta description. Restructure into two sentences, or use a comma or colon. This caught three real instances on first audit (the hero disclaimer, the status-band paragraph, and the site `<title>` in `layout.tsx`), all fixed.
- **Middle dot (`·`) rationed to one per line.** A metadata strip separating four facts with three dots ("QRIS instan · Timer tiap subtes · Akses 30 hari · Email terverifikasi") reads as a templated spec-strip. Use a divided flex row (a hairline between items) instead of chaining dots — that's what the specs strip under the hero does now.
- **No filler verbs** ("elevate", "seamless", "unleash", "revolutionize"). Say what the thing does.
- **One copy register per page.** Don't mix casual slang, formal legal phrasing, and marketing punch in the same section.

## Do's and Don'ts
- Do keep every headline and label at 700/600 weight — confident, not tentative.
- Do use hairline borders (`{colors.secondary}`, ~20% opacity) everywhere a divider is needed; never a fully-saturated 1px border, which reads heavier than the pixel width suggests.
- Do spend the orange accent in one place per screen — a hover, a number, a shape — not scattered across icons and labels.
- Do build sections around one real, subject-specific artifact instead of a generic icon-plus-paragraph grid.
- Don't use uppercase tracked "eyebrow" labels above headings.
- Don't reach for numbered markers, badge pills, or icon grids by default — use them only when the content actually is a sequence, a status, or a real metadata tag.
- Don't introduce gradients, glow, or shadow for depth — flat fill and hairlines only.
- Don't let a card, button, or section outlive its first draft unexamined — if it would work unchanged on any other SaaS landing page, it needs another pass.
- Don't use an em dash in anything a user reads, including page `<title>`s and meta descriptions.
- Don't chain more than one middle dot per line; use a divided row instead.

## Stack Notes
- Icons: `lucide-react` (already a project dependency before this system existed, so it stays rather than switching families mid-project).
- Motion: plain CSS `transition` on hover/active states only. No animation library is installed; `tw-animate-css` is present but its `animate-in` utilities didn't resolve correctly in this Next.js setup (an incomplete `@keyframes enter`), so entrance animations were dropped rather than shipped broken. Revisit only if a real animation need comes up — don't add a library speculatively.
