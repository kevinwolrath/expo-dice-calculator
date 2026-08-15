# Copilot Instructions — React Expo App

## Expo SDK documentation

Before writing Expo code, consult the versioned Expo SDK 57 documentation:
https://docs.expo.dev/versions/v57.0.0/

## Critical rule: never invent APIs

Before using any component, hook, function, property, package API, route,
configuration option or environment variable:

1. Search the existing codebase.
2. Check the installed package/version.
3. Search for existing usage in the project.
4. Use the existing implementation and project conventions.

Do not invent APIs because they appear plausible.

Examples:

- Do not assume a React Native API exists because a similar browser API exists.
- Do not assume an Expo API exists without checking the installed Expo SDK/package.
- Do not import a package that is not already installed unless explicitly required.

If the required functionality does not exist:

- explain what is missing
- propose the package or implementation required
- do not silently invent it

## Expo and React Native first

This is a React Native Expo application.

Do not treat it as a normal React web application.

Avoid browser-only APIs unless the code is specifically for Expo Web.

Do not introduce:

- `window`
- `document`
- `localStorage`
- DOM APIs
- browser-only packages

unless platform-specific web code is intentionally required.

Prefer Expo and React Native APIs.

## Check package versions

Before using package-specific functionality, inspect:

- `package.json`
- Expo SDK version
- React Native version
- installed library versions

Do not use APIs from newer package versions unless the installed version supports them.

Do not change package versions unnecessarily.

## Existing code is the source of truth

The repository is authoritative.

Before modifying a screen, component, hook or service, inspect:

- the implementation
- imports
- callers
- navigation
- related hooks
- state management
- API/service layer
- tests where available

Do not assume architecture based on another Expo or React project.

## TypeScript

Preserve TypeScript type safety.

Do not:

- introduce `any` unless unavoidable
- suppress errors with `@ts-ignore`
- use unsafe casts merely to silence TypeScript
- duplicate existing interfaces/types

Prefer existing shared types.

When changing an interface or type, inspect all usages before editing it.

## React rules

Follow React hooks rules.

Do not:

- call hooks conditionally
- call hooks inside loops
- call hooks from ordinary functions
- create unnecessary effects
- duplicate derived state

Prefer:

- derived values over duplicated state
- small reusable components
- existing hooks
- existing project patterns

## React Native styling

Use the project's existing styling approach.

Before introducing a styling library, inspect the project.

Prefer existing:

- `StyleSheet`
- shared styles
- theme system
- component library

Do not introduce CSS, SCSS or web styling patterns into native screens unless
the project already supports them.

## Visual consistency and theming

Keep all interfaces visually uniform across screens and platforms.

Before adding or changing colors, spacing, typography, borders, radii, buttons,
inputs, dropdowns, modals, or empty states:

1. Inspect the existing shared component and theme implementation.
2. Reuse the existing component, style, or theme token whenever possible.
3. Check both light and dark color schemes before considering the change complete.

Do not:

- hardcode a color in a screen when a global theme color or shared component is available
- use a light-only background, border, or text color in a theme-aware interface
- create a one-off button, input, dropdown, card, or modal style when an existing shared component can be reused
- duplicate design values across screens without a clear component-level reason
- use browser-native controls that visually bypass the React Native design system unless the behavior is intentionally web-specific

Use `useThemeColor`, `Colors`, or the existing theme/component API for colors.
If a new semantic color is required, add it to the shared theme first and use
that token everywhere. Verify text/background contrast in light and dark modes.

## Localization

All user-visible text must come from the i18next locale resources.

Use the existing `react-i18next` setup and call `useTranslation()` with `t(...)`
in React components. For non-component code, use the configured i18next instance
only when a hook cannot be used.

Translation resources are stored in:

- `locales/en.json`
- `locales/de.json`

When adding or changing visible text:

1. Add or update the same translation key in every supported locale file.
2. Use interpolation and pluralization keys for dynamic values.
3. Pass translated labels, placeholders, button titles, alerts, confirmations,
   empty states, validation messages, accessibility labels, and navigation titles
   through `t(...)`.
4. Preserve the existing translation key structure and naming conventions.

Do not hardcode user-visible strings in screens, components, alerts, navigation
options, or platform-specific branches. Technical values such as route names,
database column names, log messages, test descriptions, and icon identifiers do
not need translation.

Before finishing a UI change, search the touched files for hardcoded visible
strings and confirm that all locale files contain the new keys.

## Shared UI change checklist

Before completing a UI change, verify:

- the existing shared component and theme were inspected first
- no unnecessary screen-specific visual styles were introduced
- light mode and dark mode both have readable contrast
- all visible text uses `react-i18next`
- English and German locale files have matching keys
- the affected screen has no TypeScript diagnostics
- the relevant tests or validation command pass

## Navigation

Inspect the existing navigation system before changing routes.

The project may use:

- Expo Router
- React Navigation

Never assume which one is being used.

Do not invent route names.

Before navigating to a route:

1. confirm that the route/screen exists
2. inspect existing navigation usage
3. preserve existing parameter types

## Expo Router

If Expo Router is installed:

- use file-based routes
- preserve the existing route structure
- inspect the `app` directory before creating routes
- do not invent pathname values
- use typed route parameters where supported

Do not mix React Navigation configuration into Expo Router unnecessarily.

## State management

Use the state management solution already present in the application.

Examples may include:

- Zustand
- Context
- Redux
- TanStack Query
- component state

Do not introduce a new state-management library for a small change.

For Zustand:

- reuse existing stores
- reuse existing actions
- do not duplicate state in components unnecessarily

## API calls

Use the project's existing API/service layer.

Do not make direct `fetch` or Axios calls from UI components if the project
already has API services/hooks.

Before calling an endpoint:

1. inspect the existing API client
2. confirm the endpoint
3. confirm request/response types
4. reuse existing authentication handling

Do not invent backend endpoints.

## Async code

Preserve async/await correctly.

Do not:

- remove `await` from asynchronous APIs
- replace async APIs with invented synchronous versions
- use unhandled promises
- use `.then()` inconsistently when the project uses async/await

Handle loading and error states appropriately.

## Expo APIs

Before using an Expo package such as:

- expo-camera
- expo-location
- expo-secure-store
- expo-file-system
- expo-notifications
- expo-image-picker

confirm that:

1. the package is installed
2. the installed SDK supports the API
3. required permissions/configuration are present
4. native configuration is handled correctly

Do not assume installing an npm package is sufficient when app configuration
or permissions are also required.

## Platform-specific behaviour

Consider:

- Android
- iOS
- Expo Web

Do not make a change that fixes one platform while unintentionally breaking
another.

Use platform-specific code only where necessary:

```ts
Platform.OS
Platform.select(...)
```
