/*
 * File: photographerPage.js
 * Purpose: [Short description of this JavaScript file's responsibility]
 * Author: [Your Name] <you@example.com>
 * Date: 2025-09-15
 * Notes:
 *  - Keep functions small and pure when possible.
 *  - Document public functions and side effects.
 */

// Template étendu pour la page photographe (réutilise le template de base)
/* eslint-disable no-unused-vars */
/* exported photographerPageTemplate */
function photographerPageTemplate(photographer) {
  const { name, id, city, country, tagline, price, portrait } = photographer;

  function getPhotographerHeaderDOM() {
    // Créer la structure de l'en-tête
    const photographerInfo = document.createElement('div');
    photographerInfo.className = 'photographer-info';

    const nameElement = document.createElement('h1');
    nameElement.textContent = name;
    nameElement.className = 'photographer-page-name';
    nameElement.setAttribute('tabindex', '0');
    nameElement.setAttribute('role', 'heading');
    nameElement.setAttribute('aria-level', '1');

    const locationElement = document.createElement('p');
    locationElement.textContent = `${city}, ${country}`;
    locationElement.className = 'photographer-page-location';
    locationElement.setAttribute('tabindex', '0');
    locationElement.setAttribute(
      'aria-label',
      `Photographe basé à ${city}, ${country}`
    );

    const taglineElement = document.createElement('p');
    taglineElement.textContent = tagline;
    taglineElement.className = 'photographer-page-tagline';
    taglineElement.setAttribute('tabindex', '0');
    taglineElement.setAttribute(
      'aria-label',
      `Devise du photographe: ${tagline}`
    );

    photographerInfo.appendChild(nameElement);
    photographerInfo.appendChild(locationElement);
    photographerInfo.appendChild(taglineElement);

    // Ajouter la photo du photographe
    const photographerImage = document.createElement('img');
    photographerImage.src = `assets/photographers/Photographers ID Photos/${portrait}`;
    photographerImage.alt = `Portrait de ${name}`;
    photographerImage.className = 'photographer-page-portrait';
    photographerImage.setAttribute('tabindex', '0');
    photographerImage.setAttribute('role', 'img');

    return { photographerInfo, photographerImage };
  }

  function getPriceBadgeDOM() {
    // If the page already includes a .price-badge (server/template), reuse it
    const existing = document.querySelector('.price-badge');
    if (existing) {
      return existing;
    }

    const priceBadge = document.createElement('div');
    priceBadge.className = 'price-badge';
    priceBadge.setAttribute('role', 'complementary');
    priceBadge.setAttribute('aria-label', `Tarif journalier de ${name}`);

    const priceText = document.createElement('span');
    priceText.className = 'price-text';
    priceText.textContent = `${price}€ / jour`;

    const totalLikes = document.createElement('span');
    totalLikes.className = 'total-likes';
    totalLikes.setAttribute('id', 'total-likes');
    totalLikes.setAttribute('aria-label', 'Total des likes');

    const totalCount = document.createElement('span');
    totalCount.className = 'total-count';
    totalCount.textContent = '0';

    const totalHeart = document.createElement('span');
    totalHeart.className = 'heart-icon';
    totalHeart.textContent = '❤';

    totalLikes.appendChild(totalCount);
    totalLikes.appendChild(totalHeart);

    priceBadge.appendChild(totalLikes);
    priceBadge.appendChild(priceText);

    return priceBadge;
  }

  function updateTotalLikes() {
    const mediaItems = document.querySelectorAll('.media-item');
    let totalLikes = 0;

    mediaItems.forEach((item) => {
      const likes = parseInt(item.getAttribute('data-likes') || '0');
      totalLikes += likes;
    });

    // Try the template's own total-likes element, otherwise fall back to existing page structure
    let totalLikesElement = document.getElementById('total-likes');
    if (!totalLikesElement) {
      // fallback to the existing HTML badge used in photographer.html
      const fallbackCount = document.getElementById('total-likes-count');
      if (fallbackCount) {
        fallbackCount.textContent = `${totalLikes}`;
      }
    } else {
      const countEl = totalLikesElement.querySelector('.total-count');
      if (countEl) countEl.textContent = `${totalLikes}`;
      totalLikesElement.setAttribute(
        'aria-label',
        `${totalLikes} likes au total`
      );
    }

    return totalLikes;
  }

  return {
    name,
    id,
    city,
    country,
    tagline,
    price,
    portrait,
    getPhotographerHeaderDOM,
    getPriceBadgeDOM,
    updateTotalLikes,
  };
}
