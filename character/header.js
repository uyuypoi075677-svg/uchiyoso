import { login, logout, saveToCloud, loadFromCloud, monitorAuth } from "./firestore.js";

export function initHeader() {
    // 1. ヘッダーのHTML（見た目）
    const headerHTML = `
        <header style="background:rgba(10,10,12,0.95); backdrop-filter:blur(5px); padding:0 20px; display:flex; justify-content:space-between; align-items:center; color:#fff; border-bottom:1px solid #333; position:fixed; top:0; left:0; width:100%; height:50px; z-index:9999; box-sizing:border-box;">
            
            <a href="list.html" style="text-decoration:none; color:inherit;">
                <div style="font-family:'Orbitron', sans-serif; font-weight:bold; display:flex; align-items:center; gap:15px;">
                    <span>CYBER_OS <span style="font-size:0.8em; color:#00f3ff;">// SYSTEM_V6.0</span></span>
                    <span id="headerInfo" style="font-size:0.7rem; color:#aaa; border:1px solid #444; padding:2px 8px; border-radius:4px;">LOADING...</span>
                </div>
            </a>

            <div style="display:flex; gap:10px; align-items:center;">
                <button id="globalSaveBtn" class="cyber-btn" style="padding:4px 12px; font-size:0.8rem; border:1px solid #00f3ff; background:rgba(0,243,255,0.1); color:#00f3ff; cursor:pointer;">SAVE</button>
                <button id="headerLoginBtn" class="cyber-btn" style="padding:4px 12px; font-size:0.8rem; border:1px solid #555; background:#333; color:#fff; cursor:pointer;">LOGIN</button>
                <button id="headerLogoutBtn" class="cyber-btn hidden" style="padding:4px 12px; font-size:0.8rem; border:1px solid #ff4444; background:rgba(255,68,68,0.1); color:#ff4444; cursor:pointer; display:none;">LOGOUT</button>
            </div>
        </header>
        <div style="height:50px;"></div> `;

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

    // 保存ボタンの設定
    if(btnSave) {
        btnSave.addEventListener('click', () => {
            // 詳細画面（detail.html）など、保存機能を持っているページの場合
            if (typeof window.prepareSaveData === 'function') {
                const dataToSave = window.prepareSaveData(); 
                if(dataToSave) saveToCloud(dataToSave);
            } else {
                // リスト画面（list.html）の場合
                alert("一覧画面での画像変更は、各カードの📷ボタンを使ってください。\nステータスの変更はカードをクリックして詳細画面で行ってください。");
            }
        });
    }

    // 4. ログイン監視 & データ件数取得
    monitorAuth(
        async (user) => {
            if(btnLogin) btnLogin.style.display = 'none';
            if(btnLogout) {
                btnLogout.style.display = 'block';
                btnLogout.textContent = "LOGOUT";
            }
            
            // ログインしたらデータを読み込んで件数を表示
            if(infoSpan) {
                const data = await loadFromCloud();
                const count = data ? Object.keys(data).length : 0;
                infoSpan.textContent = `STORAGE: ${count}`; // CHARSの文字を消してスッキリさせました
                infoSpan.style.color = "#00f3ff";
                infoSpan.style.borderColor = "#00f3ff";
                
                // もし「一覧画面」なら、ここでリストを再描画するトリガーを引く
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