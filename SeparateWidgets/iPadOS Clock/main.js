// iPadOS Analog Clock - ES5 Compatible
(function() {
    var hourHand = document.getElementById('clock-hour');
    var minHand = document.getElementById('clock-min');
    var secHand = document.getElementById('clock-sec');

    function updateClock() {
        var now = new Date();
        var sec = now.getSeconds();
        var min = now.getMinutes();
        var hour = now.getHours() % 12;

        var secDeg = sec * 6;
        var minDeg = (min * 6) + (sec * 0.1);
        var hourDeg = (hour * 30) + (min * 0.5);

        if (secHand) secHand.style.transform = 'rotate(' + secDeg + 'deg)';
        if (minHand) minHand.style.transform = 'rotate(' + minDeg + 'deg)';
        if (hourHand) hourHand.style.transform = 'rotate(' + hourDeg + 'deg)';
    }

    updateClock();
    setInterval(updateClock, 1000);
})();
