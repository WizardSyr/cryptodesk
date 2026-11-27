var cities = [
    { name: 'LA', offset: -8 },
    { name: 'NYC', offset: -5 },
    { name: 'LON', offset: 0 },
    { name: 'TYO', offset: 9 },
    { name: 'LOCAL', offset: null }
];
var cityIdx = 0;

function updateClock() {
    var now = new Date();
    var c = cities[cityIdx];
    
    var h, m, s, ms;
    if (c.offset === null) {
        h = now.getHours();
        m = now.getMinutes();
        s = now.getSeconds();
        ms = now.getMilliseconds();
    } else {
        var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        var targetDate = new Date(utc + (3600000 * c.offset));
        h = targetDate.getHours();
        m = targetDate.getMinutes();
        s = targetDate.getSeconds();
        ms = targetDate.getMilliseconds();
    }
    
    var secAngle = (s + ms / 1000) * 6;
    var minAngle = (m + s / 60) * 6;
    var hourAngle = ((h % 12) + m / 60) * 30;
    
    document.getElementById('sec-hand').style.transform = 'rotate(' + secAngle + 'deg)';
    document.getElementById('min-hand').style.transform = 'rotate(' + minAngle + 'deg)';
    document.getElementById('hour-hand').style.transform = 'rotate(' + hourAngle + 'deg)';
    
    document.getElementById('city-label').textContent = c.name;
    
    requestAnimationFrame(updateClock);
}

function cycleCity() {
    cityIdx = (cityIdx + 1) % cities.length;
}

requestAnimationFrame(updateClock);
