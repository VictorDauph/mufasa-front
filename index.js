import { loadConfig } from "./config/config.js";

let API_URL = ""; // backend FastAPI

const status = document.getElementById("status");

loadConfig().then(async (url) => {
    API_URL = url
    console.log("API URL chargée:", API_URL);
    const resp = await fetch(API_URL + "/test");
    const result = await resp.text();
    console.log("Backend response:", JSON.parse(result).message);
    status.textContent = "Backend status: " + JSON.parse(result).message;
});


const pushToTalkBtn = document.getElementById("pushToTalkBtn");
const replayBtn = document.getElementById("replayBtn");
const replayBtnmob = document.getElementById("replayBtnmob");
const speed = document.getElementById("speed");
const speedVal = document.getElementById("speedVal");
const mobilePushToTalkBtn = document.getElementById("mobilePushToTalkBtn");
const mobileSpeed = document.getElementById("mobileSpeed");
const mobileSpeedVal = document.getElementById("mobileSpeedVal");

let player = null;
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


let mediaRecorder;
let audioChunks = [];

// 🎙️ Démarrer l’enregistrement
async function startRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        return; // déjà en cours, ne redémarre pas
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunks = [];
    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.onstop = async () => {
        if (!await initTone()) {
            alert("Erreur d'initialisation audio");
            return;
        }
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("ref_url", await localStorage.getItem('ref_url'));
        formData.append("context", localStorage.getItem('context'));
        formData.append("audio", audioBlob, "recording.webm");
        try {
            const resp = await fetch(API_URL + "/ask", {
                method: "POST",
                body: formData
            });

            if (!resp.ok) {
                // Si le backend renvoie une HTTPException
                const errorData = await resp.json();
                console.error("❌ Backend error:", errorData);
                alert("Erreur backend: " + (errorData.detail || "Erreur inconnue"));
                return;
            }

            const data = await resp.json();
            console.log(data);
            localStorage.setItem('context', JSON.stringify(data.context));

            if (data.audio_url) {
                await player.load(data.audio_url);  // Charge l'audio
                player.start();  // Lance la lecture
            } else {
                alert("Pas d'URL audio dans la réponse !");
            }
        } catch (err) {
            console.log("❌ Error:", err);
            alert("Erreur lors de l’envoi au backend :", err);
        }
    };
    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();

    }
}

pushToTalkBtn.addEventListener("mousedown", startRecording);
pushToTalkBtn.addEventListener("mouseup", stopRecording);

// Espace clavier
document.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.code === "Space") startRecording();
});
document.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.code === "Space") stopRecording();
});

//bouton relancer l'audio
// Modifie aussi le bouton replay
replayBtn.addEventListener("click", async () => {
    if (!isInitialized) {
        await initTone();
    }
    if (player && player.loaded) {
        player.start();
    }
});

replayBtnmob.addEventListener("touchstart", async () => {
    if (!isInitialized) {
        await initTone();
    }
    if (player && player.loaded) {
        player.start();
    }
});

//controle de la vitesse
speed.addEventListener("input", () => {
    const val = parseFloat(speed.value);
    if (player) {
        player.playbackRate = val;  // CORRECT : pas de .value
        speedVal.textContent = val.toFixed(2);
    }
});

//controle de la vitesse mobile
mobileSpeed.addEventListener("input", () => {
    const val = parseFloat(mobileSpeed.value);
    if (player) {
        player.playbackRate = val;
        mobileSpeedVal.textContent = val.toFixed(2);
    }
});

// Mobile : Push to Talk
mobilePushToTalkBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startRecording();
});
mobilePushToTalkBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopRecording();
});

function cleanup() {
    if (player) {
        player.dispose();
        player = null;
    }
    isInitialized = false;
}