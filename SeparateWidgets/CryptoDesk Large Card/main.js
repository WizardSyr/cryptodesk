// CryptoDesk Large Card - Live Binance Trades & PnL Card (iOS 9 ES5 Compatible)
(function() {
    var apiKey = localStorage.getItem('binance_apikey') || localStorage.getItem('binance_user_apikey') || '';
    var secretKey = localStorage.getItem('binance_secret') || localStorage.getItem('binance_user_secret') || '';
    var username = localStorage.getItem('pnl_username') || 'IceWizard101';
    var referralCode = localStorage.getItem('pnl_referral') || '792542923';
    var currentCoin = localStorage.getItem('cryptodesk_coin') || 'BTC';
    var activeTab = 'trades'; // 'trades' or 'market'
    var timeOffset = 0;
    var currentTrades = [];

    // Elements
    var tabTrades = document.getElementById('tab-btn-trades');
    var tabMarket = document.getElementById('tab-btn-market');
    var viewTrades = document.getElementById('view-trades');
    var viewMarket = document.getElementById('view-market');

    var tradesContainer = document.getElementById('trades-container');
    var tradesCount = document.getElementById('trades-count');
    var sumPnlVal = document.getElementById('sum-pnl-val');
    var sumRoiVal = document.getElementById('sum-roi-val');
    var syncDot = document.getElementById('sync-dot');

    var modalPnl = document.getElementById('modal-pnl');
    var btnClosePnl = document.getElementById('btn-close-pnl');
    var pnlUser = document.getElementById('pnl-user');
    var pnlDate = document.getElementById('pnl-date');
    var pnlPair = document.getElementById('pnl-pair');
    var pnlSide = document.getElementById('pnl-side');
    var pnlLev = document.getElementById('pnl-lev');
    var pnlAmount = document.getElementById('pnl-amount');
    var pnlPct = document.getElementById('pnl-pct');
    var pnlEntry = document.getElementById('pnl-entry');
    var pnlExit = document.getElementById('pnl-exit');
    var pnlRef = document.getElementById('pnl-ref');

    var modalSettings = document.getElementById('modal-settings');
    var btnOpenSettings = document.getElementById('btn-open-settings');
    var btnCloseSettings = document.getElementById('btn-close-settings');
    var btnSaveKeys = document.getElementById('btn-save-keys');
    var btnDemoKeys = document.getElementById('btn-demo-keys');
    var inputApiKey = document.getElementById('input-api-key');
    var inputSecretKey = document.getElementById('input-secret-key');
    var inputUsername = document.getElementById('input-username');
    var inputReferral = document.getElementById('input-referral');

    // Tab Switching
    if (tabTrades) {
        tabTrades.addEventListener('click', function() {
            activeTab = 'trades';
            tabTrades.className = 'nav-tab active';
            tabMarket.className = 'nav-tab';
            viewTrades.className = 'view-panel active';
            viewMarket.className = 'view-panel';
        });
    }
    if (tabMarket) {
        tabMarket.addEventListener('click', function() {
            activeTab = 'market';
            tabMarket.className = 'nav-tab active';
            tabTrades.className = 'nav-tab';
            viewMarket.className = 'view-panel active';
            viewTrades.className = 'view-panel';
            drawChart();
        });
    }

    // Modal Settings Controls
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', function() {
            if (inputApiKey) inputApiKey.value = apiKey;
            if (inputSecretKey) inputSecretKey.value = secretKey;
            if (inputUsername) inputUsername.value = username;
            if (inputReferral) inputReferral.value = referralCode;
            modalSettings.className = 'modal-overlay open';
        });
    }
    if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', function() {
            modalSettings.className = 'modal-overlay';
        });
    }
    if (btnSaveKeys) {
        btnSaveKeys.addEventListener('click', function() {
            apiKey = (inputApiKey.value || '').trim();
            secretKey = (inputSecretKey.value || '').trim();
            username = (inputUsername.value || '').trim() || 'IceWizard101';
            referralCode = (inputReferral.value || '').trim() || '792542923';

            localStorage.setItem('binance_apikey', apiKey);
            localStorage.setItem('binance_secret', secretKey);
            localStorage.setItem('pnl_username', username);
            localStorage.setItem('pnl_referral', referralCode);

            modalSettings.className = 'modal-overlay';
            syncTrades();
        });
    }
    if (btnDemoKeys) {
        btnDemoKeys.addEventListener('click', function() {
            apiKey = '';
            secretKey = '';
            localStorage.removeItem('binance_apikey');
            localStorage.removeItem('binance_secret');
            modalSettings.className = 'modal-overlay';
            renderDemoTrade();
        });
    }

    // Coin selection chips
    var chips = document.querySelectorAll('.chip');
    for (var c = 0; c < chips.length; c++) {
        (function(chip) {
            chip.addEventListener('click', function() {
                currentCoin = chip.getAttribute('data-coin');
                localStorage.setItem('cryptodesk_coin', currentCoin);
                for (var j = 0; j < chips.length; j++) chips[j].className = 'chip';
                chip.className = 'chip active';
                fetchCoinData();
            });
        })(chips[c]);
    }

    // Close PnL Modal
    if (btnClosePnl) {
        btnClosePnl.addEventListener('click', function() {
            modalPnl.className = 'pnl-card-modal';
        });
    }

    // Open PnL Card for Trade
    function openPnl(t) {
        if (!t) return;
        var now = new Date();
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var hr = now.getHours();
        var mn = now.getMinutes();
        var dateStr = y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + (hr < 10 ? '0' + hr : hr) + ':' + (mn < 10 ? '0' + mn : mn);

        if (pnlUser) pnlUser.textContent = username;
        if (pnlDate) pnlDate.textContent = dateStr;
        if (pnlPair) pnlPair.textContent = t.symbol + ' Perpetual';
        if (pnlRef) pnlRef.textContent = referralCode;

        if (pnlSide) {
            pnlSide.textContent = t.side;
            pnlSide.className = t.side === 'Short' ? 'pnl-side-tag side-short' : 'pnl-side-tag side-long';
        }
        if (pnlLev) pnlLev.textContent = t.leverage + 'x';

        var pnlVal = parseFloat(t.pnl);
        var isPos = pnlVal >= 0;
        var sign = isPos ? '+' : '';

        if (pnlAmount) {
            pnlAmount.innerHTML = Math.abs(pnlVal).toFixed(2) + ' <span class="pnl-unit">USDT</span>';
            pnlAmount.className = isPos ? 'pnl-giant-val' : 'pnl-giant-val pnl-val-red';
        }
        if (pnlPct) {
            pnlPct.textContent = sign + parseFloat(t.pnlPct).toFixed(2) + '%';
            pnlPct.className = isPos ? 'pnl-giant-pct' : 'pnl-giant-pct pnl-val-red';
        }

        if (pnlEntry) pnlEntry.textContent = t.entryPrice;
        if (pnlExit) pnlExit.textContent = t.markPrice;

        modalPnl.className = 'pnl-card-modal open';
    }

    // Time Sync
    function syncTime(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://fapi.binance.com/fapi/v1/time', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    timeOffset = data.serverTime - Date.now();
                } catch(e) {}
            }
            if (xhr.readyState === 4 && callback) callback();
        };
        xhr.send();
    }

    // HMAC SHA256 Signature
    function sign(queryStr, secret) {
        if (typeof CryptoJS !== 'undefined') {
            return CryptoJS.HmacSHA256(queryStr, secret).toString(CryptoJS.enc.Hex);
        }
        return '';
    }

    // Fetch and Sync Binance Futures Trades
    function syncTrades() {
        if (!apiKey || !secretKey) {
            renderDemoTrade();
            return;
        }

        if (syncDot) syncDot.className = 'sync-dot';

        syncTime(function() {
            var ts = Date.now() + timeOffset;
            var query = 'recvWindow=60000&timestamp=' + ts;
            var sig = sign(query, secretKey);
            var url = 'https://fapi.binance.com/fapi/v2/positionRisk?' + query + '&signature=' + sig;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('X-MBX-APIKEY', apiKey);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var positions = JSON.parse(xhr.responseText);
                            var active = [];
                            var totalPnl = 0;

                            for (var i = 0; i < positions.length; i++) {
                                var pos = positions[i];
                                var amt = parseFloat(pos.positionAmt);
                                if (amt !== 0) {
                                    var isShort = amt < 0;
                                    var mark = parseFloat(pos.markPrice);
                                    var entry = parseFloat(pos.entryPrice);
                                    var sizeUsdt = Math.abs(amt * mark);
                                    var lev = parseInt(pos.leverage) || 1;
                                    var margin = sizeUsdt / lev;
                                    var pnl = parseFloat(pos.unRealizedProfit);
                                    var pnlPct = margin > 0 ? (pnl / margin) * 100 : 0;

                                    totalPnl += pnl;

                                    active.push({
                                        symbol: pos.symbol,
                                        side: isShort ? 'Short' : 'Long',
                                        leverage: lev,
                                        size: sizeUsdt.toFixed(2),
                                        entryPrice: entry.toFixed(4),
                                        markPrice: mark.toFixed(4),
                                        liqPrice: parseFloat(pos.liquidationPrice).toFixed(4),
                                        margin: margin.toFixed(2),
                                        pnl: pnl.toFixed(2),
                                        pnlPct: pnlPct.toFixed(2)
                                    });
                                }
                            }

                            currentTrades = active;
                            renderTrades(active, totalPnl);
                            if (syncDot) syncDot.className = 'sync-dot live';
                        } catch(e) {
                            renderDemoTrade();
                        }
                    } else {
                        renderDemoTrade();
                    }
                }
            };
            xhr.send();
        });
    }

    // Render Trades DOM
    function renderTrades(trades, totalPnl) {
        if (!tradesContainer) return;
        if (tradesCount) tradesCount.textContent = trades.length;

        var isPos = totalPnl >= 0;
        var pnlSign = isPos ? '+' : '';
        if (sumPnlVal) {
            sumPnlVal.textContent = pnlSign + '$' + totalPnl.toFixed(2) + ' USDT';
            sumPnlVal.className = isPos ? 'pnl-sum-green' : 'pnl-sum-red';
        }

        if (trades.length === 0) {
            tradesContainer.innerHTML = '<div style="text-align:center;padding:24px 8px;font-size:10px;color:#64748b;">No Open Positions on Binance Futures</div>';
            return;
        }

        tradesContainer.innerHTML = '';
        for (var i = 0; i < trades.length; i++) {
            (function(t) {
                var isShort = t.side === 'Short';
                var isTradePos = parseFloat(t.pnl) >= 0;
                var sideCls = isShort ? 't-side-short' : 't-side-long';
                var barCls = isShort ? 'bar-short' : 'bar-long';
                var pnlCls = isTradePos ? 'pnl-green' : 'pnl-red';
                var sign = isTradePos ? '+' : '';

                var row = document.createElement('div');
                row.className = 'trade-card-row';
                row.innerHTML =
                    '<div class="trade-bar ' + barCls + '"></div>' +
                    '<div class="trade-r1">' +
                        '<div class="trade-pair-tag">' +
                            '<span class="t-symbol">' + t.symbol + '</span>' +
                            '<span class="t-tag">Perp</span>' +
                            '<span class="t-tag ' + sideCls + '">' + t.side + ' ' + t.leverage + 'x</span>' +
                        '</div>' +
                        '<div class="t-pnl-wrap ' + pnlCls + '">' +
                            '<span>' + sign + t.pnl + ' USDT</span>' +
                            '<span class="t-roi-sub">(' + sign + t.pnlPct + '%)</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="trade-r2">' +
                        '<div class="r2-col"><span class="r2-lbl">Size</span><span class="r2-val">' + t.size + ' USDT</span></div>' +
                        '<div class="r2-col"><span class="r2-lbl">Entry</span><span class="r2-val">' + t.entryPrice + '</span></div>' +
                        '<div class="r2-col"><span class="r2-lbl">Mark</span><span class="r2-val">' + t.markPrice + '</span></div>' +
                        '<div class="r2-col"><span class="r2-lbl">Liq</span><span class="r2-val val-liq">' + t.liqPrice + '</span></div>' +
                    '</div>';

                row.addEventListener('click', function() {
                    openPnl(t);
                });

                tradesContainer.appendChild(row);
            })(trades[i]);
        }
    }

    // Default Demo Trade (Exact data from user's uploaded images)
    function renderDemoTrade() {
        var demo = [{
            symbol: 'LINKUSDT',
            side: 'Short',
            leverage: 15,
            size: '101.20',
            entryPrice: '9.444',
            markPrice: '9.342',
            liqPrice: '8.387',
            margin: '6.74',
            pnl: '0.97',
            pnlPct: '14.71'
        }];
        currentTrades = demo;
        renderTrades(demo, 0.97);
        if (syncDot) syncDot.className = 'sync-dot live';
    }

    // Market View Chart
    var chartPoints = [89000, 89400, 88800, 90200, 90800, 90100, 91500, 91200, 91800, 91091];
    var isPositive = true;
    var coinIcons = { 'BTC': '₿', 'ETH': 'Ξ', 'SOL': '◎', 'LINK': '🔗', 'DOGE': 'Ð', 'XRP': '✕' };

    function drawChart() {
        var canvas = document.getElementById('crypto-large-chart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var dpr = window.devicePixelRatio || 1;
        var width = 248;
        var height = 90;

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
            return height - ((val - minVal) / (maxVal - minVal)) * (height - 18) - 9;
        }

        var lineColor = isPositive ? '#00c087' : '#f6465d';
        var grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, isPositive ? 'rgba(0, 192, 135, 0.4)' : 'rgba(246, 70, 93, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

        ctx.beginPath();
        ctx.moveTo(0, getY(chartPoints[0]));
        for (var i = 1; i < chartPoints.length; i++) {
            var px = (i - 1) * stepX;
            var py = getY(chartPoints[i - 1]);
            var cx = i * stepX;
            var cy = getY(chartPoints[i]);
            ctx.quadraticCurveTo(px, py, (px + cx) / 2, (py + cy) / 2);
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
            ctx.quadraticCurveTo(pxx, pyy, (pxx + cxx) / 2, (pyy + cyy) / 2);
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
                    isPositive = change >= 0;

                    var priceEl = document.getElementById('coin-price');
                    var changeEl = document.getElementById('coin-change');
                    var highEl = document.getElementById('stat-high');
                    var lowEl = document.getElementById('stat-low');
                    var volEl = document.getElementById('stat-vol');

                    if (priceEl) priceEl.textContent = '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    if (changeEl) {
                        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
                        changeEl.className = change >= 0 ? 'change-pill' : 'change-pill down';
                    }
                    if (highEl) highEl.textContent = '$' + parseFloat(data.highPrice).toLocaleString('en-US');
                    if (lowEl) lowEl.textContent = '$' + parseFloat(data.lowPrice).toLocaleString('en-US');
                    if (volEl) volEl.textContent = (parseFloat(data.volume) / 1000).toFixed(1) + 'K';

                    drawChart();
                } catch(e) {}
            }
        };
        xhr.send();
    }

    // Init
    syncTrades();
    fetchCoinData();
    setInterval(syncTrades, 10000);
})();
