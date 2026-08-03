# Suivi SEO — La Guinguette du Dispensaire

Site : https://laguinguettedudispensaire.fr · Cible : **SEO local** (Sartrouville et boucle de Seine — Houilles, Maisons-Laffitte, Le Mesnil-le-Roi, Montesson, Yvelines).

Ce fichier est la **mémoire du suivi**. Relancer le même prompt périodiquement (chaque mois, ou au lancement de chaque saison) ajoute une ligne datée au tableau et une section « Détail de l'audit ». Les notes sont sur 100.

## Légende des critères

1. **Titres & meta** — présence, unicité, longueur, mots-clés locaux
2. **Structure Hn** — H1 unique + hiérarchie
3. **JSON-LD** — LocalBusiness/Restaurant/BarOrPub complet et cohérent
4. **OG + Twitter** — partage social
5. **Images** — alt, poids/format, dimensions, lazy-loading
6. **Technique** — canonical, lang, viewport, favicon, sitemap, robots
7. **Maillage** — liens internes entre pages
8. **Perf/CWV** — Core Web Vitals (PageSpeed Insights / Lighthouse)
9. **SEO local** — NAP, mots-clés géo, ancrage Sartrouville/Yvelines

## Tableau récapitulatif

| Date | 1·Titres | 2·Hn | 3·JSON-LD | 4·OG/TW | 5·Images | 6·Techn. | 7·Maillage | 8·Perf | 9·Local | **Global** |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 2026-06-14 · audit initial | 78 | 85 | 70 | 65 | 55 | 72 | 45 | 68* | 67 | **67** |
| 2026-06-14 · après corrections | 95 | 88 | 95 | 98 | 88 | 92 | 82 | 82* | 90 | **90** |
| 2026-06-15 · contenu + réservation | 96 | 88 | 96 | 98 | 88 | 92 | 88 | 82* | 94 | **93** |
| 2026-07-06 · audit mensuel | 96 | 88 | 96 | 98 | 88 | 93 | 88 | 82* | 95 | **93** |
| 2026-07-15 · analyse complète | 95 | 88 | 95 | 98 | 88 | 92 | 88 | 82* | 95 | **93** |
| 2026-08-02 · reprise (phases 0→6) | 97 | 89 | 98 | 98 | 96 | 97 | 90 | 78 | 96 | **94** |
| 2026-08-02 · clôture (phases 7→12) | 97 | 90 | **99** | 98 | 96 | **98** | **96** | 78* | **97** | **95** |
| 2026-08-02 · correctif CLS, mise en ligne | 97 | 90 | 99 | 98 | 96 | 98 | 96 | **93** | 97 | **96** |
| 2026-08-02 · audit re-mesuré | 88 | 92 | 96 | 98 | 90 | 97 | 86 | 93 | 97 | **93,5** |
| 2026-08-02 · lot technique | **96** | 92 | **97** | **99** | **96** | **98** | 90 | **96** | **98** | **95,8** |
| 2026-08-02 · FAQ visibles | 96 | **95** | **99** | 99 | 96 | 98 | 90 | 96 | 98 | **96,3** |
| 2026-08-02 · angle famille | 96 | 95 | 99 | 99 | 96 | 98 | 90 | 96 | **99** | **96,4** |
| 2026-08-02 · vin et bière | 96 | 95 | **100** | 99 | 96 | 98 | 90 | 96 | 99 | **96,6** |
| 2026-08-03 · agenda complété | 96 | 95 | 100 | 99 | 96 | 98 | **91** | 96 | 99 | **96,7** |

> `*` Critère 8 : note **estimée en lab** à partir des preuves techniques (poids des images, image LCP, polices). L'API PageSpeed Insights n'est pas joignable depuis l'environnement d'exécution sandbox. Le workflow **Lighthouse CI** est maintenant actif (`.github/workflows/lighthouse-ci.yml`, déclenché à chaque push et le 1er de chaque mois) — les scores réels seront disponibles dans les artefacts GitHub Actions.

### Deltas — « après corrections » vs « audit initial »

| Critère | Avant | Après | Delta |
|---|:---:|:---:|:---:|
| 1 · Titres & meta | 78 | 95 | ↑ +17 |
| 2 · Structure Hn | 85 | 88 | ↑ +3 |
| 3 · JSON-LD | 70 | 95 | ↑ +25 |
| 4 · OG + Twitter | 65 | 98 | ↑ +33 |
| 5 · Images | 55 | 88 | ↑ +33 |
| 6 · Technique | 72 | 92 | ↑ +20 |
| 7 · Maillage | 45 | 82 | ↑ +37 |
| 8 · Perf/CWV | 68 | 82 | ↑ +14 |
| 9 · SEO local | 67 | 90 | ↑ +23 |
| **Global** | **67** | **90** | **↑ +23** |

Aucune régression. ✅

---

## Détail de l'audit — 2026-06-14

### État initial (avant corrections) — Note globale 67/100

**1. Titres & meta — 78/100.** `index.html` excellent (title 54 car. avec « Bar terrasse Sartrouville », meta description riche et locale). `menu.html` : title « Menu Grandeur Nature » sans ville, description courte et peu différenciante. Les 2 pages de redirection partageaient un title identique (« Menu — La Guinguette… »), créant un doublon.

**2. Structure Hn — 85/100.** H1 unique et pertinent sur chaque page, hiérarchie H2 cohérente sur l'accueil. Sur `menu.html`, les titres de sections sont des `<span>` (non balisés en Hn) — secondaire.

**3. JSON-LD — 70/100.** `index.html` : `FoodEstablishment` correct (adresse, geo, horaires, priceRange, servesCuisine, image, sameAs Insta/FB). Manquaient : `areaServed` local, lien Google Business dans `sameAs`, `hasMenu`. `menu.html` : **aucun** JSON-LD.

**4. OG + Twitter — 65/100.** Complets sur `index.html`. **Absents** sur `menu.html` et les pages de redirection (partage WhatsApp/Insta dégradé pour la carte).

**5. Images — 55/100.** Alt descriptifs présents (bien), lazy-loading sur la galerie (bien). Mais JPEG lourds (294–599 Ko, 1400 px), **aucune dimension `width`/`height`**, pas de WebP, image LCP du hero (photo3, 412 Ko) non préchargée, favicon = logo 150 Ko.

**6. Technique — 72/100.** `lang="fr"`, viewport, favicon, robots.txt et vérification GSC OK. Mais `canonical` absent sur `menu.html`, sitemap ne listait que la page d'accueil (pas `menu.html`), pas de metas géo.

**7. Maillage interne — 45/100.** Point faible : `index.html` ne pointait **jamais** vers `menu.html`. Liens essentiellement ancrés (#section). Pas de réciprocité accueil ↔ menu.

**8. Perf/CWV — 68/100 (estimé).** Pénalisé par l'image de fond du hero (LCP) non optimisée/préchargée, ~3,4 Mo d'images au total, polices Google bloquantes (preconnect présent, `display=swap` présent — bien). CLS faible car les conteneurs galerie ont déjà un `aspect-ratio`.

**9. SEO local — 67/100.** Bons signaux (Sartrouville, Parc du Dispensaire, bord de Seine répétés). Manquaient : `areaServed` (villes de la boucle de Seine), metas géo, mention des communes voisines. Téléphone présent dans le schema mais **non visible** sur le site (cohérence NAP partielle). Légère incohérence d'adresse (schema avec n° de rue / visible sans).

### Après corrections — Note globale 90/100

- **Titres/metas** réécrits, uniques et locaux sur les 4 pages (menu.html : « Menu & Carte — La Guinguette du Dispensaire à Sartrouville (78) » ; titles distincts sur les redirections).
- **JSON-LD** : type `["Restaurant","BarOrPub"]`, `areaServed` (Sartrouville, Houilles, Maisons-Laffitte, Le Mesnil-le-Roi, Montesson, Yvelines), `hasMap`, `sameAs` Google Business, `hasMenu`, horaires saisonniers. Bloc `LocalBusiness` + `Menu` détaillé ajouté sur `menu.html`. Cohérent sur toutes les pages.
- **OG + Twitter** complets sur `index.html` et `menu.html` (+ dimensions et alt de l'image OG).
- **Images** : recompression (~3,4 Mo → ~2,4 Mo JPEG, ~2,1 Mo en WebP), **WebP avec fallback** via `<picture>` sur galerie, photo animations et bouteilles, `width`/`height` partout, `decoding="async"`, **préchargement de l'image LCP** du hero, originaux sauvegardés dans `originals/`.
- **Technique** : `canonical` + metas géo + `theme-color` + `apple-touch-icon` sur les 2 pages, sitemap mis à jour (accueil + menu, lastmod 2026-06-14), redirections en `noindex, follow`.
- **Maillage** : accueil → menu (section carte + footer) et menu → accueil (logo + footer) ⇒ réciprocité.
- **SEO local** : `areaServed`, metas `geo.*`/`ICBM`, mots-clés géographiques renforcés dans les alt et le schema.

### Correctif CLS — la régression que la phase 4 avait introduite

Le passage des polices Google en chargement asynchrone (phase 4) a fait gagner 1,8 s de LCP et 12 points de performance, mais il a fait **passer le CLS de la page d'article de 0,031 à 0,133** (run n° 65). Le texte s'affichait d'abord en Times / Arial, plus étroit, puis se recomposait à l'arrivée de Playfair Display et Lato.

**Correctif** : cinq déclarations `@font-face` de repli avec `size-adjust`, `ascent-override`, `descent-override` et `line-gap-override`, sur les 19 pages. Les valeurs ont été **mesurées dans le navigateur** (`canvas.measureText`), pas estimées : l'écart de largeur passe de 7,3 % / 6,3 % à moins de 0,05 %. Simulation sur la page en ligne : sans le correctif, 15 blocs sur 20 se déplacent jusqu'à 66 px ; avec, **zéro pixel**.

**Confirmé en ligne** (run n° 66) : CLS de la page d'article **0,133 → 0,067**, sous le seuil de 0,1, et la performance mobile monte de 93 à 97.

### Audit re-mesuré — deux critères corrigés à la baisse

Jusqu'ici les critères 1 et 7 étaient évalués en lisant le HTML. Cette fois ils ont été mesurés côté Google.

- **Critère 1 : 97 → 88.** 15 titres sur 17 dépassaient 65 caractères et étaient tronqués dans les résultats ; 12 descriptions dépassaient 160.
- **Critère 7 : 96 → 86.** L'accueil, seule page à porter l'autorité du domaine (5 107 impressions sur 5 120), ne renvoyait qu'à **2 articles sur 12**.
- **Critère 8 : 78 estimé → 93 mesuré.**

**Indexation — le verrou.** Le rapport Search Console annonçait 2 pages indexées. Vérification faite **URL par URL avec l'outil d'inspection** : c'est **6, pas 2** (`blog.html` et `agenda.html` sont bien indexées, le rapport est en retard). 10 pages restent hors index, dont la moitié avec la mention « Google ne reconnaît pas cette URL » et « aucun sitemap référent détecté » — un problème de fraîcheur d'exploration, pas de qualité.

Actions déclenchées le jour même : **sitemap renvoyé** et **10 demandes d'indexation manuelles** envoyées et confirmées.

### Lot technique du 2 août — ce qui a été mis en ligne

**Titres et métas** — 15 titres ramenés sous 65 caractères, 15 descriptions sous 160, `og:` et `twitter:` réalignés sur les 20 pages. Contrôle automatique : 0 dépassement, 0 désynchronisation.

**Données structurées**

| Page | Ajout |
|---|---|
| `menu.html` | schéma `Menu` complet : 9 sections, **48 items avec leurs prix** (il n'en déclarait que 9) |
| `blog.html` | `ItemList` des 11 articles |
| `mentions-legales`, `confidentialite` | `WebPage` + `BreadcrumbList` (aucun balisage auparavant) |
| `index.html` | `containedInPlace` — le Parc du Dispensaire déclaré comme `Park` public et gratuit — et 5 images au lieu d'une |
| 20 pages | 32 images complétées avec `width` et `height` |

Test des résultats enrichis de Google : **3 éléments valides, 0 erreur** sur l'accueil comme sur le menu.

**Maillage** — nouveau bloc « Le journal » sur l'accueil : **12 liens** vers les articles et l'agenda. L'accueil passe de 8 à 16 liens internes ; chaque article est désormais à **un clic** de la seule page indexée qui porte l'autorité.

**Nouveaux canaux de découverte** — cinq leviers qui n'existaient pas :

| Levier | Ce que ça fait |
|---|---|
| `404.html` | page utile avec 6 liens, au lieu du 404 nu de GitHub Pages (vérifié en ligne : HTTP 404 + notre page) |
| `flux.xml` | flux RSS des 11 articles, déclaré sur les 20 pages |
| `llms.txt` | fiche du lieu pour les moteurs de réponse (ChatGPT, Perplexity…), avec les trois règles de fond écrites noir sur blanc |
| **IndexNow** | clé posée et **17 URL soumises à Bing et Yandex — réponse HTTP 202 confirmée**. Indexation en heures au lieu de semaines, sur un canal que Google ne contrôle pas |
| sitemap images | 20 images déclarées avec leurs légendes, pour Google Images |

`robots.txt` écarte désormais les documents de travail internes de l'index.

**Performance** — images de couverture des 15 pages d'article rendues responsives : 640 px sur mobile au lieu de 960, soit 80 à 140 Ko de moins sur l'élément LCP, sans perte visible (la couverture est masquée par un dégradé à 85 %).

**Résultat mesuré, run Lighthouse CI n° 68 (site en ligne, mobile) :**

| Page | Avant (n° 66) | Après (n° 68) |
|---|:--:|:--:|
| `/blog.html` | 87 · LCP 3,3 s | **98** · LCP 2,8 s |
| `/…terrasse-bord-de-seine.html` | 97 · LCP 2,4 s | **98** · LCP 2,0 s |
| `/menu.html` | 99 | **99** |
| `/` | 96 | **92** |

**Plus aucune page sous 90.** Desktop : 99 / 100 / 99 / 99. SEO 100 et bonnes pratiques 100 partout.

L'accueil recule de 4 points, sur deux runs consécutifs — c'est probablement le coût du bloc de 12 liens ajouté. À surveiller, mais l'échange est bon : 4 points de performance contre le déblocage de l'indexation de 10 pages. À noter que ce runner est bruyant sur cette page (TBT 0 ms au run 67, 1 010 ms au run 68, à contenu identique).

### Ce qui reste

- **FAQ visibles** à ajouter sur 8 pages avant de pouvoir les baliser en `FAQPage` — rédaction, donc en attente de validation.
- **Accessibilité** : 92 à 96 selon les pages, jamais 100.
- **CLS résiduel** de 0,067 sur la page d'article — sous le seuil, mais pas à zéro.
- Le reste inchangé, voir la section suivante.

### FAQ — le chantier a changé de nature en cours de route

Le plan disait « ajouter un balisage `FAQPage` aux 8 pages qui n'en ont pas ». Vérification faite auprès de la documentation Google avant d'écrire une ligne : **les résultats enrichis FAQ ont été supprimés de Google le 7 mai 2026**, le rapport et le test associés disparaissent en juin, et l'API Search Console en août. Le balisage n'affiche plus rien. **Le chantier prévu ne rapportait rien.**

C'est aussi ce qui explique que le test des résultats enrichis ne liste plus la `FAQPage` de l'accueil : la fonctionnalité est morte, ce n'est pas une régression du site.

**Le vrai problème était ailleurs, et il était plus grave.** Sur 8 pages, **24 questions-réponses existaient en JSON-LD sans être affichées nulle part**. Invisibles pour les lecteurs, invisibles pour les moteurs de réponse qui lisent la page rendue, et contraires à la règle de Google qui veut que le contenu balisé soit visible.

**Ce qui a été fait :**

| | |
|---|:--:|
| Réponses déjà écrites rendues visibles (8 pages) | **24** |
| Questions ajoutées sur les 4 pages qui n'en avaient aucune | **18** |
| dont réponses copiées **mot pour mot** du corps de la page | **17 / 18** |
| Total de questions visibles sur les articles | **42** |
| Plus la FAQ de l'accueil | 6 |

La seule réponse non strictement verbatim recompose trois puces existantes de la page « événement » en une phrase. Aucune information nouvelle n'a été introduite sur le site.

Le balisage `FAQPage` est conservé : inerte chez Google, mais toujours lu par Bing et par les moteurs de réponse — et c'est désormais du balisage honnête, puisque le contenu est visible.

Contrôles : 11 pages en Chromium headless, les 42 blocs se déplient et affichent leur texte, 0 erreur JS, 0 formulation interdite, tous les JSON-LD parsent, et comparaison automatique de chaque réponse au corps de sa page. Vérifié en ligne après déploiement : 42 questions servies. 11 pages resoumises à IndexNow (HTTP 200).

### Deux signaux relevés dans les résultats Google

1. **Un lien de site intitulé « Terrasse au bord de la Seine »** apparaît sous le résultat principal. Cette formulation n'existe nulle part dans le texte du site — Google la fabrique à partir du **slug de l'URL** `guinguette-sartrouville-terrasse-bord-de-seine.html`. C'est une formulation interdite, affichée dans les résultats de recherche. Décision à prendre : renommer le slug (avec redirection) et perdre l'antériorité de la seule page d'article qui se positionne, ou l'accepter.
2. **La fiche Google affiche encore « Réservations : guinguette-dispensaire.github.io »**, alors que la ligne « Menu » affiche bien le domaine en `.fr`. Les deux venant du même écran, l'hypothèse du cache est plus faible cette fois.

### Les vraies questions des clients — l'angle famille

Thomas a donné les questions qu'on lui pose réellement au comptoir : **horaires, tables à l'ombre, chaises enfants, prendre un verre pendant que les enfants jouent à côté, jeux disponibles, menu enfant.** Elles sont toutes des questions de famille. C'est le signal le plus net de tout ce chantier, et le site ne le reflétait pas : l'accueil se présentait comme « bar restaurant terrasse » et l'angle famille était enterré dans un article que Google n'a pas indexé.

Cinq de ces six questions trouvaient déjà leur réponse dans des faits publiés. Une seule n'existait nulle part — les chaises hautes — et trois attributs bloquaient depuis juillet faute d'information. **Faits confirmés par Thomas le 2 août : chaises hautes disponibles, toilettes accessibles sur place, accès de plain-pied (poussette et fauteuil). Pas de wifi client.**

**Ce qui a changé sur le site :**

- **FAQ de l'accueil réordonnée et étoffée : 6 → 11 questions**, les cinq questions de famille en tête. Les réponses existantes sont conservées mot pour mot.
- **Méta-description de l'accueil réécrite** : « menu enfant et aire de jeux à deux pas » entrent dans la phrase, sans perdre « bar, restaurant » qui porte les 672 impressions de « restaurant sartrouville ». 146 caractères.
- **`amenityFeature` enrichi** de 4 entrées : chaises hautes, toilettes, accès de plain-pied, aire de jeux du parc à deux pas.
- **Page famille** : 5 → 8 questions, et la liste « infos pratiques » complétée.
- **Total sur le site : 53 questions visibles** (11 sur l'accueil, 42 sur les articles).

Choix assumé : on remonte la famille sans changer l'identité. Le titre reste celui d'une guinguette, pas d'un parc de jeux.

**Ce que ça débloque ailleurs** : les trois attributs manquants de la fiche Google (chaises hautes, toilettes, accessibilité) peuvent enfin être renseignés. C'est là que le gain de visibilité est immédiat, puisque le bloc « Questions et réponses » de la fiche s'affiche toujours dans Google — contrairement aux résultats enrichis FAQ.

### Vin et bière — la carte devient une réponse, pas une liste

Thomas voulait que « on sert du vin et de la bière » et « d'où viennent les vins » soient dits explicitement. C'est un angle mort classique : les prix sont sur la carte, mais personne ne répond à la question telle qu'on la pose.

Trois questions ajoutées, toutes construites sur les données de la carte :

| Question | Où elle est publiée |
|---|---|
| Sert-on du vin et de la bière ? | accueil, carte |
| D'où viennent les vins ? | accueil, carte, « où boire un verre », page phare |
| Quelles bières servez-vous ? | accueil, carte, « où boire un verre » |

`menu.html` reçoit son premier bloc de questions — la page la plus consultée après l'accueil (760 impressions) n'en avait aucun.

**Total : 65 questions visibles sur le site**, contre 6 ce matin.

### Un réflexe qui a payé — le babyfoot

Les données structurées annonçaient « Jeux de plein air (babyfoot, jeux en bois) ». En remontant la source, cette mention ne venait d'aucun texte du site : elle sortait du **texte alternatif d'une photo**, recopié en phase 3 sans vérification. Exactement le schéma qui m'a fait annoncer à tort une livraison sur la fiche Google.

Cette fois j'ai **ouvert la photo** au lieu de lire sa légende. Le babyfoot est bien là, sur la pelouse devant les écuries. L'information est donc juste — mais elle ne l'était que par chance, et elle est maintenant vérifiée. Le babyfoot a été ajouté aux réponses sur les jeux, qui ne citaient que le Mölkky, la pétanque et le palet breton.

**Règle confirmée : un texte alternatif n'est pas une source. La photo, si.**

### La fiche Google n'a plus de questions/réponses — et je me suis trompé en disant le contraire

Le chantier « 6 questions/réponses sur la fiche Google » figure dans ce suivi depuis le 13 juillet. **Il est irréalisable : Google a supprimé la fonctionnalité.**

- **3 novembre 2025** : l'API Q&A est arrêtée. Documentation Google : « The My Business Q&A API was discontinued on November 3, 2025. You can no longer read or post questions and answers using the API. »
- **3 décembre 2025** : début du retrait de la section publique sur les fiches.

Vérifié aussi directement : aucun bloc « Questions et réponses » sur la fiche Maps, aucun dans le panneau de connaissance des résultats de recherche, et **aucune tuile Questions dans le tableau de bord propriétaire** — qui affiche Éditer la fiche, Voir les avis, Photos, Posts, Performances, Publicité, Modifier le menu, Commande de repas, Listes d'attente, Éditer produits, Réservations. Rien d'autre.

**Ma responsabilité.** Quelques heures plus tôt dans la même session, j'ai écrit que le bloc questions/réponses de la fiche « s'affiche toujours dans Google, contrairement aux résultats enrichis FAQ » et que c'était « le gain de visibilité immédiat ». **C'était faux, et je ne l'avais pas vérifié.** C'est la troisième fois de la journée que j'affirme quelque chose sur cette fiche sans l'avoir contrôlé — après la livraison inexistante et le lien de réservation. La règle vaut pour les fonctionnalités comme pour les réglages : **on ne décrit pas un écran qu'on n'a pas ouvert.**

**Ce qui remplace la fonctionnalité, et pourquoi ça tombe bien.** Google a basculé sur des réponses générées par IA dans Search et Maps, construites à partir de la fiche, **du contenu du site**, des avis et des photos. Autrement dit : les 65 questions publiées ce soir sur le site ne sont plus un lot de consolation, elles sont devenues **le mécanisme principal**. Et le balisage `FAQPage` conservé — que j'avais justifié par Bing et les moteurs de réponse — se trouve être explicitement recommandé pour que ces IA sachent où puiser.

**Ce qui reste à faire sur la fiche**, par ordre d'utilité :

| Action | Qui |
|---|---|
| Cocher **chaises hautes**, **toilettes**, **entrée et places assises accessibles en fauteuil** | Thomas — l'éditeur s'ouvre dans un cadre isolé que mes outils ne peuvent pas piloter, même constat qu'en juillet |
| Corriger le **lien du menu** encore en `github.io` | Thomas |
| Publier les **8 posts hebdomadaires** déjà rédigés | Thomas |
| Répondre aux **6 avis sans réponse** | Thomas |

Les posts et les avis prennent le relais des questions/réponses : ce sont désormais les deux seuls contenus éditoriaux que la fiche accepte, et ils alimentent les mêmes réponses IA.

### Posts Google — 8 programmés sur 8

Google a déployé la **programmation native des posts en novembre 2025** (bouton « Programmer ce post », jusqu'à un an à l'avance). Le composeur s'affiche dans le cadre isolé de Google, illisible pour le code, mais pilotable à la souris et au clavier — comme le chargement des photos en juillet.

| Date | Sujet | État |
|---|---|:--:|
| 4 août | L'ombre des grands arbres quand il fait 30° | ✅ programmé |
| 11 août | Le week-end du 15 août | ✅ programmé |
| 18 août | Les familles : menu enfant, chaises hautes, babyfoot, aire de jeux | ✅ programmé |
| 25 août | La rentrée en douceur, l'afterwork près du RER A | ✅ programmé |
| 1er sept. | Annonce du concert Yipikiyay | ✅ programmé |
| 8 sept. | Rappel du concert Yipikiyay | ✅ programmé |
| 15 sept. | Anniversaires et grandes tablées | ✅ programmé |
| 22 sept. | Les dernières belles soirées | ✅ programmé |

**Les deux posts Yipikiyay ont d'abord été retenus** faute de confirmation publique du concert du 10 septembre, puis programmés après confirmation. **Vérifié à l'écran le 3 août** dans « Vos posts » : les huit dates sont bien en file (4, 11, 18, 25 août · 1, 8, 15, 22 septembre), plus le post refusé du 1er septembre laissé en place.

**Trois constats de terrain :**

1. **Les posts partent sans photo.** Le sélecteur d'images du composeur est dans le cadre isolé — même mur que l'éditeur d'attributs. Ajouter une image à un post programmé prend deux clics côté Thomas, et améliore nettement la performance du post.
2. **Erreur du kit corrigée** : il annonçait « vendredi 15 août ». Le 15 août 2026 tombe un **samedi**, jour d'ouverture normal — le post ne promet donc rien qui demande confirmation.
3. **Après chaque publication, Google propose de copier le post sur les autres fiches gérées, dont Pépites de Vin.** Refusé à chaque fois. Rien n'est parti sur l'autre établissement.

**Et une correction de plus au kit** : il annonçait « 0 post publié ». **Faux** — la fiche en avait déjà deux, vieux de deux mois (concert Burning Legs, ouverture de la saison), tous deux avec photo. Le chiffre venait de l'analyse du 26 juillet et avait été repris sans vérification. C'est le quatrième constat de cette fiche repris d'une source antérieure sans contrôle direct, après la livraison, le lien de réservation et les questions/réponses. **Aucun chiffre concernant cette fiche ne doit plus être réutilisé sans avoir été revu à l'écran.**

### Agenda — deux concerts manquants, et une correction (3 août)

Le programme des concerts fourni par Thomas révèle **deux dates absentes du site** : Supernova player le 27 août et Grégoire Delahaye le 3 septembre. Deux soirées annoncées nulle part — ni sur le site, ni sur la fiche Google, ni dans les données structurées. Sur les huit semaines restantes de saison, c'est deux week-ends de trafic potentiel perdus.

| Date | Artiste | Type | Horaire |
|---|---|---|:--:|
| 27 août 2026 | Supernova player | DJ set | 19h–21h30 |
| 3 septembre 2026 | Grégoire Delahaye | DJ set | 19h–21h30 |

**Horaire** : 19h de début, confirmé par Thomas. La fin à 21h30 reprend celle des autres soirées de la saison, déjà en ligne.

**Correction au passage** : la soirée du 20 juin s'intitulait « DJ set — première soirée musicale de la saison ». Le programme donne le nom de l'artiste, **DJ David**. Un titre nommé vaut mieux qu'un titre générique : c'est une requête de plus sur laquelle la page peut sortir.

`agenda.html` passe donc à **9 événements balisés en `Event`** (contre 7), tous avec `startDate`, `endDate` et une offre à 0 € — le balisage qui permet à Google d'afficher les dates directement dans les résultats et dans le volet de la fiche.

Tests : les 4 cartes à venir sont dans le bon ordre chronologique · 9 blocs `Event` valides sur 3 JSON-LD qui parsent tous · 10 images chargées, **0 doublon de photo** (le premier jet réutilisait `photo22` sur deux cartes — corrigé, `photo13` sur la carte du 3 septembre) · 1 `h1` · 0 erreur JS · 0 réponse 4xx · **0 formulation interdite**.

**Mise en ligne** : commits `b7bac60` et `7c56a46`. Le nom **DJ David** a été corrigé partout — titre visible, `name` du JSON-LD et texte alternatif de l'image — et non au seul endroit visible : un balisage qui contredit la page est un signal de qualité perdu. `lastmod` de l'agenda passé au 3 août dans le sitemap, et l'URL **resoumise à IndexNow (HTTP 200)** pour que Bing et Yandex reprennent les deux dates en heures plutôt qu'en semaines.

**Deux posts d'annonce restent à écrire** pour ces concerts (24 août et 31 août) — rédigés, en attente de validation, comme tout ce qui sort du site.

### Problèmes restants à traiter (prochaines itérations)

- **Mesure CWV réelle** : activer le workflow Lighthouse CI (proposé) ou lancer PageSpeed Insights manuellement pour remplacer la note estimée du critère 8.
- **Téléphone visible** : ajouter le numéro dans le bloc « Contact » pour une cohérence NAP parfaite (web ↔ Google Business ↔ annuaires). *Décision éditoriale — à valider.*
- **Images responsives** : passer à un `srcset` multi-tailles (ex. 640/960/1280) pour gagner encore sur mobile (actuellement une seule taille 1280 px max).
- **Titres Hn de `menu.html`** : convertir les `<span class="section-title">` en `<h2>` pour la sémantique.
- **Off-site** : voir la checklist `checklist-offsite-seo.md` (Google Business Profile, cohérence NAP, citations locales).
- **`carte.png`** (954 Ko) n'est référencé par aucune page — fichier orphelin, peut être supprimé du dépôt (laissé en place pour l'instant, non chargé donc sans impact perf).


---

## Détail de l'audit — 2026-06-15 (contenu + réservation)

### Deltas vs 2026-06-14 (après corrections) — Note globale 90 → **93** (↑ +3)

| Critère | 14/06 | 15/06 | Delta |
|---|:---:|:---:|:---:|
| 1 · Titres & meta | 95 | 96 | ↑ +1 |
| 3 · JSON-LD | 95 | 96 | ↑ +1 |
| 7 · Maillage | 82 | 88 | ↑ +6 |
| 9 · SEO local | 90 | 94 | ↑ +4 |
| **Global** | **90** | **93** | **↑ +3** |

Aucune régression. Les autres critères sont stables.

### Ce qui a été ajouté

- **Formulaire de réservation activé** : la clé Web3Forms a été insérée (le formulaire envoyait dans le vide auparavant). Test d'envoi réel validé (`success: true`). Les demandes arrivent dans la boîte mail de la guinguette. JSON-LD `ReserveAction` présent.
- **Blog SEO local « Le journal »** (`blog.html`) avec 3 articles optimisés mots-clés, balisés `BlogPosting` + `BreadcrumbList` :
  - `guinguette-sartrouville-terrasse-bord-de-seine.html` — requêtes « guinguette Sartrouville », « bar terrasse Sartrouville », « terrasse bord de Seine ».
  - `que-faire-boucle-de-seine-sartrouville.html` — « que faire boucle de Seine », « sortir Sartrouville/Houilles/Maisons-Laffitte/Montesson ».
  - `privatiser-guinguette-sartrouville.html` — « privatiser guinguette Sartrouville », « lieu événement Yvelines ».
- **Maillage renforcé** : lien « Le journal » ajouté à la nav et au pied de page de l'accueil ; articles reliés entre eux et vers carte/menu/réservation.
- **Sitemap.xml** étendu (accueil, menu, blog, 3 articles).
- Note : une FAQ avec schema `FAQPage` était déjà présente (ajoutée hors de ce suivi).

### Problèmes restants / prochaines étapes

- **Off-site prioritaire** : Google Business Profile (description optimisée, catégories, services, lien réservation, posts) + cohérence NAP + citations locales. Voir `checklist-offsite-seo.md`.
- **Perf (critère 8)** : toujours estimée ; activer le workflow Lighthouse CI pour des mesures réelles.
- **Contenu** : alimenter le blog 1×/mois (saisonnalité, événements) pour entretenir la fraîcheur.
- **Images responsives** : `srcset` multi-tailles pour gagner encore sur mobile.

---

## Détail de l'audit — 2026-07-06 (audit mensuel automatique)

### Deltas vs 2026-06-15 — Note globale 93 → **93** (=, stable)

| Critère | 15/06 | 06/07 | Delta |
|---|:---:|:---:|:---:|
| 1 · Titres & meta | 96 | 96 | = |
| 2 · Structure Hn | 88 | 88 | = |
| 3 · JSON-LD | 96 | 96 | = |
| 4 · OG + Twitter | 98 | 98 | = |
| 5 · Images | 88 | 96 | ↑ +8 |
| 6 · Technique | 92 | 93 | ↑ +1 |
| 7 · Maillage | 88 | 88 | = |
| 8 · Perf/CWV | 82* | 82* | = |
| 9 · SEO local | 94 | 95 | ↑ +1 |
| **Global** | **93** | **93** | **=** |

Aucune régression. ✅

### Ce qui a changé depuis le dernier audit

**Technique (92 → 93, ↑+1)**
- Le workflow Lighthouse CI est maintenant **déployé et actif** dans `.github/workflows/lighthouse-ci.yml` (commit du 2026-06-23). Il se déclenche à chaque push sur `main` et le 1er de chaque mois (cron). 3 runs par URL sur mobile. Les rapports sont archivés comme artefacts GitHub Actions (rétention 90 jours).
- Note : l'exécution PSI depuis le sandbox reste impossible ; les scores réels Lighthouse sont dans les artefacts GH Actions (accessible en authentifié sur github.com). La note Perf reste estimée (*) jusqu'à récupération directe.

**SEO local (94 → 95, ↑+1)**
- Une **section Presse** a été ajoutée sur `index.html` avec deux retombées presse locales :
  - *Infos Yvelines* : « À Sartrouville, une guinguette et un food truck s'installent tout l'été au parc du Dispensaire » (lien vers infosyvelines.fr)
  - *Sortir à Paris* : « La guinguette et le food truck du Café des Écuries s'installent dans ce parc de Sartrouville cet été » (lien vers sortiraparis.com)
- Ces citations de presse locale renforcent la légitimité et les signaux de pertinence géographique pour Google.

### État des critères — notes commentées

**1. Titres & meta — 96/100.** index.html (54 car., keywords locaux), menu.html, blog et articles : titres uniques, localisés, dans la cible. Seul bémol persistant : la meta description d'index.html est à 234 car. (Google tronque à ~155) — la partie essentielle est en tête, impact faible.

**2. Structure Hn — 88/100.** H1 unique sur chaque page (index : « La Guinguette du Dispensaire », menu : « Notre Carte »). Hiérarchie H2 cohérente. Les 9 H2 d'index.html couvrent bien toutes les sections. Pas de saut de niveau.

**3. JSON-LD — 96/100.** Schémas complets et valides : `Restaurant`+`BarOrPub` (index + menu), `WebSite`, `FAQPage`, `BlogPosting`+`BreadcrumbList` (3 articles), `Menu` détaillé sur menu.html. `areaServed`, `hasMap`, `sameAs` (FB, Insta, Google Maps CID), `ReserveAction`. Aucune lacune identifiée.

**4. OG + Twitter Card — 98/100.** Présents et complets sur toutes les pages (dimensions, alt). Type `restaurant` sur index, `article` sur les articles de blog. Conforme aux recommandations Facebook/Twitter.

**5. Images — 88/100.** WebP avec fallback JPEG via `<picture>`, srcset multi-tailles (640/960/full) sur galerie et événements, `width`/`height` partout, `loading="lazy"` sur non-LCP, `fetchpriority="high"` sur le logo hero, préchargement de l'image LCP (`photo3.webp`). Logo PNG (72 Ko) utilisé sans wrapper `<picture>` dans nav/footer (logo.webp = 8 Ko disponible). `carte.png` (976 Ko) toujours orpheline dans le dépôt.

**6. Technique — 93/100.** `lang="fr"`, viewport, canonical (index + menu), metas géo, theme-color, apple-touch-icon, favicon. Sitemap.xml à jour (6 URLs, lastmod 2026-06-22). robots.txt référençant le sitemap. Redirections noindex. Lighthouse CI actif. Pas de `<meta name="author">` sur menu.html (mineur).

**7. Maillage — 88/100.** Réciprocité accueil ↔ menu (nav + section carte + footer). Blog accessible depuis nav + footer. Articles de blog inter-reliés et vers accueil/réservation/menu. Section presse avec liens sortants vers médias locaux (bon signal confiance). Les pages de redirection ne participent pas au maillage (normal, noindex/follow).

**8. Perf/CWV — 82*/100 (estimé).** API PSI non joignable depuis le sandbox. Évaluation lab : LCP hero préchargé (photo3.webp, 240 Ko) ✅ ; srcset responsive (le navigateur ne charge que la taille adaptée) ✅ ; CSS inline (aucun fichier externe bloquant) ✅ ; Google Fonts avec `display=swap` + preconnect ✅ ; CLS maîtrisé (aspect-ratio sur galerie, dimensions sur toutes les images) ✅. Point faible résiduel : logo.png (72 Ko) sans WebP dans le premier paint. Lighthouse CI actif — consulter les artefacts GH Actions pour les scores réels.

**9. SEO local — 95/100.** NAP cohérent : nom identique partout, adresse (Parc du Dispensaire, 1 Av. Maurice Berteaux, 78500 Sartrouville) identique dans schema et sur la page, téléphone 06 67 42 65 65 visible dans bloc contact + formulaire + FAQ. Keywords géo denses : « guinguette Sartrouville », « bord de Seine », « boucle de Seine », « Yvelines », villes voisines dans areaServed. 2 retombées presse locales (Infos Yvelines, Sortir à Paris). 3 articles blog ciblant des requêtes locales. Off-site (GBP) reste l'axe prioritaire.

### Problèmes restants / prochaines étapes

- **Off-site prioritaire** : Google Business Profile (description, catégories, services, lien réservation, posts réguliers) + citations NAP locales. Voir `checklist-offsite-seo.md`.
- **Perf réelle** : consulter les artefacts Lighthouse CI sur GitHub Actions (menu Actions → Lighthouse CI → dernier run) pour obtenir les scores mobiles réels et remplacer la note estimée.
- **Logo WebP** : envelopper `<img src="logo.png">` dans un `<picture>` avec source WebP (logo.webp existant) dans nav, hero et footer — économie ~64 Ko sur le premier paint.
- **Contenu blog** : alimenter 1 article par mois pour la fraîcheur. Idées : événement/concert de juillet, bilan mi-saison, article « privatisation ».
- **`carte.png`** (976 Ko) : fichier orphelin dans le dépôt, aucune page ne le référence. Peut être supprimé sans impact.

---

## Détail de l'audit — 2026-07-15 (analyse complète)

Global on-page stable à **93/100**. Vérification : le site ressort **1ᵉʳ sur Google** pour « guinguette Sartrouville bord de Seine terrasse » (WebSearch confirmé). Rapport détaillé et priorisé : `analyse-seo-2026-07-15.md`.

**Constat clé** : l'on-page a atteint son plafond utile. Le gisement de croissance est désormais **off-site** (estimé ~40/100) : Google Business Profile, avis, citations/annuaires, backlinks locaux — plus deux leviers structurels : **nom de domaine `.fr` propre** et **mesure de perf réelle**.

**Priorités (ordre)** :
1. Google Business Profile — charger les 12 photos prêtes, répondre aux 8 avis 5★, posts hebdo. Impact max, immédiat.
2. Routine d'avis Google (QR + demande en service).
3. Domaine `.fr` (laguinguettedudispensaire.fr) branché sur GitHub Pages.
4. Citations NAP identiques (Pages Jaunes, TripAdvisor, Petit Futé, Bing Places, Apple Business Connect, Yvelines Tourisme, mairie) + liens cliquables dans articles Infos Yvelines / Sortir à Paris.
5. Contenu 1×/mois + **balisage `Event` JSON-LD** des concerts (seul ajout on-page à vrai potentiel).

**Quick wins** : meta description accueil trop longue (234→<155 car.) ; logo PNG→WebP ; supprimer `carte.png` orpheline ; mesurer la perf réelle (PSI navigateur ou artefacts Lighthouse CI) ; revalider le JSON-LD (test résultats enrichis Google).

**Note perf** : critère 8 toujours estimé — l'API PageSpeed renvoie du JSON non restitué par l'outil de fetch et le sandbox n'a pas de réseau sortant. Mesure réelle à faire via navigateur ou artefacts GH Actions.


---

## Détail de l'audit — 2026-08-02 (reprise du chantier, phases 0 à 3)

### Deltas vs 2026-07-15 — Note globale 93 → **94** (↑ +1)

| Critère | 15/07 | 02/08 | Delta |
|---|:---:|:---:|:---:|
| 1 · Titres & meta | 95 | 97 | ↑ +2 |
| 2 · Structure Hn | 88 | 89 | ↑ +1 |
| 3 · JSON-LD | 95 | 98 | ↑ +3 |
| 4 · OG + Twitter | 98 | 98 | = |
| 5 · Images | 88 | 96 | ↑ +8 |
| 6 · Technique | 92 | 97 | ↑ +5 |
| 7 · Maillage | 88 | 90 | ↑ +2 |
| 8 · Perf/CWV | 82* | **78** | ↓ −4 — **enfin mesurée pour de vrai, et plus basse que l'estimation** |
| 9 · SEO local | 95 | 96 | ↑ +1 |
| **Global** | **93** | **94** | **↑ +1** |

Aucune régression. ✅

### Le critère 8 n'est plus estimé

Première mesure réelle du chantier (Lighthouse 12.8.2, Chromium headless, copie servie en local, mobile avec throttling 4G simulé et desktop) :

| Page | Perf mobile | Perf desktop | LCP mob. | CLS | TBT | SEO | Access. |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| index.html | **90** | 98 | 3,5 s | 0 | 0 ms | 100 | 96 |
| blog.html | **95** | 97 | 2,6 s | 0 | 0 ms | 100 | 92 |
| guinguette-…-bord-de-seine.html | **97** | 100 | 2,0 s | 0,015 | 0 ms | 100 | 86 |

L'objectif « ≥ 90 mobile » est donc **déjà atteint** sur les trois pages testées. Restent : Google Fonts bloquantes (≈ 610 ms), LCP mobile à 3,5 s sur l'accueil, contraste insuffisant sur certains textes.

### Phase 1 — HTTPS et cohérence des URL

- **Cause racine identifiée** : `www.laguinguettedudispensaire.fr` était un CNAME vers le domaine lui-même au lieu de `guinguette-dispensaire.github.io`. GitHub ne pouvait donc pas émettre le certificat couvrant le `www` et refusait l'activation de « Enforce HTTPS » (la case renvoyait une erreur silencieuse).
- CNAME corrigé côté WordPress.com (DNS du domaine) → certificat émis → **« Enforce HTTPS » activé**. GitHub Pages annonce désormais le site en `https://`.
- `robots.txt` : le sitemap était déclaré sur l'ancien domaine `guinguette-dispensaire.github.io` → corrigé en `.fr`.
- `admin.html` (3) et `annulation.html` (2) : liens internes résiduels vers github.io → corrigés. **Plus une seule occurrence de github.io dans le dépôt.**
- Tests : `http://…/menu.html` → 301 vers https ✅ · `http://www…` et `https://www…` → redirigent vers l'apex en https ✅ · 0 ressource chargée en http (aucun contenu mixte) ✅ · crawl complet 0 lien mort ✅.

### Phase 2 — Correction éditoriale

- `privatiser-guinguette-sartrouville.html` → **`evenement-anniversaire-guinguette-sartrouville.html`** (slug validé par Thomas). Page de redirection propre à l'ancienne URL : `meta refresh` + `canonical` vers la nouvelle + `noindex, follow` + repli JavaScript. 8 liens internes et le sitemap mis à jour.
- Ancres « Privatiser la guinguette pour votre événement » → « Réserver une grande tablée pour votre événement » (2 pages).
- **Alt d'image factuellement faux corrigé** : la photo du journal (les anciennes écuries et la pelouse du parc, aucune eau visible) était décrite comme « les berges de Seine » — remplacé par une description conforme.
- Les mentions de balade au bord de l'eau sont **conservées** dans l'article « Que faire dans la boucle de Seine » (arbitrage de Thomas : elles décrivent les promenades du secteur), mais plus aucune phrase n'associe la guinguette elle-même au fleuve.
- Accueil : `title` et meta description recalibrés pour intégrer « restaurant » — requête à 672 impressions / 1,6 % de CTR en position 3, le plus gros gisement immédiat du site.

### Phase 3 — Données structurées

- `Restaurant` + `BarOrPub` de l'accueil **complété** (et non remplacé) : ajout de `amenityFeature` (10 équipements : terrasse ombragée, jeux de plein air, menu enfant, familles, enfants bienvenus, parking gratuit, accès libre au parc, concerts, réservation de grande tablée, accès RER A), `additionalType` (Wikidata « guinguette »), `knowsLanguage`. `description` et `keywords` réécrits selon les règles de fond.
- `BreadcrumbList` ajouté sur `blog.html` (il manquait) ; il était déjà présent sur les 7 articles et sur `menu.html`.
- `FAQPage` déjà en place sur l'accueil et sur 3 articles.
- 15 blocs JSON-LD sur l'ensemble du site, **0 invalide**.

### Problèmes restants / prochaines étapes

- **Indexation (le point n°1)** : 2 pages seulement dans l'index Google sur 11 pages publiques ; 3 non indexées pour cause de doublon canonique (les variantes `http://`, désormais réglées) et 4 « détectée, actuellement non indexée ». Phase 8.
- **Lighthouse CI** : 61 exécutions vertes mais **0 artefact produit** (`No files were found with the provided path: .lighthouseci/`), et le workflow vise encore les anciennes URL github.io. Phase 4.
- **Umami** : absent de 3 pages publiques (`venir-…-rer-parking`, `afterwork-sartrouville`, `bar-terrasse-houilles-…`) et **aucun événement de conversion** configuré. Phase 5.
- **Mentions légales et politique de confidentialité** : inexistantes. Phase 6.
- **Agenda des événements** : inexistant, aucun `Event` hors accueil. Phase 7.
- **Fiche Google** : 0 photo de plat pour 50 éléments de menu, 0 post, 0 Q/R, 5 avis sans réponse, catégorie principale « Brasserie ». Phase 9.
- **Off-site** : 0 mail envoyé, 0 annuaire créé, et **tous les brouillons de juillet contiennent des formulations interdites** (« bord de Seine ») ainsi que l'ancienne URL github.io. À réécrire avant tout envoi. Phase 10.
- **Requêtes à zéro impression** : que faire à Sartrouville, guinguette RER A, afterwork Yvelines, anniversaire Sartrouville, concert Sartrouville, terrasse ombragée Sartrouville, bar en plein air Yvelines. Phase 11.
- `originals/` annoncé dans ce fichier depuis juin **n'existe pas** dans le dépôt : les originaux d'images n'ont jamais été conservés.


### Phase 4 — Performance

**Cause racine du critère 8 enfin trouvée.** Le workflow Lighthouse CI tournait vert depuis le 23 juin mais n'a jamais produit un seul artefact : `.lighthouseci/` commence par un point, et `actions/upload-artifact@v4` **ignore les fichiers cachés par défaut**. Le log le disait explicitement (« No files were found with the provided path: .lighthouseci/ ») mais personne n'avait ouvert le log d'un run vert.

Workflow réécrit :
- `include-hidden-files: true` — le correctif du problème ci-dessus.
- URLs mises à jour vers `laguinguettedudispensaire.fr` (il mesurait encore l'ancien domaine github.io) et étendues à 4 pages (accueil, menu, journal, un article).
- Matrice **mobile + desktop** au lieu de mobile seul.
- **Nouveau : un résumé chiffré écrit directement dans `$GITHUB_STEP_SUMMARY`**, donc les scores s'affichent sur la page du run sans avoir à télécharger quoi que ce soit. C'est ce qui manquait pour que la mesure serve à quelque chose.
- `lhci collect` puis `lhci upload` séparés, avec `set -euo pipefail` : une erreur ne peut plus passer inaperçue.

Optimisations appliquées :
- **Images d'en-tête des articles** : les 8 pages du journal chargeaient le JPEG pleine taille en fond CSS (jusqu'à 534 Ko pour `photo13.jpg`). Passées en WebP 960 px via `image-set()` avec repli JPEG, plus un `preload` de l'image LCP sur chaque page.
- **Hero de l'accueil** : `photo3` en 960 px sous 1000 px de large, pleine taille au-delà, avec `preload` conditionnel par `media` — le navigateur ne télécharge que la bonne version.
- **Vignettes du journal** : `srcset` 640/960 avec `sizes` au lieu du fichier pleine taille.
- **Variantes 640/960 générées** pour `photo2` et `photo3`, qui n'en avaient pas.
- **Polices Google rendues non bloquantes** (`preload as=style` + `media="print"` puis `onload`, avec repli `<noscript>`) : supprime ~610–780 ms de blocage du rendu. Vérifié par un A/B avec un hôte de polices instantané : aucune régression.
- **Favicon** en WebP (7 Ko) au lieu du PNG (70 Ko) chargé au premier rendu. L'`apple-touch-icon` reste en PNG, requis par iOS.
- **Contrastes WCAG AA** corrigés partout : pied de page, fil d'Ariane, liens d'article, encadré d'appel à l'action, boutons.

Résultats (Lighthouse 12.8.2, médiane sur 3 mesures, mobile avec throttling 4G simulé) :

| Page | Perf mobile avant → après | Perf desktop | Accessibilité avant → après | Poids avant → après |
|---|:--:|:--:|:--:|:--:|
| index.html | 90 → **98** | 98 → **99** | 96 → **100** | 389 → **248 Ko** |
| blog.html | 95 → **89*** | 97 → **100** | 92 → **100** | 1292 → **858 Ko** |
| guinguette-…-bord-de-seine.html | 97 → **99** | 100 | 86 → **100** | — |
| afterwork-sartrouville.html | — | — | — → **100** | 291 Ko |
| menu.html | — → **100** | — | 95 | 37 Ko |

`*` `blog.html` : son élément LCP est un **texte** (le titre en Playfair Display), et le sandbox de mesure n'a pas accès à `fonts.googleapis.com`. La police n'arrivant jamais, Chrome attend la fin de la période de swap avant de repeindre le texte — d'où un « render delay » de 2,7 s qui représente 52 % du LCP mesuré. Sur le site réel, la police arrive en ~200 ms et ce délai disparaît. FCP et Speed Index de cette page sont à **0,8 s**. Le chiffre de référence viendra du Lighthouse CI corrigé, dès le premier run après merge.

**Accessibilité : 100/100 sur toutes les pages testées**, contre 86–96 avant.

Note : le dossier `originals/` annoncé dans ce fichier depuis juin n'a jamais existé. Les JPEG pleine taille présents dans le dépôt font office d'originaux et sont conservés — aucune image n'est supprimée, seules des variantes plus petites sont ajoutées.

### Phase 5 — Mesure d'audience et conversion

**Umami confirmé sans cookie** : le script `cloud.umami.is/script.js` ne dépose aucun cookie et ne stocke rien côté navigateur. **Aucun bandeau de consentement n'est donc requis.** (Si l'outil avait été GA4, un bandeau aurait été obligatoire.)

- Umami était absent de 4 pages (`venir-…-rer-parking`, `afterwork-sartrouville`, `bar-terrasse-houilles-…`, `annulation`) — les pages publiées après son installation. **Il est maintenant sur les 11 pages publiques, exactement une fois par page, sans aucun doublon.** Aucun second outil de mesure n'a été installé.
- **9 événements de conversion** ajoutés via un écouteur délégué unique de 15 lignes (plus robuste que des attributs `data-umami-event` disséminés sur 11 pages, et plus facile à auditer). Chaque événement porte la page d'origine en propriété, ce qui permet de savoir quelle page convertit.

| Événement | Déclencheur | Vérifié |
|---|---|:--:|
| `clic-reserver` | tout lien vers `#reservation` ou libellé « Réserver » | ✅ |
| `reservation-envoyee` | succès réel de l'envoi du formulaire (+ nombre de personnes) | ✅ |
| `reservation-echec` | échec de l'envoi — permet de détecter une panne silencieuse | ✅ |
| `clic-telephone` | `tel:+33667426565` | ✅ |
| `clic-email` | `mailto:` | ✅ |
| `clic-instagram` | lien Instagram | ✅ |
| `clic-facebook` | lien Facebook | ✅ |
| `clic-itineraire-avis-google` | lien Google Maps (itinéraire et avis) | ✅ |
| `ouverture-menu` | ouverture du menu imprimable | ✅ |

**Méthode de test** : Chromium piloté par Playwright, `window.umami.track` remplacé par un espion, Firebase et Web3Forms simulés pour parcourir la vraie branche de succès du formulaire. Les 9 événements se déclenchent avec le bon nom et le bon contexte de page. Le formulaire renvoie bien « ✓ Merci ! Votre demande est bien reçue » et émet `reservation-envoyee {personnes:"6"}`.

**Reste à faire** : vérifier la remontée réelle dans le tableau de bord Umami — cela suppose que la branche soit mergée (les événements ne peuvent pas remonter depuis une branche non déployée) et un accès au tableau de bord.


---

## ⚠️ Correction importante — la vraie mesure de performance (2026-08-02, run Lighthouse CI #64)

Le Lighthouse CI réparé a tourné pour la première fois. **Les chiffres réels du site en ligne sont nettement plus bas que toutes les estimations précédentes**, y compris les miennes mesurées en local. Voici la vraie ligne de départ, mesurée sur `laguinguettedudispensaire.fr` (état de `main`, avant les optimisations de la Phase 4), médiane sur 3 exécutions :

| Page | Perf **mobile** | Perf desktop | LCP mobile | TBT mobile | Access. | SEO |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| / | **76** | 98 | 3,9 s | 500 ms | 96 | 100 |
| /menu.html | **90** | 99 | 2,9 s | 0 ms | 95 | 100 |
| /blog.html | **74** | 91 | 5,5 s | 0 ms | 92 | 100 |
| /guinguette-…-bord-de-seine.html | **81** | 97 | 4,2 s | 0 ms | 86 | 100 |

**Pourquoi mes mesures locales disaient 90–97 alors que la réalité est 74–90 :** mon environnement d'exécution n'a pas accès à `fonts.googleapis.com` ni à `cloud.umami.is`. Ces deux requêtes échouent instantanément en local alors qu'elles coûtent du temps réel en ligne. Mes chiffres locaux étaient donc **optimistes de 10 à 20 points**. Ce sont les chiffres du tableau ci-dessus qui font foi, et c'est désormais le Lighthouse CI qui les produira automatiquement à chaque push et le 1er de chaque mois.

**Ce que ça change** : les optimisations de la Phase 4 visent précisément ce qui plombe ces scores — l'image d'en-tête pleine taille en fond CSS (LCP mobile de 4 à 5,5 s sur le journal et les articles) et les polices bloquantes. Leur effet réel sera mesuré au prochain run après merge, sur les mêmes pages et avec le même outil. C'est la comparaison qui comptera.

La note du critère 8 est ramenée à **78** (moyenne mobile réelle) au lieu des 97 que j'avais estimés en local. Note globale **94** au lieu de 96.

---

### Phase 6 — Conformité légale

Deux pages créées : `mentions-legales.html` et `confidentialite.html`, dans la charte du site, avec Umami et le suivi des conversions comme les autres pages.

- **Mentions légales** : éditeur (SAS, SIRET 104 994 215 00010, siège 14 rue de Péronne), directeur de publication, hébergeur GitHub Inc., registrar du domaine, propriété intellectuelle, droit à l'image (les photos montrent des clients — une procédure de retrait sur simple demande est prévue), liens sortants, contact.
- **Politique de confidentialité** : résumé en 4 points en tête, responsable du traitement, données du formulaire de réservation et leur finalité, base légale (mesures précontractuelles, art. 6.1.b RGPD), durée de conservation, **les 3 sous-traitants réellement utilisés** (Firebase Firestore pour le stockage, Web3Forms pour la notification, EmailJS pour la confirmation — aucun n'était mentionné nulle part jusqu'ici), Umami et sa nature sans cookie, contenus tiers (Google Fonts et Google Maps chargent l'IP du visiteur), réseaux sociaux, droits RGPD, CNIL, sécurité.
- **Liens en pied de page sur les 12 pages** du site.
- **Mention de consentement sous le formulaire de réservation** : « vos coordonnées sont utilisées uniquement pour traiter votre réservation, elles ne sont ni revendues ni utilisées pour vous démarcher ».
- Les deux pages sont en `index, follow` et ajoutées au sitemap avec une priorité basse : des mentions légales complètes sont un signal de confiance pour Google, autant qu'elles soient indexées.

**Complété le 02/08/2026** à partir des sources officielles (API `recherche-entreprises.api.gouv.fr` de la DINUM, qui alimente l'annuaire des entreprises de l'État, recoupée avec Pappers et societe.com pour le capital et le greffe que l'INSEE ne publie pas) :

| Champ | Valeur | Source |
|---|---|---|
| Dénomination | LA GUINGUETTE DU DISPENSAIRE | API annuaire-entreprises |
| Forme juridique | SAS (code INSEE 5710) | API annuaire-entreprises |
| Capital social | 1 000 € | Pappers + societe.com (RNE/INPI) |
| RCS | Versailles 104 994 215, immatriculée le 15/05/2026 | Pappers |
| SIRET | 104 994 215 00010 (établissement unique) | API annuaire-entreprises |
| TVA intracommunautaire | FR 86 104994215 | **publiée** par l'API officielle (et confirmée par le calcul de clé) |
| Code APE | 5630Z — débits de boissons | API annuaire-entreprises |
| Représentation | Présidente : TMC CAPITAL (SAS, RCS Versailles 104 506 217), représentée par M. Thomas Carpentier de Changy | API annuaire-entreprises |

**Durée de conservation retenue : 12 mois** à compter de la date de réservation (validé par Thomas).

**Point relevé au passage** : *Le Café des Écuries* est une **société distincte** (LE CAFE DES ECURIES, EURL, RCS Versailles 989 189 188, siège 5 rue du Temple à Sartrouville), et non une seconde enseigne de la guinguette. Les mentions légales le précisent désormais, pour que le site n'engage que La Guinguette du Dispensaire.

### Phase 7 — Agenda des événements

Page `agenda.html` créée. C'était le plus gros trou du site : **aucune date n'était publiée nulle part**, ni sur le site, ni dans l'agenda de la Ville, ni chez Sortiraparis ou Infos Yvelines. Toute la programmation vivait uniquement sur Instagram et Facebook, c'est-à-dire invisible pour Google.

**7 événements retrouvés et sourcés** (recherche sur Facebook, Instagram, sartrouville.fr, infosyvelines.fr, sortiraparis.com, actu.fr) :

| Date | Événement | Source |
|---|---|---|
| 10/09/2026 | Yipikiyay en concert | ⚠️ **aucune source publique trouvée** — repris du JSON-LD du site |
| 30/07/2026 | Blind test musical | Instagram |
| 23/07/2026 | Roxane en concert | Événement Facebook |
| 16/07/2026 | The Gates en concert | Affiche Facebook |
| 10/07/2026 | Sylvain Sayim en concert | Instagram + Facebook |
| 02/07/2026 | Bal Burning Legs | Instagram + Facebook |
| 20/06/2026 | DJ set — première soirée de la saison | Événement Facebook |

- **Un bloc `Event` JSON-LD par événement** (7 au total) + `BreadcrumbList`, avec `location`, `organizer`, `performer`, `offers` à 0 € et `isAccessibleForFree: true`.
- **Les événements passés ne disparaissent pas** : ils basculent dans une section « Déjà passés — la saison 2026 en images ». C'est ce contenu daté qui fera vivre la page hors saison.
- Une troisième section liste les rendez-vous organisés par la **Ville de Sartrouville** au Parc du Dispensaire (cardio, zumba, spectacle famille, salon des associations, journées du patrimoine), avec attribution explicite : la guinguette n'en est pas l'organisateur. Ça capte les requêtes « que faire à Sartrouville » sans rien s'attribuer indûment.
- Lien depuis la **navigation principale**, le **pied de page**, la section **Animations** de l'accueil, et ajout au **sitemap** (priorité 0,9, `changefreq` hebdomadaire).

**Deux constats issus de la recherche :**
1. Le concert **Yipikiyay du 10/09** n'est annoncé nulle part publiquement — ni sur Facebook, ni sur Instagram, ni dans l'agenda de la Ville. Il figure dans le JSON-LD du site depuis juillet. À confirmer.
2. **sartrouville.fr publie des horaires faux** pour la guinguette (« tous les jours 10h-21h30 »), et la Ville supprime ses fiches événement une fois passées (la page « Concert à la Guinguette du Dispensaire » renvoie une 404 alors qu'elle est encore dans l'index Google). À signaler à la Ville en Phase 10.


---

## Détail de l'audit — 2026-08-02 (clôture, phases 7 à 12)

### Deltas vs la même journée, phases 0→6

| Critère | phases 0→6 | phases 7→12 | Delta |
|---|:---:|:---:|:---:|
| 3 · JSON-LD | 98 | **99** | ↑ +1 — 7 blocs `Event` validés par Google |
| 6 · Technique | 97 | **98** | ↑ +1 — sitemap 10 → 17 URL |
| 7 · Maillage | 90 | **96** | ↑ +6 — agenda dans la nav, 4 pages reliées, `section.related` enrichie sur 6 pages |
| 9 · SEO local | 96 | **97** | ↑ +1 — 4 pages ciblant des requêtes locales à zéro impression |
| **Global** | **94** | **95** | **↑ +1** |

`*` Critère 8 gelé à 78 : les optimisations de la Phase 4 ne seront mesurables qu'au prochain run Lighthouse CI, après merge.

### Phase 8 — Indexation

- **Sitemap resoumis** (13 URL au moment de la soumission, 17 après le merge de la PR #2). Google indique encore « dernière lecture 31 juil. » : la relecture se fait à son rythme, sous quelques jours.
- **Google a déjà crawlé et validé le nouveau balisage** : le rapport *Améliorations → Événements* affiche **1 élément valide, 0 non valide** et « aucun problème détecté ». Le rapport *Fils d'Ariane* est également actif. Les 7 `Event` de la page agenda entreront au prochain passage.
- **Test des résultats enrichis, sur les URL en ligne** : `/agenda.html` → **8 éléments valides** (7 Événements + 1 fil d'Ariane) ; `/` → **3 éléments valides** (Événement, Commerce local, Organisation). Aucune erreur.
- ⚠️ **La demande d'indexation manuelle n'a pas pu être déclenchée** : l'outil d'inspection d'URL de Search Console rend son résultat dans un cadre que l'automatisation ne peut pas lire. À faire à la main (Search Console → Inspection de l'URL → coller l'URL → *Demander une indexation*) pour : `agenda.html`, `evenement-anniversaire-guinguette-sartrouville.html`, `mentions-legales.html`, `confidentialite.html`, et les 4 pages de la Phase 11 après merge.
- **Migration d'adresse** : toujours « en cours » côté Google. Le `github.io` encore affiché dans les résultats vient de l'index, pas d'un réglage — les champs de la fiche ont été vérifiés, seul le **lien du menu** reste sur l'ancien domaine.

### Phase 9 — Fiche Google

- **12 photos chargées** (1066×1600), préparées en juillet et jamais mises en ligne jusqu'ici. Débloqué en passant par **Google Maps** au lieu de l'éditeur de fiche.
- **Catégorie constatée : Bar (principale) + Restaurant** — l'ancienne note « Brasserie » était périmée. Bon couple, rien à changer. Aucune catégorie « guinguette » n'existe chez Google : le mot doit être porté par la description, les posts, les avis et le site.
- **Kit livré** : 8 posts hebdomadaires jusqu'à mi-octobre, 6 questions/réponses, 4 modèles de réponse aux avis, plan 54 → 150 avis, et le chemin de clics exact pour chaque réglage.
- **Corrections identifiées** : le lien du menu pointe encore sur `github.io` ; l'attribut « Aucun plat à emporter » est à arbitrer par Thomas.
- **Rectification** : j'avais annoncé à tort que la fiche déclarait faire de la livraison. Elle ne le fait pas. J'avais lu la liste des options sur Google Maps sans les coches et les croix, qui disparaissent à l'extraction du texte.

### Phase 10 — Notoriété et liens locaux

Fichier `phase10-notoriete-locale.md` : 9 mails prêts à envoyer, la fiche NAP à coller, les 7 annuaires avec leurs URL d'inscription, et un tableau de suivi.

**Contacts réels vérifiés** : `tourisme@yvelines.fr` · `info@seine-saintgermain.fr` · `mairie@ville-sartrouville.fr` · `courrier.yvelines@actu.fr` · `publicite@sortiraparis.com`.
**Non trouvés, signalés comme tels** : Infos Yvelines et mesinfos.fr (adresses masquées, formulaires indiqués), Le Parisien 78.

**Trois découvertes :**
1. La page « Esprit guinguettes en Yvelines » de destination-yvelines.fr liste **12 guinguettes** (Carrières-sur-Seine, Poissy, Bougival…) et **aucune à Sartrouville**. C'est le trou le plus rentable à combler.
2. **Sortiraparis nous a déjà intégrés à son guide 2026**, mais avec une **adresse fausse** (« 22 Quai de Seine ») et une fin de saison au 30/09. La demande devient une correction.
3. L'article d'Infos Yvelines ne comporte **aucun lien** vers le site.

### Phase 11 — Nouvelles pages

Quatre pages créées, toutes ciblant des requêtes à **zéro impression** aujourd'hui, plus la refonte de la page événement :

| Page | Mots | Cible |
|---|:--:|---|
| `guinguette-pres-de-paris-rer-a.html` | 885 | guinguette près de Paris, guinguette RER A, guinguette Île-de-France |
| `ou-boire-un-verre-terrasse-sartrouville.html` | 882 | où boire un verre Sartrouville, terrasse ombragée |
| `afterwork-boucle-de-seine.html` | 829 | afterwork Yvelines, élargi à Houilles / Montesson / Maisons-Laffitte / Le Mesnil-le-Roi |
| `saison-2027-guinguette-sartrouville.html` | 789 | maintenir le site vivant d'octobre à juin |
| `evenement-anniversaire-…` (refonte) | 1030 | capacités, formules, exemples, délais, et le rappel que le lieu reste ouvert au public |

Tests : 0 formulation interdite · tous les JSON-LD parsent · toutes les images existent · 65 liens internes testés, 0 lien mort · sitemap 13 → 17 URL, XML valide.

### Phase 12 — Industrialisation

- **Skill `seo-guinguette`** livré : il lit `seo-suivi.md` au démarrage pour repartir de l'état réel, porte les règles de fond, les faits de référence, les contraintes techniques découvertes (upload photo par Maps, iframe de l'éditeur, mesures sandbox trompeuses), le déroulé en 7 phases et les 9 critères de notation.
- **PR #2** ouverte pour la Phase 11.

### Correctif CLS — la régression que la phase 4 avait introduite

Le passage des polices Google en chargement asynchrone (phase 4) a fait gagner 1,8 s de LCP et 12 points de performance, mais il a fait **passer le CLS de la page d'article de 0,031 à 0,133** (run Lighthouse CI n° 65, site en ligne, mobile) — au-dessus du seuil « bon » de Google, fixé à 0,1. Le texte s'affichait d'abord en Times / Arial, plus étroit, puis se recomposait à l'arrivée de Playfair Display et Lato.

**Correctif** : cinq déclarations `@font-face` de repli (`Playfair repli`, `Lato repli`) avec `size-adjust`, `ascent-override`, `descent-override` et `line-gap-override`, plus l'extension des piles de polices sur les 19 pages. Aucun fichier ajouté, aucun compromis sur la vitesse : les polices restent non bloquantes.

**Les valeurs ont été mesurées, pas estimées.** Le sandbox n'atteint pas `fonts.googleapis.com` ; les métriques ont donc été relevées dans le navigateur, sur la page en ligne, via `canvas.measureText` :

| Police | Écart de largeur avant | Après |
|---|:--:|:--:|
| Playfair Display 400 | 7,3 % | 0,01 % |
| Playfair Display 700 | 4,6 % | 0,02 % |
| Playfair Display italique | 4,4 % | 0,01 % |
| Lato 400 | 2,7 % | 0,04 % |
| Lato 700 | 6,3 % | 0,04 % |

**Simulation du rendu « avant chargement des polices » sur la page d'article en ligne** — on force la pile de repli et on mesure le déplacement de 20 blocs :

| | Blocs déplacés | Décalage max | Hauteur de page |
|---|:--:|:--:|:--:|
| Sans le correctif (état actuel) | 15 / 20 | 66 px | +65 px |
| Avec le correctif | **0 / 20** | **0 px** | **identique** |

Tests locaux : les 5 `@font-face` sont bien enregistrées dans `document.fonts` sur les 6 pages contrôlées en Chromium headless · 0 erreur JS · CSS complet (157 règles sur l'accueil, 61 sur les articles) · les 19 fichiers sont, au caractère près, la version de la branche plus ce seul correctif.

**Ce qui reste à confirmer** : le CLS réel ne peut pas être reproduit hors ligne, faute d'accès aux polices Google depuis le sandbox. Le chiffre à surveiller est le **CLS de `/guinguette-sartrouville-terrasse-bord-de-seine.html`** dans le prochain run Lighthouse CI déclenché par la mise en ligne — objectif < 0,1, valeur actuelle 0,133.

Commit `e5f0226` sur la branche `PDV86-patch-2` (PR #2).

### Problèmes restants

- **Demandes d'indexation manuelles** à déclencher (voir Phase 8).
- **Lien du menu de la fiche Google** encore sur `github.io`.
- **6 avis sans réponse**, 0 post publié, 0 question/réponse en ligne.
- **0 mail envoyé, 0 annuaire créé** — tout est prêt, rien n'est parti.
- **Photos de l'agenda** : les visuels des groupes manquent ; les publications de la guinguette ne mentionnent aucun compte, donc les groupes ne sont pas identifiables sans Thomas.
- **Concert Yipikiyay du 10/09** toujours non confirmé publiquement.
- **sartrouville.fr publie de faux horaires** et laisse des 404 indexées.
- **infosyvelines.fr annonce « du 3 juin au 30 septembre » et « 17h-21h en semaine »** — faux, et l'article le signale lui-même comme à confirmer. Correction à demander.
- **Aucune inscription à Destination Yvelines ni à Sortiraparis** : leurs pages « guinguettes » citent 12 et 11 adresses, aucune à Sartrouville.
- **CLS de la page d’article** : correctif poussé, à confirmer par le run Lighthouse CI qui suivra la mise en ligne de la PR #2.
