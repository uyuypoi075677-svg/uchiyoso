/**
 * 柄（パターン）管理ライブラリ
 * Update: サイズ調整機能（Scale）に対応
 */

(function() {
    // ■■■ 1. 柄の設定データ (サイズは大きめのまま) ■■■
    const config = [
        { id: 1, canvas: { type: 'dot', color: '#ffffff', size: 12, spacing: 60, opacity: 0.9 }, thumbUrl: '' },
        { id: 2, canvas: { type: 'stripe', color: 'rgba(255,255,255,0.5)', width: 60 }, thumbUrl: '' },
        { id: 3, canvas: { type: 'check', color: 'rgba(255,255,255,0.3)', size: 80 }, thumbUrl: '' },
        { id: 4, canvas: { type: 'ichimatsu', color: 'rgba(255,255,255,0.4)', size: 80 }, thumbUrl: '' },
        { id: 5, canvas: { type: 'argyle', color: 'rgba(255,255,255,0.3)', size: 120 }, thumbUrl: '' },
        { id: 6, canvas: { type: 'heart', color: 'rgba(255,255,255,0.7)', size: 50, spacing: 110 }, thumbUrl: '' },
        { id: 7, canvas: { type: 'star', color: 'rgba(255,255,255,0.8)', size: 40, spacing: 100 }, thumbUrl: '' },
        { id: 8, canvas: { type: 'diagonal', color: 'rgba(255,255,255,0.4)', width: 50 }, thumbUrl: '' }
    ];

    // ■■■ 2. 描画ロジック ■■■
    // 第5引数に scale (倍率) を追加しました。デフォルトは 1.0 です。
    function draw(ctx, w, h, p, scale = 1.0) {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        if (p.opacity) tCtx.globalAlpha = p.opacity;

        if (p.type === 'dot') {
            const s = p.spacing * scale; 
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color; tCtx.beginPath(); tCtx.arc(s/2, s/2, sz, 0, Math.PI*2); tCtx.fill();
        } 
        else if (p.type === 'ichimatsu') {
            const sz = p.size * scale;
            tempCanvas.width = sz * 2; tempCanvas.height = sz * 2;
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz, sz); tCtx.fillRect(sz, sz, sz, sz);
        } 
        else if (p.type === 'stripe') {
            const width = p.width * scale;
            const size = width * 2;
            tempCanvas.width = size; tempCanvas.height = size;
            tCtx.fillStyle = p.color;
            tCtx.beginPath();
            tCtx.moveTo(0, size); tCtx.lineTo(size, 0); tCtx.lineTo(size + width, 0); tCtx.lineTo(width, size); tCtx.fill();
            tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(width, 0); tCtx.lineTo(0, width); tCtx.fill();
        } 
        else if (p.type === 'check') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz, sz/2);
            tCtx.globalCompositeOperation = 'source-over'; 
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz/2, sz);
        } 
        else if (p.type === 'argyle') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            tCtx.fillStyle = p.color;
            tCtx.beginPath(); tCtx.moveTo(sz/2, 0); tCtx.lineTo(sz, sz/2); tCtx.lineTo(sz/2, sz); tCtx.lineTo(0, sz/2); tCtx.fill();
            tCtx.strokeStyle = "rgba(255,255,255,0.6)"; tCtx.lineWidth = 1 * scale;
            tCtx.beginPath(); tCtx.moveTo(0,0); tCtx.lineTo(sz, sz); tCtx.moveTo(sz,0); tCtx.lineTo(0, sz); tCtx.stroke();
        } 
        else if (p.type === 'heart') {
            const s = p.spacing * scale;
            const hs = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color;
            const hx = s/2; const hy = s/2;
            tCtx.beginPath();
            tCtx.moveTo(hx, hy + hs/2);
            tCtx.bezierCurveTo(hx - hs, hy - hs/2, hx - hs, hy - hs, hx, hy - hs/2);
            tCtx.bezierCurveTo(hx + hs, hy - hs, hx + hs, hy - hs/2, hx, hy + hs/2);
            tCtx.fill();
        } 
        else if (p.type === 'star') {
            const s = p.spacing * scale;
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color;
            const cx = s/2; const cy = s/2;
            const spikes = 5; const outerRadius = sz; const innerRadius = sz/2;
            let rot = Math.PI / 2 * 3; let x = cx; let y = cy; const step = Math.PI / spikes;
            tCtx.beginPath(); tCtx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius; y = cy + Math.sin(rot) * outerRadius; tCtx.lineTo(x, y); rot += step;
                x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius; tCtx.lineTo(x, y); rot += step;
            }
            tCtx.lineTo(cx, cy - outerRadius); tCtx.fill();
        } 
        else if (p.type === 'diagonal') {
            const w = p.width * scale;
            const size = w * 2;
            tempCanvas.width = size; tempCanvas.height = size;
            tCtx.strokeStyle = p.color; tCtx.lineWidth = w/2; tCtx.lineCap = 'butt';
            tCtx.beginPath(); tCtx.moveTo(-w, size); tCtx.lineTo(size, -w); tCtx.stroke();
            tCtx.beginPath(); tCtx.moveTo(0, size + w); tCtx.lineTo(size + w, 0); tCtx.stroke();
        }

        const pattern = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h);
    }

    window.ChartPatternLibrary = { config: config, draw: draw };
})();