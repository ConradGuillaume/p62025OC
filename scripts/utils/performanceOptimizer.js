// Optimisations de performance pour Fisheye
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Optimiser le chargement des images
    this.optimizeImageLoading();

    // Précharger les ressources critiques
    this.preloadCriticalResources();

    // Optimiser le DOM
    this.optimizeDOM();
  }

  optimizeImageLoading() {
    // Utiliser le lazy loading natif pour les images
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
    });

    // Optimiser les images de prévisualisation
    const mediaImages = document.querySelectorAll(".media-item img");
    mediaImages.forEach((img) => {
      img.addEventListener("load", function () {
        this.style.opacity = "1";
      });
    });
  }

  preloadCriticalResources() {
    // Précharger le logo et les icônes critiques
    const criticalImages = ["assets/images/logo.png", "assets/icons/close.svg"];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
  }

  optimizeDOM() {
    // Utiliser requestAnimationFrame pour les animations
    this.setupRAFAnimations();

    // Optimiser les event listeners
    this.optimizeEventListeners();
  }

  setupRAFAnimations() {
    // Remplacer les setTimeout par requestAnimationFrame quand possible
    window.rafTimeout = function (fn, delay) {
      let start = null;
      function frame(timestamp) {
        if (!start) start = timestamp;
        if (timestamp - start >= delay) {
          fn();
        } else {
          requestAnimationFrame(frame);
        }
      }
      requestAnimationFrame(frame);
    };
  }

  optimizeEventListeners() {
    // Utiliser la délégation d'événements pour les éléments dynamiques
    document.addEventListener(
      "click",
      (e) => {
        // Gérer les clics sur les médias de manière optimisée
        if (e.target.closest(".media-item")) {
          e.preventDefault();
          // Logique de lightbox ici
        }
      },
      { passive: false }
    );

    // Optimiser le scroll
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // Logique de scroll optimisée
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // Méthode pour déboguer les performances
  measurePerformance() {
    if (window.performance) {
      // Temps de chargement de la page (mesure silencieuse)
      const resources = performance.getEntriesByType("resource");

      // Identifier les ressources lentes
      const slowResources = resources.filter(
        (resource) => resource.duration > 100
      );
      if (slowResources.length > 0) {
        // Ressources lentes détectées
      }
    }
  }
}

// Initialiser l'optimiseur dès que possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const optimizer = new PerformanceOptimizer();
    // Mesurer les performances en développement
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      setTimeout(() => optimizer.measurePerformance(), 2000);
    }
  });
} else {
  // create an optimizer for non-DOMContentLoaded path
  /* eslint-disable-next-line no-unused-vars */
  const optimizer = new PerformanceOptimizer();
}

if (typeof window !== "undefined") {
  window.PerformanceOptimizer = PerformanceOptimizer;
}
