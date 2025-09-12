import { loadConfig } from "../../config/config.js";

let API_URL = ""; // backend FastAPI
loadConfig().then((url) => {
    API_URL = url
    console.log("API URL chargée:", API_URL);
});

document.getElementById('audioForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const input = document.getElementById('audioInput');
    let file = input.files[0];
    if (!file) {
        const resp = await fetch("../../medias/default.mp3")
        const blob = await resp.blob();
        file = new File([blob], "default.mp3", { type: "audio/mpeg" });
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/ref_upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Fichier envoyé avec succès !');
            let ref_url = await response.json();
            console.log("adresse du fichier de clone : ", ref_url);
            localStorage.setItem('ref_url', (ref_url));
        } else {
            alert('Erreur lors de l\'envoi du fichier.');
        }
    } catch (error) {
        alert('Erreur réseau : ' + error.message);
    }
});

document.getElementById('btn-supprimer').addEventListener('click', async function () {
    let ref_url = await localStorage.removeItem('ref_url');
});