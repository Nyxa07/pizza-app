# Google Play metadata — Pizza Maker 2.0.0

This directory is ready to import with Fastlane `supply` or copy into Google
Play Console. The listing is maintained for every locale shipped by the app:
`en-US` and `fr-FR`.

## Phone screenshots

The four screenshots in each locale are captures of the real Angular app in
the light appearance at 1080 × 1920 px. They cover both calculator paths and
all three primary tabs:

1. Expert calculator
2. Guided calculator
3. Recipes
4. My doughs

To regenerate them after a UI change:

```bash
npm start -- --host 127.0.0.1 --port 4200
node scripts/capture-store-screenshots.mjs http://127.0.0.1:4200
```

The capture script uses Playwright on top of the system Chrome, seeds
isolated demo data, forces the light appearance and writes both localized
screenshot sets.
For a dark-appearance QA pass without replacing Store assets, set
`PIZZA_SCREENSHOT_APPEARANCE=dark` and point
`PIZZA_SCREENSHOT_OUTPUT_ROOT` to a temporary directory.

## Release checklist

- Package version: `2.0.0` (`versionCode` 19)
- Listing locales: English (United States), French (France)
- Release notes: `changelogs/19.txt`
- Phone screenshots: four per locale, PNG, 1080 × 1920 px
- App bundle/signing and physical-device QA remain release operations; no
  signing material is stored in this metadata directory.
