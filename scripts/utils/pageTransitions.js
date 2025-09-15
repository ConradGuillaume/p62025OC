/*
 * File: pageTransitions.js
 * Purpose: [Short description of this JavaScript file's responsibility]
 * Author: [Your Name] <you@example.com>
 * Date: 2025-09-15
 * Notes:
 *  - Keep functions small and pure when possible.
 *  - Document public functions and side effects.
 */

// Gestionnaire de transitions entre pages - Version simplifiée
class PageTransitionManager {
  constructor() {
    this.loader = document.getElementById('pageLoader');
    this.content = document.getElementById('pageContent');
    this.isInitialized = false;
    this.init();
  }

  init() {
    console.log('Initialisation du gestionnaire de transitions');

    // S'assurer que le contenu est caché au départ
    if (this.content) {
      this.content.classList.remove('loaded');
    }

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.startLoadingSequence();
      });
    } else {
      this.startLoadingSequence();
    }
  }

  startLoadingSequence() {
    console.log('Démarrage de la séquence de chargement');

    // Délai minimum pour l'animation + attente des scripts
    setTimeout(() => {
      this.checkContentAndDisplay();
    }, 400);

    // Sécurité: forcer l'affichage après 6 secondes max
    setTimeout(() => {
      if (!this.isInitialized) {
        console.warn('Timeout atteint - affichage forcé');
        this.showContent();
      }
    }, 6000);
  }

  checkContentAndDisplay() {
    // Vérifier si le contenu est présent
    let hasContent = false;

    if (window.location.pathname.includes('photographer.html')) {
      const mediaDiv = document.querySelector('.photograph-media');
      const headerName = document.querySelector('.photographer-page-name');
      hasContent = mediaDiv && headerName;
      console.log('Page photographe - contenu présent:', hasContent);
    } else {
      const photographerSection = document.querySelector(
        '.photographer_section'
      );
      hasContent =
        photographerSection && photographerSection.children.length > 0;
      console.log('Page d\'accueil - contenu présent:', hasContent);
    }

    if (hasContent) {
      this.showContent();
    } else {
      // Attendre encore un peu et réessayer
      setTimeout(() => {
        this.checkContentAndDisplay();
      }, 500);
    }
  }

  showContent() {
    if (this.isInitialized) return;

    console.log('Affichage du contenu');
    this.isInitialized = true;

    if (this.loader) {
      this.loader.classList.add('fade-out');

      setTimeout(() => {
        this.loader.style.display = 'none';

        if (this.content) {
          this.content.classList.add('loaded');

          // Animer les médias après un court délai
          setTimeout(() => {
            this.animateMediaItems();
          }, 100);
        }
      }, 300);
    } else if (this.content) {
      this.content.classList.add('loaded');
      this.animateMediaItems();
    }
  }

  animateMediaItems() {
    const mediaItems = document.querySelectorAll('.media-item');
    console.log('Animation des éléments médias:', mediaItems.length);

    mediaItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('fade-in');
      }, index * 50);
    });
  }

  // Méthode statique pour animer les nouveaux médias (tri)
  static animateNewMediaItems(container) {
    const mediaItems = container.querySelectorAll('.media-item');

    // D'abord cacher tous les éléments
    mediaItems.forEach((item) => {
      item.classList.add('animating');
      item.classList.remove('fade-in');
    });

    // Puis les faire apparaître avec un délai échelonné
    mediaItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.remove('animating');
        item.classList.add('fade-in');
      }, index * 60);
    });
  }
}

// Fonction pour les transitions lors des clics sur les liens
function initPageTransitions() {
  const photographerLinks = document.querySelectorAll('.photographer-link');

  photographerLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const href = this.getAttribute('href');
      const pageContent = document.getElementById('pageContent');

      if (pageContent) {
        // Animation de sortie
        pageContent.style.transition =
          'opacity 0.3s ease-out, transform 0.3s ease-out';
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      } else {
        window.location.href = href;
      }
    });
  });

  // Gérer le retour depuis la page photographe
  const backLink = document.querySelector('header a[href="index.html"]');
  if (backLink) {
    backLink.addEventListener('click', function (e) {
      e.preventDefault();

      const href = this.getAttribute('href');
      const pageContent = document.getElementById('pageContent');

      if (pageContent) {
        // Animation de sortie
        pageContent.style.transition =
          'opacity 0.3s ease-out, transform 0.3s ease-out';
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
          window.location.href = href;
        }, 300);
      } else {
        window.location.href = href;
      }
    });
  }
}

// Initialiser le gestionnaire de transitions
// pageTransitionManager is intentionally present for API completeness
// eslint-disable-next-line no-unused-vars
let pageTransitionManager;

document.addEventListener('DOMContentLoaded', () => {
  pageTransitionManager = new PageTransitionManager();
  initPageTransitions();
});

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
  window.PageTransitionManager = PageTransitionManager;
}
