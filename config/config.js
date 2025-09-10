export async function loadConfig() {
    const resp = await fetch("/config/config.json");
    const cfg = await resp.json();
    let API_URL = cfg.api_url;
    return API_URL;
}