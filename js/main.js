/**
 * main.js
 * Entry point for the Love Story Runner game.
 */

window.addEventListener('load', () => {
    console.log('Game Loading...');

    // Connect to Node.js / Socket.io Backend (if available)
    try {
        if (typeof io !== 'undefined') {
            const socket = io();
            socket.on('connect', () => {
                console.log('Connected to server!');
            });
        }
    } catch (e) {
        console.warn('Socket.io connection failed (expected if local):', e);
    }

    try {
        const game = new Game();
        game.init();
        window._game = game; // For console debug
    } catch (e) {
        console.error('Failed to initialize Game:', e);
    }
});
