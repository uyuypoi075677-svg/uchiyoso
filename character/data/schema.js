// data/schema.js

// ■ データ項目の定義マップ (全ての保存対象データ)
export const FIELD_MAPPING = [
    // 基本情報
    { key: 'name',      id: 'inpName' },
    { key: 'kana',      id: 'inpKana' },
    { key: 'job',       id: 'inpJob' },
    { key: 'tags',      id: 'inpTags' },
    { key: 'age',       id: 'inpAge' },
    { key: 'gender',    id: 'inpGender' },
    { key: 'birthday',  id: 'inpBirthday' },
    { key: 'birthplace',id: 'inpOrigin' },
    { key: 'height',    id: 'inpHeight' },
    { key: 'weight',    id: 'inpWeight' },
    { key: 'colorHair', id: 'inpHair' },
    { key: 'colorEye',  id: 'inpEye' },
    { key: 'colorSkin', id: 'inpSkin' },
    
    // 画像
    { key: 'image',     id: 'inpImageBody' },
    { key: 'icon',      id: 'inpImageIcon' },
    
    // 金銭・戦闘・DB
    { key: 'money',     id: 'inpMoney' },
    { key: 'debt',      id: 'inpDebt' },
    { key: 'db',        id: 'v_db' },
    
    // 詳細テキスト・ログ
    { key: 'spells',    id: 'txtSpells' },
    { key: 'growth',    id: 'txtGrowth' },         // 成長履歴
    { key: 'encountered', id: 'txtEncountered' },  // 遭遇した存在
    { key: 'weapons',   id: 'txtWeapons' },        // 武器・防具
    { key: 'skillList', id: 'txtSkillList' },      // 技能表(数値テキスト)
    
    // シナリオ関連
    { key: 'scenarios', id: 'txtScenarios' },                // 簡易リスト
    { key: 'scenarioDetailsText', id: 'txtScenarioDetails' } // 詳細ログ
];

// ステータス定義
export const STATS_MAPPING = [
    { key: 'STR', id: 's_str' }, { key: 'CON', id: 's_con' },
    { key: 'POW', id: 's_pow' }, { key: 'DEX', id: 's_dex' },
    { key: 'APP', id: 's_app' }, { key: 'SIZ', id: 's_siz' },
    { key: 'INT', id: 's_int' }, { key: 'EDU', id: 's_edu' }
];

// バイタル定義
export const VITALS_MAPPING = [
    { key: 'hp', id: 'v_hp' }, { key: 'mp', id: 'v_mp' }, { key: 'san', id: 'v_san' }
];

/**
 * いあキャラ形式のテキストを解析して、全ての画面で使える共通データオブジェクトを作る
 * ★詳細画面のグラフ用データ、アイテム詳細、成長履歴なども全てここで抽出します
 */
export function parseIaChara(text) {
    const d = { 
        id: crypto.randomUUID(), 
        stats:{}, vitals:{}, memo:{}, 
        // ★詳細画面のグラフ描画に必須の構造
        skills: {combat:[], explore:[], action:[], negotiate:[], knowledge:[]},
        items: [], scenarioList: []
    };
    const m = (regex) => (text.match(regex)||[])[1]||'';

    // --- 基本情報 ---
    const nameLine = m(/名前[:：]\s*(.+)/) || 'Unknown';
    const nameMatch = nameLine.match(/^(.+?)[\s　]*[(（](.+?)[)）]/);
    if(nameMatch) { d.name = nameMatch[1].trim(); d.kana = nameMatch[2].trim(); } 
    else { d.name = nameLine; }

    d.job = m(/職業[:：]\s*(.+?)(?=\s|$)/);
    d.tags = m(/タグ[:：]\s*(.+)/);
    d.age = m(/年齢[:：]\s*(\d+)/);
    d.gender = m(/性別[:：]\s*(\S+)/);
    d.height = m(/身長[:：]\s*(\d+)/);
    d.weight = m(/体重[:：]\s*(\d+)/);
    d.birthday = m(/誕生日[:：]\s*(\S+)/);
    d.origin = m(/出身[:：]\s*(\S+)/);
    d.hair = m(/髪の色[:：]\s*(\S+)/);
    d.eye = m(/瞳の色[:：]\s*(\S+)/);
    d.skin = m(/肌の色[:：]\s*(\S+)/);
    
    // 画像URLの取得（旧形式にも対応）
    d.image = m(/画像URL[:：]\s*(\S+)/) || m(/【画像】\n:(\S+)/) || m(/【立ち絵】\n:(\S+)/);
    d.icon = m(/アイコンURL[:：]\s*(\S+)/) || m(/【アイコン】\n:(\S+)/);
    
    d.money = m(/(?:現在の)?所持金[:：]\s*(.+)/);
    d.debt = m(/借金[:：]\s*(.+)/);

    // --- ステータス (グラフ描画に必須) ---
    const getStat = (name) => {
        const reg = new RegExp(`${name}[\\s:：]+(\\d+)`);
        return parseInt(m(reg)) || 0;
    };
    d.stats.STR = getStat('STR'); d.stats.CON = getStat('CON');
    d.stats.POW = getStat('POW'); d.stats.DEX = getStat('DEX');
    d.stats.APP = getStat('APP'); d.stats.SIZ = getStat('SIZ');
    d.stats.INT = getStat('INT'); d.stats.EDU = getStat('EDU');
    d.vitals.hp = getStat('HP'); d.vitals.mp = getStat('MP');
    d.vitals.san = parseInt(m(/SAN[:：\s]+(\d+)/)) || getStat('SAN');
    d.db = m(/DB[:：\s]+([+-]\S+)/);

    // --- 技能詳細（説明文）のマッピング ---
    const descMap = {};
    const detailSec = text.split('[技能詳細]')[1];
    if(detailSec) {
        detailSec.split('\n').forEach(l => {
            const match = l.match(/^([^\s…]+)[…\s]+(.+)/);
            if(match) descMap[match[1].trim()] = match[2].trim();
        });
    }

    // --- ★技能配列の生成 (詳細画面のグラフ用) ---
    const lines = text.split('\n');
    let cat = null;
    lines.forEach(l => {
        l = l.trim();
        if(l.includes('『戦闘技能』')) cat='combat';
        else if(l.includes('『探索技能』')) cat='explore';
        else if(l.includes('『行動技能』')) cat='action';
        else if(l.includes('『交渉技能』')) cat='negotiate';
        else if(l.includes('『知識技能』')) cat='knowledge';
        else if(l.startsWith('【')) cat=null;

        if(cat) {
            // "技能名 合計 初期値..." の並びを解析
            const match = l.match(/^([^\d]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
            if(match && match[1].trim()!=='技能名') {
                const n = match[1].trim();
                d.skills[cat].push({
                    name: n, 
                    total: parseInt(match[2]), 
                    init: parseInt(match[3]), 
                    job: parseInt(match[4]), 
                    interest: parseInt(match[5]), 
                    growth: parseInt(match[6]),
                    desc: descMap[n]||'',
                    category: cat
                });
            }
        }
    });

    // --- テキストセクションの抽出ヘルパー ---
    const getSec = (tag) => {
        // [タグ] や 【タグ】 や 〈タグ〉 に対応
        const regex = new RegExp(`(?:\\[|【|〈)${tag}(?:\\]|】|〉)([\\s\\S]*?)(?:(?:\\[|【|〈)|$)`);
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };
    
    // メモ系
    d.memo.background = getSec('経歴');
    d.memo.personality = getSec('性格');
    d.memo.relations = getSec('人間関係');
    d.memo.appearance = getSec('外見') || getSec('外見的特徴');
    d.memo.roleplay = getSec('RP補足') || getSec('RP用補足');
    // 技能詳細（全体、または職業P/趣味Pの結合）
    d.memo.skillDetails = getSec('技能詳細') || [getSec('職業P振り分け詳細'), getSec('趣味P振り分け詳細')].filter(Boolean).join('\n\n');
    d.memo.memo = getSec('メモ');

    // 知識・経験系
    d.spells = getSec('魔導書、呪文、アーティファクト') || getSec('魔術');
    d.encountered = getSec('遭遇した超自然の存在') || getSec('遭遇した神話生物');
    d.growth = getSec('新たに得た知識・経験');
    d.scenarios = getSec('通過したシナリオ名') || getSec('通過シナリオ');

    // シナリオ詳細変換（[タイトル] 形式）
    if (d.scenarios) {
        const titles = d.scenarios.match(/\[(.*?)\]/g);
        if(titles) {
            d.scenarioDetailsText = titles.map(t => `${t}\n(詳細未記入)`).join('\n\n');
        } else {
            d.scenarioDetailsText = d.scenarios;
        }
        // 詳細画面リスト用オブジェクト配列
        const entries = d.scenarios.split(/\n(?=\[)/g);
        d.scenarioList = entries.map(entry => {
            const match = entry.match(/^\[(.*?)\]([\s\S]*)$/);
            if (match) return { title: match[1].trim(), desc: match[2].trim() };
            return { title: entry.trim(), desc: '' };
        }).filter(e => e.title);
    }

    // 技能リスト表（編集画面のテキストエリア用、数値表そのもの）
    const skillStart = text.indexOf('【技能値】');
    const nextSec = text.match(/【(戦闘|所持品|メモ)/);
    const skillEnd = nextSec ? nextSec.index : text.length;
    if (skillStart !== -1) {
        d.skillList = text.substring(skillStart + 5, skillEnd).trim();
    }

    // 武器
    const wMatch = text.match(/【戦闘・武器・防具】([\s\S]*?)【/);
    if(wMatch) d.weapons = wMatch[1].trim();

    // 所持品 (配列化とテキスト化)
    const itemSection = getSec('所持品');
    if(itemSection) {
        const lines = itemSection.split('\n');
        const items = [];
        lines.forEach(line => {
            if(!line.trim() || line.includes('名称') && line.includes('単価')) return;
            const parts = line.trim().split(/\s+/);
            if(parts.length > 0) {
                const name = parts[0];
                let desc = "";
                // 名称 単価 個数 価格 備考... の順
                if(parts.length >= 5) desc = parts.slice(4).join(' ');
                else if(parts.length > 1) desc = parts.slice(1).join(' ');
                items.push(desc ? `${name} : ${desc}` : name);
                
                d.items.push({name: name, desc: desc});
            }
        });
        d.itemsStr = items.join('\n');
    }

    return d;
}

/**
 * 編集画面用: フォームのデータを収集して保存用オブジェクトを作成する
 * @param {Object} currentData - 既存のデータ（Firebaseから読み込んだもの）
 * @param {boolean} overwriteEmpty - 空欄の場合に上書きするか？ (false=安全モード: 既存データを守る)
 */
export function collectFormData(currentData = {}, overwriteEmpty = false) {
    
    // 既存データをベースにコピー (画面にない隠しデータも維持)
    const newData = { ...currentData };
    newData.stats = { ...(currentData.stats || {}) };
    newData.vitals = { ...(currentData.vitals || {}) };

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : null; 
    };

    // 1. 基本フィールド処理
    FIELD_MAPPING.forEach(field => {
        const inputVal = getVal(field.id);
        
        // HTML要素が存在しない場合はスキップ (データ保護)
        if (inputVal === null) return;

        if (inputVal !== "") {
            // 入力があれば更新
            newData[field.key] = inputVal;
        } else {
            // 入力が「空」の場合
            if (overwriteEmpty) {
                // 上書きモードなら空にする (削除)
                newData[field.key] = "";
            } else {
                // ★安全モード (ここが重要)
                // 既存データが undefined (未定義) の場合のみ空文字を入れる。
                // すでにデータが入っている場合は、空欄であっても触らず維持する。
                if (newData[field.key] === undefined) {
                    newData[field.key] = "";
                }
            }
        }
    });

    // 2. ステータス・バイタル (数値系)
    const updateNum = (mapping, targetObj) => {
        mapping.forEach(field => {
            const val = getVal(field.id);
            if (val !== null && val !== "") {
                targetObj[field.key] = parseInt(val) || 0;
            }
        });
    };
    updateNum(STATS_MAPPING, newData.stats);
    updateNum(VITALS_MAPPING, newData.vitals);

    // 3. メモの結合 (画面の状態を正とする)
    const secs = [];
    const getMemo = (id) => getVal(id);
    const add = (t, val) => { if(val) secs.push(`[${t}]\n${val}`); };
    
    add('経歴', getMemo('txtBackground')); 
    add('性格', getMemo('txtPersonality'));
    add('人間関係', getMemo('txtRelations')); 
    add('外見的特徴', getMemo('txtAppearance'));
    add('RP補足', getMemo('txtRoleplay')); 
    add('技能詳細', getMemo('txtSkillDetails'));
    add('メモ', getMemo('txtMemo'));
    
    const newMemo = secs.join('\n\n');
    // メモは「空欄上書きOK」か「入力がある場合」に更新
    if (newMemo || overwriteEmpty) {
        newData.memo = newMemo;
    }

    // 4. アイテム処理
    const itemText = getVal('txtItems');
    if (itemText !== null && (itemText !== "" || overwriteEmpty)) {
         const itemLines = itemText.split('\n');
         newData.items = itemLines.filter(l=>l.trim()).map(line => {
            const parts = line.split(/[:：]/);
            if(parts.length > 1) return { name: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
            return { name: line.trim(), desc: '' };
        });
    }

    // 5. シナリオ詳細リスト
    const scnText = getVal('txtScenarioDetails');
    if (scnText !== null && (scnText !== "" || overwriteEmpty)) {
        const entries = scnText.split(/\n(?=\[)/g);
        newData.scenarioList = entries.map(entry => {
            const match = entry.match(/^\[(.*?)\]([\s\S]*)$/);
            if (match) {
                return { title: match[1].trim(), desc: match[2].trim() };
            }
            const trimmed = entry.trim();
            return trimmed ? { title: trimmed, desc: "" } : null;
        }).filter(e => e);
    }

    return newData;
}