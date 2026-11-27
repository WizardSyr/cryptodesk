var tracks = [
    {
        title: 'Shall we☆Carnival',
        artist: 'i☆Ris',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80',
        duration: 225
    },
    {
        title: 'Starry Sky & Sunset',
        artist: 'Capsule',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&auto=format&fit=crop&q=80',
        duration: 198
    },
    {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&auto=format&fit=crop&q=80',
        duration: 200
    },
    {
        title: 'Levitating',
        artist: 'Dua Lipa',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80',
        duration: 203
    }
];

var curTrackIdx = 0;
var isPlaying = false;
var currentSeconds = 72;
var isSpotifyTheme = false;

function formatTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' + sec : sec);
}

function updateTrackUI() {
    var t = tracks[curTrackIdx];
    document.getElementById('track-title').textContent = t.title;
    document.getElementById('track-artist').textContent = t.artist;
    document.getElementById('now-thumb').src = t.cover;
    document.getElementById('time-total').textContent = formatTime(t.duration);
    document.getElementById('time-current').textContent = formatTime(currentSeconds);
    
    var pct = (currentSeconds / t.duration) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    
    for (var i = 0; i < 4; i++) {
        var el = document.getElementById('slot-' + i);
        if (el) {
            el.className = (i === curTrackIdx) ? 'album-slot active' : 'album-slot';
        }
    }
}

function selectTrack(idx) {
    curTrackIdx = idx;
    currentSeconds = 0;
    isPlaying = true;
    document.getElementById('play-indicator').textContent = '⏸';
    updateTrackUI();
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('play-indicator').textContent = isPlaying ? '⏸' : '▶';
}

function scrub(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    currentSeconds = Math.round(pct * tracks[curTrackIdx].duration);
    updateTrackUI();
}

function toggleTheme() {
    isSpotifyTheme = !isSpotifyTheme;
    var card = document.getElementById('music-card');
    var svg = document.getElementById('brand-svg');
    if (isSpotifyTheme) {
        card.className = 'music-card theme-spotify';
        svg.innerHTML = '<circle cx="12" cy="12" r="10" fill="#1db954"/><path d="M7 9 C 10 8, 14 8, 17 9.8 M7.5 12 C 10 11.2, 13.5 11.2, 16.5 12.8 M8 15 C 10 14.4, 13 14.4, 15.5 15.6" stroke="#000" stroke-width="2" stroke-linecap="round" fill="none"/>';
    } else {
        card.className = 'music-card theme-coral';
        svg.innerHTML = '<path d="M12 3 L12 16 A 4 4 0 1 1 9 13 C 9.7 13, 10.3 13.3, 10.8 13.7 L11 4 L19 2 L19 12 A 4 4 0 1 1 16 9 C 16.7 9, 17.3 9.3, 17.8 9.7 L18 1 Z" fill="#ffffff"/>';
    }
}

setInterval(function() {
    if (isPlaying) {
        currentSeconds++;
        if (currentSeconds >= tracks[curTrackIdx].duration) {
            currentSeconds = 0;
            curTrackIdx = (curTrackIdx + 1) % tracks.length;
        }
        updateTrackUI();
    }
}, 1000);

updateTrackUI();
