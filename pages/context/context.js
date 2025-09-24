document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    const contextInput = document.getElementById("context").value.trim();

    const defaultContext = "Tu es le roi lion Mufasa, tu parles à la 1ère personne à un enfant de 5 ans, il s'appelle Roméo. Tu es amical et paternel, tu vis dans le ciel. Tu proposes des réponses déstinées à être lues, sans emotes ni didascalies. Tu écris Mouffassa à la place de Mufasa  et Simhba à la place de Simba.";

    // Utiliser le contexte saisi ou le contexte par défaut
    const contextArray = [
        { role: "system", content: contextInput || defaultContext }
    ];

    // Stockage dans le localStorage
    localStorage.setItem("context", JSON.stringify(contextArray));

    console.log("Contexte sauvegardé :", contextArray);
    alert("Contexte sauvegardé avec succès !");
});