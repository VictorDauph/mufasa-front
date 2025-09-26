let processingPlayer = null; // Tone.Player
let processingOsc = null;    // Tone.Oscillator (fallback synth within Tone)
let processingGain = null;   // Tone.Gain used for unified volume + fade
let _isStarting = false;
let _soundUrl = "./medias/waiting-sound.mp3";
let _volumeDb = 10; // default volume in dB (negative = attenuation)
let _loop = true;


function dbToLinear(db) {
    return Math.pow(10, db / 20);
}


/**
 * Démarre le son de "processing" en n'utilisant que Tone.js.
 * - url optionnel pour override
 * - utilise Tone.Player si url disponible, sinon Tone.Oscillator
 * NOTE: Tone.start() doit être appelé suite à un geste utilisateur (mousedown / touchstart)
 */
export async function startWaitingSound(url = null, loop = null) {
    if (processingPlayer || processingOsc || _isStarting) return;
    _isStarting = true;
    const useUrl = url || _soundUrl;
    const useLoop = loop === null ? _loop : !!loop;
    const linearGain = dbToLinear(_volumeDb);

    try {
        if (typeof Tone === "undefined") {
            throw new Error("Tone.js non chargé");
        }

        await Tone.start(); // peut rejeter si pas de geste utilisateur

        // create a single Gain node for consistent fade/volume control
        processingGain = new Tone.Gain(linearGain).toDestination();

        if (useUrl) {
            // Tone.Player path
            processingPlayer = new Tone.Player(useUrl, () => {
                try {
                    processingPlayer.loop = useLoop;
                    // connect player -> gain -> destination
                    processingPlayer.connect(processingGain);
                    processingPlayer.start();
                } catch (e) {
                    console.warn("startWaitingSound: error starting Tone.Player", e);
                    // cleanup if failed
                    try { processingPlayer.dispose(); } catch (_) { }
                    processingPlayer = null;
                }
            });
            // do NOT chain .autostart on the constructor; keep reference
            return;
        }

        // No URL: fallback to a simple oscillator (still Tone)
        processingOsc = new Tone.Oscillator(220, "sine");
        processingOsc.connect(processingGain);
        processingOsc.start();
    } catch (e) {
        console.warn("startWaitingSound: impossible d'initialiser le son:", e);
        // cleanup partial state
        if (processingPlayer) { try { processingPlayer.dispose(); } catch (_) { } processingPlayer = null; }
        if (processingOsc) { try { processingOsc.dispose(); } catch (_) { } processingOsc = null; }
        if (processingGain) { try { processingGain.dispose(); } catch (_) { } processingGain = null; }
    } finally {
        _isStarting = false;
    }
}

/**
 * Stoppe le son (fade court puis cleanup)
 */
export function stopWaitingSound() {
    // nothing to do
    if (!processingGain && !processingPlayer && !processingOsc) return;

    try {
        // try a smooth fade on the gain AudioParam if available
        if (processingGain && processingGain.gain && typeof processingGain.gain.rampTo === "function") {
            processingGain.gain.rampTo(0.0001, 0.15);
        } else if (processingGain && processingGain.gain && typeof processingGain.gain.setTargetAtTime === "function") {
            // fallback to setTargetAtTime
            processingGain.gain.setTargetAtTime(0.0001, Tone.now(), 0.05);
        } else if (processingGain) {
            // last resort
            try { processingGain.gain.value = 0; } catch (_) { }
        }
    } catch (e) {
        console.warn("stopWaitingSound fade failed:", e);
    }

    setTimeout(() => {
        // stop & dispose Player
        if (processingPlayer) {
            try { processingPlayer.stop(); } catch (_) { }
            try { processingPlayer.disconnect(); } catch (_) { }
            try { processingPlayer.dispose(); } catch (_) { }
            processingPlayer = null;
        }

        // stop & dispose Oscillator
        if (processingOsc) {
            try { processingOsc.stop(); } catch (_) { }
            try { processingOsc.disconnect(); } catch (_) { }
            try { processingOsc.dispose(); } catch (_) { }
            processingOsc = null;
        }

        // dispose Gain
        if (processingGain) {
            try { processingGain.disconnect(); } catch (_) { }
            try { processingGain.dispose(); } catch (_) { }
            processingGain = null;
        }
    }, 180);
}