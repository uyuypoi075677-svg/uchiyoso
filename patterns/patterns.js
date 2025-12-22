/**
 * 柄（パターン）管理ライブラリ
 * Update: CSSベースの複雑な柄（チョコ、クッション、花、パズル、幾何学）を追加
 */

(function() {
    // ■■■ 1. 柄の設定データ ■■■
    const config = [
        // --- 既存の柄 (ID:1-7) 変更なし ---
        {
            id: 1,
            canvas: { type: 'dot-skew', color: '#ffffff', size: 10, spacing: 60, opacity: 0.9 },
            thumbUrl: ''
        },
        {
            id: 2,
            canvas: { type: 'stripe', color: 'rgba(255,255,255,0.5)', width: 60 },
            thumbUrl: ''
        },
        {
            id: 3,
            canvas: { type: 'check', color: 'rgba(255,255,255,0.3)', size: 80 },
            thumbUrl: ''
        },
        {
            id: 4,
            canvas: { type: 'ichimatsu', color: 'rgba(255,255,255,0.4)', size: 80 },
            thumbUrl: ''
        },
        {
            id: 5,
            canvas: { type: 'argyle', color: 'rgba(255,255,255,0.3)', size: 120 },
            thumbUrl: ''
        },
        {
            id: 6,
            canvas: { type: 'dot-mix', color: 'rgba(180, 243, 234, 0.8)', color2: 'rgba(255, 188, 188, 0.8)', size: 15, spacing: 60 },
            thumbUrl: ''
        },
        {
            id: 7,
            canvas: { type: 'dot-size', color: 'rgba(255, 255, 255, 0.8)', size: 10, size2: 25, spacing: 70 },
            thumbUrl: ''
        },

        // --- ▼▼▼ 新規追加柄 (ID:8-12) ▼▼▼ ---
        
        // 8. チョコレート柄 (CSS再現)
        {
            id: 8,
            canvas: { 
                type: 'chocolate', 
                // ベース色（不要だが形式上定義）
                color: '#693319', 
                size: 100, // 1ブロックの大きさ
                spacing: 100,
                opacity: 1.0 
            },
            thumbUrl: ''
        },
        // 9. クッション風 (CSS再現)
        {
            id: 9,
            canvas: { 
                type: 'cushion', 
                color: '#a81c45', // ベースの赤系
                size: 90, 
                spacing: 90,
                opacity: 1.0 
            },
            thumbUrl: ''
        },
        // 10. お花柄 (Palette 1 を採用)
        {
            id: 10,
            canvas: { 
                type: 'flower-retro', 
                color: '#f69524', // 花びら
                color2: '#003583', // 背景
                size: 60, 
                spacing: 120,
                opacity: 1.0 
            },
            thumbUrl: ''
        },
        // 11. パズル柄
        {
            id: 11,
            canvas: { 
                type: 'puzzle', 
                color: '#4b2889', // 紫系ベース
                size: 80, 
                spacing: 80,
                opacity: 1.0 
            },
            thumbUrl: ''
        },
        // 12. 謎の幾何学模様 (七宝風・円の切り抜き)
        {
            id: 12,
            canvas: { 
                type: 'shippo-pop', 
                color: '#1a2030', // 前面の暗い色
                size: 120, 
                spacing: 120,
                opacity: 1.0 
            },
            thumbUrl: ''
        }
    ];

    // ■■■ 2. 描画ロジック ■■■
    function draw(ctx, w, h, p, scale = 1.0) {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        if (p.opacity) tCtx.globalAlpha = p.opacity;

        const s = p.spacing * scale;

        // --- 既存ロジック ---
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
            tCtx.fillStyle = p.color2;
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

        // --- ▼▼▼ 新規柄の描画ロジック ▼▼▼ ---

        // 8. チョコレート柄
        else if (p.type === 'chocolate') {
            tempCanvas.width = s; tempCanvas.height = s;
            // CSSのカラーパレット定義
            const c2 = "#996349"; const c3 = "#7b4028"; const c4 = "#693319";
            const c5 = "#612f0e"; const c6 = "#4c230e"; const c7 = "#2a0b00";
            
            // ベース（中央の平らな部分）
            tCtx.fillStyle = c4;
            tCtx.fillRect(0, 0, s, s);

            // 立体感を出すための台形描画関数
            const drawTrapezoid = (ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
                ctx.closePath(); ctx.fill();
            };

            const edge = s * 0.15; // 縁の太さ
            // 上 (明るい)
            drawTrapezoid(tCtx, 0, 0, s, 0, s - edge, edge, edge, edge, c2);
            // 左 (中間)
            drawTrapezoid(tCtx, 0, 0, edge, edge, edge, s - edge, 0, s, c3);
            // 右 (暗い)
            drawTrapezoid(tCtx, s, 0, s, s, s - edge, s - edge, s - edge, edge, c5);
            // 下 (最も暗い)
            drawTrapezoid(tCtx, 0, s, edge, s - edge, s - edge, s - edge, s, s, c7);

            // 溝のライン
            tCtx.strokeStyle = c6; tCtx.lineWidth = 2 * scale;
            tCtx.strokeRect(0, 0, s, s);
        }

        // 9. クッション風
        else if (p.type === 'cushion') {
            tempCanvas.width = s; tempCanvas.height = s;
            // グラデーションでふっくら感を出す
            const r = s / 2;
            const grd = tCtx.createRadialGradient(r, r, 0, r, r, r);
            grd.addColorStop(0, '#d1345b'); // 明るい赤 (ハイライト)
            grd.addColorStop(0.6, '#a81c45'); // ベース色
            grd.addColorStop(1, '#5e0b21');   // 影
            tCtx.fillStyle = grd;
            tCtx.fillRect(0, 0, s, s);

            // ボタン（中央の窪み）
            tCtx.beginPath();
            tCtx.arc(r, r, s * 0.08, 0, Math.PI * 2);
            tCtx.fillStyle = '#5e0b21'; // 暗い色でボタン
            tCtx.fill();
            
            // 縫い目の皺（対角線）
            tCtx.strokeStyle = "rgba(0,0,0,0.3)";
            tCtx.lineWidth = 2 * scale;
            tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(s, s); tCtx.stroke();
            tCtx.beginPath(); tCtx.moveTo(s, 0); tCtx.lineTo(0, s); tCtx.stroke();
        }

        // 10. お花柄 (レトロポップ)
        else if (p.type === 'flower-retro') {
            tempCanvas.width = s; tempCanvas.height = s;
            
            // 背景
            tCtx.fillStyle = p.color2 || '#003583'; // 紺色
            tCtx.fillRect(0, 0, s, s);

            // 花を描く関数
            const drawFlower = (cx, cy, size, petalColor, centerColor) => {
                const petalR = size / 3;
                tCtx.fillStyle = petalColor;
                // 5枚の花びら
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const x = cx + Math.cos(angle) * (petalR * 1.2);
                    const y = cy + Math.sin(angle) * (petalR * 1.2);
                    tCtx.beginPath();
                    tCtx.arc(x, y, petalR, 0, Math.PI * 2);
                    tCtx.fill();
                }
                // 花芯
                tCtx.fillStyle = centerColor;
                tCtx.beginPath();
                tCtx.arc(cx, cy, petalR * 0.8, 0, Math.PI * 2);
                tCtx.fill();
            };

            const fSize = s * 0.6;
            // 配置: 互い違いに
            drawFlower(s/2, s/2, fSize, p.color || '#f69524', '#f6f0e2'); // 中央
            
            // 四隅（半分切れる）
            drawFlower(0, 0, fSize, p.color || '#f69524', '#f6f0e2');
            drawFlower(s, 0, fSize, p.color || '#f69524', '#f6f0e2');
            drawFlower(0, s, fSize, p.color || '#f69524', '#f6f0e2');
            drawFlower(s, s, fSize, p.color || '#f69524', '#f6f0e2');
        }

        // 11. パズル柄
        else if (p.type === 'puzzle') {
            tempCanvas.width = s; tempCanvas.height = s;
            const c1 = "#4b2889"; const c2 = "#673ab7"; 
            const c3 = "#401c81"; const c4 = "#2d125d";
            const half = s / 2;

            // 4つのピースを描画（左上、右上、左下、右下）
            
            // 共通の凸凹描画ロジックは複雑なので、四角形塗り分け＋円で簡易再現
            
            // 左上 (c4)
            tCtx.fillStyle = c4; tCtx.fillRect(0, 0, half, half);
            // 右上 (c2)
            tCtx.fillStyle = c2; tCtx.fillRect(half, 0, half, half);
            // 左下 (c2)
            tCtx.fillStyle = c2; tCtx.fillRect(0, half, half, half);
            // 右下 (c3)
            tCtx.fillStyle = c3; tCtx.fillRect(half, half, half, half);
            
            // 結合部の「ポコッ」とした部分（円で表現）
            const knob = s * 0.15;
            
            // 縦の結合
            tCtx.fillStyle = c4; tCtx.beginPath(); tCtx.arc(half/2, half, knob, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = c2; tCtx.beginPath(); tCtx.arc(half + half/2, half, knob, 0, Math.PI*2); tCtx.fill();
            
            // 横の結合
            tCtx.fillStyle = c2; tCtx.beginPath(); tCtx.arc(half, half/2, knob, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = c3; tCtx.beginPath(); tCtx.arc(half, half + half/2, knob, 0, Math.PI*2); tCtx.fill();
        }

        // 12. 謎の幾何学（七宝・円切り抜き風）
        else if (p.type === 'shippo-pop') {
            tempCanvas.width = s; tempCanvas.height = s;
            
            // 背景の4色グラデーション（コニック）
            // 0f9177 25%, fdebad 50%, d34434 75%, b5d999 100%
            const half = s/2;
            tCtx.fillStyle = "#fdebad"; tCtx.fillRect(half, 0, half, half); // 右上
            tCtx.fillStyle = "#0f9177"; tCtx.fillRect(half, half, half, half); // 右下
            tCtx.fillStyle = "#b5d999"; tCtx.fillRect(0, half, half, half); // 左下
            tCtx.fillStyle = "#d34434"; tCtx.fillRect(0, 0, half, half); // 左上 (※順序は簡易再現)

            // 前面の暗い色でマスク（円形にくり抜く）
            // Canvasで「くり抜き」をするには、全体を塗ってから globalCompositeOperation = 'destination-out' で消すか、
            // 複雑なパスを描く。ここでは「暗い色のマスクを描画」する。
            
            const overlayColor = p.color || '#1a2030';
            
            // 一旦別のキャンバスでマスクを作成
            const maskC = document.createElement('canvas');
            maskC.width = s; maskC.height = s;
            const mCtx = maskC.getContext('2d');
            
            // 全体を暗い色で塗る
            mCtx.fillStyle = overlayColor;
            mCtx.fillRect(0, 0, s, s);
            
            // 円形に穴をあける
            mCtx.globalCompositeOperation = 'destination-out';
            const r = s * 0.35;
            
            // 中央の穴
            mCtx.beginPath(); mCtx.arc(half, half, r, 0, Math.PI*2); mCtx.fill();
            // 四隅の穴（繰り返した時に円になる）
            mCtx.beginPath(); mCtx.arc(0, 0, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(s, 0, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(0, s, r, 0, Math.PI*2); mCtx.fill();
            mCtx.beginPath(); mCtx.arc(s, s, r, 0, Math.PI*2); mCtx.fill();
            
            // マスクを重ねる
            tCtx.drawImage(maskC, 0, 0);
        }

        const pattern = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h);
    }

    window.ChartPatternLibrary = { config: config, draw: draw };
})();