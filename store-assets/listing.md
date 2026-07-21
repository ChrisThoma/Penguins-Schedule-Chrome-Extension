# Store listings (Chrome Web Store + Firefox Add-ons) — 2026-27 season

## Title
Penguins 2026-2027 Schedule

## Summary (short description, max 132 chars)
A quick way to view the schedule for the Pittsburgh Penguins 2026-2027 NHL Season.

## Description
See the full Pittsburgh Penguins 2026-2027 NHL season schedule at a glance, right from your browser toolbar.

- All 84 games from the September 30, 2026 opener through April 10, 2027
- Upcoming games at the top, past games listed separately below
- Game times shown in your local time zone
- Gold badge on the toolbar icon on game days
- Desktop notification 15 minutes before puck drop
- One click to the official Penguins site
- Works fully offline — no accounts, no tracking, no data collection

Updated for the 2026-2027 season. Let's go Pens!

## Screenshots (in this folder)
- schedule-1280x800.png — primary listing screenshot (1280×800)
- schedule-640x400.png — alternate size accepted by the store (640×400)

## Package upload
- Version lives in manifest.json (2.1.0). Build both store zips from the repo root:
  `./package.sh`
- Produces `store-assets/penguins-schedule-<version>-chrome.zip` and `-firefox.zip`
  (identical contents; Chrome uses `background.service_worker`, Firefox uses
  `background.scripts` from the same shared manifest — each browser ignores the
  other's key with a harmless warning).

## Firefox Add-ons (addons.mozilla.org) submission notes
- Upload `penguins-schedule-<version>-firefox.zip` at https://addons.mozilla.org/developers/
- The add-on ID is pinned in the manifest (`browser_specific_settings.gecko.id:
  {39be02d6-90bd-4df3-b882-579a5b801c6f}`, assigned by AMO on first upload) —
  it must never change.
- Listing text and screenshots: reuse the Chrome copy and images above.
- Data collection questionnaire: the extension collects and transmits nothing.
- Permissions justification for review: `alarms` schedules the daily game-day
  badge refresh and the pre-game reminder; `notifications` shows the reminder
  15 minutes before puck drop. The schedule is a bundled `schedule.json`
  snapshot (from the public NHL API) — the extension makes no network requests.
- No source-code submission needed: the zip is the source (no build step,
  bundling, or minification).
