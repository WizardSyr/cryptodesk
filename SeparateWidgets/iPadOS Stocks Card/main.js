// Stocks Card Widget - ES5
(function() {
    function drawStockChart() {
        var canvas = document.getElementById('stock-chart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var dpr = window.devicePixelRatio || 1;
        var rect = canvas.getBoundingClientRect();
        var width = rect.width || 272;
        var height = rect.height || 52;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        var points = [18, 22, 19, 25, 30, 24, 20, 16, 22, 28, 35, 32, 40, 48, 45, 52, 60, 58, 65, 72, 68, 75, 82, 78, 85, 90, 84, 88, 92, 95];
        var stepX = width / (points.length - 1);
        var minY = 10;
        var maxY = 100;

        function getY(val) {
            return height - ((val - minY) / (maxY - minY)) * (height - 12) - 6;
        }

        var grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(52, 199, 89, 0.45)');
        grad.addColorStop(1, 'rgba(52, 199, 89, 0.0)');

        ctx.beginPath();
        ctx.moveTo(0, getY(points[0]));
        for (var i = 1; i < points.length; i++) {
            var px = (i - 1) * stepX;
            var py = getY(points[i - 1]);
            var cx = i * stepX;
            var cy = getY(points[i]);
            var mx = (px + cx) / 2;
            ctx.quadraticCurveTo(px, py, mx, (py + cy) / 2);
        }
        ctx.lineTo(width, getY(points[points.length - 1]));
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, getY(points[0]));
        for (var j = 1; j < points.length; j++) {
            var pxx = (j - 1) * stepX;
            var pyy = getY(points[j - 1]);
            var cxx = j * stepX;
            var cyy = getY(points[j]);
            var mxx = (pxx + cxx) / 2;
            ctx.quadraticCurveTo(pxx, pyy, mxx, (pyy + cyy) / 2);
        }
        ctx.lineTo(width, getY(points[points.length - 1]));
        ctx.strokeStyle = '#34c759';
        ctx.lineWidth = 2.2;
        ctx.stroke();
    }

    window.addEventListener('load', drawStockChart);
    window.addEventListener('resize', drawStockChart);
})();
