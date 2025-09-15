/*
 * File: photographer.js
 * Purpose: [Short description of this JavaScript file's responsibility]
 * Author: [Your Name] <you@example.com>
 * Date: 2025-09-15
 * Notes:
 *  - Keep functions small and pure when possible.
 *  - Document public functions and side effects.
 */

/* eslint-disable no-unused-vars */
/* exported photographerTemplate */
function photographerTemplate(data) {
  const { name, portrait, city, country, tagline, price, id } = data;

  const picture = 'assets/photographers/Photographers ID Photos/' + portrait;

  function getUserCardDOM() {
    // Créer un lien pour l'accessibilité
    const link = document.createElement('a');
    link.href = 'photographer.html?id=' + id;
    link.setAttribute(
      'aria-label',
      name + ', photographe de ' + city + ', ' + country
    );
    link.className = 'photographer-link';

    // Article principal de la carte
    const article = document.createElement('article');
    article.setAttribute('role', 'listitem');

    // Image du photographe
    const img = document.createElement('img');
    img.setAttribute('src', picture);
    img.setAttribute('alt', 'Portrait de ' + name);
    img.className = 'photographer-portrait';

    // Nom du photographe
    const h2 = document.createElement('h2');
    h2.textContent = name;
    h2.className = 'photographer-name';

    // Localisation
    const location = document.createElement('p');
    location.className = 'photographer-location';
    location.textContent = city + ', ' + country;
    location.setAttribute('aria-label', 'Basé à ' + city + ', ' + country);

    // Tagline/slogan
    const taglineElement = document.createElement('p');
    taglineElement.className = 'photographer-tagline';
    taglineElement.textContent = tagline;

    // Prix
    const priceElement = document.createElement('p');
    priceElement.className = 'photographer-price';
    priceElement.textContent = price + '€/jour';
    priceElement.setAttribute(
      'aria-label',
      'Tarif : ' + price + ' euros par jour'
    );

    // Assemblage des éléments
    article.appendChild(img);
    article.appendChild(h2);
    article.appendChild(location);
    article.appendChild(taglineElement);
    article.appendChild(priceElement);

    link.appendChild(article);

    return link;
  }

  return { name: name, picture: picture, getUserCardDOM: getUserCardDOM };
}
