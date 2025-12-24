// js/dialogue_system.js

// ■ 台詞項目の定義マップ (ここですべて管理)
export const DIALOGUE_MAPPING = [
    // --- DAILY / 日常 ---
    { key: 'dialogue_default', id: 'txtDialogueDefault', label: '基本・自己紹介' },
    { key: 'dialogue_morning', id: 'txtDialogueMorning', label: '朝 (Morning)' },
    { key: 'dialogue_day',     id: 'txtDialogueDay',     label: '昼 (Day)' },
    { key: 'dialogue_night',   id: 'txtDialogueNight',   label: '夜 (Night)' },
    { key: 'dialogue_wait',    id: 'txtDialogueWait',    label: '待機中 (Waiting)' }, // NEW
    { key: 'dialogue_afk',     id: 'txtDialogueAfk',     label: '放置中 (AFK/Sleep)' }, // NEW
    
    // --- RELATION / 関係性 ---
    { key: 'dialogue_about_others', id: 'txtDialogueAboutOthers', label: '誰かについて (噂話)' }, // NEW
    { key: 'dialogue_thanks',       id: 'txtDialogueThanks',      label: '感謝 (Thanks)' },
    { key: 'dialogue_apology',      id: 'txtDialogueApology',     label: '謝罪 (Sorry)' },
    { key: 'dialogue_love',         id: 'txtDialogueLove',        label: '好意・恋愛 (Love)' },
    { key: 'dialogue_duo_generic',  id: 'txtDialogueDuo',         label: '汎用DUO反応' },

    // --- BATTLE & CONDITION / 戦闘・状態 ---
    { key: 'dialogue_battle_start',  id: 'txtDialogueBattleStart',  label: '戦闘開始' },
    { key: 'dialogue_battle_crit',   id: 'txtDialogueBattleCrit',   label: 'クリティカル' },
    { key: 'dialogue_battle_fumble', id: 'txtDialogueBattleFumble', label: 'ファンブル' },
    { key: 'dialogue_lowsan',        id: 'txtDialogueLowSan',       label: '低SAN値 (Low Sanity)' },
    { key: 'dialogue_insanity',      id: 'txtDialogueInsanity',     label: '発狂中 (Insanity)' }
];

// ■ DUO会話のシチュエーションタグ候補
export const DUO_SITUATIONS = [
    "日常 (Normal)",
    "買い物 (Shopping)",
    "喧嘩 (Quarrel)",
    "共闘 (Battle)",
    "秘密の話 (Secret)",
    "ギャグ (Comedy)"
];

/**
 * テキストからランダムに1行を取得
 */
export function pickRandomLine(text) {
    if (!text) return null;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");
    if (lines.length === 0) return null;
    return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * 状況に応じたホーム画面用セリフを取得
 * @param {Object} charData - キャラクターデータ
 * @param {Object} statusOpts - { isAfk: boolean, isBattle: boolean, ... }
 */
export function getHomeDialogue(charData, statusOpts = {}) {
    if (!charData) return "...";
    
    // 1. 放置中 (AFK)
    if (statusOpts.isAfk) {
        const afk = pickRandomLine(charData.dialogue_afk);
        if (afk) return afk;
    }

    // 2. SAN値ピンチ
    if (charData.vitals && charData.vitals.san <= 30) {
        const lowSan = pickRandomLine(charData.dialogue_lowsan);
        if (lowSan) return lowSan;
    }

    // 3. 待機 (クリック連打された時などに使用)
    if (statusOpts.isWaiting) {
        const wait = pickRandomLine(charData.dialogue_wait);
        if (wait) return wait;
    }

    // 4. 時間帯
    const hour = new Date().getHours();
    let timeLine = null;
    if (hour >= 5 && hour < 11) timeLine = pickRandomLine(charData.dialogue_morning);
    else if (hour >= 11 && hour < 18) timeLine = pickRandomLine(charData.dialogue_day);
    else timeLine = pickRandomLine(charData.dialogue_night);

    if (timeLine) return timeLine;

    // 5. デフォルト
    return pickRandomLine(charData.dialogue_default) || "......";
}