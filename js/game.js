/**
 * game.js
 * Central game controller.
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Cinematic Controls
        this.timeScale = 1.0;
        this.isCinematic = false;

        // Modules
        this.input = new InputHandler();
        this.engine = new Engine();
        this.renderer = new Renderer(this.canvas);
        this.audio = new AudioManager();

        // Entities
        this.player = new Player(this);
        this.girl = null;
        this.obstacles = [];
        this.obstaclePool = []; // For reuse
        this.finishDistance = 30000; // 30,000 units (300m)
        this.spawnInterval = 1000; // More obstacles
        this.lastSpawnZ = 0;
        this.particles = []; // Background heart particles

        // State
        this.isRunning = false;
        this.isCinematic = false;
        this.isCinematicInitiated = false;
        this.lastTime = 0;

        // Bindings
        this.loop = this.loop.bind(this);
        this.resize = this.resize.bind(this);
    }

    init() {
        try {
            // Setup Event Listeners
            window.addEventListener('resize', this.resize);
            this.resize();

            // Setup 3D Scene for existing entities
            if (this.player && this.renderer) {
                this.player.setup3D(this.renderer.scene);
            }

            // UI Buttons
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.onclick = () => {
                    console.log('Start Button Clicked via onclick');
                    this.reset();
                };
            }

            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) restartBtn.onclick = () => this.reset();

            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn) playAgainBtn.onclick = () => this.reset();

            console.log('Game Initialized Successfully');
        } catch (e) {
            console.error('Error during Game.init:', e);
        }
    }

    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active'); // Keep active for potential styling
        }
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();

        this.hideAllScreens();
        // Show HUD specifically
        const hud = document.getElementById('hud');
        if (hud) hud.classList.remove('hidden');

        // Start background music
        this.audio.playBackgroundMusic();

        requestAnimationFrame(this.loop);
    }

    reset() {
        this.isRunning = false; // Force stop loop if running
        this.engine.cameraZ = 0;
        this.player.lane = 0;
        this.player.x = 0;
        this.player.y = 0;
        this.player.vy = 0;

        // Reset Cinematic State
        this.isCinematicInitiated = false;
        this.isCinematic = false;
        this.timeScale = 1.0;

        // Clean up current obstacles
        this.obstacles.forEach(o => {
            if (o.mesh) this.renderer.scene.remove(o.mesh);
        });
        // Also clean up the pool
        this.obstaclePool.forEach(o => {
            if (o.mesh) this.renderer.scene.remove(o.mesh);
        });

        this.obstacles = [];
        this.obstaclePool = [];
        this.lastSpawnZ = 0;

        // Spawn initial set of obstacles
        const initialSpawnZ = 2000;
        const maxInitialZ = 15000; // Increased for 300m distance
        for (let z = initialSpawnZ; z < maxInitialZ; z += this.spawnInterval) {
            this.spawnObstacle(z);
        }

        if (this.girl && this.girl.group) this.renderer.scene.remove(this.girl.group);
        this.girl = new TheGirl(this.finishDistance);
        this.girl.setup3D(this.renderer.scene);

        this.start();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        // Notify other modules
        if (this.renderer) this.renderer.resize(this.width, this.height);
    }

    update(deltaTime) {
        if (this.isCinematic) {
            this.updateCinematic(deltaTime);
            return;
        }

        // Speed Progression: Increase speed as we go further
        // Base speed 600, Max speed 1200
        const progress = Math.min(this.engine.cameraZ / (this.finishDistance / 2), 1);
        const currentSpeed = 600 + (progress * 600);

        // Move Camera
        this.engine.cameraZ += currentSpeed * (deltaTime / 1000);

        // Check Win Condition
        if (this.engine.cameraZ >= this.finishDistance - 800) {
            this.startCinematic();
            return;
        }

        // Update UI
        this.updateHUD();

        // Update Player
        this.player.update(deltaTime);

        // Update Background Effects (Disabled if broken)
        // this.updateBackgroundEffects(deltaTime);

        // Dynamic Spawning & Recycling
        this.handleObstacles();

        // Check Collisions
        this.checkCollisions();

        // Sync 3D Positions for entities that don't have their own update loop
        this.obstacles.forEach(o => o.update3D());
        if (this.girl) this.girl.update3D();

        // Input Binding - Polling
        this.handleInput();
    }

    handleInput() {
        if (this.input.keys['ArrowLeft']) {
            this.player.moveLeft();
            this.input.keys['ArrowLeft'] = false;
        }
        if (this.input.keys['ArrowRight']) {
            this.player.moveRight();
            this.input.keys['ArrowRight'] = false;
        }
        if (this.input.keys['ArrowUp']) {
            this.player.jump();
            this.input.keys['ArrowUp'] = false;
        }
        if (this.input.keys['ArrowDown']) {
            this.player.slide();
            this.input.keys['ArrowDown'] = false;
        }
    }

    checkCollisions() {
        // Player hitbox (approximate) - Z is relative to camera (fixed at ~600 in front)
        const playerZ = this.engine.cameraZ + 600;
        // We give a generous overlap depth for 3D feeling
        const depthThreshold = 100;

        for (const obs of this.obstacles) {
            // 1. Z-Depth Check
            if (obs.z >= playerZ - depthThreshold && obs.z <= playerZ + depthThreshold) {
                // 2. Lane Check
                if (this.player.lane === obs.lane) {
                    // 3. Type Specific Check
                    if (this.checkTypeCollision(obs)) {
                        this.audio.playCollision();
                        this.gameOver();
                        return;
                    }
                }
            }
        }
    }

    checkTypeCollision(obs) {
        if (obs.type === 'FULL') return true; // Impossible to pass without changing lane

        if (obs.type === 'GROUND') {
            // Must be jumping (high enough off ground)
            // Obstacle height 100. Player y must be > 100
            if (this.player.y < obs.height) return true;
        }

        if (obs.type === 'OVERHEAD') {
            // Must be sliding (low enough)
            // Obstacle gap start at 150. Player height must be < 150.
            if (!this.player.isSliding) return true;
        }

        return false;
    }

    spawnObstacle(z) {
        if (z >= this.finishDistance - 1000) return; // Keep spawning closer to finish

        const lane = Math.floor(Math.random() * 3) - 1;
        let obs;
        if (this.obstaclePool.length > 0) {
            obs = this.obstaclePool.pop();
            obs.reset(z, lane);
            // Recreate the mesh with new dimensions
            obs.setup3D(this.renderer.scene);
        } else {
            obs = new Obstacle(z, lane);
            obs.setup3D(this.renderer.scene);
        }
        this.obstacles.push(obs);
        this.lastSpawnZ = z;
    }

    handleObstacles() {
        // 1. Spawn new obstacles ahead
        const viewDistance = 10000; // Fixed view distance for 3D (100m ahead)
        if (this.engine.cameraZ + viewDistance > this.lastSpawnZ + this.spawnInterval) {
            this.spawnObstacle(this.lastSpawnZ + this.spawnInterval);
        }

        // 2. Recycle obstacles behind camera
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            if (obs.z < this.engine.cameraZ - 1000) { // Well behind
                this.obstacles.splice(i, 1);
                if (obs.mesh) obs.mesh.visible = false; // Hide instead of scene.remove for performance
                this.obstaclePool.push(obs);
            }
        }
    }

    updateHUD() {
        const dist = Math.floor(this.engine.cameraZ / 100);
        document.getElementById('distance-val').innerText = `${dist}m`;

        // Progress Bar (0% to 100%)
        const percentage = Math.min((this.engine.cameraZ / this.finishDistance) * 100, 100);
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    }

    gameOver() {
        this.isRunning = false;
        this.audio.stopBackgroundMusic();
        this.showScreen('game-over-screen');
        // HUD is hidden by hideAllScreens() in showScreen()

        // Dynamic Loss Message?
        const dist = Math.floor(this.engine.cameraZ / 100);
        const msg = document.getElementById('go-message');
        if (dist < 10) msg.innerText = "You barely started...";
        else if (dist > 80) msg.innerText = "You were so close!";
        else msg.innerText = "Love is hard, try again.";
    }

    win() {
        if (this.isCinematicInitiated) return;
        this.isCinematicInitiated = true;
        this.isCinematic = true;

        console.log("Win! Starting Hug Cinematic...");

        // 1. Trigger Slow Motion
        this.timeScale = 0.2;

        // 2. Hide HUD
        document.getElementById('hud').classList.add('hidden');

        // 3. Play victory music
        this.audio.playWinMusic();

        // 3. Create heart particles
        this.createWinHeartParticles();

        // 4. Cinematic Sequence
        const duration = 3000; // 3 seconds Real-time (much longer in slow mo)
        let startTime = Date.now();

        const cinematicLoop = () => {
            if (!this.isCinematic) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Move Player and Girl toward each other for the Hug
            if (this.player.group && this.girl.group) {
                // Player moves slightly closer
                this.player.group.position.z += 0.01;
                // Transition to Hug Pose
                this.player.parts.armL_group.rotation.x = -1.5;
                this.player.parts.armR_group.rotation.x = -1.5;
                this.player.parts.armL_group.rotation.z = -0.5;
                this.player.parts.armR_group.rotation.z = 0.5;

                // Girl moves toward her hero
                this.girl.group.position.z += 0.02;
                this.girl.parts.body.rotation.x = -0.3;
            }

            // Update floating hearts
            this.updateWinHeartParticles();

            if (progress < 1.0) {
                requestAnimationFrame(cinematicLoop);
            } else {
                // End sequence
                this.timeScale = 1.0;
                this.isRunning = false; // Stop main loop
                this.showScreen('win-screen');
                this.isCinematic = false;
            }
        };

        cinematicLoop();
    }

    createWinHeartParticles() {
        // Create 60 floating heart particles for a more dramatic effect
        this.winHearts = [];
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0.25, 0.25, 0.5, 0, 0, -0.5);
        heartShape.bezierCurveTo(-0.5, 0, -0.25, 0.25, 0, 0);

        const heartGeo = new THREE.ShapeGeometry(heartShape);
        const colors = [0xff1493, 0xff69b4, 0xff0000, 0xff0066]; // Different shades of pink/red

        for (let i = 0; i < 60; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const heartMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });

            const heart = new THREE.Mesh(heartGeo, heartMat);
            const scale = 0.2 + Math.random() * 0.4;
            heart.scale.set(scale, scale, 1);
            heart.rotation.z = Math.PI;

            // Random position around the couple, starting from bottom
            heart.position.set(
                (Math.random() - 0.5) * 12,
                -10 + Math.random() * 5, // Start well below ground
                -(this.finishDistance / 100) + (Math.random() - 0.5) * 8
            );

            heart.userData = {
                speed: 1.0 + Math.random() * 2.0,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 1 + Math.random() * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05
            };

            this.renderer.scene.add(heart);
            this.winHearts.push(heart);
        }
    }

    updateWinHeartParticles() {
        if (!this.winHearts) return;

        this.winHearts.forEach((heart) => {
            // Float upward
            heart.position.y += heart.userData.speed * 0.08;

            // Wobble side to side
            const time = Date.now() / 1000;
            heart.position.x += Math.sin(time * heart.userData.wobbleSpeed + heart.userData.wobble) * 0.03;

            // Rotate
            heart.rotation.z += heart.userData.rotationSpeed;

            // Reset if too high
            if (heart.position.y > 15) {
                heart.position.y = -8;
                heart.position.x = (Math.random() - 0.5) * 12;
            }
        });
    }

    draw() {
        // In Three.js, we don't clear the context manually every frame
        // The renderer handles it.
        this.renderer.draw(this);
    }

    updateBackgroundEffects(deltaTime) {
        const dt = deltaTime / 1000;

        // Spawn heart at random position occasionally
        if (Math.random() < 0.05) {
            this.particles.push({
                x: Math.random() * this.width,
                y: this.height + 50,
                size: 10 + Math.random() * 20,
                speed: 50 + Math.random() * 100,
                life: 1.0
            });
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.y -= p.speed * dt;
            p.life -= 0.2 * dt;
            if (p.life <= 0 || p.y < -50) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawBackgroundEffects() {
        // Disabled for Three.js migration
    }

    startCinematic() {
        this.isCinematic = true;
        this.player.lane = 0;
        document.getElementById('hud').classList.add('hidden');
    }

    updateCinematic(deltaTime) {
        const targetZ = this.finishDistance - 200;
        const speed = 200; // Slow walk

        if (this.engine.cameraZ < targetZ) {
            this.engine.cameraZ += speed * (deltaTime / 1000);

            // Smoothly move player to center x=0 if not there
            const dt = deltaTime / 1000;
            this.player.x += (0 - this.player.x) * 5 * dt;
        } else {
            this.win();
        }
    }

    loop(timestamp) {
        if (!this.isRunning && !this.isCinematic) return;

        const deltaTime = (timestamp - this.lastTime) * this.timeScale;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop);
    }
}
