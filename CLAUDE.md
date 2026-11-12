# Site du Cabinet dentaire du Pericles

Maquette du site du Cabinet dentaire du Pericles (Epagny Metz-Tessy), réalisée par Tom (FremaLabs) pour le cabinet. Version retenue : **C, « calme organique »** (montagnes, lac, vert forêt, serif). Publiée avec GitHub Pages depuis la branche `v2`.

## Structure

- `index.html` : toute la page (balisage). Les textes se modifient ici.
- `css/style.css` : styles, palettes de couleurs, responsive (point de rupture 760 px), animations.
- `js/app.js` : logique de la page (classe `Component`) : état, horaires, carte, contenus calculés.
- `js/dc-runtime.js` : mini moteur qui fait vivre le balisage. À ne pas modifier sans raison.
- `assets/` : `c-hero.webp` (photo du haut de page, exemple), `favicon.svg` (symbole sommet), `plan-acces-ign.webp` (photo IGN du plan d'accès, 1800 x 1350, cadrage élargi jusqu'à l'hôpital), `91f15153dd67bd4ab5911862d1226e00.webp` (ancien cadrage, plus utilisé).
- `design/maquettes/` : maquettes de choix faites pendant l'update (horaires, premier rendez-vous, accès, urgence, équipe, logos). Pas utilisées par la page.
- `docs/taches-update.md` : liste des tâches de l'update, avec ce qui reste à fournir par le cabinet.
- `design/logos/` : 12 propositions de logo en SVG (`logo-*` complet, `symbole-*` seul). Logo retenu par Tom : `logo-11-sommet` (dessin à garder tel quel, avec ses détails). Dans les barres du site, on utilise `logo-11-sommet-horizontal.svg` : le même symbole, le nom à droite. `assets/favicon.svg` reprend le symbole. Le logo est intégré en SVG dans `index.html` (en-tête, barre fixe, menu mobile, entre les commentaires `<!-- logo : … -->` et `<!-- /logo -->`) pour garder les polices du site ; chaque copie a son propre identifiant de masque (`sommetk-hd`, `sommetk-stk`, `sommetk-mnav`).
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

Repères dans `js/app.js` : `HOURS` (créneaux du secrétariat par jour, en minutes ; le statut « ouvert » en dépend), `PRACS` (praticiens : jours de présence, lien Doctolib ou téléphone), `SPOTS` (repères du plan, en % de `plan-acces-ign.webp`), `_setFull` (plan en plein écran), `openRdv` (feuille « Premier rendez-vous »), `fxRef` (effets au défilement). Les zones du parking (polygones `zone-ok` et `zone-no`) et les trajets sont dans le SVG du plan, `index.html`, en coordonnées 1800 x 1350 ; tracé validé par Tom le 12/11/2026.

Plan d'accès : sur la page, le défilement tactile reste libre (pas de zoom au doigt) ; « Agrandir le plan » passe le même plan en plein écran avec pincement, glissement et boutons. À la souris, Ctrl + molette zoome (la molette seule fait défiler la page et affiche une aide) ; en plein écran, la molette seule zoome. Ne pas remettre `touch-action: none` hors plein écran. Les props par défaut (palette, lien Doctolib, `openState`) sont passées à `__mountDC` en bas du fichier.

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
- Téléphone : 04 50 67 55 14. E-mail : info@dentiste-pericles.fr (provisoire, .fr ou .com à confirmer).
- Secrétariat : lundi à jeudi 8h45 à 12h00 et 14h00 à 18h00 ; vendredi 8h45 à 12h00 et 14h00 à 16h30.
- Praticiens, dans cet ordre : Dr Christine Bernardi (lun, jeu, ven, sam ; pas de Doctolib), Dr Clara Manisse (lun, mar, mer, ven), Dr Martin Feaud (lun, mar, mer, jeu), Dr Coline Richard (mar, jeu ; lien Doctolib à fournir). Pas d'horaires par praticien, seulement les jours.
- Conventionné, carte Vitale. Paiement : carte, espèces, chèque, virement.
- Doctolib : Dr Manisse (lien de réservation nouveaux patients) et Dr Feaud (page profil). Le RPPS n'est plus affiché (demande du cabinet).
- Soins : liste et explications à revoir avec le contenu du cabinet.
- Accès : tournez à gauche, barrière Patients, ticket validé au secrétariat ; zone verte patients, partie haute le long des bâtiments réservée aux abonnés ; on passe sous la passerelle (pas de cour intérieure) ; bus Sibra arrêt Hôpital devant l'entrée de l'hôpital (lignes 2 et 11, liste complète à vérifier sur sibra.fr) ; abri vélo.
- Pas d'emblème croix rouge (protégé) : l'urgence vitale utilise un pictogramme téléphone « 15 » dans un rond brique.
- Urgences le dimanche et les jours fériés : dentiste de garde de Haute-Savoie (maisondentaire74.fr).

## Travailler en local

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000. Les images d'exemple et les cases grises « [Photo : …] » sont à remplacer par les vraies photos du cabinet.

## Publier

Branche `v2`, publiée par GitHub Pages. Committer puis `git push origin v2` ; la mise en ligne prend une à deux minutes.
