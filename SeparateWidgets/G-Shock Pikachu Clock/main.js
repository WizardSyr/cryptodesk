(function() {
    var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    var elH = document.getElementById('lcd-h');
    var elM = document.getElementById('lcd-m');
    var elS = document.getElementById('lcd-s');
    var elDay = document.getElementById('lcd-day');
    var elDate = document.getElementById('lcd-date');
    var lcd = document.getElementById('pika-lcd');
    var widget = document.getElementById('pika-touch');

    function updatePikachu() {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();
        var hs = h < 10 ? '0' + h : h;
        var ms = m < 10 ? '0' + m : m;
        var ss = s < 10 ? '0' + s : s;

        var month = now.getMonth() + 1;
        var date = now.getDate();
        var monthStr = month < 10 ? '0' + month : month;
        var dateStr = date < 10 ? '0' + date : date;

        if (elH) elH.textContent = hs;
        if (elM) elM.textContent = ms;
        if (elS) elS.textContent = ss;
        if (elDay) elDay.textContent = days[now.getDay()];
        if (elDate) elDate.textContent = monthStr + '-' + dateStr;
    }

    setInterval(updatePikachu, 1000);
    updatePikachu();

    // Tap to toggle Thunderbolt Backlight
    if (widget) {
        widget.addEventListener('click', function() {
            if (lcd) {
                if (lcd.className.indexOf('el-on') === -1) {
                    lcd.className += ' el-on';
                } else {
                    lcd.className = lcd.className.replace(' el-on', '');
                }
            }
        });
    }
})();
