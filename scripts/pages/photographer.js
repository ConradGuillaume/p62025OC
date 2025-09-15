/*
 * File: photographer-new.js
 * Purpose: [Short description of this JavaScript file's responsibility]
 * Author: [Your Name] <you@example.com>
 * Date: 2025-09-15
 * Notes:
 *  - Keep functions small and pure when possible.
 *  - Document public functions and side effects.
 */

// Récupération des données du photographe et de ses médias
async function getPhotographerData() {
  try {
    // Récupération des données via fetch
    const response = await fetch("./data/photographers.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    return { photographers: [], media: [] };
  }
}

// Récupération de l'ID du photographe depuis l'URL
function getPhotographerIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const photographerId = urlParams.get("id");
  return photographerId ? parseInt(photographerId) : null;
}

// Filtrage des données pour le photographe sélectionné
function getPhotographerById(photographers, photographerId) {
  const photographer = photographers.find((p) => p.id === photographerId);
  return photographer;
}

// Filtrage des médias pour le photographe sélectionné
function getMediaByPhotographerId(media, photographerId) {
  const photographerMedia = media.filter(
    (m) => m.photographerId === photographerId
  );

  console.log(
    `Médias trouvés pour le photographe ${photographerId}:`,
    photographerMedia
  );

  return photographerMedia;
}

// Affichage de l'en-tête du photographe avec le template étendu
// Module-level reference to the instantiated photographer page model
let currentPhotographerPageModel = null;
// Module-level reference to the current photographer media and name for sorting
let currentPhotographerMedia = [];
let currentPhotographerName = "";

// Affichage de l'en-tête du photographe avec le template étendu
function displayPhotographerHeader(photographer) {
  const headerDiv = document.querySelector(".photograph-header");

  if (!photographer) {
    headerDiv.innerHTML = "<p>Photographe non trouvé</p>";
    return;
  }

  // Utiliser le template étendu
  const photographerPageModel = photographerPageTemplate(photographer);
  currentPhotographerPageModel = photographerPageModel;
  const { photographerInfo, photographerImage } =
    photographerPageModel.getPhotographerHeaderDOM();

  // Améliorer l'accessibilité du bouton de contact
  const contactButton = headerDiv.querySelector(".contact_button");
  contactButton.setAttribute("aria-label", `Contacter ${photographer.name}`);
  contactButton.setAttribute("tabindex", "0");

  // Insérer les éléments avant le bouton de contact
  headerDiv.insertBefore(photographerInfo, contactButton);
  headerDiv.appendChild(photographerImage);

  // Mettre à jour le titre de la page
  document.title = `Fisheye - ${photographer.name}`;

  // Créer et ajouter le badge de prix
  const priceBadge = photographerPageModel.getPriceBadgeDOM();
  // Append only if the template created a new badge (getPriceBadgeDOM may return existing)
  if (!document.querySelector(".price-badge")) {
    document.body.appendChild(priceBadge);
  }

  // Exposer une fonction globale pour que mediaFactory puisse déclencher la mise à jour
  if (typeof window !== "undefined") {
    window.updateTotalLikes = function () {
      if (
        currentPhotographerPageModel &&
        typeof currentPhotographerPageModel.updateTotalLikes === "function"
      ) {
        return currentPhotographerPageModel.updateTotalLikes();
      }
      return 0;
    };
  }

  console.log("En-tête du photographe affiché pour:", photographer.name);

  // Mettre à jour le nom dans la modale de contact
  const modalName = document.getElementById("photographer-name-modal");
  if (modalName) modalName.textContent = photographer.name;

  // Mettre à jour le prix dans l'encart existant
  const dailyPriceEl = document.getElementById("daily-price");
  if (dailyPriceEl) dailyPriceEl.textContent = `${photographer.price}€ / jour`;

  return photographerPageModel;
}

// Affichage des médias avec la factory Media
function displayPhotographerMedia(media, photographerName) {
  const mediaDiv = document.querySelector(".photograph-media");

  // Save current media and photographer name for later sorting
  currentPhotographerMedia = Array.isArray(media) ? media.slice() : [];
  currentPhotographerName = photographerName || "";

  // Initialize lightbox with the current media list so openLightbox can find indexes
  try {
    if (window && typeof window.initializeLightbox === "function") {
      window.initializeLightbox(currentPhotographerMedia);
    }
  } catch (err) {
    console.warn("initializeLightbox non disponible:", err);
  }

  // Clear existing media before rendering to avoid duplicates
  mediaDiv.innerHTML = "";

  if (currentPhotographerMedia.length === 0) {
    mediaDiv.innerHTML = "<p>Aucun média trouvé pour ce photographe</p>";
    return;
  }

  console.log(
    "Affichage des médias avec la factory:",
    currentPhotographerMedia
  );

  // Default sort: popularité
  const sortedMedia = currentPhotographerMedia.slice().sort((a, b) => {
    if (b.likes !== a.likes) {
      return b.likes - a.likes; // Tri par likes décroissant
    }
    return a.title.localeCompare(b.title); // Puis par titre alphabétique
  });

  sortedMedia.forEach((mediaData) => {
    // Utiliser la factory Media
    const mediaModel = mediaFactory(mediaData, photographerName);
    const mediaCardDOM = mediaModel.getMediaCardDOM();
    mediaDiv.appendChild(mediaCardDOM);
  });

  // Calculer et afficher le total des likes initial via la template
  if (
    currentPhotographerPageModel &&
    typeof currentPhotographerPageModel.updateTotalLikes === "function"
  ) {
    currentPhotographerPageModel.updateTotalLikes();
  }
}

// Render helper used when user changes sort option
function renderSortedMedia(sortBy) {
  const mediaDiv = document.querySelector(".photograph-media");

  if (!currentPhotographerMedia || currentPhotographerMedia.length === 0) {
    mediaDiv.innerHTML = "<p>Aucun média trouvé pour ce photographe</p>";
    return;
  }

  // Decide sort
  const sorted = currentPhotographerMedia.slice();
  switch (sortBy) {
    case "date":
      // Newest first
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "popularity":
    default:
      sorted.sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return a.title.localeCompare(b.title);
      });
      break;
  }

  // Clear and render
  mediaDiv.innerHTML = "";
  sorted.forEach((mediaData) => {
    const mediaModel = mediaFactory(mediaData, currentPhotographerName);
    mediaDiv.appendChild(mediaModel.getMediaCardDOM());
  });

  // Update lightbox dataset to the new order
  try {
    if (window && typeof window.initializeLightbox === "function") {
      window.initializeLightbox(sorted);
    }
  } catch (err) {
    console.warn("initializeLightbox non disponible:", err);
  }

  // Update total likes after re-render
  if (
    currentPhotographerPageModel &&
    typeof currentPhotographerPageModel.updateTotalLikes === "function"
  ) {
    currentPhotographerPageModel.updateTotalLikes();
  }
}

// Note: updateTotalLikes and likes observation are provided by the
// photographerPageTemplate (photographerPage.js template). We rely on
// photographerPageModel.updateTotalLikes() after rendering media.

// Fonction principale d'initialisation
async function init() {
  console.log("=== INITIALISATION DE LA PAGE PHOTOGRAPHE ===");

  // Récupérer l'ID depuis l'URL
  const photographerId = getPhotographerIdFromURL();

  if (!photographerId) {
    console.error("Aucun ID de photographe trouvé dans l'URL");
    document.querySelector(".photograph-header").innerHTML =
      "<p>Erreur: Aucun photographe spécifié</p>";
    return;
  }

  // Récupérer toutes les données
  const { photographers, media } = await getPhotographerData();

  // Trouver le photographe correspondant
  const photographer = getPhotographerById(photographers, photographerId);

  if (!photographer) {
    console.error(`Photographe avec l'ID ${photographerId} non trouvé`);
    document.querySelector(".photograph-header").innerHTML =
      "<p>Erreur: Photographe non trouvé</p>";
    return;
  }

  // Récupérer les médias du photographe
  const photographerMedia = getMediaByPhotographerId(media, photographerId);

  // Afficher les données
  displayPhotographerHeader(photographer);
  displayPhotographerMedia(photographerMedia, photographer.name);

  // Attach sort/select listener
  try {
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", function (e) {
        const value = e.target.value;
        renderSortedMedia(value);
      });
    } else {
      console.warn("Select de tri non trouvé: #sort-select");
    }
  } catch (err) {
    console.error("Erreur lors de l-attachement du select de tri:", err);
  }

  console.log("=== PAGE PHOTOGRAPHE INITIALISÉE ===");
}

// Lancement de l'initialisation
init();
