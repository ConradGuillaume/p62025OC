/*
 * File: index.js
 * Purpose: [Short description of this JavaScript file's responsibility]
 * Author: [Your Name] <you@example.com>
 * Date: 2025-09-15
 * Notes:
 *  - Keep functions small and pure when possible.
 *  - Document public functions and side effects.
 */

async function getPhotographers() {
  try {
    // Récupération des données via fetch
    const response = await fetch('./data/photographers.json');
    const data = await response.json();

    // Console.log des données récupérées
    console.log('Données récupérées:', data);
    console.log('Photographes:', data.photographers);

    // Retourner les données des photographes
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { photographers: [] };
  }
}

async function displayData(photographers) {
  const photographersSection = document.querySelector('.photographer_section');

  photographers.forEach((photographer) => {
    const photographerModel = photographerTemplate(photographer);
    const userCardDOM = photographerModel.getUserCardDOM();
    photographersSection.appendChild(userCardDOM);
  });
}

async function init() {
  // Récupère les datas des photographes
  const { photographers } = await getPhotographers();
  displayData(photographers);
}

init();
