# Site du Cabinet dentaire du Pericles

Maquette du site du Cabinet dentaire du Pericles (Epagny Metz-Tessy), réalisée par Tom (FremaLabs) pour le cabinet. Version retenue : **C, « calme organique »** (montagnes, lac, vert forêt, serif). Publiée avec GitHub Pages depuis la branche `v2`.

## Structure

- `index.html` : toute la page (balisage). Les textes se modifient ici.
- `css/style.css` : styles, palettes de couleurs, responsive (point de rupture 760 px), animations.
- `js/app.js` : logique de la page (classe `Component`) : état, horaires, carte, contenus calculés.
- `js/dc-runtime.js` : mini moteur qui fait vivre le balisage. À ne pas modifier sans raison.
- `assets/` : `c-hero.webp` (photo du haut de page, exemple), `91f15153dd67bd4ab5911862d1226e00.webp` (vue aérienne IGN), `favicon.svg`.
- `design/logos/` : 12 propositions de logo en SVG (`logo-*` complet, `symbole-*` seul). Aucune n'est encore choisie.
- `docs/retours-client.md` : retours du cabinet et informations à confirmer. **À lire avant toute modification de contenu.**

## Comment la page fonctionne

Le balisage vient d'un canevas de design (format « Design Component ») et garde sa syntaxe :

- `{{chemin}}` : valeur lue dans l'objet renvoyé par `renderVals()` de `js/app.js`. Uniquement une recherche par chemin (`{{info.title}}`), jamais une expression.
- `<sc-if value="{{cond}}">` : affiché si `cond` est vrai (le contenu reste dans le DOM, masqué).
- `<sc-for list="{{liste}}" as="d">` : répété pour chaque élément. Pas d'évènement possible à l'intérieur.
- `onClick="{{fn}}"`, `onMouseEnter`, `onPointerDown`, etc. : la fonction `fn` vient de `renderVals()`.
- `ref="{{fxRef}}"` : appelé une fois au montage avec l'élément (scroll, apparitions, navigation).
- `this.setState({...})` relance le rendu.

Pour ajouter un contenu dynamique : calculer la valeur dans `renderVals()`, la renvoyer par un nom, puis l'utiliser avec `{{nom}}` dans `index.html`. Un texte fixe s'écrit directement dans le HTML.

Repères dans `js/app.js` : `OPEN` et `SLOTS` (jours et créneaux d'ouverture, en minutes), `SPOTS` (points de la vue aérienne, en % de l'image), `CAPS` et `QMAP` (réponses du bloc « Je viens pour… »), `fxRef` (effets au défilement). Les props par défaut (palette, lien Doctolib, `openState`) sont passées à `__mountDC` en bas du fichier.

Le sélecteur « Couleurs » (`.palC`) est un outil de maquette pour montrer les palettes au cabinet (`foret` par défaut, `lac`, `ardoise`, `nuit`, `terre`, définies dans `style.css`). À retirer une fois la palette choisie.

## Règles de rédaction et de design

- Français. Ton factuel et sobre (communication des dentistes encadrée par l'Ordre : pas de promesse ni de superlatif).
- Jamais de tiret cadratin (U+2014) ni de point médian (U+00B7) dans les textes.
- Peu de tailles de texte, deux polices (DM Serif Display pour les titres, Karla pour le reste), peu de couleurs : utiliser les variables CSS (`--deep`, `--mid`, `--sand`, `--ink`, `--muted`…).
- Pas de pastilles ou badges décoratifs. Éviter les informations évidentes ou répétées.
- Mobile d'abord : vérifier chaque modification à 390 px et à 1440 px.
- Respecter `prefers-reduced-motion` pour toute nouvelle animation.
- La page reste exclue des moteurs de recherche (`noindex`) tant que c'est une maquette.

## Informations du cabinet (état actuel du site)

- Adresse : 1 allée de la Mandallaz, Montée C, 74370 Epagny Metz-Tessy, 2ᵉ étage avec ascenseur.
- Téléphone : 04 50 67 55 14. Pas encore d'e-mail.
- Horaires affichés : mardi, mercredi, jeudi, 8h00 à 12h30 et 13h30 à 18h00 (ce sont ceux du Dr Manisse).
- Conventionné, carte Vitale. Paiement : carte, espèces, chèque, virement.
- RPPS Dr Clara Manisse : 10107413535. Lien Doctolib : celui du Dr Manisse (nouveaux patients uniquement).
- Soins : blanchiment, facettes, implant, orthèse d'avancée mandibulaire (OAM), parodontologie.
- Accès : barrière Patients à gauche, ticket remboursé à l'accueil ; bus Sibra arrêt Hôpital, lignes 2, 6, 10, 11 et 18 ; abri vélo.
- Urgences le dimanche et les jours fériés : dentiste de garde de Haute-Savoie (maisondentaire74.fr).

## Travailler en local

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000. Les images d'exemple et les cases grises « [Photo : …] » sont à remplacer par les vraies photos du cabinet.

## Publier

Branche `v2`, publiée par GitHub Pages. Committer puis `git push origin v2` ; la mise en ligne prend une à deux minutes.
