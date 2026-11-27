(function() {
    // Sharingan Eye Forms Roster
    var forms = [
        { id: 'classic', name: '3-Tomoe', tag: '写輪眼 • Insight' },
        { id: 'itachi', name: 'Itachi Mangekyō', tag: '天照 • Tsukuyomi' },
        { id: 'kamui', name: 'Kamui', tag: '神威 • Warp' },
        { id: 'sasuke', name: 'Sasuke EMS', tag: '永遠の万華鏡' },
        { id: 'shisui', name: 'Shisui', tag: '別天神 • Mind' },
        { id: 'madara', name: 'Madara EMS', tag: '斑 • Susanoo' }
    ];

    var speeds = ['8s', '4s', '1.8s', '0.6s'];
    var currentFormIdx = 0;
    var currentSpeedIdx = 1; // 4s
    var isSurging = false;

    var rollingGroup = document.getElementById('rolling-group');
    var eyeSvg = document.getElementById('eye-svg');
    var hudClock = document.getElementById('hud-clock');
    var hudTag = document.getElementById('hud-tag');
    var widget = document.getElementById('widget-touch-area');

    // Live Clock Update
    function updateClock() {
        if (!hudClock) return;
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        var hs = h < 10 ? '0' + h : h;
        var ms = m < 10 ? '0' + m : m;
        var ss = s < 10 ? '0' + s : s;
        hudClock.textContent = hs + ':' + ms + ':' + ss;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Switch Sharingan Form
    function setForm(idx) {
        currentFormIdx = idx % forms.length;
        var target = forms[currentFormIdx];

        // Hide all patterns
        for (var i = 0; i < forms.length; i++) {
            var el = document.getElementById('pattern-' + forms[i].id);
            if (el) el.style.display = 'none';
        }

        // Show active pattern
        var activeEl = document.getElementById('pattern-' + target.id);
        if (activeEl) activeEl.style.display = 'block';

        if (hudTag) hudTag.textContent = target.name;
        triggerSurge();
    }

    // Temporary surge acceleration & eye flash
    function triggerSurge() {
        if (isSurging) return;
        isSurging = true;

        if (eyeSvg) {
            eyeSvg.className.baseVal = 'eye-svg flashing';
        }
        if (rollingGroup) {
            rollingGroup.style.webkitAnimationDuration = '0.35s';
            rollingGroup.style.animationDuration = '0.35s';
        }

        setTimeout(function() {
            if (eyeSvg) {
                eyeSvg.className.baseVal = 'eye-svg';
            }
            if (rollingGroup) {
                rollingGroup.style.webkitAnimationDuration = speeds[currentSpeedIdx];
                rollingGroup.style.animationDuration = speeds[currentSpeedIdx];
            }
            isSurging = false;
        }, 1200);
    }

    // Touch / Click Handler
    // Single tap: cycle form
    // Long press or double tap: change speed
    var lastTap = 0;
    if (widget) {
        widget.addEventListener('click', function(e) {
            var now = new Date().getTime();
            var diff = now - lastTap;
            if (diff < 350) {
                // Double Tap: Change speed
                currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
                if (rollingGroup) {
                    rollingGroup.style.webkitAnimationDuration = speeds[currentSpeedIdx];
                    rollingGroup.style.animationDuration = speeds[currentSpeedIdx];
                }
            } else {
                // Single Tap: Next Form
                setForm(currentFormIdx + 1);
            }
            lastTap = now;
        });
    }

    // Init first form
    setForm(0);
})();
