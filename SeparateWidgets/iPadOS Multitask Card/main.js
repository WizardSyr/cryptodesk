(function() {
    var apps = [
        { name: 'Safari', icon: '🧭', title: 'Apple Official', sub: 'iPadOS Multi-Window' },
        { name: 'CryptoDesk', icon: '📈', title: 'BTC: $98,420', sub: 'SOL: $242.80 (+4.2%)' },
        { name: 'TikTak+', icon: '🎵', title: 'Viral Video', sub: '142K Likes • FYP' },
        { name: 'Music', icon: '💿', title: 'Starboy', sub: 'The Weeknd • Playing' },
        { name: 'Messages', icon: '💬', title: '3 Unread', sub: 'Alex: Check this out!' }
    ];

    var appLeftIdx = 0;
    var appRightIdx = 1;

    var leftWin = document.getElementById('win-left');
    var rightWin = document.getElementById('win-right');

    var lIcon = document.getElementById('l-icon');
    var lName = document.getElementById('l-name');
    var lTitle = document.getElementById('l-title');
    var lSub = document.getElementById('l-sub');

    var rIcon = document.getElementById('r-icon');
    var rName = document.getElementById('r-name');
    var rTitle = document.getElementById('r-title');
    var rSub = document.getElementById('r-sub');

    function updateApps() {
        var al = apps[appLeftIdx];
        var ar = apps[appRightIdx];

        if (lIcon) lIcon.textContent = al.icon;
        if (lName) lName.textContent = al.name;
        if (lTitle) lTitle.textContent = al.title;
        if (lSub) lSub.textContent = al.sub;

        if (rIcon) rIcon.textContent = ar.icon;
        if (rName) rName.textContent = ar.name;
        if (rTitle) rTitle.textContent = ar.title;
        if (rSub) rSub.textContent = ar.sub;
    }

    if (leftWin) {
        leftWin.addEventListener('click', function() {
            appLeftIdx = (appLeftIdx + 1) % apps.length;
            if (appLeftIdx === appRightIdx) appLeftIdx = (appLeftIdx + 1) % apps.length;
            updateApps();
        });
    }

    if (rightWin) {
        rightWin.addEventListener('click', function() {
            appRightIdx = (appRightIdx + 1) % apps.length;
            if (appRightIdx === appLeftIdx) appRightIdx = (appRightIdx + 1) % apps.length;
            updateApps();
        });
    }

    // Dock icons click
    var dockItems = document.querySelectorAll('.dock-item');
    for (var i = 0; i < dockItems.length; i++) {
        (function(idx) {
            dockItems[idx].addEventListener('click', function() {
                appRightIdx = idx % apps.length;
                updateApps();
            });
        })(i);
    }

    updateApps();
})();
