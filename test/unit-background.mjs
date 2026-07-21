// Unit test for background.js: runs it against a stubbed chrome.* API and the
// real schedule.json. No dependencies — run with `node test/unit-background.mjs`.
import { readFileSync } from 'fs';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'background.js'), 'utf8');
const schedule = JSON.parse(readFileSync(join(root, 'schedule.json'), 'utf8'));

const state = { badge: null, badgeColor: null, alarms: new Map(), notifications: [], listeners: {} };
const chrome = {
    runtime: {
        getURL: p => p,
        onInstalled: { addListener: fn => state.listeners.onInstalled = fn },
        onStartup: { addListener: fn => state.listeners.onStartup = fn },
    },
    action: {
        setBadgeText: o => state.badge = o.text,
        setBadgeBackgroundColor: o => state.badgeColor = o.color,
    },
    alarms: {
        create: (name, info) => state.alarms.set(name, info),
        clear: name => state.alarms.delete(name),
        getAll: cb => cb([...state.alarms.entries()].map(([name, i]) => ({ name, ...i }))),
        onAlarm: { addListener: fn => state.listeners.onAlarm = fn },
    },
    notifications: { create: (id, o) => state.notifications.push(o) },
};
const fakeFetch = () => Promise.resolve({ json: () => Promise.resolve(schedule) });
new Function('chrome', 'fetch', src)(chrome, fakeFetch);
const tick = () => new Promise(r => setTimeout(r, 10));
const gameAlarms = () => [...state.alarms.keys()].filter(n => n.startsWith('game:'));

const firstGame = schedule.games[0];
const openerStart = Date.parse(firstGame.startTimeUTC);
const realDate = global.Date;

// Freeze "now" so the test doesn't rot as real time passes.
function setNow(ms) {
    global.Date = class extends realDate {
        constructor(...a) { a.length ? super(...a) : super(ms); }
        static now() { return ms; }
        static parse(s) { return realDate.parse(s); }
    };
}

// 1. Install the day before the opener: badge cleared, both alarms scheduled.
setNow(openerStart - 24 * 3600 * 1000);
await state.listeners.onInstalled(); await tick();
assert.strictEqual(state.badge, '', 'badge should be cleared on a non-game day');
assert(state.alarms.has('badge-refresh'), 'badge-refresh alarm should exist');
assert.deepStrictEqual(gameAlarms(), ['game:' + firstGame.id], 'one alarm for the first game');
assert.strictEqual(state.alarms.get('game:' + firstGame.id).when, openerStart - 15 * 60 * 1000,
    'game alarm should fire 15 minutes before puck drop');

// 2. Game day (1h before puck drop): badge turns gold.
setNow(openerStart - 3600 * 1000);
const gameDay = new Date();
firstGame.gameDate = gameDay.getFullYear() + '-' +
    String(gameDay.getMonth() + 1).padStart(2, '0') + '-' +
    String(gameDay.getDate()).padStart(2, '0');
await state.listeners.onStartup(); await tick();
assert.strictEqual(state.badge, '•', 'badge should be a dot on game day');
assert.strictEqual(state.badgeColor, '#FCB514', 'badge should be Penguins gold');

// 3. Alarm fires on time: notification shown, next game chained.
setNow(openerStart - 15 * 60 * 1000);
await state.listeners.onAlarm({ name: 'game:' + firstGame.id }); await tick();
assert.strictEqual(state.notifications.length, 1, 'one notification on a timely fire');
assert.match(state.notifications[0].message, /^Penguins (vs|at) /, 'message names the opponent');
assert.deepStrictEqual(gameAlarms(), ['game:' + schedule.games[1].id], 'chained to the second game');

// 4. Stale fire (>1h after start): suppressed, but still chains onward.
state.notifications.length = 0;
setNow(openerStart + 2 * 3600 * 1000);
await state.listeners.onAlarm({ name: 'game:' + firstGame.id }); await tick();
assert.strictEqual(state.notifications.length, 0, 'no notification for a long-stale alarm');
assert.strictEqual(gameAlarms().length, 1, 'still chains the next upcoming game');

// 5. Season over: no game alarm, no crash.
const lastGame = schedule.games[schedule.games.length - 1];
setNow(realDate.parse(lastGame.startTimeUTC) + 24 * 3600 * 1000);
await state.listeners.onStartup(); await tick();
assert.strictEqual(gameAlarms().length, 0, 'no game alarm after the season ends');

global.Date = realDate;
console.log('unit-background: all 5 scenarios passed');
