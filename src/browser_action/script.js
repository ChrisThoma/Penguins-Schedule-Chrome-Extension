$(document).ready(function () {
    $.getJSON("schedule.json",
    function (json) {
        var tr;
        for (var i = 0; i < json.length; i++) {
            tr = $('<tr/>');
            tr.append("<td>" + json[i].date + "</td>");
            tr.append("<td>" + json[i].visitor + "</td>");
            tr.append("<td>" + json[i].home + "</td>");
            tr.append("<td>" + json[i].gametime + "</td>");
            tr.append("<td>" + json[i].channel + "</td>");
            yesterday = new Date;
            yesterday.setDate(yesterday.getDate() - 1)
            if (new Date(json[i].date) < yesterday) {
                $('#oldgames').append(tr);
            } else {
                $('#schedule').append(tr);
            }
        }
    });

});

function sortByDate(a, b) {
    var bkg = chrome.extension.getBackgroundPage();
    bkg.console.log(a.date);
    bkg.console.log(new Date(a.date) < new Date.setDate())
    if (new Date(a.date) > new Date) {
        return -1;
    } else {
        return 1;
    }
}