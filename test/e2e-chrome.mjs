// End-to-end test: loads the real extension into Chrome for Testing (branded
// Chrome 137+ no longer allows --load-extension) and verifies the popup,
// badge, and alarms.
//
//   cd test && npm install && npx puppeteer browsers install chrome && npm test
//
// Runs two scenarios against a copy of the extension in a temp dir:
//   A. Real schedule — popup renders all 84 games, popup height fits the
//      600px cap, no game-day badge, alarms scheduled correctly.
//   B. Fake game today — badge shows the gold dot and the alarm targets it.
import puppeteer from 'puppeteer';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['manifest.json', 'popup.html', 'popup.js', 'background.js',
    'schedule.json', 'icon.png', 'icon-16.png', 'icon-48.png'];

async function runScenario(name, mutateSchedule, checks) {
    const extDir = mkdtempSync(join(tmpdir(), 'pens-ext-'));
    for (const f of FILES) cpSync(join(root, f), join(extDir, f));
    if (mutateSchedule) {
        const data = JSON.parse(readFileSync(join(extDir, 'schedule.json'), 'utf8'));
        mutateSchedule(data);
        writeFileSync(join(extDir, 'schedule.json'), JSON.stringify(data));
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            `--disable-extensions-except=${extDir}`,
            `--load-extension=${extDir}`,
        ],
    });
    try {
        // Wait for the extension's service worker, then talk to it directly.
        const swTarget = await browser.waitForTarget(
            t => t.type() === 'service_worker' && t.url().includes('background.js'),
            { timeout: 15000 });
        const sw = await swTarget.worker();
        const extId = new URL(swTarget.url()).host;

        // Give init a moment to set badge/alarms.
        await new Promise(r => setTimeout(r, 1500));
        const badge = await sw.evaluate(() => chrome.action.getBadgeText({}));
        const alarms = await sw.evaluate(() => chrome.alarms.getAll());

        // Open the popup page itself and check the rendered schedule.
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${extId}/popup.html`);
        await page.waitForFunction(() =>
            document.querySelectorAll('#upcoming_games tr, #previous_games tr').length > 80,
            { timeout: 5000 });
        const popup = await page.evaluate(() => ({
            rows: document.querySelectorAll('#upcoming_games tr, #previous_games tr').length,
            bodyMaxHeight: getComputedStyle(document.body).maxHeight,
            overflowY: getComputedStyle(document.body).overflowY,
        }));

        checks({ badge, alarms, popup });
        console.log(`e2e-chrome [${name}]: passed`);
    } finally {
        await browser.close();
        rmSync(extDir, { recursive: true, force: true });
    }
}

const schedule = JSON.parse(readFileSync(join(root, 'schedule.json'), 'utf8'));
const totalRows = schedule.games.length + 2; // 84 games + 2 header rows

await runScenario('real schedule', null, ({ badge, alarms, popup }) => {
    assert.strictEqual(popup.rows, totalRows, `popup should render ${totalRows} table rows`);
    assert.strictEqual(popup.bodyMaxHeight, '580px', 'popup body capped at 580px (Firefox sizing fix)');
    assert.strictEqual(popup.overflowY, 'auto', 'popup body scrolls when the schedule overflows');
    assert.strictEqual(badge, '', 'no badge outside game days');
    const names = alarms.map(a => a.name).sort();
    assert(names.includes('badge-refresh'), 'daily badge-refresh alarm scheduled');
    const gameAlarm = alarms.find(a => a.name.startsWith('game:'));
    const nextGame = schedule.games.find(g => Date.parse(g.startTimeUTC) - 15 * 60000 > Date.now());
    if (nextGame) {
        assert.strictEqual(gameAlarm.name, 'game:' + nextGame.id, 'alarm targets the next game');
        assert.strictEqual(gameAlarm.scheduledTime, Date.parse(nextGame.startTimeUTC) - 15 * 60000,
            'alarm fires 15 minutes before puck drop');
    } else {
        assert.strictEqual(gameAlarm, undefined, 'season over: no game alarm');
    }
});

await runScenario('fake game today', data => {
    const start = new Date(Date.now() + 30 * 60000);
    data.games[0].gameDate = start.getFullYear() + '-' +
        String(start.getMonth() + 1).padStart(2, '0') + '-' +
        String(start.getDate()).padStart(2, '0');
    data.games[0].startTimeUTC = start.toISOString();
}, ({ badge, alarms }) => {
    assert.strictEqual(badge, '•', 'gold badge dot on game day');
    const gameAlarm = alarms.find(a => a.name.startsWith('game:'));
    assert(gameAlarm, 'alarm scheduled for the fake game');
    assert(gameAlarm.scheduledTime > Date.now() && gameAlarm.scheduledTime < Date.now() + 16 * 60000,
        'alarm due within ~15 minutes');
});

console.log('e2e-chrome: all scenarios passed');
