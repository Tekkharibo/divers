# Mot secret — générateur de fiches

Générateur de fiches « mot secret » imprimables en A4 : l'alphabet est affiché dans une grille,
les lettres du mot sont remplacées par des dessins du thème, et l'enfant décode le mot à l'aide
de la bande de dessins en bas de page. Une page de correction récapitule tous les mots
(une ligne numérotée par mot, toutes de même largeur).

## Utilisation

Ouvrir `index.html` dans un navigateur (aucune installation, aucun serveur nécessaire).

1. Choisir un thème (Hiver, Automne, Pâques, Noël, Halloween, Saint-Valentin, Été, Printemps, Anniversaire, Mer).
2. Saisir un mot par ligne (accents ignorés, les espaces séparent les mots, `-` et `'` sont recopiés).
3. « Imprimer (A4) » : choisir A4, marges « Aucune », cocher « Graphiques d'arrière-plan ».

Options : titre de la fiche, ligne « Prénom », numérotation, page de correction ou non,
bouton « Mélanger » pour tirer d'autres dessins.

## Technique

HTML/CSS/JS vanilla, 100 % statique → hébergeable sur GitHub Pages, Netlify, Cloudflare Pages…

- `themes.js` : définition des thèmes (pictos emoji, couleurs, décor). Ajouter un thème = ajouter une entrée.
- `app.js` : analyse des mots, attribution des dessins (aléatoire reproductible), rendu des pages.
- `style.css` : mise en page en millimètres pour l'impression A4.
