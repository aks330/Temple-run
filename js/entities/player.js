/**
 * player.js
 * The Hero character - Superhero Pro Version.
 */

class Player {
    constructor(game) {
        this.game = game;
        this.name = "Sham";

        // Position
        this.lane = 0;
        this.laneWidth = 600;
        this.x = 0;
        this.y = 0;
        this.z = 0;

        // Physics
        this.vy = 0;
        this.gravity = -2500;
        this.jumpForce = 1200;
        this.groundY = 0;

        // State
        this.isJumping = false;
        this.isSliding = false;

        // Visuals (Superhero Colors)
        this.suitColor = 0x0047ab; // Deep Blue
        this.bootColor = 0xcc0000; // Bright Red
        this.capeColor = 0xff0000; // Vibrant Red
        this.heartColor = 0xffffff; // White Heart

        // Smooth Movement
        this.targetX = 0;
        this.animTime = 0;

        // 3D Visuals
        this.group = null;
        this.parts = {};
    }

    setup3D(scene) {
        this.group = new THREE.Group();

        const suitMat = new THREE.MeshPhongMaterial({ color: this.suitColor });
        const bootMat = new THREE.MeshPhongMaterial({ color: this.bootColor });
        const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdbac }); // Skin tone

        // 1. Torso (Blue Suit)
        const torsoGeo = new THREE.BoxGeometry(0.8, 0.9, 0.5);
        this.parts.torso = new THREE.Mesh(torsoGeo, suitMat);
        this.parts.torso.position.y = 1.1;
        this.group.add(this.parts.torso);

        // 2. Head
        const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        this.parts.head = new THREE.Mesh(headGeo, skinMat);
        this.parts.head.position.y = 1.75;
        this.group.add(this.parts.head);

        // Hair (Black)
        const hairGeo = new THREE.BoxGeometry(0.48, 0.2, 0.48);
        const hairMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.2;
        this.parts.head.add(hair);

        // 3. Legs (Blue Suit + Red Boots)
        const legGeo = new THREE.BoxGeometry(0.32, 0.5, 0.32);
        const bootGeo = new THREE.BoxGeometry(0.34, 0.4, 0.34);

        // LEFT LEG
        this.parts.legL_group = new THREE.Group();
        this.parts.legL_upper = new THREE.Mesh(legGeo, suitMat);
        this.parts.legL_boot = new THREE.Mesh(bootGeo, bootMat);
        this.parts.legL_boot.position.y = -0.3;
        this.parts.legL_group.add(this.parts.legL_upper);
        this.parts.legL_group.add(this.parts.legL_boot);
        this.parts.legL_group.position.set(-0.25, 0.5, 0);
        this.group.add(this.parts.legL_group);

        // RIGHT LEG
        this.parts.legR_group = new THREE.Group();
        this.parts.legR_upper = new THREE.Mesh(legGeo, suitMat);
        this.parts.legR_boot = new THREE.Mesh(bootGeo, bootMat);
        this.parts.legR_boot.position.y = -0.3;
        this.parts.legR_group.add(this.parts.legR_upper);
        this.parts.legR_group.add(this.parts.legR_boot);
        this.parts.legR_group.position.set(0.25, 0.5, 0);
        this.group.add(this.parts.legR_group);

        // 4. Arms (Blue Suit + Red Gloves)
        const armGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const gloveGeo = new THREE.BoxGeometry(0.28, 0.2, 0.28);

        this.parts.armL_group = new THREE.Group();
        this.parts.armL = new THREE.Mesh(armGeo, suitMat);
        this.parts.armL_glove = new THREE.Mesh(gloveGeo, bootMat);
        this.parts.armL_glove.position.y = -0.25;
        this.parts.armL_group.add(this.parts.armL);
        this.parts.armL_group.add(this.parts.armL_glove);
        this.parts.armL_group.position.set(-0.55, 1.25, 0);
        this.group.add(this.parts.armL_group);

        this.parts.armR_group = new THREE.Group();
        this.parts.armR = new THREE.Mesh(armGeo, suitMat);
        this.parts.armR_glove = new THREE.Mesh(gloveGeo, bootMat);
        this.parts.armR_glove.position.y = -0.25;
        this.parts.armR_group.add(this.parts.armR);
        this.parts.armR_group.add(this.parts.armR_glove);
        this.parts.armR_group.position.set(0.55, 1.25, 0);
        this.group.add(this.parts.armR_group);

        // 5. Cape (Vibrant Red)
        const capeGeo = new THREE.PlaneGeometry(1.2, 1.8);
        const capeMat = new THREE.MeshPhongMaterial({ color: this.capeColor, side: THREE.DoubleSide });
        this.parts.cape = new THREE.Mesh(capeGeo, capeMat);
        this.parts.cape.position.set(0, 0.8, 0.3);
        this.parts.cape.rotation.x = 0.1;
        this.group.add(this.parts.cape);

        // White Heart on Cape
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0.5, 0.5, 1, 0, 0, -1);
        heartShape.bezierCurveTo(-1, 0, -0.5, 0.5, 0, 0);
        const heartGeo = new THREE.ShapeGeometry(heartShape);
        const heartMat = new THREE.MeshBasicMaterial({ color: this.heartColor });
        const heartOnCape = new THREE.Mesh(heartGeo, heartMat);
        heartOnCape.scale.set(0.3, 0.3, 1);
        heartOnCape.rotation.z = 0; // Right-side up
        heartOnCape.position.set(0, 0, 0.01);
        this.parts.cape.add(heartOnCape);

        // Name Label "Sham"
        this.createNameLabel(scene);

        scene.add(this.group);
    }

    createNameLabel(scene) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Sham', 128, 32);

        // Add glow
        context.shadowColor = '#ff477e';
        context.shadowBlur = 10;
        context.fillText('Sham', 128, 32);

        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.nameLabel = new THREE.Sprite(spriteMaterial);
        this.nameLabel.scale.set(2, 0.5, 1);
        this.nameLabel.position.y = 2.5;
        this.group.add(this.nameLabel);
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        // 1. Lane Movement
        this.targetX = this.lane * this.laneWidth;
        const speed = 15;
        this.x += (this.targetX - this.x) * speed * dt;

        // 2. Jump Physics
        if (this.isJumping) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;

            if (this.y <= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.vy = 0;
            }
        }

        // 3. Slide Logic
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.stopSlide();
            }
        }

        this.animTime += dt;
        this.update3D();
    }

    // Actions
    moveLeft() { if (this.lane > -1) this.lane--; }
    moveRight() { if (this.lane < 1) this.lane++; }
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.vy = this.jumpForce;
            this.stopSlide();
            if (this.game.audio) this.game.audio.playJump();
        }
    }
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 1.0;
            if (this.game.audio) this.game.audio.playSlide();
        }
    }
    stopSlide() {
        if (this.isSliding) {
            this.isSliding = false;
        }
    }

    update3D() {
        if (!this.group) return;

        // Position sync
        this.group.position.x = this.x / 100;
        this.group.position.y = this.y / 100;
        this.group.position.z = - (this.game.engine.cameraZ / 100) - 6;

        // ANIMATIONS
        const runCycle = this.animTime * 15;

        if (this.isJumping) {
            // Jump Pose: Arms up, legs tucked
            this.parts.armL_group.rotation.z = 2.5;
            this.parts.armR_group.rotation.z = -2.5;
            this.parts.legL_group.rotation.x = -1.0;
            this.parts.legR_group.rotation.x = -1.0;
            this.parts.cape.rotation.x = 0.5;
        } else if (this.isSliding) {
            // Slide Pose: Low lean
            this.group.scale.y = 0.5;
            this.parts.torso.rotation.x = -0.8;
            this.parts.head.position.y = 1.3;
            this.parts.armL_group.rotation.x = 1.5;
            this.parts.armR_group.rotation.x = 1.5;
            this.parts.cape.rotation.x = -1.0;
        } else {
            // Reset transforms
            this.group.scale.y = 1.0;
            this.parts.torso.rotation.x = 0;
            this.parts.head.position.y = 1.75;
            this.parts.armL_group.rotation.z = 0;
            this.parts.armR_group.rotation.z = 0;

            // Running Cycle
            this.parts.legL_group.rotation.x = Math.sin(runCycle) * 1.0;
            this.parts.legR_group.rotation.x = Math.sin(runCycle + Math.PI) * 1.0;
            this.parts.armL_group.rotation.x = Math.sin(runCycle + Math.PI) * 1.0;
            this.parts.armR_group.rotation.x = Math.sin(runCycle) * 1.0;

            // Subtle body bounce
            this.parts.torso.position.y = 1.1 + Math.abs(Math.cos(runCycle)) * 0.1;
            this.parts.cape.rotation.x = 0.2 + Math.abs(Math.sin(runCycle)) * 0.4;
        }

        // Cape Wave
        this.parts.cape.rotation.y = Math.sin(this.animTime * 10) * 0.1;

        // Animate name label (floating)
        if (this.nameLabel) {
            this.nameLabel.position.y = 2.5 + Math.sin(this.animTime * 2) * 0.1;
        }
    }

    draw() {
        // Handled by Three.js
    }
}
