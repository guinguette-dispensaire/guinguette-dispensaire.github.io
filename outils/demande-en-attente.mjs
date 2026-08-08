/**
 * Y a-t-il une demande de remontee en attente, posee depuis le bouton de
 * l'outil ? Sort en code 0 si oui, 1 si non. Ne fait rien d'autre : c'est le
 * portier des passages de quart d'heure, il doit rester leger.
 */
import admin from 'firebase-admin';

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const d = await admin.firestore().collection('commandes').doc('remontee').get();
const c = d.exists ? d.data() : {};
const enAttente = c.demandee && (!c.traitee || Number(c.traitee) < Number(c.demandee));

if (enAttente) {
  console.log(`Demande en attente, posee par ${c.par || '?'} il y a ${Math.round((Date.now() - Number(c.demandee)) / 60000)} min.`);
  process.exit(0);
}
console.log('Aucune demande en attente.');
process.exit(1);
