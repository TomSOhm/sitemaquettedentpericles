# Update du site : liste des tâches

Sources : `docs/retours-client.md`, avec deux origines notées entre parenthèses :
(R) réunion, notes de Tom ; (C) notes prises par le cabinet.
Base de travail : version C « calme organique », modifiée en place (mêmes composants, mêmes styles).

Légende : `[ ]` à faire, `[x]` fait, `[?]` décision ou information attendue.

## 0. Informations à obtenir du cabinet

- [?] Adresse e-mail : le site affiche `info@dentiste-pericles.fr` ; confirmer `.fr` ou `.com`.
- [?] Lien Doctolib du Dr Richard (l'ancienne page répond « supprimée ») ; en attendant, la feuille propose le téléphone. Dr Feaud : page trouvée (`doctolib.fr/dentiste/epagny-metz-tessy/martin-feaud`), à confirmer.
- [?] Dr Richard : la pédodontie (soins des enfants) est-elle à afficher ?
- [?] Premiers secours : le texte affiché est un brouillon prudent, marqué « [Conseils à faire valider par le cabinet] ». Le cabinet doit le relire ou fournir ses consignes.
- [?] Liste des soins et leurs explications.
- [?] Samedi : le Dr Bernardi consulte mais le secrétariat est fermé. Qui répond au téléphone ?
- [?] Lignes de bus à l'arrêt Hôpital : le site de l'hôpital donne 2, 6, 10, 11, 18 ; les horaires Sibra d'octobre 2026 donnent 2, 11, 21, 25, 30. Le site affiche « 2 et 11 » en attendant une vérification sur sibra.fr.
- [?] Code postal : 74370 (fiche du cabinet) ou 74330 (Base Adresse Nationale).
- [?] Photos : entrée Montée C, barrière Patients, passerelle, accueil, salles. Portraits en photo ou en dessin.
- [?] « Nouveaux patients acceptés » : affiché dans la description de la page et les données structurées (`isAcceptingNewPatients`). À retirer si le cabinet ne prend plus de nouveaux patients.
- [?] Honoraires, paiement et accès aux soins : faire valider les textes du repli en bas du pied de page (conventionné, devis, annuaire santé ameli, C2S et AME).

## 1. En-tête et navigation

- [x] Bloc e-mail à côté du téléphone, même style : en-tête, barre fixe, menu mobile, barre d'actions mobile, haut de page, bandeau final, horaires, pied de page. (C)
- [x] « 1er rendez-vous » ouvre une feuille de choix du praticien (volet à droite sur ordinateur, feuille du bas sur téléphone) avec filtre « Je peux venir le… », Doctolib ou téléphone selon le praticien, et « Peu importe le praticien » (téléphone, e-mail). (C)
- [x] « Déjà patient » retiré devant le numéro. (C)
- [x] « Tarifs » retiré de la navigation. (C)
- [x] Logo dans les barres, à la place du nom en texte ; haut de page centré sur « Cabinet dentaire du Pericles » (demande de Tom).
- [x] Logo : `logo-11-sommet` de Tom, repris tel quel ; version horizontale pour les barres (`design/logos/logo-11-sommet-horizontal.svg`) et favicon. (R)

## 2. Haut de page et référencement

- [x] « Annecy », « Epagny Metz-Tessy », « conventionnés » dans le titre de page, la description et le sous-titre. (C)
- [x] Données structurées schema.org `Dentist` (adresse, téléphone, e-mail, horaires du secrétariat).
- [x] Réglages : titre « Dentiste près d’Annecy à Epagny Metz-Tessy », description avec l’hôpital et les nouveaux patients, balises de partage (`og:`), praticiens dans les données structurées, titre « Les soins du cabinet », repère « À côté du Centre hospitalier Annecy Genevois » dans l’accès.
- [x] `robots.txt` et `sitemap.xml` préparés pour `dentiste-pericles.fr` (adresse avec ou sans www à confirmer).
- [ ] À la mise en ligne : retirer `noindex` et « (maquette) » du titre ; ajouter l’URL canonique, `og:url`, `og:image` et `url` dans les données structurées ; déclarer le site dans Google Search Console et envoyer le sitemap.
- [ ] Fiche Google Business : catégorie « Dentiste », horaires, lien vers le site et Doctolib, vraies photos ; nom, adresse et téléphone identiques partout (site, fiche Google, Doctolib, PagesJaunes, annuaire santé ameli). Pas d’« Annecy » ajouté au nom de la fiche.
- [ ] Plus tard, avec le contenu du cabinet : une page par soin, une page « Urgence dentaire », une page par praticien. Pas de page par ville.
- Règles de l’Ordre : pas de référencement payant (pas de Google Ads), pas de témoignages ni d’avis de patients sur le site (R.4127-215-1).

## 3. Bloc « Je viens pour… »

- [x] « Tarifs et remboursement » remplacé par « Écrire au cabinet ». (C)
- [x] « Un soin en particulier » conservé (choix de Tom).
- [x] Premier rendez-vous : parking précisé (tournez à gauche, barrière Patients, ticket, parking remboursé à l’accueil), lien vers le plan, bouton « Choisir un praticien ». (C)
- [x] Rendez-vous existant : horaires du secrétariat, bouton e-mail. (C)
- [x] Une douleur, une urgence : dentiste de garde cité une seule fois, premiers secours en accordéon, pictogramme SAMU 15 (pas de croix rouge, emblème protégé). (R, C)
- [x] Venir au cabinet : Google Maps, Plans, Waze ; parking remboursé à l’accueil (on ne dit pas « gratuit » : le patient paie à la borne) ; « sous la passerelle ». (C)

## 4. Venir au cabinet (plan d'accès)

- [x] Bug au clic sur le plan : le plan captait tous les gestes tactiles. Sur la page, le défilement reste libre ; « Agrandir le plan » ouvre le plan en plein écran avec pincement, glissement et boutons. (C)
- [x] Nouvelle photo IGN élargie jusqu'à l'hôpital (`assets/plan-acces-ign.webp`). (C)
- [x] Arrêt de bus placé devant l'hôpital (schéma de Tom). (C)
- [x] Zone verte patients et zone rouge abonnés selon le schéma de Tom, coche et sens interdit, P bleu au centre de la zone verte. (R, C)
- [x] « Cour intérieure » remplacé par « sous la passerelle ». (C)
- [x] Étapes en voiture réécrites, « Tournez à gauche » en premier. (R, C)
- [x] « Vue aérienne » remplacé par « plan d'accès », crédit « Photo : IGN ». (C)
- [x] Photos entrée, barrière, passerelle : affichées dans la fiche du repère cliqué ; la rangée sous le plan est retirée. (C)
- [x] Trajets redessinés d'après le deuxième schéma de Tom : bus depuis la zone d'arrivée devant l'hôpital, par la barrière et le petit parking du haut ; voiture limitée à barrière puis P (les voitures arrivent du rond-point du haut) ; vélo limité au chemin à pied depuis l'abri vélo. Chaque mode n'affiche que son propre chemin (le chemin le long de l'allée de la Mandallaz est supprimé). Icône vélo redessinée avec son guidon. Zone verte prolongée en bas à gauche, zone rouge remontée jusqu'aux façades.
- [x] Icônes du plan réduites sur téléphone, taille normale en plein écran.
- [x] Zoom Ctrl + molette à la souris (et molette seule en plein écran).
- [x] Navigation de gauche : étiquette visible seulement au-delà de 1560 px de large, sinon au survol (plus de chevauchement avec le contenu).

## 5. Horaires (« Une semaine au cabinet »)

- [x] Horaires du secrétariat ; statut « ouvert / fermé » calculé dessus. (C)
- [x] Frise interactive : secrétariat par défaut (vert), un clic sur un praticien met ses jours en évidence (brique) et propose son lien de rendez-vous. (R, C)
- [x] E-mail proposé. (C)
- [x] Colonne de gauche structurée en lignes (téléphone, e-mail, secrétariat, hors horaires, dimanche et fériés, urgence vitale).
- [x] Mode praticien : présence en ocre sur les mêmes plages que le secrétariat, pas sur toute la journée.
- [x] Urgence vitale : même pictogramme que dans le bloc urgence. (R)
- [x] Bande de fond teintée : la section se détache du plan d’accès.
- [x] Sur téléphone : la semaine passe juste sous le statut, en liste avec les heures exactes (sans barres) ; la ligne « Secrétariat » est masquée, les coordonnées viennent après.

## 6. Soins

- [?] Revoir la liste et les explications avec le contenu du cabinet. (C)

## 7. Tarifs

- [x] Section « Tarifs et remboursement » supprimée. (R, C)
- [x] « Conventionné, carte Vitale, moyens de paiement » dans le haut de page, le choix « Écrire au cabinet » et le pied de page. (C)

## 8. Équipe

- [x] Composant existant conservé : quatre praticiens, Dr Bernardi en premier, orientations en mots simples, faculté. (C)
- [x] Jours de consultation cliquables : ils sélectionnent le praticien dans la frise des horaires.
- [?] Portraits en dessin plutôt qu'en photo (maquette : `design/maquettes/equipe.html`). (R)

## 9. Pied de page

- [x] RPPS retiré. (C)
- [x] Contact : téléphone et e-mail ; horaires du secrétariat. (C)
- [ ] Mentions légales : le lien ne mène encore nulle part. Y ajouter « Conception et réalisation : Frema Labs ».
- [x] Crédit « Site réalisé par Frema Labs » (lien vers fremaconsulting.ch) dans la colonne « Informations ».
- [x] Honoraires, paiement et accès aux soins (obligatoire, R.4127-240, II) : repli discret en bas du pied de page (variante A de `design/maquettes/honoraires.html`, choisie par Tom), sans grille de prix ; renvoi vers l’annuaire santé d’ameli.fr.

## 10. Fin de chantier

- [x] `CLAUDE.md` mis à jour.
- [ ] Retirer l'outil « Couleurs » une fois la palette choisie.
- [x] Vérifié à 390 px et 1440 px.

## Notes

### Nom de domaine : dentiste-pericles

Bon choix pour le référencement local. Le poids des mots du domaine est faible ; ce qui compte pour « dentiste epagny » et voisins, c'est la fiche Google (nom, adresse, téléphone identiques au site), les textes de la page qui citent Epagny, Metz-Tessy et Annecy, et les données structurées. `dentiste-pericles.fr` est court, lisible, contient le mot recherché et reprend le nom du cabinet. Conseil : réserver aussi `dentistes-pericles.fr` (pluriel, noté en réunion) et le rediriger vers le premier. Éviter un nom générique du type `dentiste-epagny.fr` : à vérifier avec les règles de l'Ordre sur la communication des chirurgiens-dentistes.

### Icône « croix rouge » pour l'urgence grave

L'emblème de la croix rouge sur fond blanc est protégé par la loi (Conventions de Genève) : un cabinet ne peut pas l'utiliser. Le site utilise un téléphone « 15 » dans un rond brique.
