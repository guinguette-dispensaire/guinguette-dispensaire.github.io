# Remontée automatique des ventes — sans ordinateur allumé

Monté le 08/08/2026. Objectif : que les ventes Flatpay remontent seules dans
Firestore, à 22h et 7h, PC éteint.

## Pourquoi ce montage

- **Flatpay n'a pas d'API publique** ni de webhook. Leurs exports automatiques
  nocturnes n'existent que vers e-conomic, Dinero et Billy (logiciels danois).
- **Leurs mails ne servent à rien ici** : « Votre aperçu des ventes est prêt »
  ne part que sur export manuel, et ne contient qu'un lien à durée limitée.
- **Les tâches planifiées du cloud n'atteignent pas le navigateur** de Thomas.

D'où GitHub Actions + un navigateur sans écran.

## Fichiers

- `.github/workflows/remontee-ventes.yml` — cron `0 20` et `0 5` UTC, soit 22h
  et 7h à Paris **en heure d'été**. En hiver ça glisse à 21h et 6h : à ajuster
  à la reprise de saison. Lançable à la main (`workflow_dispatch`).
- `outils/remontee-ventes.mjs` — Playwright + firebase-admin.

## Secrets du dépôt

| Secret | Contenu |
|---|---|
| `FLATPAY_EMAIL` | identifiant du portail Flatpay |
| `FLATPAY_PASSWORD` | son mot de passe |
| `FIREBASE_SERVICE_ACCOUNT` | JSON complet d'un compte de service `guinguette-stocks` |

Le compte de service écrit en contournant les règles Firestore — fonctionnement
normal du SDK Admin, et c'est ce qui permet d'écrire dans `ventes` sans être un
compte de direction.

## Pièges encodés dans le script

Tous viennent d'erreurs réelles rencontrées en août :

1. **Deux caisses** (`1854318182`, `1854318183`). S'il en manque une, la
   journée est **ignorée** plutôt qu'écrite de travers — sinon le CA est divisé
   par deux en silence.
2. **Sessions à cheval** (début 04/08 21h37, fin 05/08 21h06) : une session
   appartient à sa journée de **fermeture**. En juin les tiroirs restaient
   ouverts jusqu'à six jours d'affilée.
3. **Lecture par étiquettes, jamais par position.** Le rapport répète
   « Ventes », « Remboursements », « Chiffre d'affaires » dans chaque bloc de
   paiement. Une première version lisait les remboursements à la place des
   espèces, et un montant à la place du nombre de tickets.
4. **Deux contrôles avant écriture** : `tva20 + tva10 == ca_net` et
   `ca_ht + tva == ca_net`, à deux centimes près. Sinon, pas d'écriture.
5. **Aucun chiffre deviné** : un rapport illisible fait sauter la journée.
6. **Pas de succès silencieux** : toute anomalie met le job en échec, donc mail
   d'alerte GitHub. Une tâche muette est présumée en échec.

Extraction validée le 08/08 contre le rapport réel du 5 août : quatorze champs
corrects, deux contrôles au centime.

## Fragilités

- Double authentification ajoutée par Flatpay → arrêt net sur « Connexion
  refusée ». Pas de contournement, c'est voulu.
- La liste des sessions est lue via les structures internes de React : une
  refonte du portail la casserait, et le script le dirait.
