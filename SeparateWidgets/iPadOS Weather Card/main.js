var isFahrenheit = true;
var currentCity = localStorage.getItem('weather_city') || 'San Francisco';
var currentLat = 37.7749;
var currentLon = -122.4194;

var sampleHours = [
    { time: 'Now', tempF: 68, tempC: 20 },
    { time: '10AM', tempF: 69, tempC: 21 },
    { time: '11AM', tempF: 71, tempC: 22 },
    { time: '12PM', tempF: 74, tempC: 23 },
    { time: '1PM', tempF: 76, tempC: 24 },
    { time: '2PM', tempF: 77, tempC: 25 }
];

function renderHourly() {
    var container = document.getElementById('hourly-container');
    if (!container) return;
    container.innerHTML = '';
    
    for (var i = 0; i < sampleHours.length; i++) {
        var h = sampleHours[i];
        var item = document.createElement('div');
        item.className = 'hourly-item';
        
        var temp = isFahrenheit ? h.tempF + '°' : h.tempC + '°';
        var isNow = (h.time === 'Now');
        
        item.innerHTML = 
            '<span class="hourly-time ' + (isNow ? 'active' : '') + '">' + h.time + '</span>' +
            '<svg viewBox="0 0 24 24" class="hourly-icon-svg">' +
                '<circle cx="10" cy="9" r="4" fill="#f59e0b" />' +
                '<path d="M7 16 C 5.5 16, 4 14.5, 4 13 C 4 11.5, 5.2 10.2, 6.7 10.1 C 7.3 8.3, 9 7, 11 7 C 13.5 7, 15.5 8.8, 15.9 11.2 C 16.2 11.1, 16.6 11, 17 11 C 18.7 11, 20 12.3, 20 14 C 20 15.7, 18.7 17, 17 17 L 7 17 Z" fill="#ffffff" />' +
            '</svg>' +
            '<span class="hourly-temp">' + temp + '</span>';
            
        container.appendChild(item);
    }
}

function updateDisplays() {
    var curF = 68, curC = 20;
    var highF = 78, highC = 26;
    var lowF = 56, lowC = 13;
    
    document.getElementById('current-temp').textContent = isFahrenheit ? curF + '°' : curC + '°';
    document.getElementById('high-low-temp').textContent = isFahrenheit ? (highF + '° / ' + lowF + '°') : (highC + '° / ' + lowC + '°');
    document.getElementById('city-name').textContent = currentCity;
    renderHourly();
}

function toggleUnit() {
    isFahrenheit = !isFahrenheit;
    updateDisplays();
}

function promptCity() {
    var newCity = prompt('Enter city name (e.g. New York, London, Tokyo):', currentCity);
    if (newCity && newCity.trim()) {
        currentCity = newCity.trim();
        localStorage.setItem('weather_city', currentCity);
        fetchLiveWeather();
    }
}

function fetchLiveWeather() {
    // Free Open-Meteo Geocoding and Weather (CORS enabled)
    var geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(currentCity) + '&count=1';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', geoUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var d = JSON.parse(xhr.responseText);
                if (d.results && d.results.length > 0) {
                    currentLat = d.results[0].latitude;
                    currentLon = d.results[0].longitude;
                    loadForecastData();
                }
            } catch(e) {}
        }
    };
    xhr.send();
}

function loadForecastData() {
    var wUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + currentLat + '&longitude=' + currentLon + '&hourly=temperature_2m,precipitation_probability&current_weather=true';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', wUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var data = JSON.parse(xhr.responseText);
                var cur = data.current_weather;
                if (cur) {
                    var curTempC = Math.round(cur.temperature);
                    var curTempF = Math.round((curTempC * 9/5) + 32);
                    sampleHours[0] = { time: 'Now', tempF: curTempF, tempC: curTempC };
                    
                    if (data.hourly && data.hourly.temperature_2m) {
                        for (var i = 1; i <= 5; i++) {
                            var tC = Math.round(data.hourly.temperature_2m[i]);
                            var tF = Math.round((tC * 9/5) + 32);
                            sampleHours[i].tempC = tC;
                            sampleHours[i].tempF = tF;
                        }
                    }
                    updateDisplays();
                }
            } catch(e) {}
        }
    };
    xhr.send();
}

updateDisplays();
fetchLiveWeather();
setInterval(fetchLiveWeather, 600000); // 10 min
