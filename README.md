# Penguins Schedule Extension

A small browser extension (Chrome and Firefox) that shows the Pittsburgh Penguins schedule in a toolbar popup. It also puts a gold dot on the icon on game days and sends a notification 15 minutes before puck drop.

Everything runs offline. The schedule is a bundled snapshot of `schedule.json` from the NHL API (`https://api-web.nhle.com/v1/club-schedule-season/pit/<season>`), so updating for a new season means replacing that file and bumping the version in `manifest.json`.

## Files

- `popup.html` / `popup.js` - the schedule popup
- `background.js` - badge and notification logic
- `schedule.json` - season data
- `package.sh` - builds the Chrome and Firefox zips into `store-assets/`

## Build and test

```sh
./package.sh
```

Tests live in `test/` (see `test/README.md`). Quick version:

```sh
cd test
npm install
npm test
```
