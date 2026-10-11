# Mot secret — backlog v2

Taille estimée : **S** (moins d'une heure) · **M** (quelques heures) · **L** (une journée ou plus).
Contrainte commune : tout reste statique (pas de serveur, pas de base de données).

## Idées retenues

### 1. Partager un lot de fiches par lien — M

Un bouton « 🔗 Copier le lien » génère une URL qui contient tout le lot : thème, mots, options
de lisibilité, titre, et le tirage des dessins (seed). Celui qui ouvre le lien obtient exactement les
mêmes fiches.

- Données placées après le `#` de l'URL : rien n'est envoyé à un serveur.
- Données compressées (`CompressionStream` du navigateur, puis base64url) : 20 mots donnent environ 200 à 300 caractères.
- À l'ouverture, le lien est prioritaire sur les réglages mémorisés dans le navigateur.
- Sur smartphone, utiliser le partage natif (`navigator.share`) quand il existe.
- **À faire avant le n° 2**, qui réutilise le même format de lien.

### 2. Compléter une fiche à l'ordinateur ou à la tablette — L

Un mode « en ligne » où l'enfant tape les lettres directement dans les cases au lieu d'imprimer.

- Ouvert par un lien de partage (voir n° 1) avec un paramètre de mode (`…#jouer=…`).
- Une fiche à la fois, boutons « suivant » et « précédent », progression visible (3/20).
- Grandes cases de saisie, passage automatique à la case suivante, clavier adapté sur mobile.
- Vérification : case verte si juste, rouge si faux. Option « vérifier à la fin » ou « en direct ».
- Les options de lisibilité (police, couleurs, minuscules) s'appliquent aussi.
- La réponse est dans le lien : la brouiller un minimum pour qu'elle ne soit pas lisible en clair.
- Question ouverte : faut-il garder un score ou un résumé à montrer à l'adulte en fin de lot ?

### 3. Bouton contact (mailto) — S

Un lien « ✉️ Une idée, un problème ? » en bas du panneau, qui ouvre la messagerie avec un e-mail prérempli.

- Objet prérempli : « Mot secret — idée / problème ».
- Corps prérempli : version de l'outil, type d'appareil et navigateur, lien du lot en cours (voir n° 1),
  pour faciliter le diagnostic.
- Adresse assemblée en JavaScript plutôt qu'écrite en clair, pour limiter le spam des robots.
- **Décision à prendre** : quelle adresse utiliser ? Une adresse dédiée ou un alias est conseillé.

### 4. Personnaliser le fond de page — M

- Choix des deux couleurs du dégradé (sélecteurs de couleur), avec retour au fond du thème.
- Option « Fond blanc » pour économiser l'encre, sans dégradé ni dessins de décor.
- Afficher ou masquer les dessins de décor.
- Option avancée : importer une image (gardée dans le navigateur). Elle ne pourra pas passer
  dans le lien de partage, car elle est trop lourde.

## Propositions complémentaires (à valider)

| Idée | Taille | Intérêt |
|---|---|---|
| Mode noir et blanc / économie d'encre | S | Écoles : imprimantes noir et blanc, coût de l'encre. Va avec le n° 4. |
| 2 fiches par page A4 | M | Divise le papier par deux pour les mots courts. |
| Niveaux de difficulté | M | Facile : quelques lettres déjà écrites. Difficile : dessins pièges sur des lettres absentes du mot. |
| Nouveaux thèmes | S chacun | Rentrée, ferme, espace, animaux, carnaval, galette des rois. |
| Application installable hors ligne (PWA) | M | Icône sur le téléphone, marche sans réseau. |
| Dessins SVG maison | L | Rendu identique sur tous les appareils (les emojis varient selon le système). |
| Export PDF direct | M | Un seul bouton, sans passer par la fenêtre d'impression. |
| Tag `v1.0` sur `main` | S | Retrouver facilement la version actuelle. |

## Ordre suggéré

1. Bouton contact (n° 3) : rapide et utile pour recevoir des retours.
2. Partage par lien (n° 1) : sert de base au n° 2 et au bouton contact.
3. Fond personnalisé et économie d'encre (n° 4).
4. Mode en ligne (n° 2) : le plus gros morceau.
