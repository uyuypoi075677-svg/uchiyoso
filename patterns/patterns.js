/**
 * 柄（パターン）管理ライブラリ
 * Update: 新規柄（チョコレート、クッション、花柄、パズル、ミステリー）の追加
 */

(function() {
    // ■■■ 1. 柄の設定データ ■■■
    const config = [
        // --- 既存の柄 ---
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
            canvas: { 
                type: 'dot-mix', 
                color: 'rgba(180, 243, 234, 0.8)', 
                color2: 'rgba(255, 188, 188, 0.8)', 
                size: 15, 
                spacing: 60 
            },
            thumbUrl: ''
        },
        {
            id: 7,
            canvas: { 
                type: 'dot-size', 
                color: 'rgba(255, 255, 255, 0.8)', 
                size: 10, 
                size2: 25, 
                spacing: 70 
            },
            thumbUrl: ''
        },
        // --- ▼ 新規追加の柄 ▼ ---
        // 8. チョコレート (幾何学模様)
        {
            id: 8,
            canvas: {
                type: 'chocolate',
                colors: ['#c1a095', '#996349', '#7b4028', '#693319', '#612f0e', '#4c230e', '#2a0b00'],
                size: 20 // 基準サイズ
            },
            thumbUrl: ''
        },
        // 9. クッション (タフティング風)
        {
            id: 9,
            canvas: {
                type: 'cushion',
                // HSL(20deg)ベースのカラーパレット変換値
                colors: ['#993d1f', '#7d260a', '#521907', '#3d1205'], 
                baseColor: '#200902', // 背景の濃い色
                size: 100
            },
            thumbUrl: ''
        },
        // 10. お花柄 (レトロフラワー)
        {
            id: 10,
            canvas: {
                type: 'flower',
                colors: ["#f69524", "#003583", "#f6f0e2"], // 提示されたパレット1番目
                size: 60
            },
            thumbUrl: ''
        },
        // 11. パズル柄
        {
            id: 11,
            canvas: {
                type: 'puzzle',
                colors: ['#4b2889', '#673ab7', '#401c81', '#2d125d'],
                size: 60
            },
            thumbUrl: ''
        },
        // 12. ミステリー (?)
        {
            id: 12,
            canvas: {
                type: 'mystery',
                colors: ['#0f9177', '#fdebad', '#d34434', '#b5d999'],
                overlayColor: '#1a2030',
                size: 120
            },
            thumbUrl: ''
        }
    ];

    // ■■■ 2. 描画ロジック ■■■
    function draw(ctx, w, h, p, scale = 1.0) {
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        if (p.opacity) tCtx.globalAlpha = p.opacity;

        const s = p.spacing ? p.spacing * scale : (p.size * scale);

        // ▼ 1. 斜めドット
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
        // ▼ 6. ドット色違い
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
        // ▼ 7. ドットサイズ違い
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
        // ▼ 8. チョコレート (幾何学模様)
        else if (p.type === 'chocolate') {
            // CSSの複雑なconic-gradientを、板チョコのようなブロックパターンとして再構成
            const sz = p.size * scale; 
            const unitW = sz * 2.5; // 長方形の比率
            const unitH = sz * 1.5;
            tempCanvas.width = unitW * 2;
            tempCanvas.height = unitH * 2;
            
            const colors = p.colors; // c1-c7
            
            // ベース
            tCtx.fillStyle = colors[6]; // Darkest
            tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // ブロックを描画する関数
            const drawBlock = (ox, oy, w, h) => {
                // 側面（左・上）
                tCtx.fillStyle = colors[1];
                tCtx.beginPath(); tCtx.moveTo(ox, oy+h); tCtx.lineTo(ox, oy); tCtx.lineTo(ox+w, oy); tCtx.lineTo(ox+w-sz/2, oy+sz/2); tCtx.lineTo(ox+sz/2, oy+sz/2); tCtx.lineTo(ox+sz/2, oy+h-sz/2); tCtx.fill();
                
                // 側面（右・下）
                tCtx.fillStyle = colors[4];
                tCtx.beginPath(); tCtx.moveTo(ox+w, oy); tCtx.lineTo(ox+w, oy+h); tCtx.lineTo(ox, oy+h); tCtx.lineTo(ox+sz/2, oy+h-sz/2); tCtx.lineTo(ox+w-sz/2, oy+h-sz/2); tCtx.lineTo(ox+w-sz/2, oy+sz/2); tCtx.fill();

                // 上面（トップ）
                tCtx.fillStyle = colors[0];
                tCtx.fillRect(ox+sz/2, oy+sz/2, w-sz, h-sz);
            };

            drawBlock(0, 0, unitW, unitH);
            drawBlock(unitW, unitH, unitW, unitH);
            drawBlock(unitW, 0, unitW, unitH);
            drawBlock(0, unitH, unitW, unitH);
        }
        // ▼ 9. クッション (キルティング風)
        else if (p.type === 'cushion') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            
            // 背景
            tCtx.fillStyle = p.baseColor;
            tCtx.fillRect(0, 0, sz, sz);

            // 菱形グラデーション（簡易表現）
            tCtx.fillStyle = p.colors[0];
            tCtx.beginPath(); tCtx.moveTo(sz/2, 0); tCtx.lineTo(sz, sz/2); tCtx.lineTo(sz/2, sz); tCtx.lineTo(0, sz/2); tCtx.fill();
            
            // 内部の影とハイライト
            tCtx.fillStyle = p.colors[1];
            const inset = sz * 0.1;
            tCtx.beginPath(); tCtx.moveTo(sz/2, inset); tCtx.lineTo(sz-inset, sz/2); tCtx.lineTo(sz/2, sz-inset); tCtx.lineTo(inset, sz/2); tCtx.fill();

            // ボタン（中心と四隅）
            const btnSize = sz * 0.08;
            tCtx.fillStyle = p.colors[3]; // Dark button
            const drawBtn = (x, y) => {
                tCtx.beginPath(); tCtx.arc(x, y, btnSize, 0, Math.PI*2); tCtx.fill();
                // ボタンのハイライト
                tCtx.strokeStyle = 'rgba(255,255,255,0.2)'; tCtx.lineWidth = 1;
                tCtx.beginPath(); tCtx.arc(x, y, btnSize, 0, Math.PI*2); tCtx.stroke();
            };
            
            drawBtn(sz/2, sz/2);
            drawBtn(0, 0); drawBtn(sz, 0); drawBtn(0, sz); drawBtn(sz, sz);
        }
        // ▼ 10. お花柄
        else if (p.type === 'flower') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;
            
            // 背景色
            tCtx.fillStyle = p.colors[2];
            tCtx.fillRect(0, 0, sz, sz);

            // 花を描画
            const cx = sz/2, cy = sz/2;
            const r = sz * 0.25;

            tCtx.fillStyle = p.colors[1]; // 花びら
            // 4枚の花びら
            tCtx.beginPath(); tCtx.arc(cx - r, cy, r, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(cx + r, cy, r, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(cx, cy - r, r, 0, Math.PI*2); tCtx.fill();
            tCtx.beginPath(); tCtx.arc(cx, cy + r, r, 0, Math.PI*2); tCtx.fill();

            // 中心
            tCtx.fillStyle = p.colors[0];
            tCtx.beginPath(); tCtx.arc(cx, cy, r * 0.8, 0, Math.PI*2); tCtx.fill();
        }
        // ▼ 11. パズル柄
        else if (p.type === 'puzzle') {
            const sz = p.size * scale;
            const unit = sz; 
            tempCanvas.width = unit * 2; tempCanvas.height = unit * 2;

            const c = p.colors; // [TL, TR, BL, BR] 的な順序で使用
            const r = unit * 0.25; // 凸凹の半径

            // ベースの4マスを描画
            // 左上
            tCtx.fillStyle = c[3]; tCtx.fillRect(0, 0, unit, unit);
            // 右上
            tCtx.fillStyle = c[0]; tCtx.fillRect(unit, 0, unit, unit);
            // 左下
            tCtx.fillStyle = c[2]; tCtx.fillRect(0, unit, unit, unit);
            // 右下
            tCtx.fillStyle = c[1]; tCtx.fillRect(unit, unit, unit, unit);

            // 凸凹を描画（円で表現）
            // 左上ブロック(c3)の右辺 -> 凸 (c3色で右へはみ出す)
            tCtx.fillStyle = c[3]; tCtx.beginPath(); tCtx.arc(unit, unit/2, r, 0, Math.PI*2); tCtx.fill();
            
            // 右上ブロック(c0)の下辺 -> 凹 (c1色で食い込む = c1の円を描く)
            tCtx.fillStyle = c[1]; tCtx.beginPath(); tCtx.arc(unit + unit/2, unit, r, 0, Math.PI*2); tCtx.fill();

            // 左下ブロック(c2)の上辺 -> 凹 (c3色で食い込む)
            tCtx.fillStyle = c[3]; tCtx.beginPath(); tCtx.arc(unit/2, unit, r, 0, Math.PI*2); tCtx.fill();

            // 右下ブロック(c1)の左辺 -> 凸 (c1色ではみ出す)
            tCtx.fillStyle = c[1]; tCtx.beginPath(); tCtx.arc(unit, unit + unit/2, r, 0, Math.PI*2); tCtx.fill();
        }
        // ▼ 12. ミステリー (円の切り抜き)
        else if (p.type === 'mystery') {
            const sz = p.size * scale;
            tempCanvas.width = sz; tempCanvas.height = sz;

            // 1. 4色の背景を描画 (Conic Gradientの代わり)
            const hSz = sz / 2;
            tCtx.fillStyle = p.colors[1]; tCtx.fillRect(hSz, 0, hSz, hSz); // TR: Yellow
            tCtx.fillStyle = p.colors[2]; tCtx.fillRect(hSz, hSz, hSz, hSz); // BR: Red
            tCtx.fillStyle = p.colors[3]; tCtx.fillRect(0, hSz, hSz, hSz); // BL: LightGreen
            tCtx.fillStyle = p.colors[0]; tCtx.fillRect(0, 0, hSz, hSz); // TL: Green

            // 2. オーバーレイ色で全体を覆うが、円の部分だけ穴をあける
            // destination-out を使うと透明になるので、背景色が見えるようになる
            // しかし、キャンバス自体をパターンにするため、透明にすると「白」ではなく「透け」になる
            // ここでは「オーバーレイ色」を描画し、globalCompositeOperation='destination-out' で穴をあけるのではなく、
            // 「オーバーレイ色のパス」を工夫して描画する（EvenOddルール）
            
            const holeR = sz * 0.35; // 70% width -> radius ~35%

            const drawMask = (ox, oy) => {
                tCtx.fillStyle = p.overlayColor;
                tCtx.beginPath();
                tCtx.rect(0, 0, sz, sz); // 全体
                // 穴 (逆周りにして穴をあける)
                tCtx.arc(ox, oy, holeR, 0, Math.PI*2, true); 
                tCtx.fill('evenodd'); // 中抜き塗り
            }

            // この柄は「穴」の位置が交互になる
            // CSSは radial-gradient(...) と radial-gradient(... calc(s/2)...)
            // 左上と中央に穴がある
            tCtx.fillStyle = p.overlayColor;
            tCtx.beginPath();
            tCtx.rect(0, 0, sz, sz); // 全体を四角で定義
            tCtx.arc(0, 0, holeR, 0, Math.PI*2, true); // 左上隅の穴
            tCtx.arc(sz/2, sz/2, holeR, 0, Math.PI*2, true); // 中央の穴
            // 四隅のつながりを表現するために右下などにも必要だが、繰り返しパターンなので
            // 左上(0,0)にあれば、隣のタイルの右下等はカバーされる
            tCtx.fill('evenodd');
        }
        // --- 既存の柄 ---
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

        const pattern = ctx.createPattern(tempCanvas, 'repeat');
        ctx.fillStyle = pattern; ctx.fillRect(0, 0, w, h);
    }

    window.ChartPatternLibrary = { config: config, draw: draw };
})();