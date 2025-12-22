

/**
 * 柄（パターン）管理ライブラリ
 * v2.0: カラー・透明度の動的変更に対応
 */

(function() {
    // ■■■ 1. 柄の設定データ ■■■
    // 既存の見た目を維持するため、rgbaを color(Hex) と opacity に分解して定義
    const config = [
        // 1. 斜めドット (白 / 不透明度0.9)
        { 
            id: 1, 
            canvas: { 
                type: 'dot-skew', 
                color: '#ffffff', 
                opacity: 0.9, 
                size: 10, 
                spacing: 60 
            }, 
            thumbUrl: '' 
        },
        // 2. 太いボーダー (白 / 不透明度0.5)
        { 
            id: 2, 
            canvas: { 
                type: 'stripe', 
                color: '#ffffff', 
                opacity: 0.5, 
                width: 60 
            }, 
            thumbUrl: '' 
        },
        // 3. 大きなチェック (白 / 不透明度0.3)
        { 
            id: 3, 
            canvas: { 
                type: 'check', 
                color: '#ffffff', 
                opacity: 0.3, 
                size: 80 
            }, 
            thumbUrl: '' 
        },
        // 4. 大きな市松模様 (白 / 不透明度0.4)
        { 
            id: 4, 
            canvas: { 
                type: 'ichimatsu', 
                color: '#ffffff', 
                opacity: 0.4, 
                size: 80 
            }, 
            thumbUrl: '' 
        },
        // 5. ビッグアーガイル (白 / 不透明度0.3 / 線は濃いめ)
        { 
            id: 5, 
            canvas: { 
                type: 'argyle', 
                color: '#ffffff', 
                opacity: 0.3, 
                size: 120 
            }, 
            thumbUrl: '' 
        },
        // 6. ドット色違い (水色 & 薄ピンク / 不透明度0.8)
        {
            id: 6,
            canvas: { 
                type: 'dot-mix', 
                color: '#b4f3ea',  // 色1 (rgba(180, 243, 234, 0.8))
                color2: '#ffbcbc', // 色2 (rgba(255, 188, 188, 0.8))
                opacity: 0.8,
                size: 15, 
                spacing: 60 
            },
            thumbUrl: ''
        },
        // 7. ドットサイズ違い (白 / 不透明度0.8)
        {
            id: 7,
            canvas: { 
                type: 'dot-size', 
                color: '#ffffff', 
                opacity: 0.8, 
                size: 10, // 小
                size2: 25, // 大
                spacing: 70 
            },
            thumbUrl: ''
        }
    ];

    // ■■■ 2. 描画ロジック ■■■
    // overrides引数を追加: { color, color2, opacity }
    function draw(ctx, w, h, p, scale = 1.0, overrides = {}) {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        
        // オーバーライドがあれば優先、なければ設定データの値を使用
        const drawColor = overrides.color || p.color;
        const drawColor2 = overrides.color2 || p.color2;
        const drawOpacity = (overrides.opacity !== undefined) ? overrides.opacity : p.opacity;

        // 透明度を適用
        if (drawOpacity !== undefined) tCtx.globalAlpha = drawOpacity;

        const s = p.spacing * scale;

        // ▼ 1. 斜めドット
        if (p.type === 'dot-skew') {
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = drawColor;
            
            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz, 0, Math.PI*2); tCtx.fill();
            
            tCtx.beginPath(); tCtx.arc(0, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz, 0, Math.PI*2); tCtx.fill();
        } 
        // ▼ 6. ドット色違い
        else if (p.type === 'dot-mix') {
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;

            // 色1
            tCtx.fillStyle = drawColor;
            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz, 0, Math.PI*2); tCtx.fill();

            // 色2
            tCtx.fillStyle = drawColor2 || drawColor; // 2色目がなければ1色目と同じに
            tCtx.beginPath(); tCtx.arc(0, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz, 0, Math.PI*2); tCtx.fill();
        }
        // ▼ 7. ドットサイズ違い
        else if (p.type === 'dot-size') {
            const sz1 = p.size * scale;
            const sz2 = p.size2 * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = drawColor;

            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz1, 0, Math.PI*2); tCtx.fill();

            tCtx.beginPath(); tCtx.arc(0, 0, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz2, 0, Math.PI*2); tCtx.fill();
        }
        // ▼ 4. 市松模様
        else if (p.type === 'ichimatsu') {
            const sz = p.size * scale;
            tempCanvas.width = sz * 2; tempCanvas.height = sz * 2;
            tCtx.fillStyle = drawColor; 
            tCtx.fillRect(0, 0, sz, sz); 
            tCtx.fillRect(sz, sz, sz, sz);
        } 
        // ▼ 2. ボーダー (ストライプ)
        else if (p.type === 'stripe') {
            const width = p.width * scale;
            const size = width * 2;
            tempCanvas.width = size; tempCanvas.height = size;
            tCtx.fillStyle = drawColor;
            tCtx.beginPath();
            tCtx.moveTo(0, size); tCtx.lineTo(size, 0); tCtx.lineTo(size + width, 0); tCtx.lineTo(width, size); tCtx.fill();
            tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(width, 0); tCtx.lineTo(0, width); tCtx.fill();
        } 
        // ▼ 3. チェック
        else if (p.type === 'check') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            tCtx.fillStyle = drawColor; 
            tCtx.fillRect(0, 0, sz, sz/2);
            tCtx.globalCompositeOperation = 'source-over'; 
            tCtx.fillStyle = drawColor; 
            tCtx.fillRect(0, 0, sz/2, sz);
        } 
        // ▼ 5. アーガイル
        else if (p.type === 'argyle') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            
            // 塗り
            tCtx.fillStyle = drawColor;
            tCtx.beginPath(); tCtx.moveTo(sz/2, 0); tCtx.lineTo(sz, sz/2); tCtx.lineTo(sz/2, sz); tCtx.lineTo(0, sz/2); tCtx.fill();
            
            // 線 (元のデザインでは塗りより少し濃く見えるため、透明度を調整して2回描画するなどして再現)
            // ここでは線の色も drawColor を使い、不透明度を少し上げて強調します
            tCtx.globalAlpha = Math.min(1.0, drawOpacity + 0.3); // 線を少し濃く
            tCtx.strokeStyle = drawColor; 
            tCtx.lineWidth = 1 * scale;
            tCtx.beginPath(); tCtx.moveTo(0,0); tCtx.lineTo(sz, sz); tCtx.moveTo(sz,0); tCtx.lineTo(0, sz); tCtx.stroke();
        } 

        const pattern = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h);
    }

    window.ChartPatternLibrary = { config: config, draw: draw };
})();