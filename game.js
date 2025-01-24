class Game {
    constructor() {
        this.myy = document.getElementById('myy');
        this.zpp = document.getElementById('zpp');
        this.scoreElement = document.getElementById('score');
        this.healthElement = document.getElementById('health');
        
        this.myyPos = { x: 50, y: 150 };
        this.zppPos = { x: 300, y: 150 };
        this.score = 0;
        this.zppHealth = 1000; // 血量翻10倍
        this.facing = 'right';
        
        // 按键状态
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false
        };
        
        // 添加音效
        this.hitSound = document.getElementById('hitSound');
        this.punchSound = document.getElementById('punchSound');
        
        this.init();
    }

    init() {
        this.updatePositions();
        this.setupControls();
        this.startZppMovement();
        this.startGameLoop();
        this.updateScore();
    }

    setupControls() {
        // 键盘按下
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });

        // 键盘释放
        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });

        // 屏幕按钮点击
        document.getElementById('up').addEventListener('mousedown', () => this.keys.ArrowUp = true);
        document.getElementById('down').addEventListener('mousedown', () => this.keys.ArrowDown = true);
        document.getElementById('left').addEventListener('mousedown', () => this.keys.ArrowLeft = true);
        document.getElementById('right').addEventListener('mousedown', () => this.keys.ArrowRight = true);
        document.getElementById('attack').addEventListener('mousedown', () => this.keys[' '] = true);

        // 屏幕按钮释放
        document.getElementById('up').addEventListener('mouseup', () => this.keys.ArrowUp = false);
        document.getElementById('down').addEventListener('mouseup', () => this.keys.ArrowDown = false);
        document.getElementById('left').addEventListener('mouseup', () => this.keys.ArrowLeft = false);
        document.getElementById('right').addEventListener('mouseup', () => this.keys.ArrowRight = false);
        document.getElementById('attack').addEventListener('mouseup', () => this.keys[' '] = false);

        // 触摸事件
        document.getElementById('up').addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.ArrowUp = true; });
        document.getElementById('down').addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.ArrowDown = true; });
        document.getElementById('left').addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.ArrowLeft = true; });
        document.getElementById('right').addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.ArrowRight = true; });
        document.getElementById('attack').addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[' '] = true; });

        document.getElementById('up').addEventListener('touchend', () => this.keys.ArrowUp = false);
        document.getElementById('down').addEventListener('touchend', () => this.keys.ArrowDown = false);
        document.getElementById('left').addEventListener('touchend', () => this.keys.ArrowLeft = false);
        document.getElementById('right').addEventListener('touchend', () => this.keys.ArrowRight = false);
        document.getElementById('attack').addEventListener('touchend', () => this.keys[' '] = false);
    }

    startGameLoop() {
        // 每帧更新游戏状态
        const gameLoop = () => {
            this.updateGame();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    updateGame() {
        const step = 5; // 更快的移动速度
        
        // 根据按键状态更新位置
        if (this.keys.ArrowUp && this.myyPos.y > 0) {
            this.myyPos.y -= step;
        }
        if (this.keys.ArrowDown && this.myyPos.y < 240) {
            this.myyPos.y += step;
        }
        if (this.keys.ArrowLeft && this.myyPos.x > 0) {
            this.myyPos.x -= step;
            this.facing = 'left';
        }
        if (this.keys.ArrowRight && this.myyPos.x < 360) {
            this.myyPos.x += step;
            this.facing = 'right';
        }
        if (this.keys[' ']) {
            this.attack();
        }

        this.updatePositions();
    }

    updatePositions() {
        this.myy.style.left = this.myyPos.x + 'px';
        this.myy.style.top = this.myyPos.y + 'px';
        this.zpp.style.left = this.zppPos.x + 'px';
        this.zpp.style.top = this.zppPos.y + 'px';
    }

    attack() {
        // 限制攻击频率
        if (this.attackCooldown) return;
        this.attackCooldown = true;
        setTimeout(() => this.attackCooldown = false, 200);

        // 播放出拳音效
        this.punchSound.currentTime = 0;
        this.punchSound.play().catch(e => console.log('Audio play failed:', e));

        const attackRange = 50;
        const hitBox = {
            x: this.facing === 'right' ? this.myyPos.x + 40 : this.myyPos.x - attackRange,
            y: this.myyPos.y
        };

        if (this.checkHit(hitBox)) {
            // 播放击中音效
            this.hitSound.currentTime = 0;
            this.hitSound.play().catch(e => console.log('Audio play failed:', e));

            this.zppHealth -= 10;
            this.score += 10;
            this.updateScore();
            this.checkGameOver();
        }

        this.showAttackAnimation();
    }

    checkHit(hitBox) {
        return Math.abs(hitBox.x - this.zppPos.x) < 40 && 
               Math.abs(hitBox.y - this.zppPos.y) < 60;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.healthElement.textContent = this.zppHealth;
    }

    showAttackAnimation() {
        const punch = document.createElement('div');
        punch.className = 'punch';
        
        // 计算拳头位置
        const punchX = this.facing === 'right' ? 
            this.myyPos.x + 40 : 
            this.myyPos.x - 30;
        
        punch.style.left = punchX + 'px';
        punch.style.top = (this.myyPos.y + 10) + 'px';
        
        // 根据攻击方向翻转拳头
        if (this.facing === 'left') {
            punch.style.transform = 'scale(-1.5, 1.5)';
        }
        
        document.querySelector('.arena').appendChild(punch);
        
        // 添加打击效果
        if (this.checkHit({x: punchX, y: this.myyPos.y})) {
            const impact = document.createElement('div');
            impact.style.position = 'absolute';
            impact.style.left = this.zppPos.x + 'px';
            impact.style.top = this.zppPos.y + 'px';
            impact.style.color = 'red';
            impact.style.fontSize = '20px';
            impact.textContent = '-10';
            impact.style.animation = 'float-up 0.5s ease-out';
            document.querySelector('.arena').appendChild(impact);
            
            // 击中时让ZPP闪烁
            this.zpp.style.animation = 'blink 0.3s';
            setTimeout(() => {
                this.zpp.style.animation = '';
            }, 300);
            
            setTimeout(() => impact.remove(), 500);
        }
        
        setTimeout(() => punch.remove(), 300);
    }

    startZppMovement() {
        const updateInterval = 100; // 更新频率提高到100ms
        let lastTime = 0;
        
        const moveZpp = (currentTime) => {
            if (currentTime - lastTime > updateInterval) {
                // 增加移动速度和范围
                const moveX = Math.random() * 40 - 20; // 增加移动范围
                const moveY = Math.random() * 40 - 20;
                
                // 计算新位置
                let newX = this.zppPos.x + moveX;
                let newY = this.zppPos.y + moveY;
                
                // 确保ZPP不会离MYY太远
                const distanceToMyy = Math.sqrt(
                    Math.pow(newX - this.myyPos.x, 2) + 
                    Math.pow(newY - this.myyPos.y, 2)
                );
                
                if (distanceToMyy > 200) {
                    // 如果太远，向MYY移动
                    const angle = Math.atan2(this.myyPos.y - this.zppPos.y, this.myyPos.x - this.zppPos.x);
                    newX = this.zppPos.x + Math.cos(angle) * 10;
                    newY = this.zppPos.y + Math.sin(angle) * 10;
                }
                
                // 边界检查
                this.zppPos.x = Math.max(0, Math.min(360, newX));
                this.zppPos.y = Math.max(0, Math.min(240, newY));
                
                this.updatePositions();
                lastTime = currentTime;
            }
            requestAnimationFrame(moveZpp);
        };
        
        requestAnimationFrame(moveZpp);
    }

    checkGameOver() {
        if (this.zppHealth <= 0) {
            const messages = [
                "对不起myy宝贝贝，我错了！🧎",
                "我再也不敢了！饶了我吧！🏳️",
                "myy宝贝贝最厉害了！",
                "从今以后我一定听话！"
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const finalScore = this.score;
            
            // 创建一个更好看的结算界面
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const resultBox = document.createElement('div');
            resultBox.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 80%;
                animation: popIn 0.5s ease-out;
            `;
            
            resultBox.innerHTML = `
                <h2 style="color: #ff69b4; margin-bottom: 20px;">游戏结束！</h2>
                <p style="font-size: 24px; margin-bottom: 20px;">🎮 最终得分：${finalScore}</p>
                <p style="font-size: 20px; color: #666; margin-bottom: 30px;">${randomMessage}</p>
                <div style="
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: #ff69b4;
                    border-radius: 10px;
                    cursor: pointer;
                    color: white;
                    font-size: 20px;
                    line-height: 1.5;
                    transition: transform 0.2s;
                " onclick="location.reload()">
                    <span>再</span>
                    <span>来</span>
                    <span>一</span>
                    <span>次</span>
                </div>
            `;
            
            overlay.appendChild(resultBox);
            document.body.appendChild(overlay);
            
            // 添加CSS动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes popIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .result-button:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// 启动游戏
window.onload = () => new Game(); 