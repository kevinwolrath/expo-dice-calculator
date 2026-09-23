# DiceForge UI/UX audit

Application-wide review against `docs/UI_UX_CONTRACT.md`.

Phase 1 (CRUD vocabulary, `FormActions`, action/select truncation, lock reflow) is implemented. This document records what was found everywhere else so later phases can be scoped without rediscovering the app.

**Product:** Android / iOS Expo app (SDK 57). Web is a test harness.

---

## EXECUTIVE SUMMARY

DiceForge already looks like a themed production app on Jobs (hero, generate, preview). Interaction quality lagged: each CRUD screen invented its own Add/Save copy, action rows shrank until labels ellipsized, and Lock competed with select placeholders on a phone.

**Phase 1** standardises ordinary CRUD (Add / Save / Cancel), stops action ellipsis, and reflows lock vs field. It does **not** fix tablet layout, seven-tab IA, list virtualisation polish, or ScreenList’s broken native scroll-node helper.

The remaining work is structural (navigation, tablet density) and polish (a11y on chips historically, alerts on web, hero type scaling), not a new visual language.

**Verdict:** Phone CRUD is now coherent enough for a visual review. Do not start Phase 2 until that review happens.

---

## CRITICAL

Visible breakage, clipping, or unusable controls.

| Status | Finding | Source |
| --- | --- | --- |
| **Fixed in Phase 1** | CRUD row `flex:1` + `minWidth:0` + `numberOfLines={1}` → “Save chan…” | Was `FormActionRow` / `PrimaryButton` |
| **Fixed in Phase 1** | Lock column (`minWidth: 72`) stole width from select placeholders | `LockFieldCard`, `SelectDropdown` |
| **Fixed in Phase 1** | Generate/Preview preview label `numberOfLines={1}` + `minWidth:0` | `JobsGenerateBar` |
| **Fixed in Phase 1** | Tab labels `ellipsizeMode="clip"` (mid-glyph clip) | `app/(tabs)/_layout.tsx` |
| **Fixed** | `ScreenList.getScrollContentNode` now uses the list instance (and native scroll ref fallback) instead of undefined `scrollRef`. | `components/ui/ScreenList.tsx` |

---

## HIGH

Major consistency, responsive, or usability issues.

| Finding | Source |
| --- | --- |
| **Seven bottom tabs** on a phone. Labels wrap; German is worse (`Produktionsmethoden`, `Zahlenfarben`). Maintenance is correctly *not* a tab, but reference data still is. | `app/(tabs)/_layout.tsx` |
| **Tablet = stretched phone.** `Screen` is full viewport; no use of `Layout.contentMaxWidth`. Jobs form + list stay one column; banner grows with width; lots of empty vertical field. | `components/Themed.tsx`, all `ScreenList` screens |
| Desktop web stretches the same column across >1100px. | Same |
| **Fixed** | Theme install modal actions use min-width + grow instead of `flex: 1` squeeze. Domain verbs (Overwrite / Save theme) kept. | `ThemePackManager.tsx` |
| Jobs form is very tall (hero + generate + many lock cards + preview). On a phone the list of jobs is easy to miss below the fold. | `app/(tabs)/dicejob.tsx` |
| 387+ colours: list is virtualised, but Jobs generate/preview and colour pickers will get heavy. No pagination UX. | `stock.tsx`, `dicejob.tsx`, `DicePreview` |

---

## MEDIUM

Polish and structure.

| Finding | Source |
| --- | --- |
| Chip selects wrap by default and expose `accessibilityLabel` plus `accessibilityRole="button"`. | `ChipSelect.tsx` |
| Page appearance stacks four full-width buttons (Choose image / Remove / Reset / Done) with mixed semantics. Fine on phone; noisy. | `app/page-theme.tsx` |
| Import is `variant="destructive"` (correct: replaces DB) next to Export; both are full width. | `app/maintenance.tsx` |
| **Fixed** | Not-found uses `PrimaryButton` to go home. | `app/+not-found.tsx` |
| Web confirms use `window.alert` / `window.confirm` (different copy/buttons than native `Alert`). | `components/alert.ts` |
| **Fixed** | Hero subtitle floors at `FontSize.xs` (13). | `JobsHeroBanner.tsx` |
| Night view locks page-theme customisation (intentional) but the empty message + Done is sparse. | `page-theme.tsx` |
| **Fixed** | Entity row titles wrap; delete stays icon-only with label/tooltip. | `EntityListItem.tsx` |
| Duplicate locale keys still exist (`jobs.addJob`, `stock.add`, …) now equal to Add/Save. Harmless but noisy. | `locales/*.json` |
| `ColorField` web uses a native `<input type="color">`; Android uses `ColorPickerSheet`. Correct split; visual chrome differs. | `ColorField.tsx` |
| **Fixed** | Startup title uses `Type.screenTitle` without an extra 24pt override. | `app/index.tsx` |

---

## LOW

| Finding | Source |
| --- | --- |
| `common.saving` still reads “Saving…” — status, allowed. | `locales/en.json` |
| Preview footer assets / long resin labels in `PreviewSettingsFooter` use `flexShrink: 1`. | `PreviewSettingsFooter.tsx` |
| **Fixed** | Colour picker sheet title wraps instead of ellipsizing. | `ColorPickerSheet.tsx` |
| Tab bar height is fixed (`TAB_BAR_BODY = 72`) plus safe area; two-line labels are tight. | `_layout.tsx` |
| Empty states exist on all CRUD lists; they are one sentence, not illustrated. Adequate. | `ScreenList` `emptyText` |
| Portfolio: no placeholder “lorem” or Expo template modal (removed earlier). Remaining “dev” feel is seven-tab IA and phone-stretched-on-tablet. | — |

---

## CROSS-CUTTING

| Cause | Effect |
| --- | --- |
| `ScreenList` = form in `ListHeader` + `FlatList` | Same structure everywhere; tablet cannot show form \| list side by side without a new layout. |
| `PrimaryButton` + `FormActions` | CRUD consistency now centralised. Other stacked buttons (maintenance, page-theme) still custom. |
| `usePackSurface` / night palette | Buttons and fields already branch night vs pack; new UI must keep using them. |
| i18n | All audited screens use `t(...)`. Hard-coded strings found only in `console.warn` (not UI). |
| Themes | Layout bugs were independent of tavern/dragon/unicorn; fixing primitives fixes all packs. |

---

## SCREEN-BY-SCREEN FINDINGS

### Startup — `app/index.tsx`
Loading and DB error + Retry. Clear. Title size slightly ad hoc. No CRUD.

### Jobs — `app/(tabs)/dicejob.tsx`
Primary workspace. Hero + Generate/Preview + lock fields + `FormActions`. Phase 1: Add/Save/Cancel; lock/select reflow. Remaining: form length, tablet stretch, preview cost at high colour counts, `console.warn("Failed to save job")` is log-only.

### Colours — `app/(tabs)/stock.tsx`
CRUD via `FormActions`. Colour + type + brand fields. Long colour names in `EntityListItem`. Horizontal chip/select overflow if many types (select modal mitigates). Empty state present.

### Material Types — `app/(tabs)/material-types.tsx`
Simple description CRUD. Migrated. Short form; tablet waste is obvious.

### Types (colour types) — `app/(tabs)/colour-types.tsx`
Description + allowed materials (`ChipSelect`). Migrated. Many material chips wrap only if `wrap` is passed — verify wrap on this screen in Phase 2 if chips overflow.

### Methods — `app/(tabs)/production-methods.tsx`
Description + min/max colour + allowed materials. Migrated. Number fields + chips; phone is dense but workable.

### Number Colours — `app/(tabs)/dice-number-colours.tsx`
Name + colour. Migrated. Smallest CRUD screen.

### Maintenance — `app/maintenance.tsx`
Theme chips + zip add/delete + export/import. Domain actions (correct verbs). Import destructive. Busy spinner. Not a tab (gear). Theme manager modal is a second pattern.

### Page appearance — `app/page-theme.tsx`
Per-page colours/image. Night lock. Done / Reset / image actions are domain. Four stacked buttons.

### Not found — `app/+not-found.tsx`
Localised. Link vs button inconsistency.

### Theme pack modal — `ThemePackManager.tsx`
Add from zip, name, overwrite. Full-screen `Modal`. Save theme / Overwrite / Cancel — domain, not canonical CRUD. Risk of squeezed `ActionButtonRow`.

### Colour picker sheet — `ColorPickerSheet.tsx`
Native colour UI. Done button. Sized from window width. Reasonable on phone; on tablet the sheet stays ~280px (not a bug).

### Dice preview modal — `DicePreview.tsx` + jobs preview
Scales with window. Footer text can shrink. Heavy with many colours.

### Dialogs
`confirm` / `showMessage` used for delete and import. Native vs web mismatch (HIGH/MEDIUM). Delete copy still says “Delete job” / “Delete colour” — **correct** (destructive + entity).

---

## PHONE FINDINGS (~320–600)

- Phase 1 addresses the two user-visible bugs (Save truncation, Choose a material/method truncation).
- Seven tabs still fight for width; two-line labels; German worse.
- Jobs form is long; list sits below.
- Touch targets on `FormActions` / `PrimaryButton` now respect min heights.
- Chip rows without wrap can scroll/overflow.

---

## TABLET FINDINGS (~600–1100)

- **Enlarged phone.** No two-pane form+list. `ScreenList` / maintenance / page-theme now use `Layout.contentMaxWidth`.
- Hero banner uses aspect ratio and grows — good visually, pushes the form further down.
- Tab bar has more room; seven tabs become acceptable before they become *right*.
- Full tablet layout is **out of Phase 1**.

---

## WEB FINDINGS (>1100 / Expo web)

- Same stretched column.
- `window.alert` / `confirm` vs native alerts.
- `document.getElementById("entity-form")` scroll path in `ScreenList`.
- Native `<input type="color">` vs sheet.
- Web is not a shipping target; still must not crash (`AGENTS.md`).

---

## NAVIGATION FINDINGS

| Destination | Role | Tab? |
| --- | --- | --- |
| Jobs | Primary work | Yes |
| Colours | Primary work | Yes |
| Material Types | Reference | Yes — **candidate to demote** |
| Types | Reference | Yes — **candidate to demote** |
| Methods | Reference | Yes — **candidate to demote** |
| Number Colours | Reference | Yes — **candidate to demote** |
| Maintenance | Backup + themes | No (header gear) |

**Recommended IA (Phase 2, not now):** Jobs | Colours | Library (or Setup) | (gear → Maintenance).

Header: night toggle, page appearance, gear. Compact and consistent (`HeaderActions`).

---

## ACCESSIBILITY FINDINGS

| Item | Notes |
| --- | --- |
| `PrimaryButton` / `FormActions` | Role, label, disabled state, web title — Phase 1 |
| List delete | Icon-only + `accessibilityLabel` (`common.delete`) |
| Lock switch | Labelled |
| ChipSelect | Role added in this pass |
| Tab labels | No longer clip; still may wrap |
| Contrast | Pack gold on dark is generally OK; night is B/W by design |
| Keyboard | Forms are sequential; no skip-link on web (acceptable for test web) |
| `ScreenList` scroll helper | Broken identifier — hurts focus-to-error on native |

---

## PORTFOLIO / PRODUCTION READINESS

**Feels production:** themed Jobs hero, generate/preview, localised EN/DE, no Expo template modal, DiceForge naming, Play signing/versioning (separate from UI).

**Still prototype-ish:** seven equally weighted tabs; phone layout on a tablet; Jobs form longer than the job list; web alerts; ScreenList type/focus bug.

**Not placeholder/test data in UI copy** (empty states are real product copy).

Do not strip Maintenance zip/import — that is product, not a debug panel.

---

## PHASE 1 COMPLETED

- Contract + this audit.
- `FormActions` with `common.add` / `common.save` / `common.cancel` and plus / save / close icons.
- Migrated: Jobs, Colours, Material Types, Colour Types, Methods, Number Colours.
- `PrimaryButton` no longer ellipsizes; action rows wrap/stack.
- `LockFieldCard` stacks lock at narrow width; select placeholders can use two lines when unselected.
- `JobsGenerateBar` no longer ellipsizes Preview.
- Tab `ellipsizeMode="clip"` removed.
- Locale canonical Add/Save; contextual button titles removed from live UI.
- Tests: `tests/formActions.test.ts`, `tests/uiContract.test.ts`.
- AI: `docs/UI_UX_CONTRACT.md` pointed from `AGENTS.md`, `.cursor/rules/ui-ux-contract.mdc`, `.github/copilot-instructions.md`.
- ChipSelect `accessibilityRole="button"`.

---

## RECOMMENDED PHASE 2

1. Visual review of Phase 1 on a real phone (Jobs + Colours + one reference screen, day + night, tavern + none).
2. **Tablet layout:** content max-width; optional two-pane form \| list on `ScreenList` when width ≥ 600.
3. **Navigation IA:** collapse four reference tabs into Library/Setup.
4. ~~Fix `ScreenList` `scrollRef` / `getScrollContentNode`.~~ Done in the consistency pass.
5. ~~Theme-pack modal actions: wrap like `FormActions` without renaming Overwrite/Save theme.~~ Done.
6. ~~Cap hero subtitle at ≥ `FontSize.xs`.~~ Done.
7. Visual review of remaining IA (seven tabs) and optional two-pane `ScreenList` when width ≥ 600.

---

## RECOMMENDED PHASE 3

- Desktop web content column (still test-only).
- Harmonise web alerts with in-app modal.
- Jobs form progressive disclosure (advanced lock fields).
- Performance pass for 387+ colours (preview, generate).
- Illustrated empty states if portfolio wants more “finished”.
- ChipSelect wrap audit on colour-types / methods.
- Remove unused duplicate locale keys (`jobs.addJob`, per-entity `add`/`save`).
- iOS layout pass (not this task).
