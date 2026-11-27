// CryptoDesk Card Widget - Interactive Coin Selection & Settings
(function() {
    function safeGet(k, def) {
        try { return localStorage.getItem(k) || def; } catch(e) { return def; }
    }
    function safeSet(k, v) {
        try { localStorage.setItem(k, v); } catch(e) {}
    }
    var currentCoin = safeGet('cryptodesk_coin', 'BTC');
    var chartPoints = [90000, 90500, 89800, 91200, 91000, 91500, 91091];
    var isPositive = true;

    var coinIcons = {
        'BTC': '₿',
        'ETH': 'Ξ',
        'SOL': '◎',
        'DOGE': 'Ð',
        'XRP': '✕',
        'BNB': '🟡',
        'ADA': '₳'
    };

    function drawChart() {
        var canvas = document.getElementById('crypto-chart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var dpr = window.devicePixelRatio || 1;
        var rect = canvas.getBoundingClientRect();
        var width = rect.width || 272;
        var height = rect.height || 56;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        var minVal = chartPoints[0];
        var maxVal = chartPoints[0];
        for (var k = 1; k < chartPoints.length; k++) {
            if (chartPoints[k] < minVal) minVal = chartPoints[k];
            if (chartPoints[k] > maxVal) maxVal = chartPoints[k];
        }
        if (minVal === maxVal) { maxVal += 1; minVal -= 1; }

        var stepX = width / (chartPoints.length - 1);
        function getY(val) {
            return height - ((val - minVal) / (maxVal - minVal)) * (height - 12) - 6;
        }

        var lineColor = isPositive ? '#34c759' : '#ff3b30';
        var gradStart = isPositive ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 59, 48, 0.4)';
        var gradEnd = isPositive ? 'rgba(52, 199, 89, 0.0)' : 'rgba(255, 59, 48, 0.0)';

        var grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, gradStart);
        grad.addColorStop(1, gradEnd);

        ctx.beginPath();
        ctx.moveTo(0, getY(chartPoints[0]));
        for (var i = 1; i < chartPoints.length; i++) {
            var px = (i - 1) * stepX;
            var py = getY(chartPoints[i - 1]);
            var cx = i * stepX;
            var cy = getY(chartPoints[i]);
            var mx = (px + cx) / 2;
            ctx.quadraticCurveTo(px, py, mx, (py + cy) / 2);
        }
        ctx.lineTo(width, getY(chartPoints[chartPoints.length - 1]));
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, getY(chartPoints[0]));
        for (var j = 1; j < chartPoints.length; j++) {
            var pxx = (j - 1) * stepX;
            var pyy = getY(chartPoints[j - 1]);
            var cxx = j * stepX;
            var cyy = getY(chartPoints[j]);
            var mxx = (pxx + cxx) / 2;
            ctx.quadraticCurveTo(pxx, pyy, mxx, (pyy + cyy) / 2);
        }
        ctx.lineTo(width, getY(chartPoints[chartPoints.length - 1]));
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.2;
        ctx.stroke();
    }

    function fetchCoinData() {
        var symbol = currentCoin.toUpperCase().trim();
        var pair = symbol + 'USDT';
        
        var titleEl = document.getElementById('coin-title');
        var iconEl = document.getElementById('coin-icon');
        if (titleEl) titleEl.textContent = symbol + ' / USDT';
        if (iconEl) iconEl.textContent = coinIcons[symbol] || '🪙';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.binance.com/api/v3/ticker/24hr?symbol=' + pair, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var price = parseFloat(data.lastPrice);
                    var change = parseFloat(data.priceChangePercent);
                    var pEl = document.getElementById('coin-price');
                    var cEl = document.getElementById('coin-change');

                    if (pEl) {
                        var decimals = price >= 1 ? 2 : (price >= 0.001 ? 4 : 6);
                        pEl.textContent = '$' + price.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
                    }
                    if (cEl) {
                        isPositive = change >= 0;
                        cEl.textContent = (isPositive ? '+' : '') + change.toFixed(2) + '%';
                        cEl.className = 'crypto-change' + (isPositive ? '' : ' down');
                    }
                    chartPoints.push(price);
                    if (chartPoints.length > 20) chartPoints.shift();
                    drawChart();
                } catch(e) {}
            }
        };
        xhr.send();
    }

    function fetchFearGreed() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.alternative.me/fng/?limit=1', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var res = JSON.parse(xhr.responseText);
                    var item = res.data[0];
                    var badge = document.getElementById('fg-badge');
                    if (badge) {
                        badge.textContent = item.value + ' ' + item.value_classification;
                    }
                } catch(e) {}
            }
        };
        xhr.send();
    }

    // Modal UI handling
    function setupModal() {
        var modal = document.getElementById('settings-modal');
        var btnOpen = document.getElementById('btn-open-settings');
        var btnClose = document.getElementById('btn-close-modal');
        var btnCancel = document.getElementById('btn-cancel');
        var btnSave = document.getElementById('btn-save');
        var inputCoin = document.getElementById('input-coin');
        var chips = document.querySelectorAll('.chip');

        function openModal() {
            if (inputCoin) inputCoin.value = currentCoin;
            if (modal) modal.className = 'settings-overlay active';
        }
        function closeModal() {
            if (modal) modal.className = 'settings-overlay';
        }

        if (btnOpen) btnOpen.onclick = openModal;
        if (btnClose) btnClose.onclick = closeModal;
        if (btnCancel) btnCancel.onclick = closeModal;

        for (var i = 0; i < chips.length; i++) {
            chips[i].onclick = function() {
                var c = this.getAttribute('data-coin');
                if (inputCoin) inputCoin.value = c;
            };
        }

        if (btnSave) {
            btnSave.onclick = function() {
                var val = (inputCoin.value || '').toUpperCase().trim();
                if (val) {
                    currentCoin = val;
                    safeSet('cryptodesk_coin', currentCoin);
                    fetchCoinData();
                }
                closeModal();
            };
        }
    }

    window.addEventListener('load', function() {
        drawChart();
        fetchCoinData();
        fetchFearGreed();
        setupModal();
        setInterval(fetchCoinData, 15000);
    });

    window.addEventListener('resize', drawChart);
})();
