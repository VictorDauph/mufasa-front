import { loadConfig } from "../../config/config.js";

let API_URL = ""; // backend FastAPI
loadConfig().then((url) => {
    API_URL = url
    console.log("API URL chargée:", API_URL);
});

document.getElementById('audioForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const input = document.getElementById('audioInput');
    const file = input.files[0];
    if (!file) return;

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