
function mediaFactory(data, photographerName) {
  const { id, title, image, video, likes, date, price } = data;

  // Système de suivi des likes (stockage local pour persister entre les sessions)
  const LIKED_MEDIA_KEY = 'fisheye_liked_media';

  // Vérifier si ce média a déjà été liké
  function isMediaLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || '[]'
    );
    return likedMedia.includes(mediaId);
  }

  // Marquer un média comme liké
  function markMediaAsLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || '[]'
    );
    if (!likedMedia.includes(mediaId)) {
      likedMedia.push(mediaId);
      localStorage.setItem(LIKED_MEDIA_KEY, JSON.stringify(likedMedia));
    }
  }

  // Fonction globale pour réinitialiser tous les likes (pour les tests)
  if (!window.resetAllLikes) {
    window.resetAllLikes = function () {
      localStorage.removeItem(LIKED_MEDIA_KEY);
      console.log('Tous les likes ont été réinitialisés');
      // Recharger la page pour voir les changements
      window.location.reload();
    };
  }

  // Obtenir le nom du dossier du photographe
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

  // Construire le chemin du média
  const mediaPath = image
    ? `assets/photographers/${photographerFolder}/${image}`
    : `assets/photographers/${photographerFolder}/${video}`;

  function getMediaCardDOM() {
    const article = document.createElement('article');
    article.className = 'media-item';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'img');
    article.setAttribute('data-id', id);
    article.setAttribute('data-likes', likes);

    // Créer l'élément média (image ou vidéo)
    let mediaContent;
    if (image) {
      mediaContent = document.createElement('img');
      mediaContent.src = mediaPath;
      mediaContent.alt = title;
      mediaContent.className = 'media-content';
      mediaContent.setAttribute('tabindex', '0');
      mediaContent.setAttribute('role', 'img');
      mediaContent.setAttribute(
        'aria-label',
        `Image: ${title}, ${likes} likes`
      );
    } else if (video) {
      mediaContent = document.createElement('video');
      mediaContent.src = mediaPath;
      mediaContent.className = 'media-content';
      mediaContent.setAttribute('tabindex', '0');
      mediaContent.setAttribute(
        'aria-label',
        `Vidéo: ${title}, ${likes} likes`
      );
      mediaContent.setAttribute('preload', 'metadata');
      mediaContent.controls = false; // On enlève les contrôles par défaut pour l'esthétique

      // Ajouter un overlay play pour les vidéos
      const playOverlay = document.createElement('div');
      playOverlay.className = 'video-play-overlay';
      playOverlay.innerHTML = '▶';
      playOverlay.setAttribute('aria-hidden', 'true');

      const mediaWrapper = document.createElement('div');
      mediaWrapper.className = 'media-wrapper';
      mediaWrapper.appendChild(mediaContent);
      mediaWrapper.appendChild(playOverlay);
      mediaContent = mediaWrapper;
    }

    // Ajouter les informations du média
    const mediaInfo = document.createElement('div');
    mediaInfo.className = 'media-info';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.className = 'media-title';
    titleElement.setAttribute('id', `media-title-${id}`);

    const likesButton = document.createElement('button');
    likesButton.className = 'media-likes';
    likesButton.setAttribute('tabindex', '0');
    likesButton.setAttribute('data-likes', likes);

    // Vérifier si ce média a déjà été liké
    const isLiked = isMediaLiked(id);
    let currentLikes = likes;

    if (isLiked) {
      // Si déjà liké, augmenter le nombre de likes affiché mais garder l'apparence normale
      currentLikes = likes + 1;
      likesButton.setAttribute(
        'aria-label',
        `${currentLikes} likes pour ${title}`
      );
      likesButton.setAttribute('data-likes', currentLikes);
      article.setAttribute('data-likes', currentLikes);
    } else {
      likesButton.setAttribute('aria-label', `${likes} likes pour ${title}`);
    }

    const likesCount = document.createElement('span');
    likesCount.textContent = currentLikes;
    likesCount.className = 'likes-count';

    const heartIcon = document.createElement('span');
    heartIcon.textContent = '❤'; // use a simple heart character (styling via CSS)
    heartIcon.setAttribute('aria-hidden', 'true');
    heartIcon.className = 'heart-icon';

    // Visuel initial si liké dans le localStorage
    if (isLiked) {
      heartIcon.classList.add('liked');
    }

    likesButton.appendChild(likesCount);
    likesButton.appendChild(heartIcon);

    // Gestionnaire d'événement pour les likes
    likesButton.addEventListener('click', function (e) {
      e.stopPropagation();

      // Vérifier si déjà liké (double sécurité)
      if (isMediaLiked(id)) {
        console.log(`Média "${title}" déjà liké - action ignorée`);
        return;
      }

      const currentLikes = parseInt(this.getAttribute('data-likes'));
      const newLikes = currentLikes + 1;

      // Marquer comme liké dans le localStorage
      markMediaAsLiked(id);

      // Mettre à jour l'affichage
      this.setAttribute('data-likes', newLikes);
      this.querySelector('.likes-count').textContent = newLikes;
      this.setAttribute('aria-label', `${newLikes} likes pour ${title}`);

      // Mettre à jour l'attribut data-likes de l'article parent
      article.setAttribute('data-likes', newLikes);

      // Basculer l'état visuel du coeur
      const heart = this.querySelector('.heart-icon');
      if (heart) heart.classList.add('liked');

      // Animation du like
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);

      // Mettre à jour le total des likes dans l'encart
      if (typeof updateTotalLikes === 'function') {
        updateTotalLikes();
      }

      console.log(`Like ajouté à "${title}". Total: ${newLikes}`);
    });

    // Navigation au clavier pour les likes
    likesButton.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.click();
      }
    });

    mediaInfo.appendChild(titleElement);
    mediaInfo.appendChild(likesButton);

    article.appendChild(mediaContent);
    article.appendChild(mediaInfo);

    // Améliorer l'accessibilité du média
    article.setAttribute('aria-labelledby', `media-title-${id}`);
    article.setAttribute('aria-describedby', `media-likes-${id}`);

    // Navigation au clavier pour ouvrir le média
    article.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Média sélectionné:', title);
        // N'ouvrir la lightbox que si l'événement est un geste utilisateur fiable
        if (!e.isTrusted) {
          console.warn(
            'Ouverture lightbox ignorée (keydown non fiable) pour',
            title
          );
          return;
        }
        openLightbox(data, photographerName);
      }
    });

    // Click pour ouvrir le média
    article.addEventListener('click', function (e) {
      // Ne pas ouvrir si on clique sur le bouton likes
      if (!e.target.closest('.media-likes')) {
        // Vérifier que le clic provient d'un geste utilisateur réel (pas synthétique)
        if (!e.isTrusted) {
          console.warn(
            'Ouverture lightbox ignorée (click non fiable) pour',
            title
          );
          return;
        }
        console.log('Média cliqué:', title);
        openLightbox(data, photographerName);
      }
    });

    return article;
  }

  // Fonction pour ouvrir une lightbox
  function openLightbox(mediaData, photographerName) {
    // Utiliser la fonction globale de la lightbox
    if (typeof window.openLightbox === 'function') {
      window.openLightbox(mediaData, photographerName);
    } else {
      console.log('Ouverture lightbox pour:', mediaData.title);
    }
  }

  return {
    id,
    title,
    image,
    video,
    likes,
    date,
    price,
    mediaPath,
    getMediaCardDOM,
  };
}
