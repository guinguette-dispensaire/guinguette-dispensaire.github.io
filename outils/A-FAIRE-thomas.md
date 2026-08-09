# Ce qu'il reste à faire — et que Claude ne peut pas faire

Mis à jour le 08/08/2026. Cinq étapes, dans cet ordre.

**Étapes 1 et 2 : faites.** Vérifié le 08/08 — la clé Firebase est générée et
les trois secrets sont posés sur le dépôt. Il reste les étapes 3, 4 et 5,
soit une dizaine de minutes.

Ce qui est déjà fait n'apparaît pas ici : le script, la programmation, le
bouton, les droits à l'écran, l'onglet Caisse et ses 39 mouvements.

---

## 1 · La clé Firebase (3 min)

Elle permet à la remontée automatique d'écrire dans la base sans être connectée
en tant que quelqu'un.

Lien direct, connecté avec `tdechangy@gmail.com` :
<https://console.firebase.google.com/project/guinguette-stocks/settings/serviceaccounts/adminsdk>

Bouton **Générer une nouvelle clé privée** → **Générer**. Un fichier `.json`
se télécharge : ouvre-le avec le Bloc-notes et laisse-le ouvert.

> Le projet est bien **guinguette-stocks**. `guinguette-dispensaire` est
> l'ancien, abandonné le 3 août.

> Ce fichier est un mot de passe. Ne le mets pas dans le dépôt, ne l'envoie
> à personne. Une fois l'étape 2 finie, tu peux le supprimer de ton disque.

---

## 2 · Les trois secrets GitHub (5 min)

Lien direct :
<https://github.com/guinguette-dispensaire/guinguette-dispensaire.github.io/settings/secrets/actions>

Puis bouton **New repository secret**, trois fois :

| Name | Secret |
|---|---|
| `FLATPAY_EMAIL` | ton identifiant du portail Flatpay |
| `FLATPAY_PASSWORD` | ton mot de passe Flatpay |
| `FIREBASE_SERVICE_ACCOUNT` | **tout** le contenu du fichier `.json`, de la première accolade à la dernière |

Pour le troisième : dans le Bloc-notes, `Ctrl+A` puis `Ctrl+C`, et colle tel
quel. Les retours à la ligne ne gênent pas.

**C'est bon quand** la page liste trois secrets. GitHub ne les réaffichera
jamais — c'est normal.

---

## 3 · Publier les fichiers (2 min)

Dans **GitHub Desktop** :

1. Coche ces fichiers, et **eux seuls** :
   - `admin.html`
   - `.github/workflows/remontee-ventes.yml`
   - `outils/remontee-ventes.mjs`
   - `outils/demande-en-attente.mjs`
   - `outils/README-remontee-ventes.md`
   - `outils/A-FAIRE-thomas.md`
2. Décoche tout le reste — une trentaine de fichiers apparaissent comme
   modifiés alors que seules leurs fins de ligne diffèrent. Les publier
   réécrirait des milliers de lignes pour rien
3. Message : `Remontee automatique des ventes`
4. **Commit to main**, puis **Push origin**

**C'est bon quand** GitHub Desktop n'affiche plus « Push origin » avec un
compteur.

---

## 4 · Compléter les règles Firestore (3 min)

Deux ajouts à ce que tu as publié ce matin. Le reste ne bouge pas.

Lien direct :
<https://console.firebase.google.com/project/guinguette-stocks/firestore/databases/-default-/security/rules>

**a)** Sous la fonction `equipe()`, ajoute :

```
    // Administrateur : seul compte pouvant declencher la remontee.
    function admin() {
      return request.auth != null
        && request.auth.token.email == 'tdechangy@gmail.com';
    }
```

**b)** Juste avant la dernière ligne `match /{document=**}`, ajoute :

```
    match /commandes/{doc} { allow read: if proprietaire(); allow write: if admin(); }
```

Puis **Publier**.

**C'est bon quand** le bandeau rouge n'apparaît pas et qu'une nouvelle ligne
datée d'aujourd'hui s'ajoute dans la colonne de gauche.

---

## 5 · Le premier essai (2 min + 5 min d'attente)

Lien direct :
<https://github.com/guinguette-dispensaire/guinguette-dispensaire.github.io/actions>

Colonne de gauche → **Remontee des ventes Flatpay** → bouton **Run workflow**
→ **Run workflow**. Attends deux à trois minutes, puis ouvre l'exécution et
déplie **Remonter les ventes**.

**C'est bon quand** le journal liste les journées écrites, du genre
`2026-08-06 : ecrit. CA net 1234.5 EUR, 87 tickets`.

**Si c'est rouge**, ne cherche pas : envoie-moi une capture du journal. Le
script est fait pour dire précisément ce qui a coincé — mot de passe refusé,
page changée, contrôle de TVA qui ne tombe pas.

---

## Ce que Claude ne peut pas faire, et pourquoi

- **Saisir un mot de passe ou manipuler une clé** — limite qu'il s'applique,
  y compris quand on le lui demande. Collés directement par toi dans GitHub,
  ces secrets sont chiffrés et il ne les voit jamais.
- **Écrire dans l'éditeur de règles Firestore** — bloqué par une sécurité de
  son environnement. Il peut lire la page et cliquer, pas taper dedans.
- **Pousser sur le dépôt** — non autorisé pour sa session. Se lève en ajoutant
  le dépôt aux sources autorisées, et alors il poussera lui-même.

---

## Le planning — ce qui a changé le 09/08/2026

Le tableau du Drive et l'outil se recopient maintenant l'un l'autre. Tu peux
modifier une journée des deux côtés, indifféremment.

Ce qui a été fait sans toi :

- le tableau `Planning_presence_Guinguette` est partagé en **Éditeur** avec le
  compte technique `firebase-adminsdk-fbsvc@guinguette-stocks.iam.gserviceaccount.com` ;
- l'**API Google Sheets** est activée sur le projet `guinguette-stocks` ;
- les 131 journées du tableau (23 juin → 31 octobre) sont dans la base ;
- `outils/sync-planning.mjs` synchronise les deux sens, branché sur les
  passages de 22h et 7h et sur le bouton « Lancer la remontée maintenant » ;
- l'onglet Planning a un bouton **modifier** sur chaque journée et une vue
  **mon planning**.

Ce que le robot n'écrit jamais dans le tableau : la colonne **Statut** et
toutes les colonnes à droite. Ce sont des formules, elles se recalculent
seules. Il ne touche que les horaires, la durée et les six colonnes de
prénoms.

En cas de modification des deux côtés le même jour, **c'est l'outil qui
gagne**, et la valeur du tableau qui a été écrasée est gardée dans la journée
(champ `conflit`) — rien ne disparaît en silence.

### Ce qu'il te reste à faire

**Pousser le dépôt.** Ouvre GitHub Desktop et clique sur *Push origin*. Le
commit est déjà fait, il s'appelle « Planning : synchronisation dans les deux
sens… ». Sans ce clic, rien de tout ça n'est en ligne.
