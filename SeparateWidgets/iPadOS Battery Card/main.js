// Battery Card Widget - ES5
(function() {
    function initBattery() {
        if (navigator.getBattery) {
            navigator.getBattery().then(function(battery) {
                function update() {
                    var level = Math.round(battery.level * 100);
                    var p = document.getElementById('pct-ipad');
                    var r = document.getElementById('ring-ipad');
                    if (p) p.textContent = level + '%';
                    if (r) {
                        var circum = 113.1;
                        r.style.strokeDashoffset = circum - (circum * level / 100);
                    }
                }
                update();
                battery.addEventListener('levelchange', update);
            }).catch(function() {});
        }
    }
    window.addEventListener('load', initBattery);
})();
