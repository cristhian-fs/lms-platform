---
name: tui-design
description: Design language guide for this project's UI — cockpit/terminal TUI aesthetic. Use when building or refactoring any component (cards, dialogs, tables, sidebars, forms). Enforces corner brackets, monospace data, sharp geometry, HUD overlays, and border-based structure.
user-invocable: false
---

# TUI / Cockpit Design Language

This project uses a cockpit instrument panel / terminal TUI aesthetic. Every component should feel precise, data-forward, and geometric — not soft or decorative.

## Core Principles

1. **Border-based structure.** Use `border-t`, `border-b` to separate zones inside a component. Never use padding alone as the sole separator between content areas.
2. **Corner brackets as spatial anchors.** Framed elements get L-shaped corner decorators. Always visible at low opacity; animate to `border-primary` on hover/active.
3. **Monospace for data, sans for prose.** `font-mono` on all numeric values, labels, status strings, stats, timestamps. Use Geist (sans) only for titles and body copy.
4. **Sharp geometry.** `--radius: 0.25rem` is the design token. Never use `rounded-xl`, `rounded-2xl`, or `rounded-full` on containers. `rounded-sm` or no rounding.
5. **No decorative shadows.** Depth is expressed through borders and background tone differences, not `shadow-*`. Exception: tooltips/popover elevation.
6. **Semantic colors only.** Never `bg-blue-500` or `text-green-400` directly. Use `bg-primary`, `text-muted-foreground`, `border-border`, etc. Only raw color scales are allowed inside HUD overlays on media (thumbnails, video frames) where semantic tokens don't apply.
7. **Primary color for interaction.** `border-primary`, `text-primary`, `bg-primary` for active, selected, hover-highlighted states. The primary is orange-red — use it purposefully, not as decoration.

## Detailed Rules → [components.md](./rules/components.md)
