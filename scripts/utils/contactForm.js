// Variables pour gérer l'accessibilité
let focusableElements = [];
let previouslyFocusedElement = null;

function displayModal() {
  const modal = document.getElementById("contact_modal");

  // Sauvegarder l'élément qui avait le focus
  previouslyFocusedElement = document.activeElement;

  // Afficher la modale
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  // Obtenir tous les éléments focusables dans la modale
  focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Donner le focus au premier élément focusable (le champ prénom)
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  // Ajouter les gestionnaires d'événements
  document.addEventListener("keydown", handleModalKeydown);
  modal.addEventListener("click", handleModalBackdropClick);

  // Empêcher le défilement du body
  document.body.style.overflow = "hidden";

  // Modale de contact ouverte
}

function closeModal() {
  const modal = document.getElementById("contact_modal");

  // Masquer la modale
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  // Restaurer le focus sur l'élément précédent
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }

  // Retirer les gestionnaires d'événements
  document.removeEventListener("keydown", handleModalKeydown);
  modal.removeEventListener("click", handleModalBackdropClick);

  // Restaurer le défilement du body
  document.body.style.overflow = "";

  // Réinitialiser le formulaire
  resetForm();

  // Modale de contact fermée
}

// Gestion des touches dans la modale
function handleModalKeydown(e) {
  // Fermer avec Échap
  if (e.key === "Escape") {
    closeModal();
    return;
  }

  // Piéger le focus dans la modale avec Tab
  if (e.key === "Tab") {
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

// Fermer la modale en cliquant sur l'arrière-plan
function handleModalBackdropClick(e) {
  const modal = document.querySelector(".modal");
  if (e.target.id === "contact_modal" && !modal.contains(e.target)) {
    closeModal();
  }
}

// Validation et soumission du formulaire
function initializeContactForm() {
  // Initialisation du formulaire de contact

  // Configurer le formulaire
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);

    // Ajouter la validation en temps réel
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => clearError(input));
    });
    // Formulaire configuré
  } else {
    // Formulaire non trouvé
  }

  // Ajouter les gestionnaires d'événements aux boutons
  const contactButton = document.querySelector(".contact_button");
  const closeButton = document.querySelector(".close-modal");

  // Recherche du bouton contact
  // Recherche du bouton fermeture

  if (contactButton) {
    // Vérifier s'il a déjà un onclick (si nécessaire)
    if (contactButton.hasAttribute("onclick")) {
      // existing onclick present
    }

    // Ajouter un eventListener sans supprimer l'onclick (pour double sécurité)
    contactButton.addEventListener("click", function () {
      // Click détecté sur le bouton contact
      displayModal();
    });
    // Bouton contact configuré
  } else {
    // Bouton contact non trouvé
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
    // Bouton fermeture configuré
  } else {
    // Bouton fermeture non trouvé
  }

  // Fin initialisation contact
}

function handleFormSubmit(e) {
  // e est requis par l'API du listener mais parfois non utilisé explicitement
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Valider tous les champs
  const isValid = validateForm(form);

  if (isValid) {
    // Créer un objet avec les données du formulaire
    const contactData = {
      firstname: formData.get("firstname"),
      lastname: formData.get("lastname"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // Afficher les données dans la console (comme demandé)
    console.log("=== DONNÉES DU FORMULAIRE DE CONTACT ===");
    console.log("Prénom:", contactData.firstname);
    console.log("Nom:", contactData.lastname);
    console.log("Email:", contactData.email);
    console.log("Message:", contactData.message);
    console.log("==========================================");

    // Afficher un message de succès (optionnel)
    alert("Votre message a été envoyé avec succès !");

    // Fermer la modale
    closeModal();
  }
}

function validateForm(form) {
  const inputs = form.querySelectorAll("input, textarea");
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let isValid = true;
  let errorMessage = "";

  // Validation requise
  if (field.hasAttribute("required") && !value) {
    isValid = false;
    errorMessage = "Ce champ est requis.";
  }
  // Validation email
  else if (fieldName === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Veuillez entrer une adresse email valide.";
    }
  }
  // Validation longueur minimale
  else if (value && value.length < 2) {
    isValid = false;
    errorMessage = "Ce champ doit contenir au moins 2 caractères.";
  }

  // Afficher ou masquer l'erreur
  showFieldError(field, isValid ? "" : errorMessage);

  return isValid;
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(field.name + "-error");
  if (errorElement) {
    errorElement.textContent = message;

    // Ajouter/retirer la classe d'erreur sur le champ
    if (message) {
      field.classList.add("field-error");
      field.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("field-error");
      field.setAttribute("aria-invalid", "false");
    }
  }
}

function clearError(field) {
  // Effacer l'erreur quand l'utilisateur commence à taper
  const errorElement = document.getElementById(field.name + "-error");
  if (errorElement && errorElement.textContent) {
    errorElement.textContent = "";
    field.classList.remove("field-error");
    field.setAttribute("aria-invalid", "false");
  }
}

function resetForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Réinitialiser les valeurs
  form.reset();

  // Effacer toutes les erreurs
  const errorElements = form.querySelectorAll(".error-message");
  errorElements.forEach((error) => (error.textContent = ""));

  // Retirer les classes d'erreur
  const fields = form.querySelectorAll("input, textarea");
  fields.forEach((field) => {
    field.classList.remove("field-error");
    field.setAttribute("aria-invalid", "false");
  });
}

// Initialiser le formulaire au chargement de la page avec un délai
document.addEventListener("DOMContentLoaded", function () {
  // Attendre que tous les autres scripts aient configuré la page
  setTimeout(initializeContactForm, 100);
});

// Aussi s'initialiser si la page est déjà chargée
if (document.readyState !== "loading") {
  setTimeout(initializeContactForm, 100);
}

// Exposer les fonctions globalement pour compatibilité
if (typeof window !== "undefined") {
  window.displayModal = displayModal;
  window.closeModal = closeModal;
}
