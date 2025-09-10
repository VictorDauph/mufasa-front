export async function loadConfig() {
    const resp = await fetch("/config/config.json");
    const cfg = await resp.json();

    // Détection de l'environnement
    let API_URL;
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
        API_URL = cfg.api_url; // local
    } else {
        API_URL = cfg.api_url2; // pages ou prod
    }
    return API_URL;
}