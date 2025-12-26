// --- data/scenario.js ---

/**
 * フォームの入力値から、保存用のシナリオデータを作成する
 * @param {Object} input - HTMLフォームからの入力値
 * @param {string} userId - ログインユーザーID
 */
export function createScenarioRecord(input, userId) {
    // メンバー配列の作成（検索用）
    const members = [];
    if (input.pc_key) members.push(input.pc_key);
    if (input.kpc_key) members.push(input.kpc_key);

    return {
        // 管理情報
        userId: userId,
        createdAt: new Date().toISOString(),

        // 基本情報
        title: input.title,
        system: input.system,
        date: input.date,
        gm: input.gm,
        type: "uchiyoso",

        // 検索用: 参加キャラクター名リスト
        members: members,
        pc: input.pc_key || "",
        kpc: input.kpc_key || "",

        // 結果
        result: input.result, // Alive/Lost
        endName: input.endName,

        // 詳細データ
        outline: input.outline || "",
        
        // 報酬・成長
        rewards: {
            items: input.rewards,
            san: input.sanChange
        }, 
        entities: input.mythos,
        growth: input.growth,

        // メモ
        memos: {
            pc: input.impression_pc,
            kpc: input.impression_kpc,
            public: input.comment_public,
            secret: input.comment_secret
        }
    };
}

/**
 * シナリオデータを元に、キャラクターデータを更新して新しいデータを返す
 * (saveToCloudに渡すためのデータ作成)
 */
export function syncScenarioToCharacter(charData, scenarioData, scenarioId) {
    // データのコピー
    const newChar = JSON.parse(JSON.stringify(charData));

    // 1. 通過シナリオ簡易一覧 (scenarios)
    const resultStr = scenarioData.result === 'Alive' ? '生還' : 'ロスト';
    const endStr = scenarioData.endName ? ` - ${scenarioData.endName}` : '';
    const dateStr = scenarioData.date ? `(${scenarioData.date})` : '';
    
    const newHistoryLine = `[${scenarioData.title}] ${resultStr}${endStr} ${dateStr}`;
    
    // 文字列か配列かで分岐して追加
    if (Array.isArray(newChar.scenarios)) {
        newChar.scenarios.unshift(newHistoryLine);
    } else {
        const current = newChar.scenarios || "";
        newChar.scenarios = newHistoryLine + "\n" + current;
    }

    // 2. 詳細シナリオログ (配列)
    if (!newChar.scenarioList) newChar.scenarioList = [];
    newChar.scenarioList.push({
        scenarioId: scenarioId,
        title: scenarioData.title,
        date: scenarioData.date,
        kp: scenarioData.gm,
        system: scenarioData.system,
        result: resultStr,
        end: scenarioData.endName,
        sanChange: scenarioData.rewards.san || '-',
        memo: scenarioData.memos.pc || scenarioData.memos.kpc // 簡易表示
    });

    // 3. 報酬・所持品
    if (scenarioData.rewards.items) {
        if (!newChar.items) newChar.items = [];
        // 配列管理を推奨
        if (Array.isArray(newChar.items)) {
             newChar.items.push({
                name: "獲得報酬", 
                desc: `[${scenarioData.title}] ${scenarioData.rewards.items}`
            });
        } else {
            // 文字列管理の場合
            newChar.items += `\n[${scenarioData.title}] ${scenarioData.rewards.items}`;
        }
    }
    
    // 4. 成長・遭遇など
    const appendToField = (key, val) => {
        if(!val) return;
        // 配列ならpush, 文字列なら改行追加
        if(Array.isArray(newChar[key])) {
            newChar[key].push(`[${scenarioData.title}] ${val}`);
        } else {
            const cur = newChar[key] || "";
            newChar[key] = cur + (cur ? "\n" : "") + `[${scenarioData.title}] ${val}`;
        }
    };

    appendToField('encountered', scenarioData.entities);
    appendToField('growth', scenarioData.growth);

    return newChar;
}