document.getElementById("jso").innerHtml = "test"

$(document).ready(function () {
    $.getJSON("schedule.json",
    function (json) {
        var tr;
        for (var i = 0; i < json.length; i++) {
            tr = $('<tr/>');
            tr.append("<td>" + json[i].date + "</td>");
            tr.append("<td>" + json[i].visitor + "</td>");
            tr.append("<td>" + json[i].home + "</td>");
            tr.append("<td>" + json[i].time + "</td>");
            tr.append("<td>" + json[i].channel + "</td>");
            $('table_schedule').append(tr);
        }
    });
});