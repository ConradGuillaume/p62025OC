/**
 * mediaFactory
 * Crée un objet média (image/vidéo) avec DOM, persistance des likes et ouverture lightbox.
 */
function mediaFactory(data, photographerName) {
  const { id, title, image, video, likes, date, price } = data;

  // --- Clé de stockage des likes (persistance entre sessions)
  const LIKED_MEDIA_KEY = "fisheye_liked_media";

  // Vérifie si ce média est déjà liké
  function isMediaLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || "[]"
    );
    return likedMedia.includes(mediaId);
  }

  // Ajoute un média au stockage local comme liké
  function markMediaAsLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || "[]"
    );
    if (!likedMedia.includes(mediaId)) {
      likedMedia.push(mediaId);
      localStorage.setItem(LIKED_MEDIA_KEY, JSON.stringify(likedMedia));
    }
  }

  // Réinitialise tous les likes (utile pour les tests)
  if (!window.resetAllLikes) {
    window.resetAllLikes = function () {
      localStorage.removeItem(LIKED_MEDIA_KEY);
      window.location.reload();
    };
  }

  // Retourne le nom de dossier du photographe
  function getPhotographerFolderName(photographerName) {
    const folderMapping = {
      "Mimi Keel": "Mimi",
      "Ellie-Rose Wilkens": "Ellie Rose",
      "Tracy Galindo": "Tracy",
      "Nabeel Bradford": "Nabeel",
      "Rhode Dubois": "Rhode",
      "Marcel Nikolic": "Marcel",
    };
    return folderMapping[photographerName] || photographerName;
  }

  const photographerFolder = getPhotographerFolderName(photographerName);

  // Construit le chemin du média
  const mediaPath = image
    ? `assets/photographers/${photographerFolder}/${image}`
    : `assets/photographers/${photographerFolder}/${video}`;

  // Construit le DOM de la carte média
  function getMediaCardDOM() {
    const article = document.createElement("article");
    article.className = "media-item";
    article.setAttribute("role", "group");
    article.setAttribute("data-id", id);
    article.setAttribute("data-likes", likes);

    // --- Élément média (image ou vidéo)
    let mediaContent;
    if (image) {
      mediaContent = document.createElement("img");
      mediaContent.src = mediaPath;
      mediaContent.alt = title;
      mediaContent.className = "media-content";
      mediaContent.setAttribute("tabindex", "0");
      mediaContent.setAttribute("aria-label", `Ouvrir ${title}`);
    } else if (video) {
      mediaContent = document.createElement("video");
      mediaContent.src = mediaPath;
      mediaContent.className = "media-content";
      mediaContent.setAttribute("preload", "metadata");
      mediaContent.controls = false;

      // Ajout d'un overlay play
      const playOverlay = document.createElement("div");
      playOverlay.className = "video-play-overlay";
      playOverlay.innerHTML = "▶";
      playOverlay.setAttribute("aria-hidden", "true");

      const mediaWrapper = document.createElement("div");
      mediaWrapper.className = "media-wrapper";
      mediaWrapper.appendChild(mediaContent);
      mediaWrapper.appendChild(playOverlay);
      mediaContent = mediaWrapper;
      mediaWrapper.setAttribute("tabindex", "0");
      mediaWrapper.setAttribute("aria-label", `Ouvrir ${title}`);
    }

    // --- Création d'une seule zone aria-live pour les annonces de likes
    try {
      if (typeof window.__fisheyeLiveRegion === "undefined") {
        const live = document.createElement("div");
        live.id = "fisheye-live-region";
        live.setAttribute("aria-live", "polite");
        live.setAttribute("aria-atomic", "true");
        live.style.position = "absolute";
        live.style.left = "-9999px";
        live.style.width = "1px";
        live.style.height = "1px";
        live.style.overflow = "hidden";
        document.body.appendChild(live);
        window.__fisheyeLiveRegion = live;
      }
    } catch (err) {}

    // --- Bloc info média (titre + bouton like)
    const mediaInfo = document.createElement("div");
    mediaInfo.className = "media-info";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.className = "media-title";
    titleElement.setAttribute("id", `media-title-${id}`);

    const likesButton = document.createElement("button");
    likesButton.className = "media-likes";
    likesButton.setAttribute("type", "button");
    likesButton.setAttribute("data-likes", likes);
    likesButton.setAttribute("tabindex", "0");

    // --- État initial si déjà liké
    const isLiked = isMediaLiked(id);
    let currentLikes = likes;

    if (isLiked) {
      currentLikes = likes + 1;
      likesButton.setAttribute(
        "aria-label",
        `Bouton aimer, ${currentLikes} j'aime`
      );
      likesButton.setAttribute("data-likes", currentLikes);
      article.setAttribute("data-likes", currentLikes);
    } else {
      likesButton.setAttribute("aria-label", `Bouton aimer, ${likes} j'aime`);
    }

    const likesCount = document.createElement("span");
    likesCount.textContent = currentLikes;
    likesCount.className = "likes-count";
    likesCount.setAttribute("id", `media-likes-${id}`);
    likesCount.setAttribute("aria-hidden", "true");

    const heartIcon = document.createElement("span");
    heartIcon.textContent = "❤";
    heartIcon.setAttribute("aria-hidden", "true");
    heartIcon.className = "heart-icon";
    if (isLiked) heartIcon.classList.add("liked");

    likesButton.appendChild(likesCount);
    likesButton.appendChild(heartIcon);

    // --- Gestion clic sur like
    likesButton.addEventListener("click", function (e) {
      e.stopImmediatePropagation();
      if (isMediaLiked(id)) return;

      const currentLikes = parseInt(this.getAttribute("data-likes"));
      const newLikes = currentLikes + 1;

      markMediaAsLiked(id);
      this.setAttribute("data-likes", newLikes);
      this.querySelector(".likes-count").textContent = newLikes;
      this.setAttribute("aria-label", `Bouton aimer, ${newLikes} j'aime`);
      article.setAttribute("data-likes", newLikes);

      const heart = this.querySelector(".heart-icon");
      if (heart) heart.classList.add("liked");

      this.style.transform = "scale(1.2)";
      setTimeout(() => (this.style.transform = "scale(1)"), 150);

      if (typeof updateTotalLikes === "function") updateTotalLikes();

      try {
        let totalLikes = 0;
        document.querySelectorAll(".likes-count").forEach((el) => {
          const v = parseInt(el.textContent, 10);
          if (!Number.isNaN(v)) totalLikes += v;
        });
        const live = window.__fisheyeLiveRegion;
        if (live) {
          live.textContent = `${title} : ${newLikes} j'aime. Total : ${totalLikes} j'aime.`;
        }
      } catch (err) {}

      try {
        article.dataset.justLiked = "1";
        setTimeout(() => delete article.dataset.justLiked, 300);
      } catch (err) {}
    });

    // --- Like via clavier (Enter/Espace)
    likesButton.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.click();
      }
    });

    // --- Interaction média (clavier + clic)
    try {
      const activator = mediaContent;
      if (activator && activator.addEventListener) {
        activator.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!e.isTrusted) return;
            openLightbox(data, photographerName);
          }
        });
        activator.addEventListener("click", function (e) {
          if (e.target && e.target.closest && e.target.closest(".media-likes"))
            return;
          if (!e.isTrusted) return;
          openLightbox(data, photographerName);
        });
      }
    } catch (err) {}

    mediaInfo.appendChild(titleElement);
    mediaInfo.appendChild(likesButton);

    article.appendChild(mediaContent);
    article.appendChild(mediaInfo);

    // --- Ouverture lightbox via Enter sur article
    article.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        if (e.target && e.target.closest && e.target.closest(".media-likes"))
          return;
        if (article.dataset && article.dataset.justLiked === "1") return;
        e.preventDefault();
        if (!e.isTrusted) return;
        openLightbox(data, photographerName);
      }
    });

    // --- Ouverture lightbox via clic article
    article.addEventListener("click", function (e) {
      if (article.dataset && article.dataset.justLiked === "1") return;
      if (!e.target.closest(".media-likes")) {
        if (!e.isTrusted) return;
        openLightbox(data, photographerName);
      }
    });

    return article;
  }

  // Ouvre la lightbox
  function openLightbox(mediaData, photographerName) {
    if (typeof window.openLightbox === "function") {
      window.openLightbox(mediaData, photographerName);
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

// Expose factory globally for use by other non-module scripts
if (typeof window !== "undefined") {
  window.mediaFactory = mediaFactory;
}
