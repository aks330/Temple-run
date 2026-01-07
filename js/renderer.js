/**
 * renderer.js
 * Handles 3D rendering using Three.js with enhanced sky.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 1. Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x4a90e2); // Blue sky

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 20000);
        this.camera.position.set(0, 5, 10);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 4. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(0, 50, 50);
        this.scene.add(sunLight);

        // 5. Road Setup
        this.createRoad();

        // 6. Sky with Clouds and Stars
        this.createSkyElements();
    }

    createRoad() {
        const roadWidth = 20;
        const roadLength = 10000;

        // Road Geometry
        const geometry = new THREE.PlaneGeometry(roadWidth, roadLength);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff477e,
            side: THREE.DoubleSide
        });

        this.road = new THREE.Mesh(geometry, material);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.z = -roadLength / 2;
        this.scene.add(this.road);

        // Lane Markers
        const markerGeo = new THREE.PlaneGeometry(0.2, roadLength);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });

        const m1 = new THREE.Mesh(markerGeo, markerMat);
        m1.position.set(-3.3, 0.01, -roadLength / 2);
        m1.rotation.x = -Math.PI / 2;
        this.scene.add(m1);

        const m2 = new THREE.Mesh(markerGeo, markerMat);
        m2.position.set(3.3, 0.01, -roadLength / 2);
        m2.rotation.x = -Math.PI / 2;
        this.scene.add(m2);
    }

    createSkyElements() {
        // Fog for depth
        this.scene.fog = new THREE.FogExp2(0x4a90e2, 0.00015);

        // Create Clouds
        this.clouds = [];
        const cloudMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });

        for (let i = 0; i < 15; i++) {
            const cloudGeo = new THREE.SphereGeometry(
                2 + Math.random() * 3,
                8,
                8
            );
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);

            cloud.position.set(
                (Math.random() - 0.5) * 100,
                20 + Math.random() * 30,
                -50 - Math.random() * 200
            );

            cloud.scale.set(
                1 + Math.random(),
                0.5 + Math.random() * 0.5,
                1 + Math.random()
            );

            this.clouds.push(cloud);
            this.scene.add(cloud);
        }

        // Create Shining Stars
        this.stars = [];
        const starGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const starMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });

        for (let i = 0; i < 50; i++) {
            const star = new THREE.Mesh(starGeo, starMat);

            star.position.set(
                (Math.random() - 0.5) * 200,
                30 + Math.random() * 50,
                -100 - Math.random() * 300
            );

            star.userData.twinkleSpeed = 1 + Math.random() * 2;
            star.userData.twinkleOffset = Math.random() * Math.PI * 2;

            this.stars.push(star);
            this.scene.add(star);
        }
    }

    draw(game) {
        const { engine } = game;

        // Update Camera
        this.camera.position.z = -engine.cameraZ / 100;

        // Animate Clouds (slow drift)
        const time = Date.now() / 1000;
        this.clouds.forEach((cloud, i) => {
            cloud.position.x += Math.sin(time * 0.1 + i) * 0.01;
            cloud.position.z += 0.02;

            // Reset cloud if too close
            if (cloud.position.z > this.camera.position.z + 50) {
                cloud.position.z = this.camera.position.z - 250;
            }
        });

        // Animate Stars (twinkling)
        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.userData.twinkleSpeed + star.userData.twinkleOffset);
            star.material.opacity = 0.5 + twinkle * 0.5;
        });

        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    clearCache() {
        // Not strictly needed for Three.js
    }
}
