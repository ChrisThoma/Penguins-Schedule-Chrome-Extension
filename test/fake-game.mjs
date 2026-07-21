// Toggle a fake near-future game so the badge and notification can be seen
// live in a real browser.
//
//   node test/fake-game.mjs on    -> backs up schedule.json, makes game 1
//                                    today with puck drop 17 minutes from now
//                                    (notification due in ~2 minutes)
//   node test/fake-game.mjs off   -> restores the real schedule.json
//
// After "on", load/reload the extension in the browser, watch for the gold
// badge immediately and the notification ~2 minutes later, then run "off"
// and reload again.
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schedulePath = join(root, 'schedule.json');
const backupPath = join(root, 'schedule.json.bak');
const mode = process.argv[2];

if (mode === 'on') {
    if (!existsSync(backupPath)) copyFileSync(schedulePath, backupPath);
    const data = JSON.parse(readFileSync(backupPath, 'utf8'));
    const start = new Date(Date.now() + 17 * 60 * 1000);
    const today = start.getFullYear() + '-' +
        String(start.getMonth() + 1).padStart(2, '0') + '-' +
        String(start.getDate()).padStart(2, '0');
    data.games[0].gameDate = today;
    data.games[0].startTimeUTC = start.toISOString().replace(/\.\d+Z$/, 'Z');
    writeFileSync(schedulePath, JSON.stringify(data));
    console.log(`Fake game ON: today (${today}), puck drop ${start.toLocaleTimeString()}.`);
    console.log('Reload the extension now — badge should appear immediately,');
    console.log('notification in ~2 minutes. Restore with: node test/fake-game.mjs off');
} else if (mode === 'off') {
    if (!existsSync(backupPath)) {
        console.error('No backup found — schedule.json is already the real one.');
        process.exit(1);
    }
    copyFileSync(backupPath, schedulePath);
    unlinkSync(backupPath);
    console.log('Real schedule.json restored.');
} else {
    console.error('Usage: node test/fake-game.mjs on|off');
    process.exit(1);
}
