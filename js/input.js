/**
 * input.js
 * Handles Keyboard and Swipe inputs.
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDist = 30; // Minimum pixels for a swipe

        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => this.onKeyUp(e));

        // Touch Listeners
        window.addEventListener('touchstart', e => this.onTouchStart(e), { passive: false });
        window.addEventListener('touchend', e => this.onTouchEnd(e), { passive: false });
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    onTouchStart(e) {
        // e.preventDefault(); // Prevent scrolling - handled in CSS mostly but good here too
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    onTouchEnd(e) {
        // e.preventDefault();
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        this.handleSwipe(touchEndX, touchEndY);
    }

    handleSwipe(endX, endY) {
        const diffX = endX - this.touchStartX;
        const diffY = endY - this.touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal
            if (Math.abs(diffX) > this.minSwipeDist) {
                if (diffX > 0) {
                    this.triggerKey('ArrowRight');
                } else {
                    this.triggerKey('ArrowLeft');
                }
            }
        } else {
            // Vertical
            if (Math.abs(diffY) > this.minSwipeDist) {
                if (diffY > 0) {
                    this.triggerKey('ArrowDown'); // Down swipe = Slide
                } else {
                    this.triggerKey('ArrowUp');   // Up swipe = Jump
                }
            }
        }
    }

    triggerKey(code) {
        // Simulate a key press "pulse"
        this.keys[code] = true;
    }
}
