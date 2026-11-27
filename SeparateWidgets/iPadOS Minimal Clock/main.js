var is24h = false;
var langMode = 0; // 0 = Spanish (matching Image 1), 1 = English

var daysEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
var monthsEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

var daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function updateClock() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    
    if (!is24h) {
        h = h % 12;
        if (h === 0) h = 12;
    } else {
        if (h < 10) h = '0' + h;
    }
    if (m < 10) m = '0' + m;
    
    document.getElementById('time-display').textContent = h + ':' + m;
    
    var dayIdx = now.getDay();
    var dateNum = now.getDate();
    var monthIdx = now.getMonth();
    
    if (langMode === 0) {
        document.getElementById('date-display').textContent = daysEs[dayIdx] + ', ' + dateNum + ' de ' + monthsEs[monthIdx];
    } else {
        document.getElementById('date-display').textContent = daysEn[dayIdx] + ', ' + monthsEn[monthIdx] + ' ' + dateNum;
    }
}

function toggleFormat() {
    langMode = (langMode + 1) % 2;
    updateClock();
}

setInterval(updateClock, 1000);
updateClock();
