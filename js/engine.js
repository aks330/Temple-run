/**
 * engine.js
 * Handles pseudo-3D math and projections.
 */

class Engine {
    constructor() {
        this.fov = 300;           // Softer perspective
        this.cameraHeight = 500;  // Lower camera
        this.cameraZ = 0;
        this.segmentLength = 200;
        this.drawDistance = 40;
    }

    /**
     * Projects a 3D coordinate (x, y, z) to 2D screen coordinates.
     * x: world x position (0 is center)
     * y: world y height (0 is ground)
     * z: world z depth (relative to camera)
     * width: canvas width
     * height: canvas height
     */
    project(x, y, z, width, height) {
        // Prevent division by zero or behind camera
        if (z < 1) z = 1;

        const scale = this.fov / (z);

        // Projected coords based on screen center
        // World Y increases UP, but Canvas Y increases DOWN.
        // We subtract worldY from cameraHeight to get relative Y.

        // Screen X calculation
        // x * scale centers it. We add width/2 to center on canvas.
        const x2d = (x * scale) + (width / 2);

        // Screen Y calculation
        // (y - cameraHeight) offsets world Y relative to camera. 
        // We multiply by -1 to flip for canvas coords if y is "up".
        // But usually in 2.5D: 
        // ScreenY = (CameraHeight - WorldY) * scale + (HorizonOffset)
        // Let's assume Horizon is at height/2.

        // Simpler approach:
        // Vanishing Point is at (width/2, height/2)
        // ProjectedY = ((y - this.cameraHeight) * scale) + (height / 2)

        // ProjectedY = Horizon - (RelativeY * scale)
        // We use height * 0.4 as vanishing point (slightly above middle)
        const y2d = (height * 0.4) + (this.cameraHeight - y) * scale;

        return { x: x2d, y: y2d, scale: scale };
    }

    /**
     * Gets the Z-depth of a specific segment index relative to camera
     */
    getSegmentZ(index) {
        return index * this.segmentLength;
    }
}
