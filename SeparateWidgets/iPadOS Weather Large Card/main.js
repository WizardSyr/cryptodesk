// iPadOS Weather Large Card - Live Weather & Open-Meteo Integration (iOS 9.3.5 Compatible ES5)
(function() {
    var savedCity = localStorage.getItem('weather_large_city') || 'Cupertino';
    var savedLat = localStorage.getItem('weather_large_lat') || '37.3230';
    var savedLon = localStorage.getItem('weather_large_lon') || '-122.0322';
    var savedUnit = localStorage.getItem('weather_large_unit') || 'F'; // 'F' or 'C'
    var selectedUnit = savedUnit;

    function codeToInfo(code) {
        if (code === 0) return { icon: '☀️', text: 'Sunny' };
        if (code === 1) return { icon: '🌤️', text: 'Mostly Sunny' };
        if (code === 2) return { icon: '⛅', text: 'Partly Cloudy' };
        if (code === 3) return { icon: '☁️', text: 'Overcast' };
        if (code === 45 || code === 48) return { icon: '🌫️', text: 'Foggy' };
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: '🌧️', text: 'Showers' };
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon: '❄️', text: 'Snow' };
        if (code >= 95) return { icon: '⛈️', text: 'Thunderstorm' };
        return { icon: '⛅', text: 'Cloudy' };
    }

    function formatTemp(celsius) {
        if (savedUnit === 'F') {
            return Math.round((celsius * 9 / 5) + 32) + '°';
        }
        return Math.round(celsius) + '°';
    }

    function formatHourLabel(h24) {
        var h = h24 % 24;
        var period = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12;
        if (h12 === 0) h12 = 12;
        return h12 + period;
    }

    function fetchWeather() {
        var cityEl = document.getElementById('weather-city');
        if (cityEl) cityEl.textContent = savedCity;

        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + savedLat + '&longitude=' + savedLon +
                  '&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    var cw = data.current_weather;
                    var cInfo = codeToInfo(cw.weathercode);

                    var tempEl = document.getElementById('weather-temp');
                    var iconEl = document.getElementById('cond-icon');
                    var textEl = document.getElementById('cond-text');
                    var hiloEl = document.getElementById('cond-hi-lo');

                    if (tempEl) tempEl.textContent = formatTemp(cw.temperature);
                    if (iconEl) iconEl.textContent = cInfo.icon;
                    if (textEl) textEl.textContent = cInfo.text;

                    var daily = data.daily;
                    if (daily && daily.temperature_2m_max && hiloEl) {
                        var hi = formatTemp(daily.temperature_2m_max[0]);
                        var lo = formatTemp(daily.temperature_2m_min[0]);
                        hiloEl.textContent = 'H:' + hi + ' L:' + lo;
                    }

                    // Render Hourly strip (6 columns)
                    var hourly = data.hourly;
                    var hourlyBox = document.getElementById('hourly-box');
                    if (hourly && hourly.temperature_2m && hourlyBox) {
                        var currentHour = new Date().getHours();
                        var hHtml = '';
                        for (var i = 0; i < 6; i++) {
                            var hIdx = (currentHour + i) % hourly.temperature_2m.length;
                            var t = formatTemp(hourly.temperature_2m[hIdx]);
                            var code = hourly.weathercode ? hourly.weathercode[hIdx] : 0;
                            var info = codeToInfo(code);
                            var timeText = i === 0 ? 'Now' : formatHourLabel(currentHour + i);
                            hHtml += '<div class="h-col">' +
                                     '<span class="h-time">' + timeText + '</span>' +
                                     '<span class="h-icon">' + info.icon + '</span>' +
                                     '<span class="h-temp">' + t + '</span>' +
                                     '</div>';
                        }
                        hourlyBox.innerHTML = hHtml;
                    }

                    // Render Daily strip (4 rows)
                    var dailyBox = document.getElementById('daily-box');
                    if (daily && daily.temperature_2m_max && dailyBox) {
                        var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        var todayIdx = new Date().getDay();
                        var dHtml = '';

                        // Determine global min and max for bar scaling
                        var minAll = 999;
                        var maxAll = -999;
                        for (var k = 0; k < 4 && k < daily.temperature_2m_max.length; k++) {
                            if (daily.temperature_2m_min[k] < minAll) minAll = daily.temperature_2m_min[k];
                            if (daily.temperature_2m_max[k] > maxAll) maxAll = daily.temperature_2m_max[k];
                        }
                        var rangeSpan = (maxAll - minAll) || 1;

                        for (var d = 0; d < 4 && d < daily.temperature_2m_max.length; d++) {
                            var dayLabel = d === 0 ? 'Today' : dayNames[(todayIdx + d) % 7];
                            var dCode = daily.weathercode ? daily.weathercode[d] : 0;
                            var dInfo = codeToInfo(dCode);
                            var dMax = formatTemp(daily.temperature_2m_max[d]);
                            var dMin = formatTemp(daily.temperature_2m_min[d]);

                            // Calculate bar position
                            var leftPct = Math.max(5, Math.round(((daily.temperature_2m_min[d] - minAll) / rangeSpan) * 80));
                            var widthPct = Math.max(20, Math.round(((daily.temperature_2m_max[d] - daily.temperature_2m_min[d]) / rangeSpan) * 80));
                            if (leftPct + widthPct > 95) widthPct = 95 - leftPct;

                            dHtml += '<div class="d-row">' +
                                     '<span class="d-name">' + dayLabel + '</span>' +
                                     '<span class="d-icon">' + dInfo.icon + '</span>' +
                                     '<div class="d-track"><div class="d-fill" style="left:' + leftPct + '%;width:' + widthPct + '%;"></div></div>' +
                                     '<span class="d-temp-range">' + dMin + ' / ' + dMax + '</span>' +
                                     '</div>';
                        }
                        dailyBox.innerHTML = dHtml;
                    }
                } catch(e) {}
            }
        };
        xhr.send();
    }

    // Modal & Settings Handling
    var modal = document.getElementById('weather-modal');
    var btnGear = document.getElementById('btn-open-settings');
    var btnClose = document.getElementById('btn-close-modal');
    var btnCancel = document.getElementById('btn-cancel');
    var btnSave = document.getElementById('btn-save');
    var inputCity = document.getElementById('input-city');
    var geoStatus = document.getElementById('geo-status');
    var unitC = document.getElementById('unit-c');
    var unitF = document.getElementById('unit-f');

    function updateUnitPills() {
        if (selectedUnit === 'C') {
            unitC.className = 'u-btn active';
            unitF.className = 'u-btn';
        } else {
            unitF.className = 'u-btn active';
            unitC.className = 'u-btn';
        }
    }

    if (btnGear) {
        btnGear.onclick = function() {
            inputCity.value = savedCity;
            selectedUnit = savedUnit;
            updateUnitPills();
            if (geoStatus) geoStatus.textContent = '';
            modal.className = 'weather-modal active';
        };
    }

    function closeModal() {
        modal.className = 'weather-modal';
    }

    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (unitC) unitC.onclick = function() { selectedUnit = 'C'; updateUnitPills(); };
    if (unitF) unitF.onclick = function() { selectedUnit = 'F'; updateUnitPills(); };

    if (btnSave) {
        btnSave.onclick = function() {
            var newCity = inputCity.value.trim();
            if (!newCity) {
                closeModal();
                return;
            }

            savedUnit = selectedUnit;
            localStorage.setItem('weather_large_unit', savedUnit);

            if (geoStatus) geoStatus.textContent = 'Searching location...';

            var geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(newCity) + '&count=1&language=en&format=json';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', geoUrl, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var res = JSON.parse(xhr.responseText);
                            if (res.results && res.results.length > 0) {
                                var item = res.results[0];
                                savedCity = item.name;
                                savedLat = item.latitude;
                                savedLon = item.longitude;
                                localStorage.setItem('weather_large_city', savedCity);
                                localStorage.setItem('weather_large_lat', savedLat);
                                localStorage.setItem('weather_large_lon', savedLon);
                            } else {
                                savedCity = newCity;
                                localStorage.setItem('weather_large_city', savedCity);
                            }
                        } catch(e) {
                            savedCity = newCity;
                            localStorage.setItem('weather_large_city', savedCity);
                        }
                    } else {
                        savedCity = newCity;
                        localStorage.setItem('weather_large_city', savedCity);
                    }
                    closeModal();
                    fetchWeather();
                }
            };
            xhr.send();
        };
    }

    // Initial load
    fetchWeather();
    // Auto refresh every 15 minutes
    setInterval(fetchWeather, 15 * 60 * 1000);
})();
