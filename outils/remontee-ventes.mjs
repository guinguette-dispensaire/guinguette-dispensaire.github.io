/**
 * Remontee automatique des ventes Flatpay vers Firestore.
 *
 * Tourne sur les serveurs de GitHub (Actions), sans aucun ordinateur allume.
 * Se connecte au portail Flatpay avec un navigateur sans ecran, lit les
 * rapports de fin de journee, et ecrit les journees manquantes dans Firestore.
 *
 * Principe qui prime sur tout : ne JAMAIS deviner un chiffre. Une journee dont
 * les controles ne tombent pas juste est ignoree et signalee, jamais ecrite.
 *
 * Secrets attendus (variables d'environnement) :
 *   FLATPAY_EMAIL, FLATPAY_PASSWORD, FIREBASE_SERVICE_ACCOUNT
 */

import { chromium } from 'playwright';
import admin from 'firebase-admin';

const JOURS_EN_ARRIERE = 10;
const CAISSES_CONNUES = ['1854318182', '1854318183'];

const journal = [];
const dire = m => { journal.push(m); console.log(m); };
const anomalies = [];

/* ─── Dates, en heure de Paris ─── */
const aParis = d => new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(d);

function fenetre() {
  const fin = new Date();
  const debut = new Date(fin.getTime() - JOURS_EN_ARRIERE * 86400000);
  const jours = [];
  for (let d = new Date(debut); d <= fin; d = new Date(d.getTime() + 86400000)) jours.push(aParis(d));
  return { debut, fin, jours };
}

/* ─── Firestore ─── */
function firestore() {
  const brut = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!brut) throw new Error("Secret FIREBASE_SERVICE_ACCOUNT absent.");
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(brut)) });
  return admin.firestore();
}

/* ─── Lecture d'un rapport de fin de journee ─── */
const nombre = t => {
  if (t == null) return null;
  const m = String(t).replace(/ | |\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(',', '.')) : null;
};

async function lireRapport(page, sessionId, caisseId) {
  await page.goto(`https://portal.flatpay.com/pos/drawer/${sessionId}-${caisseId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const brut = await page.innerText('main');

  // On raisonne sur des etiquettes, jamais sur des positions fixes : le rapport
  // repete "Ventes", "Remboursements" et "Chiffre d'affaires" dans chaque bloc
  // de paiement, et un decalage en dur donnerait un chiffre faux sans bruit.
  const L = brut.split('\n').map(l => l.trim()).filter(Boolean);
  const ou = (etiquette, depuis = 0) => L.findIndex((l, k) => k >= depuis && l === etiquette);
  const valeurApres = (etiquette, depuis = 0) => { const i = ou(etiquette, depuis); return i === -1 ? null : nombre(L[i + 1]); };

  // Dans un bloc de paiement, la ligne utile est "Chiffre d'affaires".
  const bloc = nom => {
    const i = ou(nom);
    if (i === -1) return 0;
    const j = ou("Chiffre d'affaires", i);
    return j === -1 ? 0 : (nombre(L[j + 1]) ?? 0);
  };

  // Le TTC d'un taux de TVA donne.
  const ttcDuTaux = taux => {
    const i = L.findIndex(l => l.startsWith(`Taux : ${taux}`));
    if (i === -1) return 0;
    const j = ou('TTC', i);
    return j === -1 ? 0 : (nombre(L[j + 1]) ?? 0);
  };

  // Le nombre de commandes est sous "Statistiques", pas dans les blocs de paiement.
  const commandes = () => {
    const i = ou('Statistiques');
    if (i === -1) return null;
    const j = ou('Ventes', i);
    return j === -1 ? null : nombre(L[j + 1]);
  };

  const heure = etiquette => {
    const i = ou(etiquette);
    const m = i === -1 ? null : (L[i + 1] || '').match(/\d{2}:\d{2}/);
    return m ? m[0] : null;
  };

  return {
    ca_net: valeurApres("Chiffre d'affaires net"),
    ca_ht: valeurApres('Ventes hors TVA'),
    tva: valeurApres('TVA collectée'),
    remises: Math.abs(valeurApres('Remises') ?? 0),
    remboursements: Math.abs(valeurApres('Remboursement') ?? 0),
    especes: bloc('Espèces'),
    carte: bloc('Carte'),
    autre: bloc('Autre'),
    ecart_caisse: valeurApres('Différence') ?? 0,
    tickets: commandes(),
    tva20_ttc: ttcDuTaux('20'),
    tva10_ttc: ttcDuTaux('10'),
    ouverture: heure('Date de début'),
    fermeture: heure('Date de fin')
  };
}

/* ─── Programme ─── */
(async () => {
  const { debut, fin, jours } = fenetre();
  dire(`Fenetre examinee : ${jours[0]} -> ${jours[jours.length - 1]}`);

  const db = firestore();
  const deja = new Set();
  const snap = await db.collection('ventes').get();
  snap.forEach(d => deja.add(d.id));
  const manquantes = jours.filter(j => !deja.has(j));
  dire(`${deja.size} journees deja en base. Manquantes sur la fenetre : ${manquantes.length ? manquantes.join(', ') : 'aucune'}`);
  if (!manquantes.length) { dire('Rien a faire.'); return; }

  const navigateur = await chromium.launch();
  const page = await (await navigateur.newContext({ locale: 'fr-FR', timezoneId: 'Europe/Paris' })).newPage();

  try {
    /* Connexion */
    await page.goto('https://portal.flatpay.com/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', process.env.FLATPAY_EMAIL);
    await page.fill('input[name="password"]', process.env.FLATPAY_PASSWORD);
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.click('button[type="submit"]')
    ]);
    await page.waitForTimeout(3000);
    if (page.url().includes('/login')) {
      throw new Error("Connexion a Flatpay refusee. Mot de passe change, ou double authentification activee.");
    }
    dire('Connecte au portail Flatpay.');

    /* Liste des sessions de caisse sur la fenetre */
    const bornes = `fromDate=${debut.toISOString()}&toDate=${new Date(fin.getTime() + 86400000).toISOString()}`;
    await page.goto(`https://portal.flatpay.com/pos/drawer?pageIndex=0&${bornes}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const sessions = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('tr').forEach(tr => {
        const k = Object.keys(tr).find(k => k.startsWith('__reactFiber'));
        if (!k) return;
        let f = tr[k], n = 0;
        while (f && n++ < 12) {
          const p = f.memoizedProps;
          if (p && p.row && p.row.original) {
            const o = p.row.original;
            out.push({ id: o.id, caisse: o.drawerId, debut: o.startDate, fin: o.closedDate });
            return;
          }
          f = f.return;
        }
      });
      return out;
    });
    dire(`${sessions.length} sessions de caisse trouvees.`);
    if (!sessions.length) throw new Error("Aucune session lue : la page a change de structure.");

    /* Une session appartient a sa journee de FERMETURE. */
    const parJour = {};
    for (const s of sessions) {
      if (!s.fin) continue;                       // caisse encore ouverte : on ne touche pas
      const jour = String(s.fin).slice(0, 10);
      (parJour[jour] = parJour[jour] || []).push(s);
    }

    for (const jour of manquantes) {
      const lot = parJour[jour];
      if (!lot || !lot.length) { dire(`${jour} : aucun rapport de caisse -> journee fermee, rien a ecrire.`); continue; }

      const caisses = new Set(lot.map(s => String(s.caisse)));
      const attendues = CAISSES_CONNUES.filter(c => caisses.has(c));
      if (attendues.length < CAISSES_CONNUES.length) {
        anomalies.push(`${jour} : ${caisses.size} caisse(s) au lieu de ${CAISSES_CONNUES.length}. Journee ignoree pour ne pas diviser le chiffre d'affaires.`);
        continue;
      }

      const parts = [];
      for (const s of lot) parts.push(await lireRapport(page, s.id, s.caisse));
      if (parts.some(p => p.ca_net == null || p.tickets == null)) {
        anomalies.push(`${jour} : un rapport n'a pas pu etre lu. Journee ignoree.`);
        continue;
      }

      const somme = c => +parts.reduce((t, p) => t + (p[c] || 0), 0).toFixed(2);
      const heures = parts.map(p => p.ouverture).filter(Boolean).sort();
      const fins = parts.map(p => p.fermeture).filter(Boolean).sort();

      const j = {
        date: jour,
        ca_net: somme('ca_net'), ca_ht: somme('ca_ht'), tva: somme('tva'),
        tickets: somme('tickets'), especes: somme('especes'), carte: somme('carte'),
        autre: somme('autre'), remboursements: somme('remboursements'), remises: somme('remises'),
        tva20_ttc: somme('tva20_ttc'), tva10_ttc: somme('tva10_ttc'),
        ecart_caisse: somme('ecart_caisse'),
        ouverture: heures[0] || null, fermeture: fins[fins.length - 1] || null,
        source: 'flatpay-fin-de-journee', maj: Date.now()
      };

      const ecart1 = Math.abs((j.tva20_ttc + j.tva10_ttc) - j.ca_net);
      const ecart2 = Math.abs((j.ca_ht + j.tva) - j.ca_net);
      if (ecart1 > 0.02 || ecart2 > 0.02) {
        anomalies.push(`${jour} : controles echoues (TVA ${ecart1.toFixed(2)}, HT+TVA ${ecart2.toFixed(2)}). Journee ignoree.`);
        continue;
      }

      await db.collection('ventes').doc(jour).set(j, { merge: true });
      dire(`${jour} : ecrit. CA net ${j.ca_net} EUR, ${j.tickets} tickets, especes ${j.especes} EUR` +
           (j.ecart_caisse ? `, ECART DE CAISSE ${j.ecart_caisse} EUR` : ''));
      if (j.ecart_caisse) anomalies.push(`${jour} : ecart de caisse de ${j.ecart_caisse} EUR.`);
    }
  } finally {
    await navigateur.close();
  }

  if (anomalies.length) {
    console.log('\n--- A REGARDER ---');
    anomalies.forEach(a => console.log('  ' + a));
    process.exitCode = 1;   // fait echouer l'action : GitHub envoie un mail
  } else {
    dire('Termine sans anomalie.');
  }
})().catch(e => {
  console.error('ECHEC : ' + e.message);
  process.exit(1);
});
