/**
 * 柄（パターン）設定ファイル
 * 
 * window.chartPatternsConfig という変数に配列を格納します。
 * 分布メーカー側でこの変数を読み取って柄を表示します。
 */

window.chartPatternsConfig = [
    { 
        id: 1, 
        canvas: { type: 'dot', color: '#ffffff', size: 4, spacing: 20, opacity: 0.7 }, 
        thumbUrl: '' 
    },
    { 
        id: 2, 
        canvas: { type: 'stripe', color: 'rgba(255,255,255,0.4)', width: 20 }, 
        thumbUrl: '' 
    },
    { 
        id: 3, 
        canvas: { type: 'check', color: 'rgba(255,255,255,0.3)', size: 40 }, 
        thumbUrl: '' 
    },
    { 
        id: 4, 
        canvas: { type: 'ichimatsu', color: 'rgba(255,255,255,0.4)', size: 40 }, 
        thumbUrl: '' 
    },
    { 
        id: 5, 
        canvas: { type: 'argyle', color: 'rgba(255,255,255,0.3)', size: 60 }, 
        thumbUrl: '' 
    }
];