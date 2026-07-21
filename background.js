const BADGE_ALARM = "badge-refresh";
const GAME_ALARM_PREFIX = "game:";
const NOTIFY_LEAD_MS = 15 * 60 * 1000;
const STALE_LIMIT_MS = 60 * 60 * 1000;

function loadSchedule() {
    return fetch(chrome.runtime.getURL("schedule.json"))
        .then(response => response.json());
}

function localDateString(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function updateBadge(data) {
    const today = localDateString(new Date());
    const isGameDay = data.games.some(game => game.gameDate === today);
    if (isGameDay) {
        chrome.action.setBadgeBackgroundColor({ color: "#FCB514" });
        chrome.action.setBadgeText({ text: "•" });
    } else {
        chrome.action.setBadgeText({ text: "" });
    }
}

function scheduleBadgeRefresh() {
    const nextMidnight = new Date();
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 1, 0, 0);
    chrome.alarms.create(BADGE_ALARM, {
        when: nextMidnight.getTime(),
        periodInMinutes: 1440
    });
}

function scheduleNextGameAlarm(data) {
    chrome.alarms.getAll(alarms => {
        for (const alarm of alarms) {
            if (alarm.name.startsWith(GAME_ALARM_PREFIX)) {
                chrome.alarms.clear(alarm.name);
            }
        }
        const now = Date.now();
        const nextGame = data.games.find(game =>
            Date.parse(game.startTimeUTC) - NOTIFY_LEAD_MS > now);
        if (nextGame) {
            chrome.alarms.create(GAME_ALARM_PREFIX + nextGame.id, {
                when: Date.parse(nextGame.startTimeUTC) - NOTIFY_LEAD_MS
            });
        }
    });
}

function notifyGameStart(game) {
    const home = game.homeTeam.abbrev === "PIT";
    const opponent = home ?
        "vs " + game.awayTeam.placeName.default :
        "at " + game.homeTeam.placeName.default;
    const startTime = new Date(game.startTimeUTC)
        .toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
    chrome.notifications.create("game-start-" + game.id, {
        type: "basic",
        iconUrl: "icon.png",
        title: "Penguins game starting soon",
        message: "Penguins " + opponent + " starts at " + startTime + ". Let's go Pens!"
    });
}

function init() {
    loadSchedule().then(data => {
        updateBadge(data);
        scheduleBadgeRefresh();
        scheduleNextGameAlarm(data);
    });
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

chrome.alarms.onAlarm.addListener(alarm => {
    loadSchedule().then(data => {
        updateBadge(data);
        if (alarm.name.startsWith(GAME_ALARM_PREFIX)) {
            const gameId = Number(alarm.name.slice(GAME_ALARM_PREFIX.length));
            const game = data.games.find(g => g.id === gameId);
            // A missed alarm can fire long after the fact (e.g. browser was
            // closed); only notify if the game started less than an hour ago.
            if (game && Date.now() < Date.parse(game.startTimeUTC) + STALE_LIMIT_MS) {
                notifyGameStart(game);
            }
            scheduleNextGameAlarm(data);
        }
    });
});
