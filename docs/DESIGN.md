# Design System — Rekan Tes

Token warna dan font tinggal di `src/app/globals.css`; dokumen ini mengatur cara memakainya.

## Overview
Bright canvas, flat surfaces, confident type, and a two-color pairing that reads as trustworthy and energetic without needing illustration: a deep, stable teal carries the brand, and a warm orange is spent in one deliberate place at a time. Nothing in the system relies on gradients, glow, or decorative artwork; hierarchy comes entirely from weight, color fill, and spacing.

The product is a bank-recruitment test practice platform, so the design should look like it belongs to that world — exam timing, multiple-choice answers, a syllabus of subjects — rather than a generic SaaS template. Prefer a real example (an actual sample question, a real subject breakdown) over an abstract stat card or icon grid.

## Colors
- **Primary (#105C78):** Deep teal. The brand color — buttons, links, headings, section fills. Confident and stable rather than loud; it can carry large solid areas (a full-width CTA band) without feeling aggressive.
- **Secondary (#D8E3E7):** Primary at low opacity, used only for hairlines — card outlines, dividers, button borders. Never used as a fill on its own.
- **Accent (#F68B1F):** Warm orange. Spent sparingly and specifically: hover states, the one number or timer that should catch the eye, a single decorative shape. If more than one element on a screen is orange, that's a sign the accent is being used as decoration instead of emphasis.
- **Neutral (#F7F9FA):** Near-white cool background for quiet bands (a specs strip, a section separator) that need to sit behind white cards without disappearing into them.
- **Surface (#FFFFFF):** Base surface for cards, headers, and buttons.
- **On-surface (#12242B):** Near-black text with a slight cool cast. Used at full opacity for headings and primary copy; drop to 60–80% opacity for secondary text rather than switching to a separate gray.
- **Error (#E02E2E):** Reserved for validation and destructive states only.
- **App icon (#15803D):** Green background with a white `RT` monogram. This color is reserved for the favicon and does not replace Primary in the interface.

## Typography
Geist (variable) is the only typeface, for display and body alike — no serif or slab pairing. Headlines are bold and tight, not light and airy: `headline-display` and `headline-section` both sit at weight 700 with negative tracking, because this system reads as direct and confident rather than editorial-quiet. Body text stays at regular weight 400 for readability; labels and buttons step up to 600 so controls read as controls. `Geist Mono` appears only where digits need to line up — a timer, a step number — never as a decorative typeface choice.

Don't reach for uppercase, letter-spaced "eyebrow" labels above headings. It was tried and reads as templated — a heading should be able to stand on its own without a small colored kicker line introducing it.

## Layout
Centered content column, generous horizontal margins. Build each one around one concrete, subject-specific artifact (a real sample question, a real syllabus row) rather than an abstract feature-icon grid. If a section could be reskinned for a completely different product by swapping the copy alone, redesign it — it's structurally generic.

Keep the page shorter than feels natural at first draft. One short sentence beats one long paragraph; a single-line specs strip beats a four-card icon grid repeating the same three facts. If a paragraph is being trimmed and a sentence still feels like it's explaining rather than stating, cut again.

## Elevation & Depth
Fully flat — no shadows, no gradients, no illustration. Depth comes only from a 1px hairline at Secondary and from solid color fills sitting next to white. A flat orange or teal square is the ceiling for decoration.

## Shapes
`rounded.sm` (4px) for every button, input, and interactive control; `rounded.md` (6px) for cards and framed panels; `rounded.full` only for true pills — status badges and circular icon/number chips, not for grouping content (a list of subjects is a table, not a row of pill chips).

Rollout gap: much of the app (including admin and parts of the landing page) still uses `rounded-xl`/`rounded-2xl`. Bring a screen in line when you touch it.

## Components
`button-primary` is teal fill, white text, `rounded.sm`, 48px tall, centered via flex rather than manually balanced padding. Its hover doesn't just deepen the teal — it swaps to the orange accent, which is the system's one deliberate hue-shift interaction and shouldn't be copied onto other hover states. `button-secondary` is a white button with a teal hairline border and teal text; on hover it inverts to a solid teal fill with white text, giving it real affordance instead of sitting as a pale ghost button.

Cards are white with a Secondary hairline border and `rounded.md` corners — no shadow. `table-row` is the pattern for any list of comparable items with a label and a short description (subjects, order history rows): a bordered container with hairline dividers between rows, not a grid of pill chips or icon cards. `badge` (solid teal pill, white text) is reserved for real status/metadata — "Ilustrasi", an order status — not for restating a heading as decoration.

Numbered steps (`01 / 02 / 03`) are only justified when the content is an actual sequence with a real order — a checkout-then-do-then-review flow. Don't add numbering to a list that has no inherent order just for visual rhythm.

## Copy Rules
- **No em dash (`—`) anywhere the user can see it** — headline, body, button, caption, `<title>`, meta description. Restructure into two sentences, or use a comma or colon.
- **Middle dot (`·`) rationed to one per line.** A metadata strip separating four facts with three dots ("QRIS instan · Timer tiap subtes · Akses 30 hari · Email terverifikasi") reads as a templated spec-strip. Use a divided flex row (a hairline between items) instead of chaining dots.
- **No filler verbs** ("elevate", "seamless", "unleash", "revolutionize"). Say what the thing does.
- **One copy register per page.** Don't mix casual slang, formal legal phrasing, and marketing punch in the same section.

## Stack Notes
- Icons: `lucide-react`.
- Motion: plain CSS `transition` on hover/active states only. No animation library is installed; `tw-animate-css` is present but its `animate-in` utilities didn't resolve correctly in this Next.js setup (an incomplete `@keyframes enter`), so entrance animations were dropped rather than shipped broken. Revisit only if a real animation need comes up — don't add a library speculatively.
