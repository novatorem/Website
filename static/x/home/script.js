function updateClock() {
    var now = new Date();
    hours = now.getHours();
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = now.getMinutes();
    if (minutes < 10) {
        time = hours + ':' + "0" + minutes;
    } else {
        time = hours + ':' + minutes;
    }
    if (hours < 10) {
        time = "0" + time;
    }
    document.getElementById('time').innerHTML = time;
    setTimeout(updateClock, 1000);
}

updateClock();