// Variables globales pour la LightBox
let lightboxMediaData = [];
let currentMediaIndex = 0;
let focusableElements = [];
let previouslyFocusedElement = null;

// Tracker du dernier geste utilisateur pour éviter les ouvertures automatiques
let __lastUserGesture = { time: 0, isTrusted: false };
['click', 'keydown', 'touchstart'].forEach((evt) => {
  document.addEventListener(
    evt,
    (e) => {
      try {
        __lastUserGesture = { time: Date.now(), isTrusted: !!e.isTrusted };
      } catch (err) {
        __lastUserGesture = { time: Date.now(), isTrusted: false };
      }
    },
    true
  );
});

// Initialiser la lightbox avec les données des médias
function initializeLightbox(mediaData) {
  lightboxMediaData = mediaData;
  // LightBox initialisée avec medias (silencieux en production)
}

// Ouvrir la lightbox avec un média spécifique
function openLightbox(mediaData, photographerName, options) {
  // Debug instrumentation: n'affiche que si localStorage.debug_lightbox === '1' ou sur localhost
  try {
    const debugEnabled =
      localStorage.getItem('debug_lightbox') === '1' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (debugEnabled) {
      // Debug instrumentation (disabled by default) - enable via localStorage.debug_lightbox
    }
  } catch (dbgErr) {
    // ignore debug errors
  }
  // Guard: n'autoriser l'ouverture que si un geste utilisateur récent est présent
  // ou si l'appelant fournit `options && options.force === true`.
  const MAX_GESTURE_AGE = 2000; // ms
  const forced = options && options.force === true;
  if (!forced) {
    if (
      !(
        __lastUserGesture &&
        __lastUserGesture.isTrusted &&
        Date.now() - __lastUserGesture.time < MAX_GESTURE_AGE
      )
    ) {
      // openLightbox blocked: no recent user gesture
      return;
    }
  }

  // Trouver l'index du média dans la liste
  currentMediaIndex = lightboxMediaData.findIndex(
    (media) => media.id === mediaData.id
  );

  if (currentMediaIndex === -1) {
    // Média non trouvé dans la liste
    return;
  }

  const lightbox = document.getElementById('lightbox_modal');

  // Sauvegarder l'élément qui avait le focus
  previouslyFocusedElement = document.activeElement;

  // Afficher la lightbox
  lightbox.style.display = 'flex';
  lightbox.setAttribute('aria-hidden', 'false');

  // Charger le média courant
  loadMediaInLightbox(currentMediaIndex, photographerName);

  // Obtenir tous les éléments focusables dans la lightbox
  focusableElements = lightbox.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Donner le focus au bouton de fermeture
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  // Ajouter les gestionnaires d'événements
  document.addEventListener('keydown', handleLightboxKeydown);
  lightbox.addEventListener('click', handleLightboxBackdropClick);

  // Empêcher le défilement du body
  document.body.style.overflow = 'hidden';

  // LightBox ouverte pour: (silencieux)
}

// Fermer la lightbox
function closeLightbox() {
  const lightbox = document.getElementById('lightbox_modal');

  // Masquer la lightbox
  lightbox.style.display = 'none';
  lightbox.setAttribute('aria-hidden', 'true');

  // Restaurer le focus sur l'élément précédent
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }

  // Retirer les gestionnaires d'événements
  document.removeEventListener('keydown', handleLightboxKeydown);
  lightbox.removeEventListener('click', handleLightboxBackdropClick);

  // Restaurer le défilement du body
  document.body.style.overflow = '';

  // LightBox fermée
}

// Charger un média dans la lightbox
function loadMediaInLightbox(index, photographerName) {
  if (index < 0 || index >= lightboxMediaData.length) {
    return;
  }

  const mediaData = lightboxMediaData[index];
  const mediaContainer = document.getElementById('lightbox-media');
  const titleElement = document.getElementById('lightbox-title');

  // Effacer le contenu précédent
  mediaContainer.innerHTML = '';

  // Obtenir le nom du dossier du photographe (réutiliser la fonction du factory)
  function getPhotographerFolderName(photographerName) {
    const folderMapping = {
      'Mimi Keel': 'Mimi',
      'Ellie-Rose Wilkens': 'Ellie Rose',
      'Tracy Galindo': 'Tracy',
      'Nabeel Bradford': 'Nabeel',
      'Rhode Dubois': 'Rhode',
      'Marcel Nikolic': 'Marcel',
    };
    return folderMapping[photographerName] || photographerName;
  }

  const photographerFolder = getPhotographerFolderName(photographerName);

  // Créer l'élément média
  let mediaElement;
  if (mediaData.image) {
    mediaElement = document.createElement('img');
    mediaElement.src = `assets/photographers/${photographerFolder}/${mediaData.image}`;
    mediaElement.alt = mediaData.title;
    mediaElement.className = 'lightbox-media-content';
  } else if (mediaData.video) {
    mediaElement = document.createElement('video');
    mediaElement.src = `assets/photographers/${photographerFolder}/${mediaData.video}`;
    mediaElement.className = 'lightbox-media-content';
    mediaElement.controls = true;
    mediaElement.autoplay = false;
    mediaElement.setAttribute('preload', 'metadata');
  }

  // Ajouter l'élément au container
  mediaContainer.appendChild(mediaElement);

  // Mettre à jour le titre
  titleElement.textContent = mediaData.title;

  // Mettre à jour les états des boutons de navigation
  updateNavigationButtons();

  // Mettre à jour les attributs d'accessibilité
  const lightbox = document.getElementById('lightbox_modal');
  lightbox.setAttribute('aria-labelledby', 'lightbox-title');

  // Média chargé (silencieux)
}

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
  const prevButton = document.querySelector('.lightbox-prev');
  const nextButton = document.querySelector('.lightbox-next');

  // Désactiver le bouton précédent si on est au début
  if (currentMediaIndex <= 0) {
    prevButton.disabled = true;
    prevButton.setAttribute('aria-disabled', 'true');
  } else {
    prevButton.disabled = false;
    prevButton.setAttribute('aria-disabled', 'false');
  }

  // Désactiver le bouton suivant si on est à la fin
  if (currentMediaIndex >= lightboxMediaData.length - 1) {
    nextButton.disabled = true;
    nextButton.setAttribute('aria-disabled', 'true');
  } else {
    nextButton.disabled = false;
    nextButton.setAttribute('aria-disabled', 'false');
  }
}

// Naviguer vers le média précédent
function showPreviousMedia(photographerName) {
  if (currentMediaIndex > 0) {
    currentMediaIndex--;
    loadMediaInLightbox(currentMediaIndex, photographerName);
  }
}

// Naviguer vers le média suivant
function showNextMedia(photographerName) {
  if (currentMediaIndex < lightboxMediaData.length - 1) {
    currentMediaIndex++;
    loadMediaInLightbox(currentMediaIndex, photographerName);
  }
}

// Gestion des touches dans la lightbox
function handleLightboxKeydown(e) {
  // Fermer avec Échap
  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }

  // Navigation avec les flèches
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    showPreviousMedia(getCurrentPhotographerName());
    return;
  }

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    showNextMedia(getCurrentPhotographerName());
    return;
  }

  // Piéger le focus dans la lightbox avec Tab
  if (e.key === 'Tab') {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab seul
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// Fermer la lightbox en cliquant sur l'arrière-plan
function handleLightboxBackdropClick(e) {
  const lightboxContent = document.querySelector('.lightbox');
  if (e.target.id === 'lightbox_modal' && !lightboxContent.contains(e.target)) {
    closeLightbox();
  }
}

// Obtenir le nom du photographe actuel (helper function)
function getCurrentPhotographerName() {
  // Récupérer depuis l'URL ou depuis une variable globale
  const photographerNameElement = document.querySelector(
    '.photographer-page-name'
  );
  return photographerNameElement ? photographerNameElement.textContent : '';
}

// Initialiser les gestionnaires d'événements de la lightbox
function initializeLightboxEvents() {
  document.addEventListener('DOMContentLoaded', function () {
    // Bouton de fermeture
    const closeButton = document.querySelector('.close-lightbox');
    if (closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    }

    // Boutons de navigation
    const prevButton = document.querySelector('.lightbox-prev');
    const nextButton = document.querySelector('.lightbox-next');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        showPreviousMedia(getCurrentPhotographerName());
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        showNextMedia(getCurrentPhotographerName());
      });
    }
  });
}

// Initialiser les événements
initializeLightboxEvents();

// Exposer les fonctions au niveau global
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.initializeLightbox = initializeLightbox;
