// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION FIREBASE — La Guinguette du Dispensaire
//
//  Projet : guinguette-stocks  (Firestore, région europe-west9 / Paris)
//  Migration du 03/08/2026 : l'ancien projet « guinguette-dispensaire »
//  a été abandonné, son compte Google propriétaire étant introuvable.
//  Les 38 réservations ont été réimportées avec leurs identifiants
//  d'origine, pour que les liens d'annulation déjà envoyés aux clients
//  continuent de fonctionner.
//
//  Note : ces clés ne sont pas secrètes — la sécurité est assurée
//  par les règles Firestore et l'authentification.
// ═══════════════════════════════════════════════════════════════

export const firebaseConfig = {
  apiKey: "AIzaSyCpm3tlXr3TX3jF7s0F2WR1t67KIVJCg98",
  authDomain: "guinguette-stocks.firebaseapp.com",
  projectId: "guinguette-stocks",
  storageBucket: "guinguette-stocks.firebasestorage.app",
  messagingSenderId: "765011657714",
  appId: "1:765011657714:web:f87e8de1ebd55e7461216b"
};
