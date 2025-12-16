// data/schema.js

// ■ データ項目の定義マップ (基本的な単一項目)
export const FIELD_MAPPING = [
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
    
    { key: 'image',     id: 'inpImageBody' },
    { key: 'icon',      id: 'inpImageIcon' },
    
    { key: 'money',     id: 'inpMoney' },
    { key: 'debt',      id: 'inpDebt' },
    { key: 'db',        id: 'v_db' },
    
    // テキスト・ログ (単一エリアのもの)
    { key: 'spells',    id: 'txtSpells' },
    { key: 'growth',    id: 'txtGrowth' },
    { key: 'encountered', id: 'txtEncountered' },
    
    // シナリオ関連
    { key: 'scenarios', id: 'txtScenarios' },
    { key: 'scenarioDetailsText', id: 'txtScenarioDetails' }
];

// ステータス・バイタル定義
export const STATS_MAPPING = [
    { key: 'STR', id: 's_str' }, { key: 'CON', id: 's_con' },
    { key: 'POW', id: 's_pow' }, { key: 'DEX', id: 's_dex' },
    { key: 'APP', id: 's_app' }, { key: 'SIZ', id: 's_siz' },
    { key: 'INT', id: 's_int' }, { key: 'EDU', id: 's_edu' }
];
export const VITALS_MAPPING = [
    { key: 'hp', id: 'v_hp' }, { key: 'mp', id: 'v_mp' }, { key: 'san', id: 'v_san' }
];

/**
 * いあキャラ形式のテキストを解析
 */
export function parseIaChara(text) {
    const d = { 
        id: crypto.randomUUID(), 
        stats:{}, vitals:{}, memo:{}, 
        skills: {combat:[], explore:[], action:[], negotiate:[], knowledge:[]},
        items: [], weapons: [], scenarioList: [] // weapons配列を追加
    };
    
    // ★修正1: 空文字も許容し、行末までを取得するように正規表現を強化 (mフラグ利用を想定)
    const m = (regex) => {
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

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
    
    d.image = m(/画像URL[:：]\s*(\S+)/) || m(/【画像】\n:(\S+)/) || m(/【立ち絵】\n:(\S+)/);
    d.icon = m(/アイコンURL[:：]\s*(\S+)/) || m(/【アイコン】\n:(\S+)/);
    
    // ★修正1の適用: 改行の前までを取得するように変更 (.*)
    d.money = m(/(?:現在の)?所持金[:：]\s*(.*)$/m);
    d.debt = m(/借金[:：]\s*(.*)$/m);

    // ステータス
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

    // 技能詳細（説明文）のマッピング
    const descMap = {};
    const detailSec = text.split('[技能詳細]')[1];
    if(detailSec) {
        detailSec.split('\n').forEach(l => {
            const match = l.match(/^([^\s…]+)[…\s]+(.+)/);
            if(match) descMap[match[1].trim()] = match[2].trim();
        });
    }

    // 技能配列の生成
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
                    desc: descMap[n]||'', // 詳細テキストもここで結合
                    category: cat
                });
            }
        }
    });

    const getSec = (tag) => {
        const regex = new RegExp(`(?:\\[|【|〈)${tag}(?:\\]|】|〉)([\\s\\S]*?)(?:(?:\\[|【|〈)|$)`);
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };
    
    d.memo.background = getSec('経歴');
    d.memo.personality = getSec('性格');
    d.memo.relations = getSec('人間関係');
    d.memo.appearance = getSec('外見') || getSec('外見的特徴');
    d.memo.roleplay = getSec('RP補足') || getSec('RP用補足');
    d.memo.memo = getSec('メモ');

    d.spells = getSec('魔導書、呪文、アーティファクト') || getSec('魔術');
    d.encountered = getSec('遭遇した超自然の存在') || getSec('遭遇した神話生物');
    d.growth = getSec('新たに得た知識・経験');
    d.scenarios = getSec('通過したシナリオ名') || getSec('通過シナリオ');

    if (d.scenarios) {
        const titles = d.scenarios.match(/\[(.*?)\]/g);
        if(titles) {
            d.scenarioDetailsText = titles.map(t => `${t}\n(詳細未記入)`).join('\n\n');
        } else {
            d.scenarioDetailsText = d.scenarios;
        }
        const entries = d.scenarios.split(/\n(?=\[)/g);
        d.scenarioList = entries.map(entry => {
            const match = entry.match(/^\[(.*?)\]([\s\S]*)$/);
            if (match) return { title: match[1].trim(), desc: match[2].trim() };
            return { title: entry.trim(), desc: '' };
        }).filter(e => e.title);
    }

    // ★修正2: 武器の解析 (配列化)
    const wSection = getSec('戦闘・武器・防具');
    if(wSection) {
        const wLines = wSection.split('\n');
        wLines.forEach(wl => {
            wl = wl.trim();
            if(!wl || wl.includes('名前') && wl.includes('成功率')) return;
            // 複数の空白で区切られていることを想定して分割
            const cols = wl.split(/\s{2,}/); 
            // 名前 成功率 ダメージ 射程 攻撃回数 装弾数 耐久力 故障
            if(cols.length >= 2) {
                d.weapons.push({
                    name: cols[0]||'', 
                    rate: cols[1]||'', 
                    damage: cols[2]||'', 
                    range: cols[3]||'', 
                    attacks: cols[4]||'', 
                    capacity: cols[5]||'', 
                    hp: cols[6]||'', 
                    malfunction: cols[7]||''
                });
            }
        });
    }

    // ★修正3: アイテムの解析 (配列化を確実に)
    const itemSection = getSec('所持品');
    if(itemSection) {
        const lines = itemSection.split('\n');
        lines.forEach(line => {
            if(!line.trim() || line.includes('名称') && line.includes('単価')) return;
            const parts = line.trim().split(/\s+/);
            if(parts.length > 0) {
                const name = parts[0];
                let desc = "";
                if(parts.length >= 5) desc = parts.slice(4).join(' '); // いあキャラ標準形式の場合
                else if(parts.length > 1) desc = parts.slice(1).join(' '); // 簡易形式の場合
                d.items.push({name: name, desc: desc});
            }
        });
    }

    return d;
}

/**
 * 編集画面用: フォームのデータを収集して保存用オブジェクトを作成する
 */
export function collectFormData(currentData = {}, overwriteEmpty = false) {
    
    const newData = { ...currentData };
    newData.stats = { ...(currentData.stats || {}) };
    newData.vitals = { ...(currentData.vitals || {}) };

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : null; 
    };

    // 1. 基本フィールド
    FIELD_MAPPING.forEach(field => {
        const inputVal = getVal(field.id);
        if (inputVal === null) return;
        if (inputVal !== "") {
            newData[field.key] = inputVal;
        } else if (overwriteEmpty) {
            newData[field.key] = "";
        } else if (newData[field.key] === undefined) {
            newData[field.key] = "";
        }
    });

    // 2. 数値ステータス
    const updateNum = (mapping, targetObj) => {
        mapping.forEach(field => {
            const val = getVal(field.id);
            if (val !== null && val !== "") targetObj[field.key] = parseInt(val) || 0;
        });
    };
    updateNum(STATS_MAPPING, newData.stats);
    updateNum(VITALS_MAPPING, newData.vitals);

    // 3. メモ系
    const secs = [];
    const getMemo = (id) => getVal(id);
    const add = (t, val) => { if(val) secs.push(`[${t}]\n${val}`); };
    add('経歴', getMemo('txtBackground')); 
    add('性格', getMemo('txtPersonality'));
    add('人間関係', getMemo('txtRelations')); 
    add('外見的特徴', getMemo('txtAppearance'));
    add('RP補足', getMemo('txtRoleplay')); 
    add('メモ', getMemo('txtMemo'));
    
    const newMemo = secs.join('\n\n');
    if (newMemo || overwriteEmpty) newData.memo = newMemo;

    // 4. ★リストデータの収集 (DOMから収集)
    
    // (A) アイテムリスト
    const itemContainer = document.getElementById('itemList');
    if(itemContainer) {
        const itemRows = itemContainer.querySelectorAll('.item-entry');
        newData.items = Array.from(itemRows).map(row => ({
            name: row.querySelector('.i-name').value,
            desc: row.querySelector('.i-desc').value
        })).filter(i => i.name); // 名前がないものは除外
    }

    // (B) 武器リスト
    const weaponContainer = document.getElementById('weaponList');
    if(weaponContainer) {
        const weaponRows = weaponContainer.querySelectorAll('.weapon-entry');
        newData.weapons = Array.from(weaponRows).map(row => ({
            name: row.querySelector('.w-name').value,
            rate: row.querySelector('.w-rate').value,
            damage: row.querySelector('.w-dmg').value,
            range: row.querySelector('.w-range').value,
            attacks: row.querySelector('.w-atk').value,
            capacity: row.querySelector('.w-cap').value,
            hp: row.querySelector('.w-hp').value,
            malfunction: row.querySelector('.w-mal').value
        })).filter(w => w.name);
    }

    // (C) 技能リスト (数値・詳細)
    // 画面上で編集された値を skills オブジェクトに反映
    // ※今回は簡易的に「全てのカテゴリをスキャンして再構築」します
    const skills = {combat:[], explore:[], action:[], negotiate:[], knowledge:[]};
    ['combat', 'explore', 'action', 'negotiate', 'knowledge'].forEach(cat => {
        const container = document.getElementById(`skill-cat-${cat}`);
        if(container) {
            const rows = container.querySelectorAll('.skill-entry');
            rows.forEach(row => {
                skills[cat].push({
                    category: cat,
                    name: row.querySelector('.s-name').textContent,
                    total: parseInt(row.querySelector('.s-total').value)||0,
                    init: parseInt(row.querySelector('.s-init').value)||0,
                    job: parseInt(row.querySelector('.s-job').value)||0,
                    interest: parseInt(row.querySelector('.s-interest').value)||0,
                    growth: parseInt(row.querySelector('.s-growth').value)||0,
                    desc: row.querySelector('.s-desc').value // 詳細テキスト
                });
            });
        }
    });
    // もし画面にスキル表が展開されていれば更新、なければ既存維持
    if(document.getElementById('skill-cat-combat')) {
        newData.skills = skills;
        // 互換性のため、技能詳細はmemoにも結合テキストとして入れておくなどの処理が必要ならここで行う
    }

    // 5. シナリオリスト
    const scnText = getVal('txtScenarioDetails');
    if (scnText !== null && (scnText !== "" || overwriteEmpty)) {
        const entries = scnText.split(/\n(?=\[)/g);
        newData.scenarioList = entries.map(entry => {
            const match = entry.match(/^\[(.*?)\]([\s\S]*)$/);
            if (match) return { title: match[1].trim(), desc: match[2].trim() };
            const trimmed = entry.trim();
            return trimmed ? { title: trimmed, desc: "" } : null;
        }).filter(e => e);
    }

    return newData;
}