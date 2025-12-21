/**
 * 柄（パターン）設定ファイル
 * 
 * update: ドット拡大、ストライプ幅広、ハート・星・斜めストライプ追加
 */

window.chartPatternsConfig = [
    // 1. 大きめドット（修正：サイズ4→7, 間隔20→30）
    { 
        id: 1, 
        canvas: { type: 'dot', color: '#ffffff', size: 7, spacing: 30, opacity: 0.8 }, 
        thumbUrl: '' 
    },
    // 2. 太めストライプ（修正：幅20→40）
    { 
        id: 2, 
        canvas: { type: 'stripe', color: 'rgba(255,255,255,0.5)', width: 40 }, 
        thumbUrl: '' 
    },
    // 3. ギンガムチェック
    { 
        id: 3, 
        canvas: { type: 'check', color: 'rgba(255,255,255,0.3)', size: 40 }, 
        thumbUrl: '' 
    },
    // 4. 市松模様
    { 
        id: 4, 
        canvas: { type: 'ichimatsu', color: 'rgba(255,255,255,0.4)', size: 40 }, 
        thumbUrl: '' 
    },
    // 5. アーガイル
    { 
        id: 5, 
        canvas: { type: 'argyle', color: 'rgba(255,255,255,0.3)', size: 60 }, 
        thumbUrl: '' 
    },
    // 6. 【新規】ハート（キュート）
    {
        id: 6,
        canvas: { type: 'heart', color: 'rgba(255,255,255,0.6)', size: 24, spacing: 50 },
        thumbUrl: ''
    },
    // 7. 【新規】お星さま（ポップ）
    {
        id: 7,
        canvas: { type: 'star', color: 'rgba(255,255,255,0.7)', size: 15, spacing: 40 },
        thumbUrl: ''
    },
    // 8. 【新規】斜めストライプ（キャンディ）
    {
        id: 8,
        canvas: { type: 'diagonal', color: 'rgba(255,255,255,0.4)', width: 30 },
        thumbUrl: ''
    }
];