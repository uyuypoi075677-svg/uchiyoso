import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// ★不足していた addDoc, query, where, serverTimestamp などを追加しました
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc, query, where, serverTimestamp } 
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

export function logout() {
    signOut(auth).then(() => {
        alert("ログアウトしました");
    });
}

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

// --- データベース機能 (キャラクター) ---

const SHARED_COLLECTION = "rooms";
const SHARED_DOC_ID = "couple_shared_data";
const CHAR_SUB_COLLECTION = "characters"; 

// 保存 (SAVE) - IDを基準に保存するように修正
export async function saveToCloud(charData) {
    if (!currentUser) {
        alert("エラー: データの保存にはログインが必要です。");
        return;
    }
    if (!charData || !charData.id) {
        alert("エラー: IDがありません。保存できません。");
        return;
    }

    try {
        // ★修正点: 名前(name)ではなく、IDをファイル名として保存します
        // これにより名前を変更してもファイルが増殖しません
        const charRef = doc(db, SHARED_COLLECTION, SHARED_DOC_ID, CHAR_SUB_COLLECTION, charData.id);
        
        await setDoc(charRef, charData, { merge: true });
        
        alert("保存が完了しました: " + charData.name);
        
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("保存エラー: " + e.message);
    }
}

// 読み込み (LOAD) - ID対応
export async function loadFromCloud() {
    if (!currentUser) {
        alert("エラー: データの読み込みにはログインが必要です。");
        return null;
    }

    try {
        const colRef = collection(db, SHARED_COLLECTION, SHARED_DOC_ID, CHAR_SUB_COLLECTION);
        const querySnapshot = await getDocs(colRef);

        const loadedData = {};
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // ★重要: 古いデータ(IDがない)場合、ドキュメント名をIDとして扱う救済処置
            if (!data.id) {
                data.id = docSnap.id;
            }

            // IDをキーにしてデータを格納
            loadedData[data.id] = data;
        });

        if (Object.keys(loadedData).length === 0) {
            console.log("データが見つかりませんでした。");
        }

        return loadedData;

    } catch (e) {
        console.error("Error loading document: ", e);
        alert("読み込みエラー: " + e.message);
        return null;
    }
}

// 削除 (DELETE) - ID基準に修正
export async function deleteFromCloud(charId) {
    if (!currentUser) return;
    if (!charId) return;

    try {
        // ★修正点: 名前ではなくIDを指定して削除します
        const charRef = doc(db, SHARED_COLLECTION, SHARED_DOC_ID, CHAR_SUB_COLLECTION, charId);
        await deleteDoc(charRef);
        
        alert("削除しました。");
        location.reload(); 

    } catch (e) {
        console.error("Delete error:", e);
        alert("削除エラー: " + e.message);
    }
}

// --- シナリオデータ (Scenarios) ---
// ★以下、削除されていたコードを復旧しました

// シナリオを新規保存 (scenariosコレクション)
export async function saveScenario(scenarioData) {
    if (!currentUser) throw new Error("User not logged in");
    
    // サーバー時間を付与
    const dataToSave = {
        ...scenarioData,
        updatedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, "scenarios"), dataToSave);
        console.log("Scenario saved ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding scenario: ", e);
        throw e;
    }
}

// キャラクターIDからシナリオを取得
export async function getScenariosForCharacter(charId) {
    if (!currentUser) return [];
    try {
        // 参加メンバー(members配列)にcharIdが含まれているものを検索
        const q = query(
            collection(db, "scenarios"),
            where("members", "array-contains", charId)
        );
        const querySnapshot = await getDocs(q);
        const scenarios = [];
        querySnapshot.forEach((doc) => {
            scenarios.push({ id: doc.id, ...doc.data() });
        });
        // 日付順ソート (新しい順)
        return scenarios.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.error(e);
        return [];
    }
}