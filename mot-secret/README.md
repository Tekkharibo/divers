# Mot secret — générateur de fiches

Générateur de fiches « mot secret » imprimables en A4 : l'alphabet est affiché dans une grille,
les lettres du mot sont remplacées par des dessins du thème, et l'enfant décode le mot à l'aide
de la bande de dessins en bas de page. Une page de correction récapitule tous les mots
(une ligne numérotée par mot, toutes de même largeur).

## Utilisation

Ouvrir `index.html` dans un navigateur (aucune installation, aucun serveur nécessaire).

1. Choisir un thème (Hiver, Automne, Pâques, Noël, Halloween, Saint-Valentin, Été, Printemps, Anniversaire, Mer).
2. Saisir un mot par ligne, ou cliquer « Utiliser les 20 mots du thème » (liste fixe par thème, dans `themes.js`) (accents ignorés, les espaces séparent les mots, `-` et `'` sont recopiés).
3. « Télécharger le PDF (A4) » : PDF prêt à imprimer, généré dans le navigateur (marche aussi sur iPad / smartphone).
   Ou « Imprimer » : choisir A4, marges « Aucune », cocher « Graphiques d'arrière-plan ».

Lisibilité (enfants dys, troubles visuels) : police adaptée (Andika par défaut, OpenDyslexic, Lexend,
Atkinson Hyperlegible), lettres en minuscules, texte agrandi, cases espacées, voyelles en rouge / consonnes en bleu.

Utilisable sur smartphone : barre de navigation en bas (Réglages / Aperçu / Imprimer) ;
« Imprimer » permet d'enregistrer un PDF A4.

Autres options : noir et blanc (économie d'encre), titre de la fiche, ligne « Prénom », numérotation, page de correction ou non,
bouton « Mélanger » pour tirer d'autres dessins.

## Technique

HTML/CSS/JS vanilla, 100 % statique → hébergeable sur GitHub Pages, Netlify, Cloudflare Pages…

- `themes.js` : définition des thèmes (pictos emoji, couleurs, décor). Ajouter un thème = ajouter une entrée.
- `app.js` : analyse des mots, attribution des dessins (aléatoire reproductible), rendu des pages.
- `style.css` : mise en page en millimètres pour l'impression A4.
- `vendor/` : jsPDF et html2canvas (MIT, voir `vendor/LICENSES.txt`), chargés seulement au premier export PDF.
- `emoji/` : dessins [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft (licence MIT, voir `emoji/LICENSE.txt`),
  en SVG : `flat/` et `hc/` (High Contrast, utilisé en noir et blanc).
  Après avoir ajouté des emojis dans `themes.js` : `node tools/copy-fluent-emoji.js /chemin/vers/clone/fluentui-emoji`.
- `fonts/` : polices hébergées localement (licence SIL OFL, voir `fonts/OFL.txt`), aucune dépendance externe.

## Mise à jour

À chaque modification de `style.css`, `app.js`, `themes.js` ou `fonts/fonts.css`, changer la valeur `?v=…`
correspondante dans `index.html` (par exemple la date du jour) : les navigateurs rechargent alors le fichier
au lieu d'utiliser leur cache.
