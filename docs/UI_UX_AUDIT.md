# DiceForge UI/UX audit

Audit of interaction consistency against `docs/UI_UX_CONTRACT.md`. Paths are from the repository root.

## CRITICAL

Visible clipping / truncation or controls that become unusable on a narrow phone.

| Finding | Source |
| --- | --- |
| CRUD buttons use `flex: 1` + `minWidth: 0` in a single row, and `PrimaryButton` forces `numberOfLines={1}`. That produces “Save chan…” / similar. | `components/ui/FormActionRow.tsx`, `components/ui/PrimaryButton.tsx` |
| Select trigger text is always `numberOfLines={1}` inside a row that also hosts a non-shrinking Lock column (`minWidth: 72`). Placeholders such as “Choose a material type” lose width first. | `components/ui/SelectDropdown.tsx`, `components/ui/LockFieldCard.tsx` |
| Jobs Generate/Preview bar gives Preview `flex: 3`, `minWidth: 0`, and `numberOfLines={1}` on the action label. | `components/ui/JobsGenerateBar.tsx` |
| Tab labels use `ellipsizeMode="clip"` (mid-glyph clipping) across seven destinations. | `app/(tabs)/_layout.tsx` |

## CONSISTENCY

Equivalent CRUD operations implemented differently.

| Finding | Source |
| --- | --- |
| Canonical actions are passed per-screen as “Add job”, “Save job”, “Add colour”, “Save changes”, “Add type”, “Save method”, etc. | `locales/en.json`, `locales/de.json`; all six tab CRUD screens via `FormActionRow` |
| `FormActionRow` already exists but still requires each screen to supply contextual titles instead of `common.add` / `common.save`. | `components/ui/FormActionRow.tsx` |
| `ActionButtonRow` is a second, non-wrapping row used by theme install as well as CRUD. | `components/ui/PrimaryButton.tsx`, `components/ui/ThemePackManager.tsx` |
| Domain actions (Generate, Preview, Import, Export, Delete theme) correctly keep specific verbs — leave them. | `components/ui/JobsGenerateBar.tsx`, `app/maintenance.tsx`, `components/ui/ThemePackManager.tsx` |

CRUD screens that share `FormActionRow` (migrate together):

- `app/(tabs)/dicejob.tsx`
- `app/(tabs)/stock.tsx`
- `app/(tabs)/material-types.tsx`
- `app/(tabs)/colour-types.tsx`
- `app/(tabs)/production-methods.tsx`
- `app/(tabs)/dice-number-colours.tsx`

## RESPONSIVE

Phone / tablet / web layout.

| Finding | Source |
| --- | --- |
| Phone forms are single-column (keep). Action rows do not wrap or stack; they shrink. | `FormActionRow` + `ActionButtonRow` |
| `LockFieldCard` is always `flexDirection: "row"` with a reserved lock column; no reflow at narrow width. | `components/ui/LockFieldCard.tsx` |
| No shared maximum content width for desktop web; `Screen` is full viewport. | `components/Themed.tsx`, `constants/theme.ts` |
| Tablet multi-column / grouped forms are not implemented. Documented as follow-up. | — |

## NAVIGATION

| Finding | Source |
| --- | --- |
| Seven tabs: Jobs, Colours, Material Types, Types, Methods, Number Colours (+ maintenance is a stack screen, not a tab). Labels wrap or clip on a phone. | `app/(tabs)/_layout.tsx`, `locales/en.json` `tabs.*` |
| `TabBarLabel` allows two lines but `ellipsizeMode="clip"`. | `app/(tabs)/_layout.tsx` |

**Recommendation (not in this change):** collapse reference-data tabs into one Library/Setup destination.

## FOLLOW-UP

Out of scope unless approved:

- Full tablet / desktop layout using `Layout.contentMaxWidth`
- Tab information architecture (seven destinations)
- Theme pack / maintenance / page-theme action copy (those are domain actions, not CRUD Add/Save)
- Replacing Generate/Preview with `FormActions`
