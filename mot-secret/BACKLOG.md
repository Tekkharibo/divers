# Mot secret — backlog v2

Taille estimée : **S** (moins d'une heure) · **M** (quelques heures) · **L** (une journée ou plus).
Contrainte commune : tout reste statique (GitHub Pages), sans serveur ni base de données.

## Idées retenues

### 1. Mode vidéoprojecteur (16:9) — M

Afficher les fiches en plein écran au format 16:9, pour un TBI ou un vidéoprojecteur en classe.

- Bouton « 📽️ Projeter » : passe en plein écran (API Fullscreen) et montre une fiche par écran.
- Mise en page paysage : grille de l'alphabet à gauche, bande du mot à droite, tout en très grand.
- Navigation au clavier ou à la télécommande de présentation (flèches, espace, Page suivante),
  au toucher sur un TBI, et touche Échap pour quitter.
- Bouton « Révéler » pour afficher la réponse, lettre par lettre ou d'un coup, pour une correction collective.
- Option : export PDF en 16:9 (format de page paysage dédié), pour l'ouvrir sur un ordinateur sans connexion.
- Les options de lisibilité (police, couleurs, minuscules) s'appliquent aussi.

### 2. Partager un lot de fiches par lien — M

Un bouton « 🔗 Copier le lien » génère une URL qui contient tout le lot : thème, mots, options
de lisibilité, titre, et le tirage des dessins (seed). Celui qui ouvre le lien obtient exactement les
mêmes fiches.

- Données placées après le `#` de l'URL : rien n'est envoyé à un serveur.
- Données compressées (`CompressionStream` du navigateur, puis base64url) : 20 mots donnent environ 200 à 300 caractères.
- À l'ouverture, le lien est prioritaire sur les réglages mémorisés dans le navigateur.
- Sur smartphone, utiliser le partage natif (`navigator.share`) quand il existe.
- Sert aussi au mode vidéoprojecteur (ouvrir directement en projection), au bouton contact et au mode en ligne.

### 3. Bouton contact (mailto) — S

Un lien « ✉️ Une idée, un problème ? » en bas du panneau, qui ouvre la messagerie avec un e-mail prérempli.

- Objet prérempli : « Mot secret — idée / problème ».
- Corps prérempli : version de l'outil, type d'appareil et navigateur, lien du lot en cours (voir n° 2),
  pour faciliter le diagnostic.
- Adresse assemblée en JavaScript plutôt qu'écrite en clair, pour limiter le spam des robots.
- **Décision à prendre** : quelle adresse utiliser ? Une adresse dédiée ou un alias est conseillé.

### 4. Personnaliser le fond de page — M

- Choix des deux couleurs du dégradé (sélecteurs de couleur), avec retour au fond du thème.
- Option « Fond blanc » pour économiser l'encre, sans dégradé ni dessins de décor.
- Afficher ou masquer les dessins de décor.
- Option avancée : importer une image (gardée dans le navigateur). Elle ne pourra pas passer
  dans le lien de partage, car elle est trop lourde.

## En attente

### 5. Compléter une fiche à l'ordinateur ou à la tablette — L

Un mode où l'enfant tape les lettres directement dans les cases au lieu d'imprimer.

- **Pas de serveur nécessaire pour la base** : le lot arrive par le lien de partage (n° 2), et la vérification
  des réponses se fait dans le navigateur.
- **Un serveur deviendrait nécessaire** seulement pour collecter les résultats : score envoyé à l'enseignant,
  comptes élèves, suivi dans le temps. C'est hors périmètre pour l'instant.
- Contenu envisagé : une fiche à la fois, grandes cases de saisie, passage automatique à la case suivante,
  case verte si juste et rouge si faux, résumé affiché à l'écran en fin de lot.
- La réponse est dans le lien : la brouiller un minimum pour qu'elle ne soit pas lisible en clair.

## Propositions complémentaires (à valider)

| Idée | Taille | Intérêt |
|---|---|---|
| ~~Mode noir et blanc / économie d'encre~~ ✅ fait | S | Case « Noir et blanc » : fond blanc, sans décor, dessins en gris. |
| 2 fiches par page A4 | M | Divise le papier par deux pour les mots courts. |
| Niveaux de difficulté | M | Facile : quelques lettres déjà écrites. Difficile : dessins pièges sur des lettres absentes du mot. |
| Nouveaux thèmes | S chacun | Rentrée, ferme, espace, animaux, carnaval, galette des rois. |
| Application installable hors ligne (PWA) | M | Icône sur le téléphone ou l'ordinateur de classe, marche sans réseau. |
| ~~Dessins SVG~~ ✅ fait | L | Fluent Emoji (Microsoft, MIT) en SVG : rendu identique partout, trait noir en noir et blanc. |
| PDF vectoriel (texte et dessins nets, fichier léger) | M | Possible maintenant que les dessins sont en SVG (svg2pdf.js). |
| ~~Export PDF direct~~ ✅ fait | M | Bouton « Télécharger le PDF » (jsPDF + html2canvas, dans le navigateur). |
| Tag `v1.0` sur `main` | S | Retrouver facilement la version actuelle. |

## Ordre suggéré

1. Bouton contact (n° 3) : rapide et utile pour recevoir des retours.
2. Partage par lien (n° 2) : sert de base au mode vidéoprojecteur, au contact et au mode en ligne.
3. Mode vidéoprojecteur (n° 1).
4. Fond personnalisé et économie d'encre (n° 4).
5. Mode en ligne (n° 5), si le besoin se confirme.
