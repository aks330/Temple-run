/**
 * obstacle.js
 * Obstacles to avoid - Upgraded 3D version.
 */

class Obstacle {
    constructor(z, lane) {
        this.reset(z, lane);
    }

    reset(z, lane) {
        this.z = z;
        this.lane = lane;
        this.laneWidth = 600;
        this.x = this.lane * (this.laneWidth / 100) * 100; // Match Three.js scale
        this.y = 0;

        this.type = this.getRandomType();
        this.setSize();

        this.color = 0xff3333;
        this.mesh = null;
    }

    getRandomType() {
        const types = ['GROUND', 'OVERHEAD', 'FULL'];
        return types[Math.floor(Math.random() * types.length)];
    }

    setSize() {
        if (this.type === 'GROUND') {
            this.width = 400; this.height = 100; this.y = 0;
        } else if (this.type === 'OVERHEAD') {
            this.width = 600; this.height = 100; this.y = 1500; // High in world units
            // Wait, world y for overhead was 150? Let's fix scaling.
            this.y = 150;
        } else {
            this.width = 400; this.height = 400; this.y = 0;
        }
    }

    setup3D(scene) {
        // Remove old mesh if it exists
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        // Crate-like design for obstacles
        const geometry = new THREE.BoxGeometry(this.width / 100, this.height / 100, 1);
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            emissive: 0x440000,
            shininess: 50
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = true;
        scene.add(this.mesh);
        this.update3D();
    }

    update3D() {
        if (!this.mesh) return;
        this.mesh.position.set(
            (this.lane * 600) / 100,
            (this.y + this.height / 2) / 100,
            -this.z / 100
        );
    }

    draw() {
        this.update3D();
    }
}
