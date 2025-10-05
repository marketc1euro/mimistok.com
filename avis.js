document.addEventListener("DOMContentLoaded", () => {
  const workerUrl = "https://avismimistok.marketc1euro.workers.dev/";

  // Récupération des éléments du formulaire
  const form = document.getElementById("reviewForm");
  const nameInput = document.getElementById("name");
  const ratingInput = document.getElementById("rating");
  const commentInput = document.getElementById("comment");
  const reviewsContainer = document.getElementById("reviews");

  if (!form || !reviewsContainer) {
    console.error("Formulaire ou conteneur d'avis introuvable !");
    return;
  }

  // Fonction pour charger les avis depuis le Worker
  async function loadReviews() {
    try {
      const res = await fetch(workerUrl);
      const avis = await res.json();

      if (!avis.length) {
        reviewsContainer.innerHTML = "<p style='color:white;'>Aucun avis pour le moment.</p>";
        return;
      }

      reviewsContainer.innerHTML = avis.map(a => `
        <div style="background: rgba(50,50,50,0.7); padding:15px; border-radius:10px;">
          <strong style="color:#FFD700;">${a.nom}</strong> - ${'★'.repeat(a.note)}<br>
          <p style="color:white;">${a.message}</p>
          <small style="color:#ccc;">${new Date(a.date).toLocaleString()}</small>
        </div>
      `).join('');
    } catch (err) {
      console.error("Erreur lors du chargement des avis :", err);
      reviewsContainer.innerHTML = "<p style='color:white;'>Impossible de charger les avis.</p>";
    }
  }

  // Gestion de l'envoi du formulaire
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const name = nameInput.value.trim() || "Anonyme";
    const note = parseInt(ratingInput.value);
    const comment = commentInput.value.trim();

    if (!note || !comment) {
      alert("Veuillez saisir une note et un commentaire.");
      return;
    }

    try {
      const res = await fetch(workerUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nom: name, note, message: comment })
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      alert("Avis envoyé !");
      form.reset();
      loadReviews();
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'avis :", err);
      alert("Impossible d'envoyer l'avis.");
    }
  });

  // Charger les avis au démarrage
  loadReviews();
});