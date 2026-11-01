# Brand Guidelines — Lakshya Soni

> Last updated: 2026-11-01
> Status: Active (v3.0 — Paper & Ink)

## Why v3

v2 ("Editorial AI Terminal") read as template-generated: particle canvas, gradient text, glowing
cards, fake terminal telemetry (`SYS.ONLINE`, `MOD_01 //`), a cycling job title, four typefaces and
metrics repeated in five places. v3 removes all of that and treats the site like a well-set CV.

## Quick Reference

| Element | Value |
|---------|-------|
| Background | `#F5F3EE` paper (dark: `#151412`) |
| Text | `#1A1917` ink (dark: `#ECE8DF`) |
| Accent | `#B03A1C` vermilion (dark: `#E8896B`) — links and focus only |
| Text face | Newsreader (variable, optical size) |
| Label face | IBM Plex Mono — dates and section labels only |
| Voice | First person, plain, specific |

## Principles

1. **Say what the thing does.** "Reads 600+ articles a day and clusters coverage" beats
   "Real-time NLP market intelligence engine".
2. **One number, once.** Each metric appears in the one place it belongs.
3. **One accent colour.** Vermilion is for links and focus rings. Nothing else is coloured.
4. **Structure from type and rules, not boxes.** Hairline dividers, a label column, generous
   line-height. No cards, shadows, gradients, pills or glows.
5. **Motion is not decoration.** No entrance animations, counters or canvas effects. Only colour
   transitions on hover, disabled under `prefers-reduced-motion`.

## Colour & contrast (light)

| Pair | Ratio |
|------|-------|
| Ink `#1A1917` on paper `#F5F3EE` | ~16:1 |
| Soft `#57534C` on paper | ~6.9:1 |
| Faint `#6B675F` on paper | ~5.0:1 |
| Vermilion `#B03A1C` on paper | ~5.5:1 |

Dark mode follows `prefers-color-scheme` with equivalent roles (see `css/tokens.css`).

## Typography

- **Newsreader** 400/500/600 + italic — everything readable: intro, headings, body, lists.
  Organisation names and tech stacks are set in italic rather than as tags.
- **IBM Plex Mono** 400/500 at 13px — section labels, dates, footer. Never for prose.

## Layout

- Max width 60rem; text measure 38rem.
- Desktop: 11rem label column + content column, sections separated by a 1px rule.
- Mobile (<760px): single column, label above content.

## Assets

- `assets/favicon.svg` — "LS" in Newsreader on paper with a vermilion underline.
- `assets/og-banner.svg` — 1200×630, the intro sentence set on paper.
