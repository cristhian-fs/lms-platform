# Component Patterns

## Corner Brackets

Every framed/card element gets four L-shaped corner decorators. They are `absolute` children of a `relative` container.

```tsx
// ✅ Correct — muted at rest, primary on hover
<div className="relative group/card border border-border">
  <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
  <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
  <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
  <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
</div>

// ❌ Wrong — no corner brackets, soft shadow, rounded
<div className="rounded-xl shadow-md border">
```

**Size rules:**
- `size-2` (8px) — cards, panels, dialogs
- `size-1.5` (6px) — buttons, menu items, smaller interactive elements

**When to omit:** Inside button groups where the group's own brackets already frame the set. Use `:first-child` / `:last-child` selectors to hide overlapping sides (see sidebar.tsx implementation).

---

## Section Zones

Divide a component's content into zones with `border-t`. Each zone has its own `px-* py-*` padding. Never use a single padding block to space all content.

```tsx
// ✅ Correct — explicit zones
<div className="flex flex-col border border-border">
  <div className="px-3 py-2.5">         {/* title zone */}
    <h3>Title</h3>
  </div>
  <div className="border-t px-3 py-2">  {/* data zone */}
    <Stats />
  </div>
  <div className="border-t px-3 py-2">  {/* footer zone */}
    <Metadata />
  </div>
</div>

// ❌ Wrong — single block padding, no zone separation
<div className="p-4 space-y-2">
  <h3>Title</h3>
  <Stats />
  <Metadata />
</div>
```

---

## Monospace Data Labels

All stats, counts, timestamps, percentages, and status strings use `font-mono`. Labels are `uppercase tracking-widest text-[10px]`.

```tsx
// ✅ Correct
<span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
  Progresso
</span>
<span className="font-mono tabular-nums text-foreground">
  {value}%
</span>

// ❌ Wrong — sans-serif for data, no mono
<span className="text-xs text-muted-foreground">Progress: {value}%</span>
```

**Separators:** Use `│` (U+2502) with `text-border` color as a visual pipe between stat items. Never use `/` or `-`.

```tsx
<span className="text-border" aria-hidden="true">│</span>
```

---

## Status / Level Labels

Status strings and enum labels use bracketed monospace notation. No rounded pill badges.

```tsx
// ✅ Correct
<span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
  [{label}]
</span>

// Also valid for prominent status
<span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
  ◆ Concluído
</span>

// ❌ Wrong — pill badge
<span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700">
  Concluído
</span>
```

---

## HUD Overlays on Media

When placing labels or status indicators over a thumbnail or video frame, always add a gradient scrim first to ensure legibility. Use raw color scales only inside the overlay context.

```tsx
// ✅ Correct
<div className="relative overflow-hidden">
  <img src={src} className="w-full h-full object-cover" />

  {/* Scrim — always present */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

  {/* Labels sit on top of scrim */}
  <span className="absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400 bg-black/40 px-1 py-px">
    [Iniciante]
  </span>
</div>

// ❌ Wrong — label directly on image without scrim
<div className="relative">
  <img src={src} />
  <span className="absolute bottom-2 left-2 text-xs text-white">Iniciante</span>
</div>
```

---

## Progress Indicators

Use a raw `h-px` div instead of the `<Progress>` component when inside a TUI-styled zone. The thin line reads as a terminal loading bar.

```tsx
// ✅ Correct — TUI progress bar
<div className="h-px bg-border overflow-hidden">
  <div
    className="h-full bg-primary transition-[width]"
    style={{ width: `${pct}%` }}
  />
</div>

// ❌ Wrong — styled component with rounded track
<Progress value={pct} className="h-1.5" />
```

---

## Hover / Active States

- Borders shift from `border-border` to `border-primary/50` on the container
- Corner brackets shift from `border-foreground/20` to `border-primary`
- Use `transition-colors` (not `transition-all`) to keep transforms snappy

```tsx
// ✅ Correct
<div className="border border-border transition-colors hover:border-primary/50">
```

---

---

## Dialogs & Alert Dialogs

Dialog panels are framed surfaces — they get corner brackets and a `border border-border` instead of `ring-1`. No `rounded-xl`.

```tsx
// ✅ Correct — DialogContent / AlertDialogContent
className="... bg-popover border border-border ..."  // no rounded-xl, no ring-1

// Corner brackets inside content:
<span className="pointer-events-none absolute top-0 left-0 size-2 border-l border-t border-foreground/30 z-10" />
<span className="pointer-events-none absolute top-0 right-0 size-2 border-r border-t border-foreground/30 z-10" />
<span className="pointer-events-none absolute bottom-0 left-0 size-2 border-l border-b border-foreground/30 z-10" />
<span className="pointer-events-none absolute bottom-0 right-0 size-2 border-r border-b border-foreground/30 z-10" />

// ✅ Correct — DialogFooter / AlertDialogFooter
className="-mx-4 -mb-4 ... border-t bg-muted/50 ..."  // no rounded-b-xl

// ❌ Wrong
className="... rounded-xl ring-1 ring-foreground/10 ..."
```

---

## Tabs

`TabsList` default variant uses a `border-b border-border` baseline — not a muted pill container. `TabsTrigger` uses a `border-b-2 border-primary -mb-px` indicator for the active tab, overlapping the list's border. No rounding, no shadow.

```tsx
// ✅ Correct — TabsList default
<TabsList>  {/* border-b border-border, no bg-muted, no rounded */}
  <TabsTrigger value="a">Tab A</TabsTrigger>
  {/* active trigger gets border-b-2 border-primary -mb-px */}
</TabsList>

// ✅ Correct — TabsList line variant
<TabsList variant="line">
  {/* no baseline border, active trigger gets primary after underline */}
</TabsList>

// ❌ Wrong
<TabsList className="rounded-lg bg-muted p-[1px]" />
// active trigger with shadow-sm
```

---

## What NOT to do

| Pattern | Why |
|---|---|
| `rounded-xl`, `rounded-2xl` on containers | Contradicts sharp geometry |
| `shadow-md`, `shadow-lg` on cards | Depth via borders, not shadows |
| `<Badge>` with `rounded-full` for status | Use bracketed mono labels instead |
| `space-x-*` / `space-y-*` | Use `flex gap-*` |
| Raw `bg-blue-500`, `text-green-400` outside media overlays | Use semantic tokens |
| `text-sm` on numeric data without `font-mono` | All data is monospace |
