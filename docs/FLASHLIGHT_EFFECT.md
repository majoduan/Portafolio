# Flashlight Hover Effect

A mouse-tracking radial glow that illuminates only the interior of elements, creating a "lantern" effect where the cursor acts as a light source painting across multiple items simultaneously.

## How It Works

### Concept

Each element has a `::before` pseudo-element containing a `radial-gradient` that follows the mouse cursor. The gradient is positioned using CSS custom properties (`--tag-x`, `--tag-y`) that are updated via JavaScript `onMouseMove`. Since each element clips the gradient independently (via `overflow: hidden`), the glow only appears **inside** the elements — gaps between them remain unaffected.

### Architecture

```
Container (div)
├── onMouseMove → updates --tag-x, --tag-y, --tag-active on EACH child
├── onMouseLeave → resets --tag-active to 0 on each child
│
├── Element 1 (.tech-tag)
│   └── ::before → radial-gradient at (--tag-x, --tag-y), clipped by overflow:hidden
├── Element 2 (.tech-tag)
│   └── ::before → radial-gradient at (--tag-x, --tag-y), clipped by overflow:hidden
└── ...
```

### Key Mechanism

The mouse coordinates are calculated **relative to each individual element**, not the container. This is critical — it means each element's gradient is centered correctly relative to its own bounds:

```javascript
onMouseMove={(e) => {
  const elements = e.currentTarget.querySelectorAll('.tech-tag');
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--tag-x', `${x}px`);
    el.style.setProperty('--tag-y', `${y}px`);
    el.style.setProperty('--tag-active', '1');
  });
}}
onMouseLeave={(e) => {
  const elements = e.currentTarget.querySelectorAll('.tech-tag');
  elements.forEach((el) => {
    el.style.setProperty('--tag-active', '0');
  });
}}
```

## CSS

### Required CSS Variables (theme-aware)

```css
/* Dark mode */
:root {
  --tag-glow-color: rgba(30, 58, 138, 0.85); /* Deep blue */
}

/* Light mode */
html:not(.dark) {
  --tag-glow-color: rgba(220, 5, 0, 0.35); /* Light red */
}
```

### Element Styles

```css
.tech-tag {
  position: relative;
  overflow: hidden;        /* Clips the gradient to the element bounds */
  background: transparent;
  isolation: isolate;      /* Creates stacking context so z-index:-1 works */
}

.tech-tag::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;  /* Matches the element's border-radius */
  background: radial-gradient(
    150px circle at var(--tag-x, -200px) var(--tag-y, -200px),
    var(--tag-glow-color),
    transparent 70%
  );
  opacity: var(--tag-active, 0);
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: -1;             /* Behind text content, inside stacking context */
}
```

## Important Design Decisions

### Why `isolation: isolate` + `z-index: -1`?

The elements contain direct text nodes (no wrapper `<span>`). Using `z-index: -1` on `::before` would normally push it behind the element's background entirely. `isolation: isolate` creates a new stacking context scoped to the element, so `z-index: -1` means "behind the text but still inside this element." This ensures:
- The glow renders **behind** the text (text stays fully readable)
- The glow renders **inside** the element (not behind its background)

### Why per-element coordinates?

An earlier approach used a single `::before` on the **container** with one radial gradient. This caused the glow to bleed into the gaps between elements. By computing coordinates per-element and placing the gradient inside each element individually, the glow is naturally clipped at element boundaries.

### Gradient Parameters

- `150px circle` — radius of the glow. Increase for a wider lantern beam, decrease for a tighter spotlight.
- `transparent 70%` — how quickly the glow fades. Lower % = sharper falloff, higher % = softer.
- `--tag-glow-color` opacity — controls intensity. Dark mode uses higher opacity (0.85) because the dark background needs more contrast. Light mode uses lower (0.35) to avoid overwhelming.

## Reuse Guide

To apply this effect to any set of elements:

1. Add `--tag-glow-color` to your CSS variables (or reuse the existing ones)
2. Add the `.tech-tag` CSS rules (or create a new class with the same styles)
3. Add `onMouseMove` / `onMouseLeave` to the parent container
4. Add the class to each child element
5. Ensure elements have `border-radius` set (the `::before` inherits it)

### Example: Cards Grid

```jsx
<div
  className="grid grid-cols-3 gap-4"
  onMouseMove={(e) => {
    e.currentTarget.querySelectorAll('.glow-card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--tag-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--tag-y', `${e.clientY - rect.top}px`);
      card.style.setProperty('--tag-active', '1');
    });
  }}
  onMouseLeave={(e) => {
    e.currentTarget.querySelectorAll('.glow-card').forEach((card) => {
      card.style.setProperty('--tag-active', '0');
    });
  }}
>
  {items.map((item) => (
    <div className="glow-card p-6 rounded-2xl border border-white/20">
      {item.content}
    </div>
  ))}
</div>
```

With CSS:
```css
.glow-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.glow-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    250px circle at var(--tag-x, -200px) var(--tag-y, -200px),
    var(--tag-glow-color),
    transparent 70%
  );
  opacity: var(--tag-active, 0);
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: -1;
}
```

## Performance Notes

- `querySelectorAll` runs on every mouse move. For large sets (50+ elements), consider throttling or using `requestAnimationFrame`.
- CSS custom properties are updated via inline styles for maximum performance (no class toggling or React re-renders).
- The `pointer-events: none` on `::before` ensures the pseudo-element doesn't interfere with click/hover events on the element itself.
- `transition: opacity 0.3s` on `::before` provides smooth fade-in/out without JavaScript animation overhead.
