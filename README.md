# Ledger — Personal Habit & Productivity Dashboard

A dark, dense, spreadsheet-style dashboard for tracking habits, tasks, mood, sleep,
and 9 analytics graphs. No backend, no build step — data lives in your browser.

This version is a **PWA (Progressive Web App)**: once hosted on a real URL (see
below), it can be installed as an app icon on both phone and desktop. It is NOT
an .apk — see "About APKs" below for why, and how to get one if you still want it.

## Run it locally (quickest way to try it)

Just open `index.html` directly in a browser. Habit tracking, tasks, mood, sleep,
analytics — all work immediately via localStorage.

The "install as an app" part (below) needs a real server — opening the file
directly (`file://...`) won't trigger the install prompt.

## Install it as an app (phone + PC)

Browsers only offer to "install" a PWA when it's served over HTTPS (or localhost).
The easiest free way to get that:

1. Push these files to a GitHub repository.
2. In the repo, go to **Settings → Pages**, set the source to your main branch, save.
   GitHub gives you a URL like `https://yourname.github.io/reponame/`.
3. Open that URL:
   - **On your phone** (Chrome/Safari): open the menu → "Add to Home Screen" /
     "Install app". It now behaves like a native app icon.
   - **On your PC** (Chrome/Edge): click the install icon (⊕) in the address bar,
     or menu → "Install Ledger…". It opens in its own window, pinned to your
     taskbar/dock, works offline.

No app store, no signing, no APK needed for this — same app, same data model,
on both platforms, from one set of files.

## About APKs

An `.apk` is a package format specific to Android — it cannot run on a PC.
There is no single file that installs on both a phone and a computer; that's
exactly the problem a PWA (above) solves instead.

If you specifically want a real, installable Android `.apk` (e.g. to sideload
outside a browser, or eventually list on the Play Store), the standard free
path is:

1. Host this project somewhere public (GitHub Pages, as above).
2. Go to **pwabuilder.com**, paste in your hosted URL.
3. It reads the `manifest.json` already included here and generates a signed
   `.apk` (or `.aab` for the Play Store) for you to download — no Android
   Studio required for a basic build.

I can't generate that `.apk` file myself in this chat (it requires the live
hosted URL and Android build tooling I don't have access to here), but once
you've hosted the site, that step takes a few minutes.

## Files

- `index.html`, `styles.css`, `app.js` — the app itself
- `manifest.json` — PWA metadata (name, icons, colors) used by "Add to Home Screen"
  and by PWABuilder to generate an APK
- `sw.js` — service worker, enables offline use once installed
- `icons/` — app icons (192px, 512px)

## Data

Stored under the localStorage key `ledger_v1` as one JSON object:
`{ habits, logs, todos, moods, sleep }`. Use Settings → Export inside the app
to back it up as JSON before clearing browser data.
