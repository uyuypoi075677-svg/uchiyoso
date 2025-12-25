// --- firestore.js (日本語化・削除機能付き完全版) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// ★削除用に updateDoc, deleteField を追加しました
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZVh6NhFA_BSuyUW-sZV2QPSvSzdYJZWU",
  authDomain: "chocolatmer-uchiyoso.firebaseapp.com",
  projectId: "chocolatmer-uchiyoso",
  storageBucket: "chocolatmer-uchiyoso.firebasestorage.app",
  messagingSenderId: "251681036234",
  appId: "1:251681036234:web:be56156da1210d45afe133"
};

// 初期化処理
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;

// --- 認証機能 ---

// ログイン処理
export function login() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Logged in:", result.user.email);
            alert("ログインしました: " + result.user.displayName);
        }).catch((error) => {
            console.error(error);
            alert("ログインに失敗しました: " + error.message);
        });
}

// ログアウト処理
export function logout() {
    signOut(auth).then(() => {
        alert("ログアウトしました");
    });
}

// ログイン状態の監視
export function monitorAuth(onLogin, onLogout) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            if(onLogin) onLogin(user);
        } else {
            if(onLogout) onLogout();
        }
    });
}

// --- データベース機能 (共有設定) ---

// 2人で共有するための固定された場所を指定
const SHARED_COLLECTION = "rooms";
const SHARED_DOC_ID = "couple_shared_data"; 

// 保存 (SAVE CLOUD)
export async function saveToCloud(charData) {
    if (!currentUser) {
        alert("エラー: データの保存にはログインが必要です。");
        return;
    }
    if (!charData || !charData.name) {
        alert("エラー: 保存するキャラクターデータがありません。");
        return;
    }

    try {
        const sharedRef = doc(db, SHARED_COLLECTION, SHARED_DOC_ID);
        
        // 既存データを取得してマージ
        const docSnap = await getDoc(sharedRef);
        let currentStore = {};
        if (docSnap.exists()) {
            currentStore = docSnap.data().store || {};
        }
        
        currentStore[charData.name] = charData;

        await setDoc(sharedRef, { store: currentStore }, { merge: true });
        
        // 日本語で保存完了を表示
        alert("保存が完了しました: " + charData.name);
        
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("保存エラー: " + e.message);
    }
}

// 読み込み (LOAD CLOUD)
export async function loadFromCloud() {
    if (!currentUser) {
        alert("エラー: データの読み込みにはログインが必要です。");
        return null;
    }

    try {
        const sharedRef = doc(db, SHARED_COLLECTION, SHARED_DOC_ID);
        const docSnap = await getDoc(sharedRef);

        if (docSnap.exists()) {
            return docSnap.data().store || {};
        } else {
            return {};
        }
    } catch (e) {
        console.error("Error loading document: ", e);
        alert("読み込みエラー: " + e.message);
        return null;
    }
}

// 【追加】削除機能 (DELETE CLOUD)
export async function deleteFromCloud(charName) {
    if (!currentUser) {
        alert("エラー: データの削除にはログインが必要です。");
        return;
    }
    if (!charName) return;

    if (!confirm(charName + " を削除しますか？\nこの操作は取り消せません。")) {
        return;
    }

    try {
        const sharedRef = doc(db, SHARED_COLLECTION, SHARED_DOC_ID);
        
        // 現在の保存構造に合わせて特定のキャラデータのみを削除
        await updateDoc(sharedRef, {
            [`store.${charName}`]: deleteField()
        });
        
        alert("削除しました: " + charName);
        
        // 画面をリロードして反映させたい場合は以下を有効化
        // location.reload();

    } catch (e) {
        console.error("Delete error:", e);
        alert("削除エラー: " + e.message);
    }
}