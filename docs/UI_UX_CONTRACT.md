# DiceForge UI/UX interaction contract

This is an interaction contract, not a visual redesign.

Preserve existing themes, visual identity, business behaviour, and routes unless a later change is explicitly approved.

## 1. CRUD action vocabulary

Normal create/update forms use these canonical labels (via i18n `common.add`, `common.save`, `common.cancel`):

- Add
- Save
- Cancel

Do **not** use contextual variants such as “Add job”, “Add colour”, “Save job”, “Save changes”, or “Save colour”. The screen already identifies the entity.

**Exceptions** — keep a meaningful verb for destructive or domain-specific operations:

- Delete, Archive, Generate, Import, Export, Preview, Choose image, Overwrite, and similar.

Loading copy such as “Saving…” is a status, not a CRUD label variant.

## 2. Action icons

Use `expo-symbols` already in the app. Do not add an icon library for actions.

| Action | Role of the icon |
| --- | --- |
| Add | plus |
| Save | save / check from the existing symbol set |
| Cancel | close / x |

Icons **supplement** text. They do not replace it except in a deliberately compact control that still has an accessibility label (and a web `title` where appropriate).

## 3. Never truncate action labels

Button and action text must **never** be ellipsized, clipped, or truncated.

“Save…” and “Save chan…” are defects.

If actions do not fit, in this order:

1. Reduce non-essential gap/padding without going below touch-target minimums.
2. Reflow the action row (wrap).
3. Stack the buttons.
4. Use icon-only only in a defined compact UI where the action stays unambiguous.

Do not shrink type to make a row fit. Do not set `numberOfLines={1}` or `ellipsizeMode` on action labels. Do not give action buttons `minWidth: 0` in a squeezed row.

## 4. Touch targets

Interactive controls keep a sensible mobile hit area (`Touch.minHeight` / existing 44–56pt button heights).

Do not fix overflow by making controls tiny.

## 5. Form fields and selects

Meaningful selected values and placeholders get available width **before** secondary accessories (for example a Lock switch).

At narrow widths:

- The primary field uses the remaining width, then wraps to its own row if needed.
- Secondary controls reflow instead of compressing the field.
- Keep placeholder/value text readable.
- Ellipsis is allowed only for genuinely long **dynamic** values when wrapping is not enough.

Do not special-case individual placeholder strings.

## 6. Responsive behaviour

| Surface | Rule |
| --- | --- |
| Phone | Single-column forms. Phone-first layout stays. Actions and field accessories reflow instead of truncating. |
| Tablet | Use extra width deliberately (grouped / multi-column where it helps). Do not stretch a phone form across the whole canvas. **Full tablet layout is follow-up**, not this change. Shared primitives should not assume an infinite phone column. |
| Desktop web | DiceForge is a mobile/tablet product. Content may use `Layout.contentMaxWidth`. Do not stretch forms across an arbitrary desktop viewport. |

## 7. Navigation

Bottom-navigation labels must not be clipped mid-glyph.

The app currently has **seven** tab destinations. That density is a structural problem: labels wrap or fight for width on a phone. Do not invent a new navigation pattern in an interaction-fix change.

**Recommendation (follow-up):** keep Jobs and Colours (and similar primary work) in the tab bar; move reference data (material types, colour types, methods, number colours) behind a single “Library” or “Setup” destination.

## 8. Accessibility

Shared controls keep:

- `accessibilityRole` (buttons are `"button"`)
- `accessibilityLabel` when the visible text is insufficient or for icon-only
- `accessibilityState.disabled` when disabled
- keyboard / web press behaviour already provided by `Pressable`
- existing test hooks and disabled/loading behaviour

## Shared primitives

- `FormActions` — canonical Add / Save / Cancel row; wraps then stacks; never truncates.
- `LockFieldCard` / `SelectDropdown` — primary field width first; lock reflows on narrow cards.
- `Layout.contentMaxWidth` — reserved for tablet/web content width; not a full layout rewrite.
