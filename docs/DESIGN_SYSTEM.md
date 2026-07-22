# Folira Design System Foundations

The Folira design system provides a cohesive set of design tokens, component patterns, reading themes, and layout rules for creating a calm, premium digital library.

---

## 1. Design Tokens

### Color Tokens

```css
/* Primary Brand Palette */
--color-folira-forest: #2F6B4F;
--color-deep-forest: #204B38;
--color-soft-leaf: #DDEBE2;

/* Neutrals */
--color-paper: #F8F5EE;
--color-warm-white: #FFFDF8;
--color-soft-stone: #E8E5DD;
--color-graphite: #252A27;
--color-deep-ink: #151A17;

/* Accent Gold */
--color-reading-gold: #C89545;
--color-soft-gold: #F2E4CB;
```

---

## 2. Typography Tokens

* **UI Sans-Serif (`var(--font-sans)`)**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Editorial Serif (`var(--font-serif)`)**: Literata, Georgia, Cambria, "Times New Roman", serif.

### Type Scale
* **Heading 1**: 32px / 1.2 line-height / Bold
* **Heading 2**: 24px / 1.25 line-height / SemiBold
* **Heading 3**: 18px / 1.3 line-height / SemiBold
* **Body Normal**: 14px / 1.5 line-height / Regular
* **Body Small / Meta**: 12px / 1.4 line-height / Medium
* **Caption / Pill**: 11px / 1.3 line-height / SemiBold

---

## 3. Surface & Border Radius Scale

* **Radius Small (`--radius-sm`)**: 6px (buttons, small inputs)
* **Radius Medium (`--radius-md`)**: 12px (cards, toolbars)
* **Radius Large (`--radius-lg`)**: 16px (modals, hero sections)
* **Radius Full (`--radius-full`)**: 9999px (pills, badges)

---

## 4. Reading Themes

1. **Paper Theme**:
   - Background: `#F8F5EE`
   - Text: `#252A27`
   - Accent: `#2F6B4F`
2. **Night Theme**:
   - Background: `#151A17`
   - Text: `#F8F5EE`
   - Accent: `#3D8B67`
3. **Sepia Theme**:
   - Background: `#F2E4CB`
   - Text: `#3E2723`
   - Accent: `#C89545`

---

## 5. Micro-Animations & Motion

All transitions must be subtle (150ms–200ms ease-out).
Large page transitions and bouncing animations are explicitly forbidden.

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
