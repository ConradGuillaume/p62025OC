# Linting

Ce projet n'avait pas de configuration de linter. J'ai ajouté des fichiers de configuration pour ESLint (JS) et Stylelint (CSS) ainsi qu'un `package.json` minimal.

Instructions rapides:

1. Installer Node.js (si nécessaire): https://nodejs.org/
2. Depuis la racine du projet exécuter:

```powershell
npm install
```

3. Lancer les linters:

```powershell
npm run lint
```

- `npm run lint:js` exécute ESLint sur tous les fichiers `.js`.
- `npm run lint:css` exécute Stylelint sur tous les fichiers `.css`.

Autofix:

- ESLint peut corriger automatiquement certains problèmes avec `npx eslint "**/*.js" --fix`.
- Stylelint peut corriger certains problèmes avec `npx stylelint "**/*.css" --fix`.

Si vous voulez, je peux exécuter `npm install` et lancer les linters ici; donnez le feu vert pour que j'installe les dépendances dans l'environnement de travail et je fournirai le rapport d'erreurs et corrections proposées.
