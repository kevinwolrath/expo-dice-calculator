# DiceForge UI/UX contract

This is a **rule document**. Follow it when creating or changing user-facing UI.

It is **not** a visual redesign. Keep existing themes, DiceForge identity, business behaviour, routes, and data formats unless a later change is explicitly approved.

All user-facing strings come from i18n (`locales/en.json`, `locales/de.json`). Do not hard-code English (or German) in screens.

Read Expo SDK 57 docs before adding APIs. Mobile is the product; web is a test harness (`AGENTS.md`).

---

## 1. CRUD terminology

Ordinary create/update forms use **only** these labels, from `common.add`, `common.save`, `common.cancel`:

- **Add**
- **Save**
- **Cancel**

Do **not** use “Add job”, “Add colour”, “Save job”, “Save changes”, “Save colour”, “Add type”, “Save method”, or similar. The screen already names the entity.

**Domain / destructive verbs stay descriptive:** Delete, Generate, Preview, Import, Export, Overwrite, Choose image, Remove image, Reset, Done, Retry, Archive.

“Saving…” (`common.saving`) is a **status**, not a CRUD label.

Use `FormActions` for ordinary CRUD rows. Do not hand-roll Add/Save/Cancel rows.

---

## 2. Action hierarchy and icons

| Role | Variant | Icon (existing `expo-symbols` only) |
| --- | --- | --- |
| Add | secondary | plus / add |
| Save | primary | checkmark / save |
| Cancel | cancel | xmark / close |
| Destructive | destructive | only if the control already uses an icon (e.g. list delete) |

Preferred presentation: `[+ Add] [save/check + Save] [x Cancel]`.

Icons **supplement** labels. Do not replace action text with icons except in a defined compact control (list-row delete) that has `accessibilityLabel` and a web `title` where appropriate.

Do not add an icon library for this.

---

## 3. Buttons — no truncation

**HARD RULE: action/button text must never be ellipsized, clipped, or truncated.**

“Save chan…” and “Save…” on a button are bugs.

If actions do not fit, in this order:

1. Reduce non-essential gap/padding; keep touch targets (`Touch.minHeight`, ~44–56pt).
2. Allow the row to wrap (`flexWrap`).
3. Stack vertically below `FORM_ACTION_STACK_MAX_WIDTH`.
4. Icon-only only in a deliberate compact UI.

Do **not**:

- shrink type to make a row fit
- set `numberOfLines={1}` or `ellipsizeMode` on action labels
- give action buttons `minWidth: 0` in a squeezed row
- stretch a single phone row across an arbitrary desktop width

Shared implementation: `components/ui/FormActions.tsx`, `PrimaryButton` (no ellipsis), `formActionLayout.ts`.

---

## 4. Touch targets

Interactive controls stay at least `Touch.minHeight` (44) high. Primary buttons use `Layout.buttonHeight` (56) as `minHeight`.

Do not fix overflow by making controls tiny.

---

## 5. Forms, fields, accessories

- Labels, required markers, errors, and helper text use existing `FieldLabel` / `FieldError` / `Type.hint`.
- Errors sit **under** the field they belong to.
- Required fields keep the existing required indicator.
- Primary field content (placeholder or selected value) gets width **before** secondary accessories (Lock switch, chevrons).
- At narrow widths, reflow the accessory (stack under the field). Do not special-case placeholder strings.
- Ellipsis is allowed only on **long dynamic values** when wrapping is not enough — never on action labels, never on short placeholders because a Lock stole space.
- Shared implementation: `LockFieldCard`, `SelectDropdown`, `lockFieldLayout.ts`.

---

## 6. Validation and destructive actions

- Block save and surface field errors; scroll to the first error when the existing focus helpers support it.
- Destructive actions use `variant="destructive"` and `confirm()` before delete/import-replace.
- Confirm labels stay localised (`common.ok` / `common.cancel` or explicit confirm copy).

---

## 7. Responsive behaviour

| Surface | Width (approx.) | Rule |
| --- | --- | --- |
| Phone | 320–600 | Single-column forms. Phone-first. Actions and accessories reflow. |
| Tablet | 600–1100 | Use extra width (grouped / two-column where it helps). Do **not** merely stretch a phone form. Full tablet layout is **Phase 2**. Primitives must not assume an infinite phone column. |
| Desktop web | >1100 | Test harness. Cap content with `Layout.contentMaxWidth` (720) when applying layout. Do not stretch forms across the viewport. |

`Screen` is still full-bleed for themed backgrounds; max-width applies to **content**, not the scene art.

---

## 8. Navigation

Bottom-navigation labels must not clip mid-glyph (`ellipsizeMode="clip"` is forbidden).

Seven primary tabs is a **structural** problem. Do not add an eighth. Do not redesign IA in a small UI fix.

**Direction (Phase 2+):** keep Jobs and Colours as primary work; group Material Types, Types, Methods, Number Colours behind Library/Setup. Maintenance stays a stack screen (gear), not a tab.

---

## 9. Typography

- Use `FontSize` / `Type` tokens. Body and buttons stay at `FontSize.md` (16) unless a token already defines otherwise.
- Do not drop below `FontSize.xs` (13) for interactive or essential text. Hero banner subtitle scaling that goes to 9pt is a known exception to fix later — do not copy it.
- Hierarchy: screen title → heading → body/label → hint/meta.
- Long dynamic names wrap in lists; ellipsis only when a single-line row is unavoidable.

---

## 10. Spacing / density

Use `Space`, `Layout.screenGutter`, `Layout.cardGap`, `Layout.cardPadding`. Do not invent one-off paddings on a new screen when those tokens exist.

Phone stays touch-friendly (not cramped). Tablet should eventually reduce unused vertical stretch (Phase 2).

---

## 11. Accessibility

- Buttons: `accessibilityRole="button"`, `accessibilityState.disabled` when disabled.
- Icon-only: `accessibilityLabel` required; web `title` when using `Pressable` on web.
- Switches: accessible name (existing `accessibilityLabel` on Lock).
- Chip / select options: `accessibilityRole="button"`.
- Keep disabled visible (opacity tokens already on `PrimaryButton`).
- Keyboard: rely on `Pressable` / `TextInput`; do not trap focus in web-only hacks.

---

## 12. Localisation

- Every visible string: `t(...)`.
- Canonical actions: `common.*` only.
- EN and DE keys must match.
- Do not leave unused contextual CRUD strings as the live button titles.

---

## 13. Theming

Layout and interaction rules are **theme-independent**. Do not hard-code theme pack colours in a new screen; use `useThemeColors` / `useControlColors` / `usePackSurface`.

Night view is black/white by product rule. Do not invent a third palette.

Verify contrast of new controls on tavern / dragon / unicorn / none / night.

---

## 14. Application states

Every entity list/form must have:

- empty copy
- saving/disabled on the save action
- validation errors
- delete confirmation
- save/load failure via `showMessage`

Large lists stay virtualised (`ScreenList` / `FlatList`). Preview and generate stay usable when colour count is high.

---

## 15. Platform

- Do not break Android to polish web.
- Isolate web-only colour input vs native `ColorPickerSheet`.
- `window.alert` / `window.confirm` on web are accepted for now; native uses `Alert`. Do not mix them on Android.

---

## Shared primitives to reuse

| Primitive | Use for |
| --- | --- |
| `FormActions` | Add / Save / Cancel |
| `PrimaryButton` | All other buttons |
| `LockFieldCard` + `SelectDropdown` | Locked selects |
| `FormField` / `ChipSelect` / `ColorField` | Inputs |
| `EntityListItem` | List rows + icon delete |
| `ScreenList` | Form + virtualised list |
| `Layout.contentMaxWidth` | Future content width cap |
