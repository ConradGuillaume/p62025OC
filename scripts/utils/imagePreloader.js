

// Gestionnaire de préchargement des images
class ImagePreloader {
  constructor() {
    this.preloadedImages = new Set();
    this.loadingPromises = new Map();
  }

  // Précharger une image
  preloadImage(src) {
    // Si l'image est déjà préchargée, retourner immédiatement
    if (this.preloadedImages.has(src)) {
      return Promise.resolve();
    }

    // Si le chargement est déjà en cours, retourner la promesse existante
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Créer une nouvelle promesse de chargement
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Précharger plusieurs images
  async preloadImages(imageSources) {
    const promises = imageSources.map(src => this.preloadImage(src));
    
    try {
      await Promise.all(promises);
      console.log(`${imageSources.length} images préchargées avec succès`);
    } catch (error) {
      console.warn('Certaines images n\'ont pas pu être préchargées:', error);
    }
  }

  // Précharger les images des médias
  async preloadMediaImages(mediaData, photographerName) {
    const imageSources = [];
    
    mediaData.forEach(media => {
      if (media.image) {
        const folderMapping = {
          'Mimi Keel': 'Mimi',
          'Ellie-Rose Wilkens': 'Ellie Rose',
          'Tracy Galindo': 'Tracy',
          'Nabeel Bradford': 'Nabeel',
          'Rhode Dubois': 'Rhode',
          'Marcel Nikolic': 'Marcel',
        };
        
        const photographerFolder = folderMapping[photographerName] || photographerName;
        const imagePath = `assets/photographers/${photographerFolder}/${media.image}`;
        imageSources.push(imagePath);
      }
    });

    await this.preloadImages(imageSources);
  }

  // Précharger les portraits des photographes
  async preloadPhotographerPortraits(photographers) {
    const portraitSources = photographers.map(photographer => photographer.portrait);
    await this.preloadImages(portraitSources);
  }
}

// Instance globale du préchargeur
const imagePreloader = new ImagePreloader();

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
  window.ImagePreloader = ImagePreloader;
  window.imagePreloader = imagePreloader;
}
