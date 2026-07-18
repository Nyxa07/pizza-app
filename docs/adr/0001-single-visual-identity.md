# Single visual identity replaces the theme catalog

v1 shipped 8 selectable public themes plus a secret Konami theme unlocked by easter egg (~5,400 lines of per-theme SCSS, each re-styling every Ionic component). As part of the premium redesign we decided to remove the entire catalog — including Konami, which was a v1 playful experiment — in favor of **one** designed visual identity with two appearances (light/dark, following the system, designed light-first).

## Why

- Every new theme cost ~500–800 lines of hand-written overrides because no shared semantic token layer existed; base-theme colors also leaked into all themes via hard-coded values in `global.scss`.
- A theme catalog signals "hobby app"; the sellable-premium positioning requires one opinionated, polished identity.
- Light/dark appearances still require a palette-mapping token architecture, so the machinery stays — only the user-facing catalog dies.

## Consequences

- `ThemeService`, `KonamiService`, theme enums and the 10 theme SCSS files are removed; a minimal appearance service (system/light/dark + native status bar) replaces them.
- Persisted prefs (`theme`, `public-theme`, `secret-theme`, `discovered-themes`) must be migrated/cleaned on first launch after the redesign.
- Users attached to a v1 theme lose it; this is deliberate.
