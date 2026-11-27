// CryptoDesk Large Card - Pure Live Market Watchlist (iOS 9 ES5)
(function() {
    var coinSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT'];
    var coinKeys = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP'];
    
    var coinStats = {
        'BTC': { name: 'Bitcoin', price: 59860.20, change: -1.67, high: 62248, low: 58792 },
        'ETH': { name: 'Ethereum', price: 1666.40, change: -2.38, high: 1755, low: 1634 },
        'SOL': { name: 'Solana', price: 71.99, change: 0.46, high: 73.9, low: 70.1 },
        'BNB': { name: 'BNB Chain', price: 553.75, change: -0.50, high: 568, low: 542 },
        'DOGE': { name: 'Dogecoin', price: 0.0577, change: 1.28, high: 0.059, low: 0.056 },
        'XRP': { name: 'Ripple', price: 0.9500, change: -0.38, high: 0.987, low: 0.931 }
    };
    
    var selectedIdx = 0;

    function formatPrice(p) {
        if (p >= 1000) {
            return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (p >= 1) {
            return '$' + p.toFixed(2);
        } else {
            return '$' + p.toFixed(4);
        }
    }

    function updateUI() {
        for (var i = 0; i < coinKeys.length; i++) {
            var k = coinKeys[i];
            var item = coinStats[k];
            var pEl = document.getElementById('price-' + k);
            var cEl = document.getElementById('change-' + k);
            var rowEl = document.getElementById('row-' + k);
            
            if (pEl) pEl.textContent = formatPrice(item.price);
            if (cEl) {
                var isUp = item.change >= 0;
                cEl.textContent = (isUp ? '+' : '') + item.change.toFixed(2) + '%';
                cEl.className = 'change-pill ' + (isUp ? 'up' : 'down');
            }
            if (rowEl) {
                if (i === selectedIdx) {
                    rowEl.className = 'coin-row active';
                } else {
                    rowEl.className = 'coin-row';
                }
            }
        }
        
        var curK = coinKeys[selectedIdx];
        var curStat = coinStats[curK];
        var footEl = document.getElementById('footer-details');
        if (footEl) {
            footEl.textContent = curK + ' 24h: H ' + formatPrice(curStat.high) + ' · L ' + formatPrice(curStat.low);
        }
    }

    window.selectCoin = function(idx) {
        selectedIdx = idx;
        updateUI();
    };

    window.fetchMarketData = function() {
        var query = encodeURIComponent(JSON.stringify(coinSymbols));
        var url = 'https://api.binance.com/api/v3/ticker/24hr?symbols=' + query;
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.length) {
                        for (var i = 0; i < data.length; i++) {
                            var t = data[i];
                            var sym = t.symbol.replace('USDT', '');
                            if (coinStats[sym]) {
                                coinStats[sym].price = parseFloat(t.lastPrice);
                                coinStats[sym].change = parseFloat(t.priceChangePercent);
                                coinStats[sym].high = parseFloat(t.highPrice);
                                coinStats[sym].low = parseFloat(t.lowPrice);
                            }
                        }
                        updateUI();
                    }
                } catch(e) {}
            }
        };
        xhr.send();
    };

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

    updateUI();
    window.fetchMarketData();
    fetchFearGreed();
    setInterval(window.fetchMarketData, 15000);
})();
