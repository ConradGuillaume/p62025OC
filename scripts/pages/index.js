async function getPhotographers() {
  try {
    // Récupération des données via fetch
    const response = await fetch('./data/photographers.json');
    const data = await response.json();

    // Données récupérées (silencieux)

    // Retourner les données des photographes
    return data;
  } catch (error) {
    // Erreur lors de la récupération des données
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
