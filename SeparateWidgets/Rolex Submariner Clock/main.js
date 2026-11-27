(function() {
    var hourHand = document.getElementById('rolex-hour');
    var minuteHand = document.getElementById('rolex-minute');
    var secondHand = document.getElementById('rolex-second');
    var dateBox = document.getElementById('rolex-date-num');

    function updateRolex() {
        var now = new Date();
        var ms = now.getMilliseconds();
        var sec = now.getSeconds();
        var sFloat = sec + ms / 1000;
        var mFloat = now.getMinutes() + sFloat / 60;
        var hFloat = (now.getHours() % 12) + mFloat / 60;

        var sAngle = sFloat * 6;
        var mAngle = mFloat * 6;
        var hAngle = hFloat * 30;

        if (hourHand) {
            hourHand.setAttribute('transform', 'rotate(' + hAngle + ' 120 120)');
        }
        if (minuteHand) {
            minuteHand.setAttribute('transform', 'rotate(' + mAngle + ' 120 120)');
        }
        if (secondHand) {
            secondHand.setAttribute('transform', 'rotate(' + sAngle + ' 120 120)');
        }
        if (dateBox) {
            dateBox.textContent = now.getDate();
        }

        if (window.requestAnimationFrame) {
            requestAnimationFrame(updateRolex);
        } else {
            setTimeout(updateRolex, 50);
        }
    }

    updateRolex();
})();
