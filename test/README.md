# Testing the extension

One-time setup:

```sh
cd test
npm install
npx puppeteer browsers install chrome   # Chrome for Testing (branded Chrome 137+ can't sideload extensions)
```

## Automated (run these after any change)

```sh
npm test
```

- **`npm run unit`** — runs `background.js` against a stubbed `chrome.*` API:
  badge on/off by game day, alarm set 15 min before puck drop, notification on
  a timely fire, stale-alarm suppression, alarm chaining, season-over no-op.
- **`npm run e2e`** — loads the real extension into headless Chrome for
  Testing: popup renders all 84 games, popup height fix (`max-height: 580px`
  + scroll), no badge off game days, correct alarms; second scenario injects
  a game "today" and asserts the gold badge and pending alarm.
- **`npm run lint`** — Mozilla's AMO validator (`web-ext lint`). Expected:
  0 errors; 2 known warnings (Chrome's `service_worker` key, Android
  min-version notice).

## Live in Firefox (and the notification, in either browser)

```sh
npm run fake-game    # game 1 becomes today, puck drop in 17 min
npm run firefox      # launches Firefox with the extension temp-installed
```

Then check: popup opens tall (scrolls, not 200px), gold dot badge on the
toolbar icon, and a system notification after ~2 minutes ("Penguins vs/at …
starts at …"). For Chrome, load the repo root via chrome://extensions →
"Load unpacked" instead of `npm run firefox` (reload it after fake-game).

When done:

```sh
npm run real-game    # restores the real schedule.json
```

`fake-game` backs up the schedule to `schedule.json.bak` and `real-game`
restores it — don't package or commit while the fake game is on.
