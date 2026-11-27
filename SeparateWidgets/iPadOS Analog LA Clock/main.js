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
    
    var h, m, s;
    if (c.offset === null) {
        h = now.getHours();
        m = now.getMinutes();
        s = now.getSeconds();
    } else {
        var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        var targetDate = new Date(utc + (3600000 * c.offset));
        h = targetDate.getHours();
        m = targetDate.getMinutes();
        s = targetDate.getSeconds();
    }
    
    var secAngle = s * 6;
    var minAngle = (m + s / 60) * 6;
    var hourAngle = ((h % 12) + m / 60) * 30;
    
    var secEl = document.getElementById('sec-hand');
    var minEl = document.getElementById('min-hand');
    var hourEl = document.getElementById('hour-hand');
    var cityEl = document.getElementById('city-label');
    
    if (secEl) {
        secEl.style.transform = 'rotate(' + secAngle + 'deg)';
        secEl.style.webkitTransform = 'rotate(' + secAngle + 'deg)';
    }
    if (minEl) {
        minEl.style.transform = 'rotate(' + minAngle + 'deg)';
        minEl.style.webkitTransform = 'rotate(' + minAngle + 'deg)';
    }
    if (hourEl) {
        hourEl.style.transform = 'rotate(' + hourAngle + 'deg)';
        hourEl.style.webkitTransform = 'rotate(' + hourAngle + 'deg)';
    }
    if (cityEl) cityEl.textContent = c.name;
}

function cycleCity() {
    cityIdx = (cityIdx + 1) % cities.length;
    updateClock();
}

updateClock();
setInterval(updateClock, 1000);
