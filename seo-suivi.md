# Suivi SEO — La Guinguette du Dispensaire

Site : https://guinguette-dispensaire.github.io · Cible : **SEO local** (Sartrouville et boucle de Seine — Houilles, Maisons-Laffitte, Le Mesnil-le-Roi, Montesson, Yvelines).

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

> `*` Critère 8 : note **estimée en lab** à partir des preuves techniques (poids des images, image LCP, polices). L'API PageSpeed Insights n'était pas joignable depuis l'environnement d'exécution. Le workflow **Lighthouse CI** proposé fournira des mesures réelles et automatiques à partir de la prochaine exécution.

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

### Problèmes restants à traiter (prochaines itérations)

- **Mesure CWV réelle** : activer le workflow Lighthouse CI (proposé) ou lancer PageSpeed Insights manuellement pour remplacer la note estimée du critère 8.
- **Téléphone visible** : ajouter le numéro dans le bloc « Contact » pour une cohérence NAP parfaite (web ↔ Google Business ↔ annuaires). *Décision éditoriale — à valider.*
- **Images responsives** : passer à un `srcset` multi-tailles (ex. 640/960/1280) pour gagner encore sur mobile (actuellement une seule taille 1280 px max).
- **Titres Hn de `menu.html`** : convertir les `<span class="section-title">` en `<h2>` pour la sémantique.
- **Off-site** : voir la checklist `checklist-offsite-seo.md` (Google Business Profile, citations locales, backlinks).
- **`carte.png`** (954 Ko) n'est référencé par aucune page — fichier orphelin, peut être supprimé du dépôt (laissé en place pour l'instant, non chargé donc sans impact perf).
