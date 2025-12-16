// --- header.js ---
import { login, logout, saveToCloud, loadFromCloud, monitorAuth } from "./firestore.js";

export function initHeader() {
    // 1. ヘッダーのHTML（見た目）
    // ★追加: div id="headerInfo" を追加して、ここに件数を表示します
    const headerHTML = `
        <header style="background:#111; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; color:#fff; border-bottom:1px solid #333; position:fixed; top:0; left:0; width:100%; z-index:9999; box-sizing:border-box; height:60px;">
            <div style="font-family:'Orbitron', sans-serif; font-weight:bold; color:#fff; display:flex; align-items:center; gap:15px;">
                <span>CYBER_OS <span style="font-size:0.8em; color:#00f3ff;">// SYSTEM_V6.0</span></span>
                <span id="headerInfo" style="font-size:0.8rem; color:#aaa; border:1px solid #444; padding:2px 8px; border-radius:4px;">LOADING...</span>
            </div>
            <div style="display:flex; gap:10px;">
                <button id="globalSaveBtn" class="cyber-btn" style="padding:5px 15px; font-size:0.9rem;">SAVE DATA</button>
                <button id="headerLoginBtn" class="cyber-btn" style="padding:5px 15px; font-size:0.9rem;">LOGIN</button>
                <button id="headerLogoutBtn" class="cyber-btn hidden" style="padding:5px 15px; font-size:0.9rem; display:none;">LOGOUT</button>
            </div>
        </header>
        <div style="height:60px;"></div> `;

    // 2. 挿入（重複防止）
    if(!document.querySelector('header')) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // 3. ボタン機能設定
    const btnLogin = document.getElementById('headerLoginBtn');
    const btnLogout = document.getElementById('headerLogoutBtn');
    const btnSave = document.getElementById('globalSaveBtn');
    const infoSpan = document.getElementById('headerInfo');

    if(btnLogin) btnLogin.addEventListener('click', login);
    if(btnLogout) btnLogout.addEventListener('click', logout);

    if(btnSave) {
        btnSave.addEventListener('click', () => {
            if (typeof window.prepareSaveData === 'function') {
                const dataToSave = window.prepareSaveData(); 
                if(dataToSave) saveToCloud(dataToSave);
            } else {
                alert("このページでは保存機能は使えません（閲覧専用、または準備関数なし）");
            }
        });
    }

    // 4. ログイン監視 & データ件数取得
    monitorAuth(
        async (user) => {
            if(btnLogin) btnLogin.style.display = 'none';
            if(btnLogout) {
                btnLogout.style.display = 'block';
                btnLogout.textContent = "LOGOUT (" + user.displayName + ")";
            }
            
            // ★追加: ログインしたらデータを読み込んで件数を表示
            if(infoSpan) {
                const data = await loadFromCloud();
                const count = data ? Object.keys(data).length : 0;
                infoSpan.textContent = `STORAGE: ${count} CHARS`;
                infoSpan.style.color = "#00f3ff";
                infoSpan.style.borderColor = "#00f3ff";
                
                // もし「一覧画面」なら、ここでリストを再描画するトリガーを引くこともできます
                if(typeof window.renderCharacterList === 'function') {
                    window.renderCharacterList(data);
                }
            }
        },
        () => {
            if(btnLogin) btnLogin.style.display = 'block';
            if(btnLogout) btnLogout.style.display = 'none';
            if(infoSpan) {
                infoSpan.textContent = "OFFLINE";
                infoSpan.style.color = "#aaa";
            }
        }
    );
}