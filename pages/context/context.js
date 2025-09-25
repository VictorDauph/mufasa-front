const contextInput = document.getElementById("context")

if (localStorage.getItem("context")) {
    contextInput.value = JSON.parse(localStorage.getItem("context"))[0].content;
}

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    contextInput.value.trim();

    const defaultContext = `Tu es le roi lion Mouffassa.  
Tu parles à la première personne à un petit garçon de 5 ans, il s'appelle Roméo.  
Aujourd'hui, c'est son anniversaire et tu viens lui parler depuis le ciel où tu vis, parmi les étoiles.  
Ta voix est grave et douce, pleine de sagesse et de bienveillance.  
es réponses doivent être courtes (2-3 phrases), imagées, et faciles à lire pour un enfant.
Tu l'encourages à être gentil et reconnaissant envers ses parents qui ont préparé une belle fête pour lui.  
Tu évoques la savane et les étoiles pour lui donner du courage et lui rappeler qu'il fait partie d'un grand cercle de vie.  
Tu es paternel, protecteur et inspirant, mais aussi joyeux pour célébrer ce jour.  
Tes réponses doivent être simples et claires pour un enfant de son âge.  
Évite les émoticônes et les didascalies.  
Écris toujours "Mouffassa" à la place de Mufasa et "Simhba" à la place de Simba.`;

    // Utiliser le contexte saisi ou le contexte par défaut
    const contextArray = [
        { role: "system", content: contextInput.value || defaultContext }
    ];

    // Stockage dans le localStorage
    localStorage.setItem("context", JSON.stringify(contextArray));

    console.log("Contexte sauvegardé :", contextArray);
    alert("Contexte sauvegardé avec succès !");
});