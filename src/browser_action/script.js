$(document).ready(function () {
    $.getJSON("schedule.json",
    function (json) {
        var tr;
        console.log(json);
        for (var i = 0; i < json.length; i++) {
            console.log("hello")
            tr = $('<tr/>');
            console.log(tr)
            tr.append("<td>" + json[i].day + "</td>");
            console.log(tr)
            tr.append("<td>" + json[i].date + "</td>");
            console.log(tr)
            tr.append("<td>" + json[i].time + "</td>");
            console.log(tr)
            tr.append("<td>" + json[i].opponent + "</td>");
            console.log(tr)
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