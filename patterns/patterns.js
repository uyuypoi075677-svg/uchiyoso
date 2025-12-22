/**
 * 柄（パターン）管理ライブラリ
 * Update: 
 *  - 複雑な柄（チョコ・クッション等）の描画崩れを修正
 *  - 全パターンで「色変更（color, color2）」に対応
 *  - 単色から自動で影色・ハイライト色を生成する関数を追加
 */

(function() {
    // ■■■ 0. ユーティリティ：色操作関数 ■■■
    // 色の明るさを調整する (例: adjustColor('#ff0000', -20) で暗い赤)
    function adjustColor(col, amt) {
        var usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        var num = parseInt(col, 16);
        var r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        var b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        var g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    // ■■■ 1. 柄の設定データ ■■■
    const config = [
        // 1. 斜めドット
        { 
            id: 1, 
            canvas: { type: 'dot-skew', color: '#ffffff', size: 10, spacing: 60, opacity: 0.9 }, 
            thumbUrl: '' 
        },
        // 2. 太いボーダー
        { 
            id: 2, 
            canvas: { type: 'stripe', color: '#ffffff', width: 60, opacity: 0.5 }, 
            thumbUrl: '' 
        },
        // 3. 大きなチェック
        { 
            id: 3, 
            canvas: { type: 'check', color: '#ffffff', size: 80, opacity: 0.3 }, 
            thumbUrl: '' 
        },
        // 4. 大きな市松模様
        { 
            id: 4, 
            canvas: { type: 'ichimatsu', color: '#ffffff', size: 80, opacity: 0.4 }, 
            thumbUrl: '' 
        },
        // 5. ビッグアーガイル
        { 
            id: 5, 
            canvas: { type: 'argyle', color: '#ffffff', size: 120, opacity: 0.3 }, 
            thumbUrl: '' 
        },
        // 6. ドット色違い (2色)
        {
            id: 6,
            canvas: { type: 'dot-mix', color: '#b4f3ea', color2: '#ffbcbc', size: 15, spacing: 60, opacity: 0.9 },
            thumbUrl: ''
        },
        // 7. ドットサイズ違い
        {
            id: 7,
            canvas: { type: 'dot-size', color: '#ffffff', size: 10, size2: 25, spacing: 70, opacity: 0.8 },
            thumbUrl: ''
        },

        // --- ▼▼▼ 新規追加柄 (修正版: 色変更対応) ▼▼▼ ---
        
        // 8. チョコレート柄 (色1: ベース色)
        {
            id: 8,
            canvas: { type: 'chocolate', color: '#693319', size: 100, spacing: 100, opacity: 1.0 },
            thumbUrl: ''
        },
        // 9. クッション風 (色1: ベース色)
        {
            id: 9,
            canvas: { type: 'cushion', color: '#a81c45', size: 90, spacing: 90, opacity: 1.0 },
            thumbUrl: ''
        },
        // 10. お花柄 (色1: 花びら, 色2: 背景)
        {
            id: 10,
            canvas: { type: 'flower-retro', color: '#f69524', color2: '#003583', size: 60, spacing: 120, opacity: 1.0 },
            thumbUrl: ''
        },
        // 11. パズル柄 (色1: メイン, 色2: サブ)
        {
            id: 11,
            canvas: { type: 'puzzle', color: '#4b2889', color2: '#673ab7', size: 80, spacing: 80, opacity: 1.0 },
            thumbUrl: ''
        },
        // 12. 幾何学模様 (色1: 前面, 色2: 背景)
        {
            id: 12,
            canvas: { type: 'shippo-pop', color: '#1a2030', color2: '#fdebad', size: 120, spacing: 120, opacity: 1.0 },
            thumbUrl: ''
        }
    ];

    // ■■■ 2. 描画ロジック ■■■
    function draw(ctx, w, h, p, scale = 1.0) {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        if (p.opacity) tCtx.globalAlpha = p.opacity;

        const s = Math.floor(p.spacing * scale); // 整数化して隙間防止

        // ▼ 既存の柄 ▼
        if (p.type === 'dot-skew') {
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color;
            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz, 0, Math.PI*2); tCtx.fill();
        } 
        else if (p.type === 'dot-mix') {
            const sz = p.size * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color;
            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = p.color2 || p.color;
            tCtx.beginPath(); tCtx.arc(0, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz, 0, Math.PI*2); tCtx.fill();
        }
        else if (p.type === 'dot-size') {
            const sz1 = p.size * scale;
            const sz2 = p.size2 * scale;
            tempCanvas.width = s; tempCanvas.height = s;
            tCtx.fillStyle = p.color;
            tCtx.beginPath(); tCtx.arc(s/2, s/2, sz1, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, 0, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, 0, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(0, s, sz2, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(s, s, sz2, 0, Math.PI*2); tCtx.fill();
        }
        else if (p.type === 'ichimatsu') {
            const sz = Math.floor(p.size * scale);
            tempCanvas.width = sz * 2; tempCanvas.height = sz * 2;
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz, sz); tCtx.fillRect(sz, sz, sz, sz);
        } 
        else if (p.type === 'stripe') {
            const width = Math.floor(p.width * scale);
            const size = width * 2;
            tempCanvas.width = size; tempCanvas.height = size;
            tCtx.fillStyle = p.color;
            tCtx.beginPath();
            tCtx.moveTo(0, size); tCtx.lineTo(size, 0); tCtx.lineTo(size + width, 0); tCtx.lineTo(width, size); tCtx.fill();
            tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(width, 0); tCtx.lineTo(0, width); tCtx.fill();
        } 
        else if (p.type === 'check') {
            const sz = Math.floor(p.size * scale);
            tempCanvas.width = sz; tempCanvas.height = sz;
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz, sz/2);
            tCtx.globalCompositeOperation = 'source-over'; 
            tCtx.fillStyle = p.color; tCtx.fillRect(0, 0, sz/2, sz);
        } 
        else if (p.type === 'argyle') {
            const sz = Math.floor(p.size * scale);
            tempCanvas.width = sz; tempCanvas.height = sz;
            tCtx.fillStyle = p.color;
            tCtx.beginPath(); tCtx.moveTo(sz/2, 0); tCtx.lineTo(sz, sz/2); tCtx.lineTo(sz/2, sz); tCtx.lineTo(0, sz/2); tCtx.fill();
            tCtx.strokeStyle = "rgba(255,255,255,0.6)"; tCtx.lineWidth = 1 * scale;
            tCtx.beginPath(); tCtx.moveTo(0,0); tCtx.lineTo(sz, sz); tCtx.moveTo(sz,0); tCtx.lineTo(0, sz); tCtx.stroke();
        } 

        // --- ▼▼▼ 新規柄 (色変更対応版) ▼▼▼ ---

        // 8. チョコレート柄
        else if (p.type === 'chocolate') {
            tempCanvas.width = s; tempCanvas.height = s;
            const base = p.color;
            // ベース色から自動で影色・ハイライトを生成
            const cHighlight = adjustColor(base, 40); // 明るい
            const cShadow = adjustColor(base, -20);   // 暗い
            const cDark = adjustColor(base, -60);     // もっと暗い
            
            // ベース
            tCtx.fillStyle = base; tCtx.fillRect(0, 0, s, s);

            const drawTrapezoid = (ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) => {
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.fill();
            };

            const edge = s * 0.15;
            drawTrapezoid(tCtx, 0, 0, s, 0, s - edge, edge, edge, edge, cHighlight); // 上
            drawTrapezoid(tCtx, 0, 0, edge, edge, edge, s - edge, 0, s, cShadow); // 左
            drawTrapezoid(tCtx, s, 0, s, s, s - edge, s - edge, s - edge, edge, cShadow); // 右
            drawTrapezoid(tCtx, 0, s, edge, s - edge, s - edge, s - edge, s, s, cDark); // 下

            // 溝
            tCtx.strokeStyle = cDark; tCtx.lineWidth = 2 * scale; tCtx.strokeRect(0, 0, s, s);
        }

        // 9. クッション風
        else if (p.type === 'cushion') {
            tempCanvas.width = s; tempCanvas.height = s;
            const base = p.color;
            const cLight = adjustColor(base, 50);
            const cDark = adjustColor(base, -50);

            // グラデーション生成
            const r = s / 2;
            const grd = tCtx.createRadialGradient(r, r, 0, r, r, r);
            grd.addColorStop(0, cLight);
            grd.addColorStop(0.6, base);
            grd.addColorStop(1, cDark);
            
            tCtx.fillStyle = grd;
            tCtx.fillRect(0, 0, s, s);

            // ボタン
            tCtx.beginPath(); tCtx.arc(r, r, s * 0.08, 0, Math.PI * 2);
            tCtx.fillStyle = cDark; tCtx.fill();
            
            // シワ
            tCtx.strokeStyle = "rgba(0,0,0,0.2)"; tCtx.lineWidth = 2 * scale;
            tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(s, s); tCtx.stroke();
            tCtx.beginPath(); tCtx.moveTo(s, 0); tCtx.lineTo(0, s); tCtx.stroke();
        }

        // 10. お花柄
        else if (p.type === 'flower-retro') {
            tempCanvas.width = s; tempCanvas.height = s;
            
            // 背景 (color2)
            tCtx.fillStyle = p.color2 || '#003583';
            tCtx.fillRect(0, 0, s, s);

            const petalColor = p.color || '#f69524';
            const centerColor = '#ffffff';

            const drawFlower = (cx, cy, size) => {
                const petalR = size / 3;
                tCtx.fillStyle = petalColor;
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const x = cx + Math.cos(angle) * (petalR * 1.2);
                    const y = cy + Math.sin(angle) * (petalR * 1.2);
                    tCtx.beginPath(); tCtx.arc(x, y, petalR, 0, Math.PI * 2); tCtx.fill();
                }
                tCtx.fillStyle = centerColor;
                tCtx.beginPath(); tCtx.arc(cx, cy, petalR * 0.8, 0, Math.PI * 2); tCtx.fill();
            };

            const fSize = s * 0.6;
            drawFlower(s/2, s/2, fSize);
            drawFlower(0, 0, fSize); drawFlower(s, 0, fSize);
            drawFlower(0, s, fSize); drawFlower(s, s, fSize);
        }

        // 11. パズル柄
        else if (p.type === 'puzzle') {
            tempCanvas.width = s; tempCanvas.height = s;
            const c1 = p.color || '#4b2889'; 
            const c2 = p.color2 || adjustColor(c1, 30); // color2がなければ明るく
            const c3 = adjustColor(c1, -20); // 暗め
            const c4 = adjustColor(c2, 20);  // 明るめ

            const half = s / 2;
            const knob = s * 0.15;

            // 左上 (Base)
            tCtx.fillStyle = c1; tCtx.fillRect(0, 0, half, half);
            // 右上 (Sub)
            tCtx.fillStyle = c2; tCtx.fillRect(half, 0, half, half);
            // 左下 (Sub)
            tCtx.fillStyle = c2; tCtx.fillRect(0, half, half, half);
            // 右下 (Dark)
            tCtx.fillStyle = c3; tCtx.fillRect(half, half, half, half);
            
            // 結合部（円）
            tCtx.fillStyle = c1; tCtx.beginPath(); tCtx.arc(half/2, half, knob, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = c2; tCtx.beginPath(); tCtx.arc(half + half/2, half, knob, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = c2; tCtx.beginPath(); tCtx.arc(half, half/2, knob, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = c3; tCtx.beginPath(); tCtx.arc(half, half + half/2, knob, 0, Math.PI*2); tCtx.fill();
        }

        // 12. 幾何学模様
        else if (p.type === 'shippo-pop') {
            tempCanvas.width = s; tempCanvas.height = s;
            
            // 背景色 (color2)
            const bg = p.color2 || '#fdebad';
            tCtx.fillStyle = bg;
            tCtx.fillRect(0, 0, s, s);

            // 前面の円 (color1)
            const fg = p.color || '#1a2030';
            const r = s * 0.35;
            
            // Canvasの合成モードを使って「くり抜き」を表現
            // まず全面を塗る
            const maskC = document.createElement('canvas');
            maskC.width = s; maskC.height = s;
            const mCtx = maskC.getContext('2d');
            
            mCtx.fillStyle = fg;
            mCtx.fillRect(0, 0, s, s);
            
            // 穴をあける
            mCtx.globalCompositeOperation = 'destination-out';
            mCtx.beginPath(); mCtx.arc(s/2, s/2, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(0, 0, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(s, 0, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(0, s, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(s, s, r, 0, Math.PI*2); mCtx.fill();

            tCtx.drawImage(maskC, 0, 0);
        }

        const pattern = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h);
    }

    window.ChartPatternLibrary = { config: config, draw: draw };
})();