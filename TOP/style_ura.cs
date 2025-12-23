@charset "UTF-8";

/* === 裏サイト（水色テーマ）の変数上書き === */
:root {
    /* メインカラーを水色系に変更（勿忘草色） */
    --accent-pink: #89c3eb; 
    
    /* グラデーションも青系に */
    --accent-gradient: linear-gradient(135deg, #89c3eb 0%, #a0d8ef 100%);
    
    /* 文字色を少し冷たい色味に */
    --text-main: #384d5a;
    --text-sub: #5f7a8b;
    
    /* ガラスの枠線なども少し青くする */
    --glass-border: rgba(220, 240, 255, 0.5);
    --glass-bg: rgba(240, 250, 255, 0.25);
}

/* === 背景設定 === */
body {
    /* 
       1. 基本の背景色を水色にします
    */
    background-color: #e0f7fa;

    /* 
       2. 画像の指定
       もし「水色の背景画像」をお持ちなら、下の行のコメント(//)を外してファイル名を書き換えてください。
       指定がない場合は、表のピンク画像がそのまま使われます。
    */
     background-image: url('../images/background/fur-texture-blue.png'); 

    /* 
       3. 色の合成モード
       表のピンク画像を使う場合、ここで「色相(hue)」や「カラー(color)」を指定して
       無理やり水色になじませます。
       画像を変えた場合は、この行は削除しても大丈夫です。
    */
    background-blend-mode: hard-light; 
}

/* === その他の微調整 === */

/* 時計の枠線色 */
.digital-clock {
    border-color: #d1e8f5;
    color: var(--accent-pink);
}

/* ニュースバーの背景を少し寒色に */
.top-news-bar, .header-right-area {
    background: #f0f8ff; /* アリスブルー */
    border-bottom-color: var(--accent-pink);
    box-shadow: -10px 0 10px -5px #f0f8ff; /* 影の色合わせ */
}

/* 下部リボンの色合わせ */
.ribbon-bar {
    background: #f0f8ff;
    border-top-color: var(--accent-pink);
}
.ribbon-stitch {
    border-color: rgba(137, 195, 235, 0.5);
}

/* ティッカー（流れる文字）の背景色 */
.area-ticker {
    background: rgba(224, 247, 250, 0.4);
    box-shadow: var(--glass-shadow), inset 0 0 20px rgba(137, 195, 235, 0.2);
}