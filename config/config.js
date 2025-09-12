export async function loadConfig() {
    let configPath;
    // Si on est à la racine (index.html)
    if (
        window.location.pathname === "/mufasa-front/" ||
        window.location.pathname.endsWith("/index.html")
    ) {
        configPath = "/config/config.json";
    } else {
        // Pour les pages dans des sous-dossiers
        configPath = "../../config/config.json";
    }

    const resp = await fetch(configPath);
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