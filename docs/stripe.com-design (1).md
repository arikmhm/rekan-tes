---
version: alpha
name: Stripe Modern
description: A bright, editorial fintech system with airy spacing, vivid violet accents, and lightweight typography.
colors:
  primary: "#533AFD"
  secondary: "#B9B9F9"
  tertiary: "#000EFF"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#091A3A"
  text: "#091A3A"
  muted: "#6B7A99"
  border: "#E6ECF5"
  error: "#D92D20"
typography:
  headline-display:
    fontFamily: "sohne-var"
    fontSize: "48px"
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "-0.96px"
  headline-lg:
    fontFamily: "sohne-var"
    fontSize: "32px"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.64px"
  headline-md:
    fontFamily: "sohne-var"
    fontSize: "26px"
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: "-0.26px"
  headline-sm:
    fontFamily: "sohne-var"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: "0px"
  body-lg:
    fontFamily: "sohne-var"
    fontSize: "18px"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: "sohne-var"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.55
    letterSpacing: "-0.02em"
  body-sm:
    fontFamily: "sohne-var"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  label-lg:
    fontFamily: "sohne-var"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0px"
  label-md:
    fontFamily: "sohne-var"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0px"
  label-sm:
    fontFamily: "sohne-var"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0.02em"
  overline:
    fontFamily: "sohne-var"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 6px
  sm: 14px
  md: 24px
  lg: 36px
  xl: 96px
  gutter: 24px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
    height: "48px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "8px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
---

# Stripe Modern

## Overview
Stripe presents a polished, highly modern fintech personality: confident, premium, and editorial rather than transactional. The layout feels open and spacious, with large type and restrained UI chrome that lets the hero messaging and colorful abstract ribbon art carry the brand energy. The tone is professional but approachable, with a subtle sense of momentum and innovation.

## Colors
- **Primary (#533AFD):** The signature violet used for the main CTA and key interactive accents. It communicates energy, trust, and a distinctly digital product feel.
- **Secondary (#B9B9F9):** A soft lavender used for quiet borders and secondary emphasis, especially in outlined button treatments.
- **Tertiary (#000EFF):** A vivid electric blue that reinforces the brand’s interactive links and high-contrast emphasis moments.
- **Neutral (#FFFFFF):** The dominant background color that keeps the interface bright, airy, and premium.
- **Surface (#FFFFFF):** Card and control surfaces remain white to preserve the minimal, uncluttered presentation.
- **On-surface (#091A3A):** A deep navy used for primary text, navigation, and UI controls; it reads softer than pure black while still feeling authoritative.
- **Muted (#6B7A99):** A desaturated blue-gray for secondary text and supporting labels.
- **Border (#E6ECF5):** A faint cool border tone used to separate sections without adding visual weight.
- **Error (#D92D20):** Reserved for validation and destructive states; it should remain infrequent and clearly alarming.

## Typography
The system uses `sohne-var` as the sole type family, with `SF Pro Display` and sans-serif as fallbacks. Headline styles are notably light in weight at 300, creating a sleek editorial voice rather than a heavy corporate one. Body text also stays light, while labels step up to 400 or 500 to preserve clarity in smaller UI controls.

`headline-display` and `headline-lg` are intended for hero statements and major section headings, with tight negative letter-spacing to keep large sizes elegant and compact. `headline-md` supports subheads and module titles, while `headline-sm` covers smaller UI headings. Body scales from `body-lg` to `body-sm` for readable marketing copy and supporting metadata. Labels and `overline` styles are useful for buttons, nav items, and small contextual text; avoid all-caps unless the context explicitly needs a label treatment, since the source leans more on weight and spacing than on uppercase styling.

## Layout
The composition is built on a wide, centered desktop canvas with generous white space and a clear vertical rhythm. Sections are separated by large gaps, matching the `xl` and `section` spacing scale, while smaller UI clusters use `xs`, `sm`, and `md` to maintain compact relationships. Content feels organized in broad bands rather than dense columns, with a strong hero-first structure and minimal nesting.

Use consistent page gutters around 24px and expand section padding dramatically for marketing blocks. Containers should stay spacious and readable, with text blocks set to comfortable line lengths rather than edge-to-edge width. Inline navigation spacing is tight enough to read as a single bar, but main content areas should remain open and breathable.

## Elevation & Depth
The interface is intentionally flat. Instead of relying on heavy shadows or layered cards, hierarchy comes from typography scale, color contrast, whitespace, and the vivid contrast of the hero artwork. When depth is needed, use only subtle separation such as faint borders or a very soft shadow on cards; avoid strong elevation stacks.

## Shapes
The shape language is understated and slightly softened. Interactive controls use small radii, especially `rounded.sm` at 4px, which keeps buttons crisp and modern. Larger surfaces can move up to `rounded.md` for a gentle, approachable feel, but the overall system should stay close to rectilinear rather than pill-heavy or overly rounded.

## Components
Buttons are the primary interactive pattern. `button-primary` is a filled violet CTA with white text, 48px height, and 16px/24px padding; it should be used for the strongest action on the page. `button-secondary` is an outlined white button with violet text and a faint lavender border, suitable for secondary conversion actions. `button-tertiary` is text-only and should be used for inline navigation or low-emphasis actions.

Button states should remain simple and high-clarity: hover states may deepen the primary color to `button-primary-hover`, while focus should be visible but not flashy. Keep button labels medium weight and avoid oversized tracking.

Cards are minimal containers with white backgrounds, small padding, and little or no visible border. If a shadow is used, it should be subtle and soft, as the design does not lean on dramatic depth. Inputs should follow the same restrained logic: white surface, small radius, clear text color, and enough padding to feel comfortable without becoming bulky.

Navigation links are lightweight and text-driven, matching the editorial feel of the top bar. Chips and small metadata badges should stay subdued, using muted text and soft radii. In general, components should feel like they are framed by the page rather than boxed off from it.

## Do's and Don'ts
- Do keep sections spacious and let the typography do most of the hierarchy work.
- Do use the violet primary for the strongest CTA and blue for prominent link-style emphasis.
- Do keep borders faint and shadows minimal so the interface stays airy.
- Do use the light 300 weight for headlines and body copy to match the brand voice.
- Don't introduce heavy dark panels, thick borders, or aggressive elevation.
- Don't make buttons overly pill-shaped; stick to small, crisp radii.
- Don't pack content too tightly or compress the vertical rhythm.
- Don't overuse uppercase labels or decorative treatments that compete with the hero art.