/**
 * girl.js
 * Akshaya - The Angel Girl with Fairy Wings
 */

class TheGirl {
    constructor(finishZ) {
        this.z = finishZ;
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 170;
        this.name = "Akshaya";

        this.group = null;
        this.parts = {};
        this.startTime = Date.now();
    }

    setup3D(scene) {
        this.group = new THREE.Group();

        // Angel white/pink material
        const angelMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffb6c1,
            emissiveIntensity: 0.3
        });

        // 1. Body (Dress)
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.5, 1.0, 8);
        this.parts.body = new THREE.Mesh(bodyGeo, angelMat);
        this.parts.body.position.y = 0.8;
        this.group.add(this.parts.body);

        // Skirt
        const skirtGeo = new THREE.ConeGeometry(0.6, 0.8, 12);
        this.parts.skirt = new THREE.Mesh(skirtGeo, angelMat);
        this.parts.skirt.position.y = 0.5;
        this.group.add(this.parts.skirt);

        // 2. Head
        const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
        this.parts.head = new THREE.Mesh(headGeo, angelMat);
        this.parts.head.position.y = 1.5;
        this.group.add(this.parts.head);

        // 3. Fairy Wings (Left and Right)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.bezierCurveTo(0.5, 0.8, 0.8, 1.2, 0.3, 1.5);
        wingShape.bezierCurveTo(0, 1.3, -0.2, 0.8, 0, 0);

        const wingGeo = new THREE.ShapeGeometry(wingShape);
        const wingMat = new THREE.MeshPhongMaterial({
            color: 0xffc0cb,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            emissive: 0xffb6c1,
            emissiveIntensity: 0.5
        });

        // Left Wing
        this.parts.wingL = new THREE.Mesh(wingGeo, wingMat);
        this.parts.wingL.position.set(-0.3, 1.0, 0.2);
        this.parts.wingL.rotation.y = Math.PI / 6;
        this.group.add(this.parts.wingL);

        // Right Wing
        this.parts.wingR = new THREE.Mesh(wingGeo, wingMat);
        this.parts.wingR.position.set(0.3, 1.0, 0.2);
        this.parts.wingR.rotation.y = -Math.PI / 6;
        this.parts.wingR.scale.x = -1;
        this.group.add(this.parts.wingR);

        // 4. Heart on Chest
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0.25, 0.25, 0.5, 0, 0, -0.5);
        heartShape.bezierCurveTo(-0.5, 0, -0.25, 0.25, 0, 0);

        const heartGeo = new THREE.ShapeGeometry(heartShape);
        const heartMat = new THREE.MeshBasicMaterial({
            color: 0xff0066,
            emissive: 0xff0066,
            emissiveIntensity: 0.8
        });
        this.parts.heart = new THREE.Mesh(heartGeo, heartMat);
        this.parts.heart.scale.set(0.5, 0.5, 1); // Larger
        this.parts.heart.rotation.z = 0; // Right-side up
        this.parts.heart.position.set(0, 1.0, 0.4); // More forward
        this.group.add(this.parts.heart);

        // 5. Halo
        const haloGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
        this.parts.halo = new THREE.Mesh(haloGeo, haloMat);
        this.parts.halo.position.y = 1.9;
        this.parts.halo.rotation.x = Math.PI / 2;
        this.group.add(this.parts.halo);

        // Name Label "Lucky Charm Aks"
        this.createNameLabel(scene);

        scene.add(this.group);
        this.update3D();
    }

    createNameLabel(scene) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;

        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'bold 40px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Lucky Charm Aks', 256, 32);

        // Add glow
        context.shadowColor = '#ff69b4';
        context.shadowBlur = 15;
        context.fillText('Lucky Charm Aks', 256, 32);

        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.nameLabel = new THREE.Sprite(spriteMaterial);
        this.nameLabel.scale.set(4, 0.5, 1);
        this.nameLabel.position.y = 2.8;
        this.group.add(this.nameLabel);
    }

    update3D() {
        if (!this.group) return;
        const time = (Date.now() - this.startTime) / 1000;

        // Gentle Floating
        this.group.position.set(
            this.x / 100 + Math.sin(time * 0.8) * 0.15,
            this.y / 100 + Math.cos(time * 0.5) * 0.1 + 0.5,
            -this.z / 100
        );

        // Gentle rotation
        this.group.rotation.y = Math.sin(time * 0.3) * 0.15;

        // Wing flapping
        const flapAngle = Math.sin(time * 4) * 0.3;
        this.parts.wingL.rotation.y = Math.PI / 6 + flapAngle;
        this.parts.wingR.rotation.y = -Math.PI / 6 - flapAngle;

        // Heart pulse
        const pulse = 0.3 + Math.sin(time * 3) * 0.05;
        this.parts.heart.scale.set(pulse, pulse, 1);

        // Halo glow
        this.parts.halo.rotation.z = time * 0.5;

        // Animate name label (floating)
        if (this.nameLabel) {
            this.nameLabel.position.y = 2.8 + Math.sin(time * 2) * 0.15;
        }
    }

    draw() {
        this.update3D();
    }
}
