var yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate()-1);
const yesterday =  new Date(yesterdayDate.toString().substring(0, 15));

const upcomingGames = document.getElementById('upcoming_games');

const pastGames = document.getElementById('previous_games');

function createUpcomingGamesTable(data) {
    for (let game of data.games) {
        let dateObj = Date.parse(game.gameDate);
        if (isDateBeforeToday(dateObj)) {
            addDateToTable(game, pastGames);
        } else {
            addDateToTable(game, upcomingGames);
        }
    }
}

function addDateToTable(gameInfo, table) {
    var row = table.insertRow();
    let gameDate = new Date(gameInfo.startTimeUTC);
    var dateCell = row.insertCell();
    var timeCell = row.insertCell();
    var homeCell = row.insertCell();
    var awayCell = row.insertCell();

    dateCell.innerHTML = gameDate.toLocaleString('default', { month: 'long' }) + " " +
        gameDate.toLocaleString('default', { day: 'numeric' });
    timeCell.innerHTML = gameDate.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    homeCell.innerHTML = gameInfo.homeTeam.placeName.default;
    awayCell.innerHTML = gameInfo.awayTeam.placeName.default
}

function isDateBeforeToday(date) {
    return date < yesterday;
}

fetch("./schedule.json")
    .then(Response => {
        return Response.json();
    }).then(data => {
        createUpcomingGamesTable(data);
    });

// https://api-web.nhle.com/v1/club-schedule-season/pit/20242025