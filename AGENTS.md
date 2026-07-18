# Agents Guide (pizza-app)

This repo is an Ionic + Angular (standalone) app using TypeScript (strict), ESLint, Prettier, and Karma/Jasmine.

## Quick Commands

- Install deps: `npm install`
- Dev server: `npm start` (Angular dev server, http://localhost:4200)
- Production build: `npm run build:prod`
- Dev build (watch): `npm run watch`
- Lint: `npm run lint` (Angular ESLint)
- Unit tests (watch): `npm test` (Karma + Jasmine)

## Tests (including single test)

Karma runs in a browser by default.

- Run once (headless):
  - `npm test -- --watch=false --browsers=ChromeHeadless`
- Run a single spec file (fastest):
  - `npm test -- --include="src/app/features/recipe/recipe.component.spec.ts" --watch=false --browsers=ChromeHeadless`
- Run a subset by glob:
  - `npm test -- --include="src/app/features/**/calculator-*.spec.ts" --watch=false --browsers=ChromeHeadless`

Notes:

- Coverage output: `coverage/app/`
- The project uses `tsconfig.spec.json` and `karma.conf.js`.

## Build Targets / Mobile

- Web build (Makefile): `make web-build` (runs `npm run build:prod`)
- Android build (Makefile): `make android-build` (runs `ionic cap sync` + `ionic cap build android`)
- iOS build (Makefile): `make ios-build` (runs `ionic cap sync` + `ionic cap build ios`)
- Android live reload: `make android-livereload`

## Lint / Format

- Lint: `npm run lint`
- Prettier (manual): `npx prettier --write .`

Formatting notes:

- Indentation: 2 spaces (see `.editorconfig`).
- Quotes: single quotes in TypeScript (see `.editorconfig`).
- HTML: Prettier uses the Angular parser for `*.page.html` (see `.prettierrc`).

Config sources to follow:

- ESLint: `.eslintrc.json`
- Prettier: `.prettierrc`
- EditorConfig: `.editorconfig`
- TS strictness: `tsconfig.json`

## Project Conventions

### Architecture

- Standalone Angular: components/pages typically declare `standalone: true` and list dependencies in `imports: [...]`.
- Ionic standalone components: prefer `@ionic/angular/standalone` imports (e.g. `IonContent`, `IonHeader`).
- Feature-first structure under `src/app/features/*` and pages under `src/app/pages/*`.

### TypeScript

- `strict: true` is enabled; avoid `any`.
- Prefer specific unions/enums/interfaces over loose objects.
- Prefer `import type { ... }` when importing types only.
- Prefer `readonly` for constants and injected icon refs.
- Access modifiers:
  - `private` for implementation details
  - `protected` for template-bound fields/methods
  - avoid new public surface unless needed

### Naming

- Files are kebab-case and end with a meaningful suffix:
  - `*.page.ts`, `*.component.ts`, `*.service.ts`, `*.processor.ts`, `*.enum.ts`, `*.interface.ts`
- Classes are PascalCase:
  - Pages: `SomethingPage`
  - Components: `SomethingComponent`
  - Services: `SomethingService`
  - Processors: `SomethingProcessor`
- Observables end with `$` (e.g. `results$`, `settings$`).
- Booleans use `is/has/can` prefixes (e.g. `isInitialized`).

Selector conventions in this repo:

- App-level/feature components commonly use `app-*` selectors.
- Pages under `src/app/pages/**` often use `home-*-page`, `calculator-*-page`, etc. (match existing files when adding/renaming pages).

### Angular / Ionic Style

- Prefer `ChangeDetectionStrategy.OnPush` for UI components unless there is a reason not to.
- When subscribing manually, use `takeUntilDestroyed()` and keep subscriptions close to where they are created.
- Prefer using the `AsyncPipe` in templates over manual subscriptions when possible.
- Use Angular Signals where they already exist (e.g. `signal(false)` + `.set(...)`).

### Imports

Keep imports grouped and stable (this makes diffs smaller):

1. Angular framework imports (`@angular/*`)
2. Ionic imports (`@ionic/*`)
3. Third-party libs (`rxjs`, `@ngx-translate/*`, `lucide-angular`, etc.)
4. App absolute imports using baseUrl (`src/app/...`)
5. Relative imports (`./...`, `../...`) for same-folder modules

Use blank lines between groups.

### RxJS

- Prefer pipeable operators (`source$.pipe(map(...), shareReplay(...))`).
- Avoid nested subscriptions; compose streams instead.
- Use `shareReplay({ refCount: true, bufferSize: 1 })` for cached computed streams.

### Error Handling

- Wrap browser/Capacitor APIs and JSON parsing in `try/catch` and provide safe fallbacks.
- Only swallow errors when a fallback is explicitly acceptable; otherwise log with context.
- Prefer `console.warn` for recoverable failures (e.g. optional locale loading) and keep messages actionable.

### i18n / Locales

- Translations live in `src/assets/i18n/*.json` and are consumed via `@ngx-translate/core`.
- Locale selection/persistence is handled by `LocaleManagerService` and `PrefsStorage`.
- When adding a new UI string, add it to all language JSON files (or provide a clear fallback).

### Styling (SCSS)

- Global styling lives in `src/global.scss` and theme variables in `src/theme/variables.scss`.
- Keep component SCSS scoped and small (Angular has component style budgets in `angular.json`).
- Prefer CSS variables/theme tokens over hard-coded colors.

## Testing Conventions

- Unit tests use Jasmine + Karma (`npm test`).
- Prefer standalone testing style when possible:
  - `imports: [ComponentUnderTest]` (and required providers like `provideRouter([])`)
- Legacy tests may use `declarations: [...]` + `IonicModule.forRoot()`; keep style consistent within a file.

## Practical Gotchas

- `baseUrl` is set in `tsconfig.json`; prefer `src/...` imports to avoid deep `../../..` paths.
- The ESLint config enforces Angular selector conventions; existing pages may not fully align.
  - When adding new components, prefer `app-*` selectors unless matching an existing page pattern.

## Agent skills

### Issue tracker

Issues tracked on GitHub Issues (`Nyxa07/pizza-app`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
