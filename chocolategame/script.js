/* --- 設定とデータ --- */
const CONFIG = {
    charSrc: '../images/hoko/mahiru.png', 
    charSize: 48,
    walkSpeed: 4,
    
    // 障害物 (x, y, w, h)
    // 入り口(480付近)を通れるように下壁を左右に分割しました
    obstacles: [
        { x: 0, y: 0, w: 220, h: 220 },     // 左上の棚
        { x: 180, y: 300, w: 280, h: 60 },  // ショーケース（足元のみ）
        { x: 560, y: 0, w: 280, h: 200 },   // 右上のキッチン
        { x: 620, y: 380, w: 140, h: 160 }, // 右下のレジ
        
        // 画面外へ出ないための壁
        { x: -50, y: 0, w: 60, h: 540 },    // 左
        { x: 950, y: 0, w: 50, h: 540 },    // 右
        { x: 0, y: -50, w: 960, h: 100 },   // 上
        // 下壁（入り口を開けるために左右分割）
        { x: 0, y: 530, w: 400, h: 50 },    // 左下
        { x: 560, y: 530, w: 400, h: 50 }   // 右下
    ],

    // 初期出現位置 (階段下)
    spawnX: 880,
    spawnY: 250,

    // 家具クリック時の「安全な立ち位置」 (topをずらした分、yも下に修正)
    safePoints: {
        'zone-shelf': { x: 200, y: 280 },
        'zone-display': { x: 320, y: 400 },
        'zone-kitchen': { x: 700, y: 250 },
        'zone-register': { x: 580, y: 480 }
    }
};

const RECIPES = [
    { id: 'simple', name: '定番チョコ', cost: 1, energy: 10, xp: 10, price: 40, minLv: 1 },
    { id: 'white', name: 'ホワイトチョコ', cost: 2, energy: 15, xp: 20, price: 70, minLv: 2 },
    { id: 'truffle', name: '高級トリュフ', cost: 3, energy: 25, xp: 50, price: 150, minLv: 4 },
];

/* --- ゲームエンジン --- */
class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.stage = document.getElementById('game-stage');
        this.entityLayer = document.getElementById('entities-layer');
        
        // 状態
        this.state = {
            money: 1000,
            ingredients: 5,
            stock: 0,
            display: 0,
            energy: 100,
            xp: 0,
            level: 1,
            isNight: false
        };

        this.audioCtx = null;
        this.isPlaying = false;
        
        this.player = null;
        this.customers = [];
        this.ui = new UI(this);
        this.logic = new GameLogic(this);
        
        this.lastTime = 0;
        this.customerTimer = 0;

        // リサイズ監視（最初の例題のようにウィンドウに合わせる）
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    // ウィンドウサイズに合わせて、960x540の画面をフィットさせる
    resize() {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const baseW = 960;
        const baseH = 540;

        // 画面の90%くらいの大きさに収める
        const scale = Math.min(winW / baseW, winH / baseH) * 0.95;
        
        this.container.style.transform = `scale(${scale})`;
    }

    start() {
        document.getElementById('start-screen').style.display = 'none';
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = true;

        this.player = new Actor(this, 'player', CONFIG.charSrc, CONFIG.spawnX, CONFIG.spawnY);
        this.ui.updateAll();
        
        this.stage.addEventListener('pointerdown', (e) => this.handleClick(e));
        
        requestAnimationFrame((t) => this.loop(t));
    }

    handleClick(e) {
        if (!this.isPlaying || this.player.isBusy) return;

        // スケールを考慮した座標計算
        const rect = this.stage.getBoundingClientRect();
        // 現在の表示サイズと本来のサイズ(960x540)の比率
        const scaleX = 960 / rect.width;
        const scaleY = 540 / rect.height;

        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        this.playSound('click');

        if (e.target.classList.contains('hotspot')) {
            const id = e.target.id;
            const safePos = CONFIG.safePoints[id];
            
            if (safePos) {
                this.player.walkTo(safePos.x, safePos.y, () => {
                    this.logic.interact(id);
                });
            }
        } else {
            this.player.walkTo(clickX, clickY);
            this.ui.createSparkle(clickX, clickY);
        }
    }

    loop(timestamp) {
        if (!this.isPlaying) return;
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.player.update(dt);

        for (let i = this.customers.length - 1; i >= 0; i--) {
            const c = this.customers[i];
            c.update(dt);
            if (c.isDead) {
                c.element.remove();
                this.customers.splice(i, 1);
            }
        }

        if (this.state.display > 0 && !this.state.isNight) {
            this.customerTimer += dt;
            if (this.customerTimer > 4000 + Math.random() * 4000) {
                this.spawnCustomer();
                this.customerTimer = 0;
            }
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    spawnCustomer() {
        if(this.customers.length >= 3) return;
        
        // 画面外の下（入り口）から出現
        const customer = new Actor(this, 'customer', null, 480, 560);
        customer.element.style.filter = `hue-rotate(${Math.random()*360}deg)`;
        
        // レジ前へ
        const regPos = CONFIG.safePoints['zone-register'];
        customer.walkTo(regPos.x, regPos.y, () => {
            setTimeout(() => {
                if(this.state.display > 0) {
                    this.logic.sellItem();
                    customer.showBubble("おいしい！");
                    this.playSound('money');
                } else {
                    customer.showBubble("売り切れ...");
                }
                // 帰る (入り口の座標へ)
                setTimeout(() => {
                    customer.walkTo(480, 600, () => customer.isDead = true);
                }, 1000);
            }, 800);
        });
        
        this.customers.push(customer);
    }

    toggleNight() {
        this.state.isNight = !this.state.isNight;
        this.stage.classList.toggle('night', this.state.isNight);
        this.playSound('click');
    }
    
    toggleAudio() {
        if(this.audioCtx.state === 'suspended') this.audioCtx.resume();
        else this.audioCtx.suspend();
    }

    playSound(type) {
        if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;

        if (type === 'click') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'money') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.setValueAtTime(2000, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        }
    }
}

/* --- アクター（キャラ） --- */
class Actor {
    constructor(game, type, imgSrc, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.isBusy = false;
        this.speed = CONFIG.walkSpeed;
        this.frame = 1;
        this.dir = 0; 
        this.animTimer = 0;
        this.isDead = false;

        this.element = document.createElement('div');
        this.element.className = 'entity';
        this.element.style.width = CONFIG.charSize + 'px';
        this.element.style.height = CONFIG.charSize + 'px';
        
        if (type === 'player' && imgSrc) {
            this.element.style.backgroundImage = `url(${imgSrc})`;
            this.element.style.backgroundSize = `${CONFIG.charSize * 3}px ${CONFIG.charSize * 4}px`;
        } else {
            // 客
            this.element.style.background = '#5D4037';
            this.element.style.borderRadius = '50% 50% 10% 10%';
            this.element.style.width = '32px';
            this.element.style.height = '48px';
            this.element.style.border = '2px solid #fff';
            this.element.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        }
        
        this.game.entityLayer.appendChild(this.element);
        this.updatePos();
    }

    walkTo(x, y, callback) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
        this.onArrive = callback || null;
    }

    update(dt) {
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > this.speed) {
                let vx = (dx / dist) * this.speed;
                let vy = (dy / dist) * this.speed;

                // 衝突判定
                if (!this.checkCollision(this.x + vx, this.y)) this.x += vx;
                if (!this.checkCollision(this.x, this.y + vy)) this.y += vy;

                // 向き
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                if (angle > -45 && angle <= 45) this.dir = 2; 
                else if (angle > 45 && angle <= 135) this.dir = 0; 
                else if (angle > 135 || angle <= -135) this.dir = 1; 
                else this.dir = 3; 

                // アニメ
                this.animTimer += dt;
                if (this.animTimer > 150) {
                    this.frame = (this.frame + 1) % 3;
                    this.animTimer = 0;
                }
            } else {
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
                this.frame = 1; 
                if (this.onArrive) {
                    const cb = this.onArrive;
                    this.onArrive = null;
                    cb();
                }
            }
            this.updatePos();
        }
    }

    checkCollision(x, y) {
        for (let obs of CONFIG.obstacles) {
            if (x > obs.x && x < obs.x + obs.w &&
                y > obs.y && y < obs.y + obs.h) {
                return true;
            }
        }
        return false;
    }

    updatePos() {
        this.element.style.left = (this.x - CONFIG.charSize/2) + 'px';
        this.element.style.top = (this.y - CONFIG.charSize) + 'px'; 
        this.element.style.zIndex = Math.floor(this.y);
        
        const bx = this.frame * CONFIG.charSize;
        const by = this.dir * CONFIG.charSize;
        this.element.style.backgroundPosition = `-${bx}px -${by}px`;
    }

    showBubble(text) {
        const b = document.createElement('div');
        b.className = 'bubble';
        b.innerText = text;
        b.style.left = this.x + 'px';
        b.style.top = (this.y - 60) + 'px';
        this.game.stage.appendChild(b);
        setTimeout(() => b.remove(), 2000);
    }
}

/* --- ロジック & UI --- */
class GameLogic {
    constructor(game) { this.game = game; }

    interact(zoneId) {
        this.game.player.dir = 3; 
        this.game.player.updatePos();

        if (zoneId === 'zone-kitchen') {
            this.openKitchen();
        } else if (zoneId === 'zone-shelf') {
            this.game.ui.openModal('modal-shelf');
        } else if (zoneId === 'zone-display') {
            this.game.ui.openModal('modal-display');
            document.getElementById('mod-stock').innerText = this.game.state.stock;
        } else if (zoneId === 'zone-register') {
            this.game.player.showBubble("いらっしゃいませ！");
        }
    }

    openKitchen() {
        const list = document.getElementById('recipe-list');
        list.innerHTML = '';
        RECIPES.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            const canMake = this.game.state.ingredients >= r.cost && this.game.state.energy >= r.energy;
            const isLocked = this.game.state.level < r.minLv;
            
            if(isLocked) {
                btn.innerHTML = `<span>🔒 Lv.${r.minLv}〜</span>`;
                btn.disabled = true;
            } else {
                btn.innerHTML = `<span>${r.name}</span><small>-${r.cost}🍫 / -${r.energy}⚡</small>`;
                btn.disabled = !canMake;
                btn.onclick = () => this.cook(r);
            }
            list.appendChild(btn);
        });
        this.game.ui.openModal('modal-kitchen');
    }

    cook(recipe) {
        this.game.ui.closeModals();
        this.game.player.isBusy = true;
        this.game.player.showBubble("調理中...");
        
        setTimeout(() => {
            this.game.state.ingredients -= recipe.cost;
            this.game.state.energy -= recipe.energy;
            this.game.state.stock += 3;
            this.gainXp(recipe.xp);
            
            this.game.player.isBusy = false;
            this.game.player.showBubble("できた！");
            this.game.ui.updateAll();
        }, 1500);
    }

    buyIngredients(amt) {
        const cost = amt === 1 ? 20 : 90;
        if (this.game.state.money >= cost) {
            this.game.state.money -= cost;
            this.game.state.ingredients += amt;
            this.game.playSound('money');
            this.game.ui.updateAll();
            this.game.player.showBubble("仕入れ完了");
        } else {
            alert("お金が足りません");
        }
    }

    stockShowcase() {
        if(this.game.state.stock > 0) {
            this.game.state.display += this.game.state.stock;
            this.game.state.stock = 0;
            this.game.ui.closeModals();
            this.game.ui.updateAll();
            this.game.player.showBubble("並べました！");
        } else {
             this.game.ui.closeModals();
             this.game.player.showBubble("在庫がないよ");
        }
    }

    sellItem() {
        this.game.state.display--;
        const earnings = 50 + (this.game.state.level * 5);
        this.game.state.money += earnings;
        this.game.ui.createSparkle(600, 350); 
        this.game.ui.updateAll();
    }

    gainXp(val) {
        this.game.state.xp += val;
        if(this.game.state.xp >= this.game.state.level * 100) {
            this.game.state.xp = 0;
            this.game.state.level++;
            this.game.state.energy = 100;
            this.game.playSound('money');
            this.game.player.showBubble("Level Up!!");
        }
    }
}

class UI {
    constructor(game) { this.game = game; }

    updateAll() {
        const s = this.game.state;
        document.getElementById('ui-money').innerText = s.money;
        document.getElementById('ui-level').innerText = s.level;
        document.getElementById('ui-ing').innerText = s.ingredients;
        document.getElementById('ui-stock').innerText = s.stock;
        document.getElementById('ui-display').innerText = s.display;
        document.getElementById('ui-energy').innerText = s.energy;
    }

    openModal(id) {
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    closeModals() {
        document.getElementById('modal-overlay').classList.add('hidden');
        this.game.playSound('click');
    }

    createSparkle(x, y) {
        const d = document.createElement('div');
        d.innerText = '✦';
        d.style.position = 'absolute';
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        d.style.color = '#FFD54F';
        d.style.fontSize = '20px';
        d.style.fontWeight = 'bold';
        d.style.pointerEvents = 'none';
        d.style.zIndex = 100;
        d.animate([
            { transform: 'translate(0,0) scale(0.5)', opacity: 1 },
            { transform: 'translate(0,-30px) scale(1.5)', opacity: 0 }
        ], { duration: 600 });
        this.game.stage.appendChild(d);
        setTimeout(() => d.remove(), 600);
    }
}

const game = new Game();