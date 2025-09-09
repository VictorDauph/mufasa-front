let API_URL = ""; // backend FastAPI

async function loadConfig() {
    const resp = await fetch("./config/config.json");
    const cfg = await resp.json();
    API_URL = cfg.api_url;
    console.log("API URL chargée:", API_URL);
}

const btn = document.getElementById("sendBtn");
const textInput = document.getElementById("textInput");
const refInput = document.getElementById("refInput");
const replayBtn = document.getElementById("replayBtn");
const speed = document.getElementById("speed");
const speedVal = document.getElementById("speedVal");

loadConfig();

// Déclaration des variables globales
let playbackRate = null;
let player = null;  // Remplace audioSource
let isInitialized = false;

async function initTone() {
    if (!isInitialized) {
        try {
            await Tone.start();

            // Crée le player Tone.js
            player = new Tone.Player({
                playbackRate: parseFloat(speed.value)
            }).toDestination();

            isInitialized = true;
            console.log("✅ Audio chain initialized");
            return true;
        } catch (err) {
            console.error("❌ Audio initialization error:", err);
            cleanup();
            return false;
        }
    }
    return true;
}

// Modifie le click handler pour utiliser Tone.Player
btn.addEventListener("click", async () => {
    if (!await initTone()) {
        alert("Erreur d'initialisation audio");
        return;
    }

    // ...existing code...

    try {
        const resp = await fetch(`${API_URL}/speak`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput.value, ref_url: refInput.value })
        });
        const data = await resp.json();

        if (data.audio_url) {
            await player.load(data.audio_url);  // Charge l'audio
            player.start();  // Lance la lecture
        } else {
            alert("Pas d'URL audio dans la réponse !");
        }
    } catch (err) {
        console.error("❌ API error:", err);
        alert("Erreur lors de l'appel API");
    }
});

// Modifie aussi le bouton replay
replayBtn.addEventListener("click", async () => {
    if (!isInitialized) {
        await initTone();
    }
    if (player && player.loaded) {
        player.start();
    }
});

// Sliders
speed.addEventListener("input", () => {
    const val = parseFloat(speed.value);
    if (player) {
        player.playbackRate = val;  // CORRECT : pas de .value
        speedVal.textContent = val.toFixed(2);
    }
});

function cleanup() {
    if (player) {
        player.dispose();
        player = null;
    }
    isInitialized = false;
}