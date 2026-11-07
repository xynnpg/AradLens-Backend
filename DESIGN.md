# AradLens Admin Design

<!-- impeccable:design-schema 1 -->

## World

AradLens admin is a living roster of the city: editorial records feel like distinct places with a small visual identity, while the surrounding shell stays calm and operational. The product borrows the friendly clarity of a curated catalog without turning the working screen into a poster or a toy.

## Mode

Operate

## Palette and material

- Deep plum navigation rail (`#251b35`) gives the workspace a stable anchor.
- Warm paper content ground (`#f7f5ef`) keeps long sessions comfortable.
- Ink (`#24222a`) and muted ink (`#746f7c`) create a clear reading hierarchy.
- Pastel state colors carry meaning: mint for healthy, apricot for attention, rose for incidents, lavender for editorial activity.
- Flat fills, small hairline dividers, and soft depth; no gradients or glass decoration.

## Typography

Use a single humanist sans stack with strong numerals and compact labels. Headings use a medium weight and close tracking; data uses tabular numerals. Avoid display type in controls.

## Shape

G2-style corners: rounded enough to feel approachable, not pill-shaped. Primary panels use 24px radius, controls 12px, badges 999px. Use borders and whitespace before shadows.

## Composition

Persistent left rail on desktop, collapsible top bar on small screens. Overview leads with service health and editorial queue, followed by a recent activity stream. Detail pages use a title/action row, filter strip, then dense but breathable tables or roster grids.

## Signature move

Every important point has a small “place marker” ribbon: a color plus compact letterform that persists from overview cards into tables and detail views. This makes content recognition faster than reading every title and gives the city roster a memorable identity.

## Interaction

Use familiar web controls. Active navigation is a filled lavender tile in the rail. Status changes use inline confirmation and clear copy. Motion is limited to 180ms surface transitions and one subtle marker lift on hover. Respect reduced motion.

## Accessibility

Keep text contrast at or above WCAG AA, never rely on pastel color alone for state, preserve visible keyboard focus, and make all navigation and table actions usable without a pointer.
