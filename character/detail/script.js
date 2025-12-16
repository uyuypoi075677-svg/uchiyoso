// detail/script.js
import { login, logout, monitorAuth, saveToCloud, loadFromCloud } from "../firestore.js";

let charData = null;
let charts = { main: null, category: null };
const els = {
    boot: document.getElementById('boot-screen'),
    file: document.getElementById('fileInput'),
    tabs: document.getElementById('skillTabs'),
    listBody: document.getElementById('skillListBody'),
    hideToggle: document.getElementById('hideInitToggle'),
    shortDescToggle: document.getElementById('shortDescToggle'),
    summaryViz: document.getElementById('summaryViz'),
    localSave: document.getElementById('btnLocalSave'),
    localLoad: document.getElementById('btnLocalLoad'),
    modal: document.getElementById('loadDialog'),
    savedList: document.getElementById('savedList'),
    infoTabs: document.getElementById('infoTabs'),
    chartTitle: document.getElementById('chartTitle'),
    chartDesc: document.getElementById('chartDesc'),
    dashboard: document.getElementById('dashboard'),
    themeSwitcher: document.getElementById('themeSwitcher'),
    mainStyle: document.getElementById('mainStyle')
};

const CAT_COLORS = { combat: '#ff4444', explore: '#44ff44', action: '#ffaa00', negotiate: '#d000ff', knowledge: '#0088ff', summary: '#00f3ff' };

function adjustHeight(el) {
    if(document.querySelector('.short-view') && !el.matches(':focus') && !el.matches(':hover')) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
}

const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnCloudSave = document.getElementById('btnLocalSave');
const btnCloudLoad = document.getElementById('btnLocalLoad');

if(btnLogin) btnLogin.addEventListener('click', login);
if(btnLogout) btnLogout.addEventListener('click', logout);

monitorAuth(
    (user) => {
        if(btnLogin) btnLogin.classList.add('hidden');
        if(btnLogout) {
            btnLogout.classList.remove('hidden');
            btnLogout.textContent = "DISCONNECT (" + user.displayName + ")";
        }
    },
    () => {
        if(btnLogin) btnLogin.classList.remove('hidden');
        if(btnLogout) btnLogout.classList.add('hidden');
    }
);

if(btnCloudSave) {
    btnCloudSave.addEventListener('click', () => {
        if(!charData) return;
        charData.memo = document.getElementById('memoArea').value;
        saveToCloud(charData);
    });
}

if(btnCloudLoad) {
    btnCloudLoad.addEventListener('click', async () => {
        const cloudStore = await loadFromCloud();
        if(cloudStore) {
            const list = document.getElementById('savedList'); 
            list.innerHTML='';
            Object.keys(cloudStore).forEach(k => {
                const li = document.createElement('li');
                li.textContent = "☁️ " + (cloudStore[k].name || "No Name");
                li.onclick = () => { launchDashboard(cloudStore[k]); document.getElementById('loadDialog').close(); };
                list.appendChild(li);
            });
            document.getElementById('loadDialog').showModal();
        }
    });
}

els.file.addEventListener('change', handleFile);
els.hideToggle.addEventListener('change', () => renderCurrentTab());
els.shortDescToggle.addEventListener('change', (e) => {
    if(e.target.checked) els.listBody.classList.add('short-view');
    else {
        els.listBody.classList.remove('short-view');
        document.querySelectorAll('.skill-desc-inp').forEach(tx => adjustHeight(tx));
    }
});

els.themeSwitcher.addEventListener('click', () => {
    const currentHref = els.mainStyle.getAttribute('href');
    if (currentHref.includes('style-cork.css')) {
        els.mainStyle.setAttribute('href', 'detail/style.css');
        els.themeSwitcher.textContent = '◆ THEME: CYBER';
    } else {
        els.mainStyle.setAttribute('href', 'detail/style-cork.css');
        els.themeSwitcher.textContent = '◆ THEME: ANALOG';
    }
});

els.tabs.addEventListener('click', (e) => {
    if(e.target.classList.contains('tab')) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderSkillSection(e.target.dataset.cat);
    }
});

els.infoTabs.addEventListener('click', (e) => {
    if(e.target.classList.contains('d-tab')) {
        document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const targetId = e.target.dataset.target;
        document.querySelectorAll('.deck-pane').forEach(p => p.classList.remove('active'));
        const targetPane = document.getElementById(targetId);
        targetPane.classList.add('active');
        targetPane.querySelectorAll('textarea').forEach(tx => adjustHeight(tx));
    }
});

document.querySelectorAll('.swap-btn-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
        els.dashboard.classList.toggle('swapped');
        setTimeout(() => {
            document.querySelectorAll('textarea').forEach(tx => {
                if(tx.offsetParent !== null) adjustHeight(tx);
            });
        }, 300); 
    });
});

function handleFile(e) {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
        try {
            const d = parseData(ev.target.result);
            launchDashboard(d);
        } catch(err) { console.error(err); alert('Parse Error: ' + err.message); }
    };
    r.readAsText(f);
}

function launchDashboard(data) {
    charData = data;
    renderProfile(data);
    renderSkillSection('summary'); 
    renderItems(data.items);
    
    document.getElementById('memoArea').value = data.memo;
    
    // ★新機能: シナリオ詳細 (テキスト or リスト)
    const histBox = document.getElementById('scenarioList');
    histBox.innerHTML = '';
    if(Array.isArray(data.scenarioList) && data.scenarioList.length > 0) {
        data.scenarioList.forEach(scn => {
            const div = document.createElement('div');
            div.className = 'scenario-entry';
            div.innerHTML = `<h4 class="scenario-title">${scn.title}</h4><div class="scenario-desc">${scn.desc}</div>`;
            histBox.appendChild(div);
        });
    } else {
        // 旧形式または簡易リスト
        renderSimpleList('scenarioList', data.scenarios, 'scenario-tag');
    }

    document.getElementById('spellsList').textContent = data.spells || 'No records.';
    document.getElementById('entitiesList').textContent = data.encountered || 'No records.'; // entities -> encountered に統一
    
    // ★新機能: 成長履歴・武器・所持金を表示 (DOMがあれば)
    const growthBox = document.getElementById('growthList');
    if(growthBox) growthBox.textContent = data.growth || 'No records.';
    
    const weaponBox = document.getElementById('weaponList');
    if(weaponBox) weaponBox.textContent = data.weapons || 'No records.';

    const moneyEl = document.getElementById('valMoney');
    if(moneyEl) moneyEl.textContent = `Money: ${data.money || 0} / Debt: ${data.debt || 0}`;

    els.boot.classList.add('hidden');
    document.body.classList.add('loaded');
}

function renderCurrentTab() {
    const activeCat = document.querySelector('.tab.active').dataset.cat;
    renderSkillSection(activeCat);
}

// --- PARSER (テキストファイル読み込み用) ---
function parseData(text) {
    // データ構造の初期化 (schema.js と互換性を持たせる)
    const d = {
        id: crypto.randomUUID(),
        name: '', kana: '', job: '', age: '??', tags: '', image: '', db: '±0',
        stats: {}, vitals: {}, skills: {combat:[], explore:[], action:[], negotiate:[], knowledge:[]},
        items: [], memo: '', scenarios: '', spells: '', encountered: '', growth: '', weapons: '', money: '', debt: '', skillList: ''
    };

    const nameLine = (text.match(/名前:\s*(.+)/)||[])[1] || 'Unknown';
    const nameMatch = nameLine.match(/^(.+?)[\s　]*[(（](.+?)[)）]/);
    if(nameMatch) { d.name = nameMatch[1].trim(); d.kana = nameMatch[2].trim(); } 
    else { d.name = nameLine; }

    d.job = (text.match(/職業:\s*(.+)/)||[])[1]||'';
    d.age = (text.match(/年齢:\s*(.+?)\s/)||[])[1]||'??';
    d.tags = (text.match(/タグ:\s*(.+)/)||[])[1]||'';
    d.image = (text.match(/【アイコン】\s*:?(\s*https?:\/\/[^\s]+)/)||[])[1]||'';
    
    // ★追加: 所持金・借金
    d.money = (text.match(/(?:現在の)?所持金[:：]\s*(.+)/)||[])[1]||'';
    d.debt = (text.match(/借金[:：]\s*(.+)/)||[])[1]||'';

    ['STR','CON','POW','DEX','APP','SIZ','INT','EDU'].forEach(k => {
        const regex = new RegExp(`${k}\\s+(\\d+)`);
        d.stats[k] = parseInt((text.match(regex)||['', '0'])[1]);
    });
    
    d.vitals.hp = (text.match(/HP\s+(\d+)/)||[])[1]||0;
    d.vitals.mp = (text.match(/MP\s+(\d+)/)||[])[1]||0;
    d.vitals.san = (text.match(/現在SAN値\s*(\d+)/)||[])[1]||0;
    d.db = (text.match(/DB\s*([+-\d]+[dD\d]*)/)||[])[1] || '±0';

    // 技能説明の抽出
    const descMap = {};
    const detailSec = text.split('[技能詳細]')[1];
    if(detailSec) {
        detailSec.split('\n').forEach(l => {
            const m = l.match(/^([^\s…]+)[…\s]+(.+)/);
            if(m) descMap[m[1].trim()] = m[2].trim();
        });
    }

    // 技能表の解析
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
            const m = l.match(/^([^\d]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
            if(m && m[1].trim()!=='技能名') {
                const n = m[1].trim();
                d.skills[cat].push({
                    name: n, total: parseInt(m[2]), init: parseInt(m[3]), job: parseInt(m[4]), interest: parseInt(m[5]), growth: parseInt(m[6]),
                    desc: descMap[n]||'',
                    category: cat
                });
            }
        }
    });

    // アイテム
    const iSec = text.match(/【所持品】([\s\S]+?)【/);
    if(iSec) iSec[1].split('\n').forEach(l=>{
        l=l.trim(); 
        if(l && !l.startsWith('名称') && !l.startsWith('単価')) {
            const p = l.split(/\s{2,}/); 
            d.items.push({name:p[0], desc:p[p.length-1]!==p[0]?p[p.length-1]:''});
        }
    });

    // 各セクション抽出
    const mSec = (tag) => (text.match(new RegExp(`〈${tag}〉([\\s\\S]*?)(〈|【|$)`))||[])[1]||'';
    d.spells = mSec('魔導書、呪文、アーティファクト').trim();
    d.encountered = mSec('遭遇した超自然の存在').trim();
    d.growth = mSec('新たに得た知識・経験').trim(); // ★追加: 成長履歴
    d.scenarios = mSec('通過したシナリオ名').trim();

    // 武器
    const wMatch = text.match(/【戦闘・武器・防具】([\s\S]*?)【/);
    if(wMatch) d.weapons = wMatch[1].trim();

    // メモ結合ロジック
    const memoTag = text.match(/【メモ】([\s\S]*?)【経歴】/);
    const background = text.match(/【経歴】([\s\S]*?)【性格】/);
    const personality = text.match(/【性格】([\s\S]*?)【人間関係】/);
    const relation = text.match(/【人間関係】([\s\S]*?)【外見】/);
    const appearance = text.match(/【外見】([\s\S]*?)【RP用/);
    const rp = text.match(/【RP用補足メモ】([\s\S]*?)\[技能詳細\]/);

    let fullMemo = "";
    if(memoTag) fullMemo += "[メモ]\n" + memoTag[1].trim() + "\n\n";
    if(background) fullMemo += "[経歴]\n" + background[1].trim() + "\n\n";
    if(personality) fullMemo += "[性格]\n" + personality[1].trim() + "\n\n";
    if(relation) fullMemo += "[人間関係]\n" + relation[1].trim() + "\n\n";
    if(appearance) fullMemo += "[外見]\n" + appearance[1].trim() + "\n\n";
    if(rp) fullMemo += "[RP補足]\n" + rp[1].trim();

    d.memo = fullMemo || ((text.match(/【メモ】([\s\S]*)/)||[])[1]||'');

    return d;
}

function renderProfile(d) {
    document.getElementById('charName').textContent = d.name;
    document.getElementById('charKana').textContent = d.kana;
    document.getElementById('charJob').textContent = d.job;
    document.getElementById('charAge').textContent = `AGE: ${d.age}`;
    document.getElementById('charImage').src = d.image || 'https://placehold.co/400x600/000/333?text=NO+IMAGE';
    document.getElementById('valDB').textContent = d.db; 

    const tags = document.getElementById('charTags'); tags.innerHTML='';
    d.tags.split(' ').forEach(t=>{if(t.trim()) tags.innerHTML+=`<span class="tag">${t}</span>`});

    setBar('HP', d.vitals.hp, 15);
    setBar('MP', d.vitals.mp, 18);
    setBar('SAN', d.vitals.san, 99);

    const sGrid = document.getElementById('rawStatsGrid'); sGrid.innerHTML='';
    Object.keys(d.stats).forEach(k => sGrid.innerHTML+=`<div class="stat-box"><small>${k}</small><span>${d.stats[k]}</span></div>`);

    // チャートやフレーバーテキストの描画は省略（変更なし）
}

function renderSimpleList(id, text, tagClass) {
    const box = document.getElementById(id);
    if(!box) return;
    box.innerHTML = '';
    if(!text) { box.textContent = 'No records.'; return; }
    const lines = text.split('\n');
    lines.forEach(l => {
        if(!l.trim()) return;
        const div = document.createElement('div');
        if(tagClass) div.innerHTML = l.replace(/\[(.*?)\]/g, `<span class="${tagClass}">$1</span>`);
        else div.textContent = l;
        box.appendChild(div);
    });
}

function setBar(id, v, m) {
    document.getElementById(`val${id}`).textContent = `${v}/${m}`;
    document.getElementById(`bar${id}`).style.width = Math.min(100, (v/m)*100) + '%';
}

function renderSkillSection(cat) {
    const hideInit = els.hideToggle.checked;
    let skillsToRender = [];
    
    if(cat === 'summary') {
        ['combat','explore','action','negotiate','knowledge'].forEach(c => {
            skillsToRender = skillsToRender.concat(charData.skills[c] || []);
        });
    } else {
        skillsToRender = charData.skills[cat] || [];
    }

    skillsToRender.sort((a,b) => b.total - a.total);

    els.listBody.innerHTML = '';
    skillsToRender.forEach(s => {
        if(hideInit && s.total === s.init) return;
        const row = document.createElement('tr');
        row.className = `cat-${s.category || cat}`;

        let badge = '';
        if(s.total >= 90) badge = `<span class="mastery-badge badge-legend">LEGEND</span>`;
        else if(s.total >= 80) badge = `<span class="mastery-badge badge-master">MASTER</span>`;

        const max = 100;
        const pInit = (s.init/max)*100;
        const pJob = (s.job/max)*100;
        const pInt = (s.interest/max)*100;
        const pGrow = (s.growth/max)*100;

        row.innerHTML = `
            <td>
                <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">${s.name}${badge}</div>
                <textarea class="skill-desc-inp" placeholder="..." rows="1">${s.desc}</textarea>
            </td>
            <td style="font-family:var(--font-head); font-size:1.2rem; text-align:center; color:#fff">${s.total}</td>
            <td>
                <div class="val-row">
                    <span>Init:${s.init}</span>
                    <span style="color:var(--secondary)">Job:${s.job}</span>
                    <span style="color:var(--accent)">Int:${s.interest}</span>
                    <span style="color:var(--grow)">Grow:${s.growth}</span>
                </div>
                <div class="dist-bar-track">
                    <div class="d-init" style="width:${pInit}%"></div>
                    <div class="d-job" style="width:${pJob}%"></div>
                    <div class="d-int" style="width:${pInt}%"></div>
                    <div class="d-grow" style="width:${pGrow}%"></div>
                </div>
            </td>
        `;

        const tx = row.querySelector('textarea');
        tx.addEventListener('input', (e) => {
            s.desc = e.target.value;
            adjustHeight(e.target);
        });
        setTimeout(() => adjustHeight(tx), 0);

        els.listBody.appendChild(row);
    });
    
    if(els.shortDescToggle.checked) {
        els.listBody.classList.add('short-view');
    }

    renderTabChart(cat, skillsToRender);
}

// チャート描画関数は変更なし
function renderTabChart(cat, skills) { /* ... */ }

function renderItems(items) {
    const list = document.getElementById('itemList'); list.innerHTML='';
    items.forEach(i => {
        const d = document.createElement('div');
        d.className = 'item-row';
        d.innerHTML = `<span class="item-name">${i.name}</span><textarea class="item-desc-inp" rows="1">${i.desc}</textarea>`;
        const tx = d.querySelector('textarea');
        tx.addEventListener('input', (e)=>{ i.desc=e.target.value; adjustHeight(e.target); });
        setTimeout(() => adjustHeight(tx), 0);
        list.appendChild(d);
    });
}

function chartOpts(max) {
    return { scales: { r: { angleLines: {color:'rgba(255,255,255,0.1)'}, grid: {color:'rgba(255,255,255,0.1)'}, pointLabels: {color:'#ddd', font:{size:11, family:'"Zen Kaku Gothic New", sans-serif'}}, suggestedMin:0, suggestedMax:max, ticks:{display:false, backdropColor:'transparent'} }}, plugins: { legend: {display:false} }, maintainAspectRatio: false };
}

window.prepareSaveData = function() {
    if(!charData) { alert("データが読み込まれていません。"); return null; }
    const memo = document.getElementById('memoArea');
    if(memo) charData.memo = memo.value;
    return charData; 
};