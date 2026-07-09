# Rapport de déploiement — Module de réservations « La Guinguette du Dispensaire »

Date : 8 juillet 2026
Site : https://guinguette-dispensaire.github.io

## Résumé

Le module de réservation (Firestore + page admin + page d'annulation) est **déployé et fonctionnel en production**. La chaîne complète a été testée de bout en bout : formulaire public → enregistrement Firestore → validation par l'équipe → annulation par le client. **Seul l'envoi d'emails automatiques (EmailJS) reste à configurer** — le reste fonctionne, l'email est proprement désactivé en attendant.

## État par étape

| Étape | Résultat | Détail |
|---|---|---|
| A1 — Projet Firebase | ✅ | `guinguette-dispensaire` créé sous le compte de l'équipe, forfait Spark (gratuit), Google Analytics désactivé |
| A2 — Firestore | ✅ | Base en **mode production**, emplacement **europe-west9 (Paris)** |
| A3 — Règles de sécurité | ✅ | Règles publiées, logique identique à `firestore.rules`, aucune erreur de compilation |
| A4 — Authentication | ✅ | Fournisseur **E-mail/Mot de passe activé** (lien magique laissé désactivé) |
| A5 — Compte admin | ✅ | `laguinguettedudispensaire@gmail.com` créé (voir identifiants ci-dessous) |
| A6 — Application web | ✅ | App « site-guinguette » ajoutée (sans Hosting), clés `firebaseConfig` récupérées |
| A7 — firebase-config.js | ✅ | Rempli avec les vraies clés |
| B — EmailJS | ⚠️ **À finaliser** | Compte/clé non configurés (création de compte + captcha impossibles en autonomie). L'admin fonctionne sans ; l'email est désactivé proprement |
| C — Contrôle pré-déploiement | ✅ | Plus aucun `COLLER_ICI` dans `firebase-config.js` ; `index.html` importe bien `./firebase-config.js` |
| D — Déploiement (repo) | ✅ | Dépôt cloné, 4 fichiers déposés, 2 commits poussés sur `main`, GitHub Pages en ligne |
| E1 — Réservation test | ✅ | Formulaire → doc Firestore créé + message « ✓ Merci ! » en page |
| E3 — Admin (listing) | ✅ | Connexion admin OK, réservation listée « En attente » |
| E4 — Validation | ✅ | Statut → validée. Email non envoyé (EmailJS non configuré) — comportement attendu |
| E5 — Annulation client | ✅ | Page `annulation.html?id=…` → « Réservation annulée ✓ » |
| E7 — Vérif Firestore | ✅ | Document : `statut = "annulee"`, `annuleParClient = true` |
| E4/E5 — Emails | ⚠️ | Non testés : dépendent d'EmailJS (voir ci-dessous) |
| Nettoyage | ✅ | Les 2 réservations de test supprimées — base vide et propre |

## Identifiants créés

**Compte admin de la page de gestion** (Firebase Authentication — distinct du compte Gmail) :

- Identifiant : `laguinguettedudispensaire@gmail.com`
- Mot de passe : `Gug3BaVvuJUj4B7G=xK%`

Recommandation : changer ce mot de passe et le partager avec Ema par un canal sûr (gestionnaire de mots de passe, pas par email/SMS en clair).

## IDs de référence

- Firebase `projectId` : `guinguette-dispensaire`
- EmailJS : *à compléter une fois configuré* (Service ID / Template ID / Public Key)

## URLs

- Site public (formulaire) : https://guinguette-dispensaire.github.io
- Page admin (équipe) : https://guinguette-dispensaire.github.io/admin.html
- Page d'annulation : https://guinguette-dispensaire.github.io/annulation.html?id=IDENTIFIANT

## Points de vigilance

1. **EmailJS non configuré (à finaliser).** Tant que ce n'est pas fait, aucun email automatique n'est envoyé au client. La page admin fonctionne parfaitement : l'équipe valide/refuse les demandes, mais doit prévenir le client par téléphone. Pour activer les emails, il faut créer/connecter un compte EmailJS, ajouter le service Gmail (OAuth), créer le template ({{to_email}} / {{sujet}} / {{corps}}), puis coller les 3 clés dans le bloc `CONFIG EMAILJS` en haut de `admin.html` et re-committer.

2. **Incident corrigé au déploiement.** Le premier envoi de `firebase-config.js` avait été tronqué (problème d'écriture de fichier sur le montage Windows), ce qui cassait tout le module. Corrigé et re-poussé (commit « Corrige firebase-config.js tronqué… »). Vérifié : le fichier servi en ligne est complet.

3. **Formulaire toujours relié à Web3Forms en secours.** Le formulaire envoie la demande à Firestore ET, en parallèle, une notification à l'équipe via Web3Forms (comportement historique conservé par l'auteur du module). Rien à faire, mais bon à savoir.

4. **Dépôt local.** Le clone se trouve dans `C:\Users\PC\Desktop\guinguette-dispensaire-deploy`.
