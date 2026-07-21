---
name: verify
description: Build, launch and drive this Ionic/Angular app headlessly to verify a change end-to-end (screenshots, real clicks, localStorage checks). Use when verifying that a change works in the real app.
---

# Verify pizza-app (web surface)

## Build & serve

```bash
npm run build:prod          # outputs to www/
```

`www/` needs an SPA fallback (deep links like `/tabs/home/settings` must serve
`index.html`) — plain `python3 -m http.server` returns 404s. Use a ~20-line node
static server with fallback (serve `www/`, fallback to `index.html`), e.g. on
port 8877.

## Drive headlessly (no Playwright installed)

Chrome + CDP over the repo's own `ws` package works well:

```bash
google-chrome --headless=new --remote-debugging-port=9333 \
  --user-data-dir=/tmp/profile --no-first-run --window-size=420,900 about:blank &
# targets: GET http://127.0.0.1:9333/json/list → webSocketDebuggerUrl (type=page)
NODE_PATH=/home/Nyxa/Projets/pizza-app/node_modules node drive.cjs
```

Useful CDP calls: `Page.navigate`, `Runtime.evaluate` (returnByValue+awaitPromise),
`Page.captureScreenshot`, `Input.dispatchMouseEvent` (real clicks: get
`getBoundingClientRect()` center via evaluate, then mousePressed+mouseReleased).

## Gotchas learned

- Headless Chrome on this machine reports `prefers-color-scheme: dark`.
  Pin it with `Emulation.setEmulatedMedia {features:[{name:'prefers-color-scheme',value:'light'}]}`
  — also the way to test live system-scheme switching without reload.
- Wait for readiness with `!!document.querySelector('ion-app .ion-page')`
  + `document.fonts.ready`, then ~600ms for Ionic to settle.
- `ion-select` opens an `ion-alert`: options are `.alert-radio-button`
  (match by `textContent`), confirm via the OK button. All clickable by
  coordinates.
- Prefs live in localStorage under version-prefixed keys `3:<key>`, JSON
  `{value, expiresAt}`. Seed/inspect them via `Runtime.evaluate`.
- Routes: `/tabs/home`, `/tabs/calculator`, `/tabs/guides`, settings at
  `/tabs/home/settings` (gear = `ion-header ion-button` on home).

## Flows worth driving

- Boot → `document.documentElement.dataset.appearance` + computed `--bg`/body
  background; fonts via `document.fonts.check('16px Fraunces')`.
- Settings → Apparence select (system/light/dark), persistence across reload.
- v1→v2 migration: seed `3:theme`, `3:public-theme`, `3:secret-theme`,
  `3:discovered-themes`, reload, expect them purged and `3:schema-version` = 2.
