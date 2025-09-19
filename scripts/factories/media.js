function mediaFactory(data, photographerName) {
  const { id, title, image, video, likes, date, price } = data;

  // Système de suivi des likes (stockage local pour persister entre les sessions)
  const LIKED_MEDIA_KEY = "fisheye_liked_media";

  // Vérifier si ce média a déjà été liké
  function isMediaLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || "[]"
    );
    return likedMedia.includes(mediaId);
  }

  // Marquer un média comme liké
  function markMediaAsLiked(mediaId) {
    const likedMedia = JSON.parse(
      localStorage.getItem(LIKED_MEDIA_KEY) || "[]"
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
      // Recharger la page pour voir les changements
      window.location.reload();
    };
  }

  // Obtenir le nom du dossier du photographe
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

  // Construire le chemin du média
  const mediaPath = image
    ? `assets/photographers/${photographerFolder}/${image}`
    : `assets/photographers/${photographerFolder}/${video}`;

  function getMediaCardDOM() {
    const article = document.createElement("article");
    article.className = "media-item";
    // Use role="group" so the article groups media + controls but is not
    // announced as a single image object by screen readers. This lets SR
    // users land on the interactive like button when tabbing.
    article.setAttribute("role", "group");
    article.setAttribute("data-id", id);
    article.setAttribute("data-likes", likes);

    // Créer l'élément média (image ou vidéo)
    let mediaContent;
    if (image) {
      mediaContent = document.createElement("img");
      mediaContent.src = mediaPath;
      mediaContent.alt = title;
      mediaContent.className = "media-content";
      // Make the media content focusable so keyboard users can reach it first,
      // then tab to the like button. We provide an explicit aria-label to
      // announce the intent (open the media) but avoid setting `role="button"`
      // here because some screen readers add the phrase "bouton d'activation"
      // or similar. Keep it a focusable element with a clear label.
      mediaContent.setAttribute("tabindex", "0");
      mediaContent.setAttribute("aria-label", `Ouvrir ${title}`);
    } else if (video) {
      mediaContent = document.createElement("video");
      mediaContent.src = mediaPath;
      mediaContent.className = "media-content";
      // media element is hidden from SRs; accessible labeling comes from the like button
      mediaContent.setAttribute("preload", "metadata");
      mediaContent.controls = false; // On enlève les contrôles par défaut pour l'esthétique

      // Ajouter un overlay play pour les vidéos
      const playOverlay = document.createElement("div");
      playOverlay.className = "video-play-overlay";
      playOverlay.innerHTML = "▶";
      playOverlay.setAttribute("aria-hidden", "true");

      const mediaWrapper = document.createElement("div");
      mediaWrapper.className = "media-wrapper";
      mediaWrapper.appendChild(mediaContent);
      mediaWrapper.appendChild(playOverlay);
      mediaContent = mediaWrapper;
      // Make the video wrapper focusable/interactive so keyboard users can open the lightbox
      mediaWrapper.setAttribute("tabindex", "0");
      // Avoid role="button" on the wrapper for the same reason as images above.
      mediaWrapper.setAttribute("aria-label", `Ouvrir ${title}`);
    }

    // Ensure a single polite live region exists for announcing like updates
    // This is created once on the page and reused by every media card.
    try {
      if (typeof window.__fisheyeLiveRegion === "undefined") {
        const live = document.createElement("div");
        live.id = "fisheye-live-region";
        live.setAttribute("aria-live", "polite");
        live.setAttribute("aria-atomic", "true");
        // Visually hide but keep available for AT
        live.style.position = "absolute";
        live.style.left = "-9999px";
        live.style.width = "1px";
        live.style.height = "1px";
        live.style.overflow = "hidden";
        document.body.appendChild(live);
        window.__fisheyeLiveRegion = live;
      }
    } catch (err) {
      // If document/body isn't available yet or append fails, ignore silently.
    }

    // Ajouter les informations du média
    const mediaInfo = document.createElement("div");
    mediaInfo.className = "media-info";

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.className = "media-title";
    titleElement.setAttribute("id", `media-title-${id}`);

    const likesButton = document.createElement("button");
    likesButton.className = "media-likes";
    // Use native button behavior and ensure it's treated as a button (not a submit)
    likesButton.setAttribute("type", "button");
    // data-likes stores the current displayed likes for easy updates
    likesButton.setAttribute("data-likes", likes);
    // Explicit tabindex for some screen reader environments that detect focusable
    // elements more reliably when tabindex is present.
    likesButton.setAttribute("tabindex", "0");

    // Vérifier si ce média a déjà été liké
    const isLiked = isMediaLiked(id);
    let currentLikes = likes;

    if (isLiked) {
      // Si déjà liké, augmenter le nombre de likes affiché mais garder l'apparence normale
      currentLikes = likes + 1;
      // Announce as a button for SR users (short form: label + count)
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
    // expose the likes count with an id so aria-describedby can reference it
    likesCount.setAttribute("id", `media-likes-${id}`);
    // hide the visual count from screen readers so only the button's aria-label
    // is announced (exactly: "Bouton aimer {count}")
    likesCount.setAttribute("aria-hidden", "true");

    const heartIcon = document.createElement("span");
    heartIcon.textContent = "❤"; // use a simple heart character (styling via CSS)
    heartIcon.setAttribute("aria-hidden", "true");
    heartIcon.className = "heart-icon";

    // Visuel initial si liké dans le localStorage
    if (isLiked) {
      heartIcon.classList.add("liked");
    }

    likesButton.appendChild(likesCount);
    likesButton.appendChild(heartIcon);

    // Gestionnaire d'événement pour les likes
    likesButton.addEventListener("click", function (e) {
      // Prevent any outer handlers (like the article click) from receiving this event
      // This is minimal and doesn't change tabindex/navigation.
      e.stopImmediatePropagation();

      // Vérifier si déjà liké (double sécurité)
      if (isMediaLiked(id)) {
        return;
      }

      const currentLikes = parseInt(this.getAttribute("data-likes"));
      const newLikes = currentLikes + 1;

      // Marquer comme liké dans le localStorage
      markMediaAsLiked(id);

      // Mettre à jour l'affichage
      this.setAttribute("data-likes", newLikes);
      this.querySelector(".likes-count").textContent = newLikes;
      this.setAttribute("aria-label", `Bouton aimer, ${newLikes} j'aime`);

      // Mettre à jour l'attribut data-likes de l'article parent
      article.setAttribute("data-likes", newLikes);

      // Basculer l'état visuel du coeur
      const heart = this.querySelector(".heart-icon");
      if (heart) heart.classList.add("liked");

      // Animation du like
      this.style.transform = "scale(1.2)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 150);

      // Mettre à jour le total des likes dans l'encart
      if (typeof updateTotalLikes === "function") {
        updateTotalLikes();
      }

      // Announce the per-media and overall totals in the polite live region.
      try {
        // Compute overall total by summing visible likes counters.
        let totalLikes = 0;
        document.querySelectorAll(".likes-count").forEach((el) => {
          const v = parseInt(el.textContent, 10);
          if (!Number.isNaN(v)) totalLikes += v;
        });
        const live = window.__fisheyeLiveRegion;
        if (live) {
          live.textContent = `${title} : ${newLikes} j'aime. Total : ${totalLikes} j'aime.`;
        }
      } catch (err) {
        // ignore
      }

      // Mark the article as recently liked to protect against synthetic
      // or out-of-order events that could open the lightbox immediately after.
      try {
        article.dataset.justLiked = "1";
        setTimeout(() => {
          delete article.dataset.justLiked;
        }, 300);
      } catch (err) {
        // ignore
      }

      // Like ajouté (silent in production)
    });

    // Navigation au clavier pour les likes
    likesButton.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Stop propagation so the article-level keydown doesn't open the lightbox
        e.stopImmediatePropagation();
        this.click();
      }
    });

    // Make the media content interactive via keyboard (Enter/Space to open)
    try {
      const activator = mediaContent;
      if (activator && activator.addEventListener) {
        activator.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopImmediatePropagation();
            // Ensure we only open if not a synthetic/delayed event
            if (!e.isTrusted) return;
            openLightbox(data, photographerName);
          }
        });
        // Also allow click on the media content to open the lightbox
        activator.addEventListener("click", function (e) {
          // prevent clicks originating from the like button
          if (e.target && e.target.closest && e.target.closest(".media-likes"))
            return;
          if (!e.isTrusted) return;
          openLightbox(data, photographerName);
        });
      }
    } catch (err) {
      // ignore
    }

    mediaInfo.appendChild(titleElement);
    mediaInfo.appendChild(likesButton);

    article.appendChild(mediaContent);
    article.appendChild(mediaInfo);

    // Keep article free of inherited labels so focusing child controls
    // (like the like button) won't cause the SR to read the article title.
    // (media activator and like button have their own aria-labels.)

    // Navigation au clavier pour ouvrir le média
    article.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        // If the Enter key event comes from within the like button, ignore it here.
        // This is a minimal guard to avoid changing page navigation behavior.
        if (e.target && e.target.closest && e.target.closest(".media-likes")) {
          return;
        }

        // If we just processed a like on this article, ignore this Enter
        // which may be a synthetic or delayed event originating from the like.
        if (article.dataset && article.dataset.justLiked === "1") {
          return;
        }

        e.preventDefault();
        // Méthode: média sélectionné (silencieux)
        // N'ouvrir la lightbox que si l'événement est un geste utilisateur fiable
        if (!e.isTrusted) {
          // Ouverture lightbox ignorée (keydown non fiable)
          return;
        }
        openLightbox(data, photographerName);
      }
    });

    // Click pour ouvrir le média
    article.addEventListener("click", function (e) {
      // If we just processed a like on this article, ignore this click
      // which may be triggered synthetically by AT or browser quirks.
      if (article.dataset && article.dataset.justLiked === "1") {
        return;
      }

      // Ne pas ouvrir si on clique sur le bouton likes
      if (!e.target.closest(".media-likes")) {
        // Vérifier que le clic provient d'un geste utilisateur réel (pas synthétique)
        if (!e.isTrusted) {
          // Ouverture lightbox ignorée (click non fiable)
          return;
        }
        // Méthode: média cliqué (silencieux)
        openLightbox(data, photographerName);
      }
    });

    return article;
  }

  // Fonction pour ouvrir une lightbox
  function openLightbox(mediaData, photographerName) {
    // Utiliser la fonction globale de la lightbox
    if (typeof window.openLightbox === "function") {
      window.openLightbox(mediaData, photographerName);
    } else {
      // Ouverture lightbox fallback (silencieux)
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
