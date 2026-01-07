/**
 * audio.js
 * Handles game audio and music
 */

class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.winMusic = null;
        this.loseSound = null;
        this.jumpSound = null;
        this.isMuted = false;

        this.initAudio();
    }

    initAudio() {
        // Create audio context for web audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Background music - upbeat running theme
        this.bgMusic = this.createOscillatorMusic();

        // Create sound effects
        this.createSoundEffects();
    }

    createOscillatorMusic() {
        // Create a simple upbeat melody using Web Audio API
        const music = {
            oscillators: [],
            gainNode: this.audioContext.createGain(),
            isPlaying: false
        };

        music.gainNode.connect(this.audioContext.destination);
        music.gainNode.gain.value = 0.1; // Low volume for background

        return music;
    }

    createSoundEffects() {
        // Jump sound effect
        this.jumpSound = () => {
            if (this.isMuted) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.value = 400;
            gain.gain.value = 0.1;

            osc.start();
            osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            osc.stop(this.audioContext.currentTime + 0.15);
        };

        // Slide sound effect
        this.slideSound = () => {
            if (this.isMuted) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.value = 200;
            gain.gain.value = 0.08;

            osc.start();
            osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            osc.stop(this.audioContext.currentTime + 0.2);
        };

        // Collision sound
        this.collisionSound = () => {
            if (this.isMuted) return;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sawtooth';
            osc.frequency.value = 100;
            gain.gain.value = 0.2;

            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            osc.stop(this.audioContext.currentTime + 0.3);
        };
    }

    playBackgroundMusic() {
        if (this.isMuted || this.bgMusic.isPlaying) return;

        // Romantic love theme melody - expressing Sham's emotions
        // Using a heartfelt chord progression
        const melody = [
            // Verse 1 - Longing
            { freq: 523.25, duration: 0.4, type: 'sine' },    // C5 - "I"
            { freq: 587.33, duration: 0.4, type: 'sine' },    // D5 - "am"
            { freq: 659.25, duration: 0.6, type: 'sine' },    // E5 - "running"
            { freq: 587.33, duration: 0.4, type: 'sine' },    // D5 - "to"
            { freq: 523.25, duration: 0.8, type: 'sine' },    // C5 - "you"

            // Verse 2 - Hope
            { freq: 659.25, duration: 0.4, type: 'sine' },    // E5 - "My"
            { freq: 783.99, duration: 0.4, type: 'sine' },    // G5 - "heart"
            { freq: 880.00, duration: 0.6, type: 'sine' },    // A5 - "beats"
            { freq: 783.99, duration: 0.4, type: 'sine' },    // G5 - "for"
            { freq: 659.25, duration: 0.8, type: 'sine' },    // E5 - "you"

            // Bridge - Building emotion
            { freq: 880.00, duration: 0.4, type: 'triangle' }, // A5 - "Through"
            { freq: 987.77, duration: 0.4, type: 'triangle' }, // B5 - "every"
            { freq: 1046.50, duration: 0.6, type: 'triangle' },// C6 - "obstacle"
            { freq: 987.77, duration: 0.4, type: 'triangle' }, // B5 - "I'll"
            { freq: 880.00, duration: 0.8, type: 'triangle' }, // A5 - "run"

            // Chorus - Love declaration
            { freq: 1046.50, duration: 0.5, type: 'sine' },   // C6 - "To"
            { freq: 987.77, duration: 0.3, type: 'sine' },    // B5 - "be"
            { freq: 880.00, duration: 0.3, type: 'sine' },    // A5 - "with"
            { freq: 783.99, duration: 0.5, type: 'sine' },    // G5 - "my"
            { freq: 659.25, duration: 1.0, type: 'sine' },    // E5 - "love"
        ];

        // Harmony notes for richness
        const harmony = [
            { freq: 392.00, duration: 0.4 }, // G4
            { freq: 440.00, duration: 0.4 }, // A4
            { freq: 493.88, duration: 0.6 }, // B4
            { freq: 440.00, duration: 0.4 }, // A4
            { freq: 392.00, duration: 0.8 }, // G4

            { freq: 493.88, duration: 0.4 }, // B4
            { freq: 587.33, duration: 0.4 }, // D5
            { freq: 659.25, duration: 0.6 }, // E5
            { freq: 587.33, duration: 0.4 }, // D5
            { freq: 493.88, duration: 0.8 }, // B4

            { freq: 659.25, duration: 0.4 }, // E5
            { freq: 739.99, duration: 0.4 }, // F#5
            { freq: 783.99, duration: 0.6 }, // G5
            { freq: 739.99, duration: 0.4 }, // F#5
            { freq: 659.25, duration: 0.8 }, // E5

            { freq: 783.99, duration: 0.5 }, // G5
            { freq: 739.99, duration: 0.3 }, // F#5
            { freq: 659.25, duration: 0.3 }, // E5
            { freq: 587.33, duration: 0.5 }, // D5
            { freq: 523.25, duration: 1.0 }, // C5
        ];

        this.bgMusic.isPlaying = true;
        let currentTime = this.audioContext.currentTime;

        const playPattern = () => {
            if (!this.bgMusic.isPlaying) return;

            // Play melody
            melody.forEach((note, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.bgMusic.gainNode);

                osc.frequency.value = note.freq;
                osc.type = note.type || 'sine';

                const startTime = currentTime + (i * 0.45);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
                gain.gain.linearRampToValueAtTime(0, startTime + note.duration);

                osc.start(startTime);
                osc.stop(startTime + note.duration);
            });

            // Play harmony (softer)
            harmony.forEach((note, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.bgMusic.gainNode);

                osc.frequency.value = note.freq;
                osc.type = 'triangle';

                const startTime = currentTime + (i * 0.45);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
                gain.gain.linearRampToValueAtTime(0, startTime + note.duration);

                osc.start(startTime);
                osc.stop(startTime + note.duration);
            });

            currentTime += melody.length * 0.45;
            setTimeout(playPattern, melody.length * 450);
        };

        playPattern();
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.isPlaying = false;
        }
    }

    playWinMusic() {
        if (this.isMuted) return;

        this.stopBackgroundMusic();

        // Romantic victory fanfare - "We're together at last!"
        const victoryMelody = [
            // Triumphant opening
            { freq: 523.25, duration: 0.3, gain: 0.2 },  // C5
            { freq: 659.25, duration: 0.3, gain: 0.2 },  // E5
            { freq: 783.99, duration: 0.3, gain: 0.25 }, // G5
            { freq: 1046.50, duration: 0.5, gain: 0.3 }, // C6

            // Emotional peak - "Together!"
            { freq: 1174.66, duration: 0.4, gain: 0.3 }, // D6
            { freq: 1318.51, duration: 0.6, gain: 0.35 },// E6
            { freq: 1174.66, duration: 0.3, gain: 0.3 }, // D6
            { freq: 1046.50, duration: 0.5, gain: 0.3 }, // C6

            // Resolution - "Forever"
            { freq: 987.77, duration: 0.4, gain: 0.25 }, // B5
            { freq: 880.00, duration: 0.4, gain: 0.25 }, // A5
            { freq: 783.99, duration: 0.6, gain: 0.25 }, // G5
            { freq: 1046.50, duration: 1.2, gain: 0.3 }, // C6 - final note
        ];

        // Harmony for richness
        const harmonyNotes = [
            { freq: 392.00, duration: 0.3 },  // G4
            { freq: 493.88, duration: 0.3 },  // B4
            { freq: 587.33, duration: 0.3 },  // D5
            { freq: 783.99, duration: 0.5 },  // G5

            { freq: 880.00, duration: 0.4 },  // A5
            { freq: 987.77, duration: 0.6 },  // B5
            { freq: 880.00, duration: 0.3 },  // A5
            { freq: 783.99, duration: 0.5 },  // G5

            { freq: 739.99, duration: 0.4 },  // F#5
            { freq: 659.25, duration: 0.4 },  // E5
            { freq: 587.33, duration: 0.6 },  // D5
            { freq: 783.99, duration: 1.2 },  // G5
        ];

        let currentTime = this.audioContext.currentTime;

        // Play melody
        victoryMelody.forEach((note, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.value = note.freq;
            osc.type = 'triangle';

            const startTime = currentTime + (i * 0.35);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(note.gain, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

            osc.start(startTime);
            osc.stop(startTime + note.duration);
        });

        // Play harmony
        harmonyNotes.forEach((note, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.value = note.freq;
            osc.type = 'sine';

            const startTime = currentTime + (i * 0.35);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

            osc.start(startTime);
            osc.stop(startTime + note.duration);
        });

        // Add romantic "heartbeat" bass
        for (let i = 0; i < 8; i++) {
            const bass = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();

            bass.connect(bassGain);
            bassGain.connect(this.audioContext.destination);

            bass.frequency.value = 130.81; // C3
            bass.type = 'sine';

            const beatTime = currentTime + (i * 0.6);
            bassGain.gain.setValueAtTime(0, beatTime);
            bassGain.gain.linearRampToValueAtTime(0.15, beatTime + 0.05);
            bassGain.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.3);

            bass.start(beatTime);
            bass.stop(beatTime + 0.3);
        }
    }

    playJump() {
        this.jumpSound();
    }

    playSlide() {
        this.slideSound();
    }

    playCollision() {
        this.collisionSound();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        return this.isMuted;
    }
}
