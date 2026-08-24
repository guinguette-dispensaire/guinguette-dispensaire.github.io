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

const JOURS_EN_ARRIERE = 21;
const CAISSES_CONNUES = ['1854318182', '1854318183'];

/* Journees dont le tiroir est reste ouvert plusieurs jours d'affilee : aucun
   rapport journalier n'existe pour elles, et les recoller collerait plusieurs
   jours de recettes sur une seule date. Leurs chiffres viennent du journal des
   commandes du premier import, qui est juste. On n'y touche jamais. */
const JOURNEES_INTOUCHABLES = ['2026-06-06', '2026-06-07', '2026-06-08', '2026-06-14', '2026-06-25'];

/* Reconsolidation : relit et reecrit une periode entiere, meme deja en base.
   Pilotee depuis GitHub (Run workflow), jamais automatique. */
const RECONSOLIDER = process.env.RECONSOLIDER === 'oui';
const DEPUIS = process.env.DEPUIS || '';
const JUSQUA = process.env.JUSQUA || '';

const journal = [];
const dire = m => { journal.push(m); console.log(m); };
const anomalies = [];

/* ─── Dates, en heure de Paris ─── */
const aParis = d => new Intl.DateTimeFormat('fr-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(d);

function fenetre() {
  const fin = JUSQUA ? new Date(JUSQUA + 'T23:59:59') : new Date();
  const debut = DEPUIS ? new Date(DEPUIS + 'T00:00:00')
                       : new Date(fin.getTime() - JOURS_EN_ARRIERE * 86400000);
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

/* ─── Le journal des commandes ───
   La source de secours, et la vraie reponse au probleme : les rapports de fin
   de journee n'existent que si le tiroir a ete cloture. Le journal des
   commandes, lui, existe toujours — chaque encaissement y figure des qu'il est
   passe. Quand une seule caisse sur deux a ete clôturee (ou aucune), on
   reconstitue la journee ici plutot que de la jeter.
   Ce qu'on n'a pas par cette voie : la ventilation de TVA et le HT. L'outil
   sait deja estimer le HT des journees qui en manquent. */

/** Le decalage de Paris sur l'UTC, en minutes, a une date donnee. */
function decalageParis(d) {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', timeZoneName: 'longOffset'
  }).format(d);
  const m = s.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 120;
  const signe = m[1] === '-' ? -1 : 1;
  return signe * (Number(m[2]) * 60 + Number(m[3]));
}

/** Minuit a minuit, heure de Paris, exprime en UTC. */
function bornesDuJour(jour) {
  const dec = decalageParis(new Date(`${jour}T12:00:00Z`));
  const debut = new Date(Date.parse(`${jour}T00:00:00Z`) - dec * 60000);
  return { debut, fin: new Date(debut.getTime() + 86400000 - 1000) };
}

const SANS_ACCENT = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

async function lireJournal(page, jour) {
  const { debut, fin } = bornesDuJour(jour);
  await page.goto('https://portal.flatpay.com/pos/orders?pageIndex=0&status=all'
    + `&fromDate=${debut.toISOString()}&toDate=${fin.toISOString()}&sorting=orderId-desc`,
    { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  /* La page affiche vingt commandes a la fois et ne se defile pas : la suite
     est derriere le bouton « Suivant », en bas. Les parametres de date de
     l'URL, eux, sont bien respectes — contrairement a la page des produits. */
  const moisson = await page.evaluate(async () => {
    const nombre = t => {
      const m = String(t || '').replace(/\s|\u00a0/g, '').match(/-?\d+(?:[.,]\d+)?/);
      return m ? parseFloat(m[0].replace(',', '.')) : null;
    };
    /* Les colonnes se lisent par leur intitule, jamais par leur position :
       « Commande N° | Date | Statut | Paiement | Personnel | Remise | Total ».
       Flatpay a deja deplace des colonnes une fois cet ete. */
    const reperes = () => {
      const tbl = document.querySelector('table');
      if (!tbl) return null;
      const th = [...tbl.querySelectorAll('thead th')].map(h => h.innerText.trim().toLowerCase());
      const col = re => th.findIndex(h => re.test(h));
      return { th, iNum: col(/commande|n°|order/), iStatut: col(/statut|status/),
               iPaie: col(/paiement|payment/), iTotal: col(/^total$|montant/) };
    };
    const lire = () => {
      const c = reperes();
      if (!c || c.iTotal < 0) return [];
      const out = [];
      document.querySelectorAll('tbody tr').forEach(tr => {
        const td = [...tr.querySelectorAll('td')].map(x => x.innerText.trim());
        if (td.length < 3) return;
        out.push({
          num: c.iNum >= 0 ? td[c.iNum] : td[0],
          statut: c.iStatut >= 0 ? td[c.iStatut] : '',
          paiement: c.iPaie >= 0 ? td[c.iPaie] : '',
          total: nombre(td[c.iTotal])
        });
      });
      return out;
    };
    const bouton = mot => [...document.querySelectorAll('button, [role="button"], a')]
      .find(b => new RegExp(`^${mot}$`, 'i').test((b.textContent || '').trim()) && !b.disabled);

    const vu = new Map();
    lire().forEach(r => vu.set(r.num, r));
    /* « fini » ne vaut vrai que si on est alle jusqu'au bout : le bouton
       « Suivant » grise. S'arreter parce que la boucle a atteint sa limite ou
       parce qu'une page n'a rien apporte de neuf, ce n'est pas la meme chose —
       et un total ampute ressemble a un vrai total. */
    let pages = 1, fini = false;
    for (let i = 0; i < 60; i++) {
      const b = bouton('suivant') || bouton('next');
      if (!b) { fini = true; break; }
      const avant = vu.size;
      b.click();
      await new Promise(r => setTimeout(r, 1800));
      lire().forEach(r => vu.set(r.num, r));
      if (vu.size === avant) break;
      pages++;
    }
    return { entetes: (reperes() || {}).th || [], pages, fini, lignes: [...vu.values()] };
  });

  if (!moisson.entetes.length) throw new Error("journal des commandes illisible (pas d'en-tetes)");
  const lignes = moisson.lignes;
  if (!lignes.length) return null;

  if (!moisson.fini)
    throw new Error(`la pagination ne s'est pas terminee proprement apres ${moisson.pages} page(s) `
      + `et ${lignes.length} commandes — on n'ecrit pas un total peut-etre ampute`);

  /* Les numeros de commande ne se suivent pas toujours : le 20 aout, trente
     commandes s'etalaient sur trente-six numeros. On le note, on n'en fait pas
     un motif de refus. */
  const nums = lignes.map(l => Number(String(l.num).replace(/\D/g, ''))).filter(n => n > 0);
  if (nums.length === lignes.length && nums.length > 1) {
    const etendue = Math.max(...nums) - Math.min(...nums) + 1;
    if (etendue !== nums.length)
      console.log(`  ${jour} : ${nums.length} commandes sur ${etendue} numeros `
        + `(${Math.min(...nums)}-${Math.max(...nums)}) — des numeros non utilises, c'est normal.`);
  }

  const utiles = lignes.filter(l => l.total != null && !/annul/.test(SANS_ACCENT(l.statut)));
  if (!utiles.length) return null;

  /* Un encaissement peut etre partage — « Carte, Espèces ». Le journal ne dit
     pas comment. Plutot que d'inventer une repartition, on ne publie la
     ventilation que si toutes les commandes ont un moyen unique. */
  let total = 0, mixtes = 0;
  const sacs = { especes: 0, carte: 0, autre: 0 };
  for (const l of utiles) {
    const p = SANS_ACCENT(l.paiement);
    const m = Number(l.total) || 0;
    total += m;
    const esp = /espece|cash/.test(p), cb = /carte|card/.test(p);
    if (esp && cb) { mixtes++; sacs.autre += m; }
    else if (esp)  sacs.especes += m;
    else if (cb)   sacs.carte += m;
    else           sacs.autre += m;
  }
  const rond = x => +x.toFixed(2);
  const j = {
    date: jour, ca_net: rond(total), tickets: utiles.length,
    remboursements: 0, remises: 0, ecart_caisse: 0,
    pages_lues: moisson.pages,
    source: 'flatpay-journal-commandes', complet: false, maj: Date.now()
  };
  if (mixtes) j.paiements_mixtes = mixtes;
  else { j.especes = rond(sacs.especes); j.carte = rond(sacs.carte); j.autre = rond(sacs.autre); }
  return j;
}

/* ─── Mix produit (ce qui a ete vendu) ───
   Compartiment separe : cette page est nettement plus capricieuse que les
   rapports de fin de journee. Elle ignore les parametres d'URL, il faut passer
   par le selecteur de dates, et elle affiche parfois "Aucune vente" alors que
   les donnees existent — il faut toucher un autre controle pour la reveiller.
   Un echec ici ne doit PAS empecher les journees de remonter : on le signale,
   et on ne fait echouer le job que si le mix n'a pas bouge depuis 3 jours. */
async function lireMixProduit(page) {
  await page.goto('https://portal.flatpay.com/pos/saleafterproduct', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const tableauRempli = async () => {
    const t = await page.innerText('main').catch(() => '');
    if (/Aucune vente/i.test(t)) return false;
    return (await page.locator('tbody tr').count()) > 3;
  };

  // Reveil paresseux : jusqu'a trois tentatives en touchant les controles.
  for (let essai = 0; essai < 3; essai++) {
    if (await tableauRempli()) break;
    const filtre = page.locator('button, [role="combobox"]').filter({ hasText: /cat[ée]gorie/i }).first();
    if (await filtre.count()) { await filtre.click().catch(() => {}); await page.waitForTimeout(1200); await page.keyboard.press('Escape').catch(() => {}); }
    await page.waitForTimeout(2500);
  }
  if (!await tableauRempli()) throw new Error("page 'ventes par produit' vide apres trois tentatives");

  /* Les colonnes se lisent par leur intitule. Flatpay les a deja deplacees une
     fois — en aout 2026 le tableau est devenu
     « Produit | Categorie | Ventes | Remise | Total », et la lecture par
     position rangeait la remise dans les unites et laissait passer des prix de
     carte en guise de chiffre d'affaires. Si un intitule manque, on s'arrete :
     mieux vaut un mix perime qu'un mix faux. */
  const lu = await page.evaluate(() => {
    const n = t => { const m = String(t||'').replace(/\s| /g,'').match(/-?\d+(?:[.,]\d+)?/); return m ? parseFloat(m[0].replace(',','.')) : 0; };
    const tbl = document.querySelector('table');
    if (!tbl) return { entetes: [], lignes: [] };
    const th = [...tbl.querySelectorAll('thead th')].map(h => h.innerText.trim().toLowerCase());
    const col = re => th.findIndex(h => re.test(h));
    const iNom = col(/produit|article/), iCat = col(/cat[ée]gorie/);
    const iQte = col(/^ventes$|quantit|unit/), iCa = col(/^total$|chiffre|montant/);
    const lignes = [...tbl.querySelectorAll('tbody tr')].map(tr => {
      const c = [...tr.querySelectorAll('td')].map(td => td.innerText.trim());
      if (c.length < 3) return null;
      return {
        nom: c[iNom >= 0 ? iNom : 0] || '',
        categorie: iCat >= 0 ? (c[iCat] || '') : '',
        unites: iQte >= 0 ? n(c[iQte]) : 0,
        ca: iCa >= 0 ? n(c[iCa]) : 0
      };
    }).filter(Boolean);
    return { entetes: th, manque: { qte: iQte < 0, ca: iCa < 0 }, lignes };
  });
  if (lu.manque && (lu.manque.qte || lu.manque.ca))
    throw new Error(`colonnes du tableau non reconnues : ${lu.entetes.join(' | ')}`);
  const lignes = lu.lignes;
  if (!lignes.length) throw new Error("aucune ligne de produit lue");
  console.log(`  colonnes lues : ${lu.entetes.join(' | ')}`);

  const parCategorie = {};
  for (const l of lignes) {
    const k = l.categorie || 'Sans categorie';
    parCategorie[k] = parCategorie[k] || { nom: k, unites: 0, ca: 0 };
    parCategorie[k].unites += l.unites; parCategorie[k].ca += l.ca;
  }
  // Les totaux financiers de la periode, lus sur la meme page. Sans eux, ecrire
  // une date de fin a jour a cote de montants perimes serait un mensonge muet.
  const brut = await page.innerText('main').catch(() => '');
  const L2 = brut.split('\n').map(l => l.trim()).filter(Boolean);
  const n2 = t => { const m = String(t||'').replace(/\s| /g,'').match(/-?\d+(?:[.,]\d+)?/); return m ? parseFloat(m[0].replace(',','.')) : null; };
  const apres = e => { const i = L2.findIndex(l => l === e); return i === -1 ? null : n2(L2[i+1]); };
  const totaux = {};
  const ttc = apres('Total TTC') ?? apres("Chiffre d'affaires brut") ?? apres("Chiffre d'affaires");
  const ht  = apres('Total HT')  ?? apres('Ventes hors TVA');
  const tva = apres('Total TVA') ?? apres('TVA collectée');
  if (ttc != null) totaux.ca_ttc = ttc;
  if (ht  != null) totaux.ca_ht  = ht;
  if (tva != null) totaux.tva    = tva;

  const arrondir = o => ({ ...o, ca: +o.ca.toFixed(2) });
  return {
    ...totaux,
    totauxLus: Object.keys(totaux).length === 3,
    produits: lignes.length,
    unites: lignes.reduce((t,l) => t + l.unites, 0),
    categories: Object.values(parCategorie).map(arrondir).sort((a,b) => b.ca - a.ca),
    top: lignes.slice().sort((a,b) => b.ca - a.ca).slice(0,15).map(arrondir)
  };
}

/* ─── Programme ─── */
(async () => {
  const { debut, fin, jours } = fenetre();
  dire(`Fenetre examinee : ${jours[0]} -> ${jours[jours.length - 1]}`);

  const db = firestore();
  const deja = new Map();
  const snap = await db.collection('ventes').get();
  snap.forEach(d => deja.set(d.id, d.data()));

  /* Une journee reconstituee depuis le journal des commandes n'est qu'un
     depannage : elle n'a ni TVA ni HT. On la repasse tant que les caisses
     peuvent encore etre clôturees, pour la remplacer par le vrai rapport. */
  const partielle = d => (deja.get(d) || {}).source === 'flatpay-journal-commandes';
  const manquantes = (RECONSOLIDER ? jours.slice()
                                   : jours.filter(j => !deja.has(j) || partielle(j)))
    .filter(j => { if (JOURNEES_INTOUCHABLES.includes(j)) { dire(`${j} : ecartee — tiroir reste ouvert plusieurs jours, pas de rapport journalier.`); return false; } return true; });
  if (RECONSOLIDER) dire('MODE RECONSOLIDATION : les journees deja en base seront relues et reecrites.');
  dire(`${deja.size} journees deja en base. A traiter sur la fenetre : ${manquantes.length ? manquantes.join(', ') : 'aucune'}`);

  /* Le planning dit quels jours la guinguette etait ouverte. Sans lui, une
     journee sans aucun rapport de caisse serait indistinguable d'un lundi de
     fermeture — et on irait interroger le journal pour rien. */
  const ouvert = new Map();
  try {
    (await db.collection('planning').get()).forEach(d => ouvert.set(d.id, !d.data().ferme));
  } catch (e) { dire('Planning illisible, on continue sans : ' + e.message); }
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

    /* La liste est paginee par vingt. Une seule page suffisait sur dix jours ;
       sur une saison elle en cacherait la moitie. On parcourt tout. */
    const sessions = await page.evaluate(async () => {
      const lire = () => { const out = [];
        document.querySelectorAll('tr').forEach(tr => {
          const k = Object.keys(tr).find(k => k.startsWith('__reactFiber'));
          if (!k) return;
          let f = tr[k], n = 0;
          while (f && n++ < 12) { const p = f.memoizedProps;
            if (p && p.row && p.row.original) { const o = p.row.original;
              out.push({ id: o.id, caisse: String(o.drawerId), debut: o.startDate, fin: o.closedDate }); return; }
            f = f.return; } });
        return out; };
      const suivant = () => [...document.querySelectorAll('button')].find(b =>
        /suivant|next/i.test((b.textContent || '') + (b.getAttribute('aria-label') || '')) && !b.disabled);
      const vu = new Map();
      lire().forEach(r => vu.set(r.id, r));
      for (let i = 0; i < 30; i++) {
        const b = suivant(); if (!b) break;
        const avant = vu.size; b.click();
        await new Promise(r => setTimeout(r, 2200));
        lire().forEach(r => vu.set(r.id, r));
        if (vu.size === avant) break;
      }
      return [...vu.values()];
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

    /* Le depannage : reconstituer la journee depuis le journal des commandes.
       Ne remplace jamais un vrai rapport, ne s'ecrit que faute de mieux. */
    const parLeJournal = async (jour, raison, plancher = 0) => {
      if (partielle(jour)) { dire(`${jour} : ${raison} — deja reconstituee, on attend la clôture.`); return; }
      try {
        const j = await lireJournal(page, jour);
        if (!j) { dire(`${jour} : ${raison}, et aucune commande ce jour-la. Rien a ecrire.`); return; }
        /* La caisse qui a ete clôturee, elle, a declare un montant. Le journal
           couvre les deux caisses : il ne peut pas etre plus petit. S'il l'est,
           c'est qu'on n'a pas tout lu — on ne l'ecrit pas. */
        if (plancher > 0 && j.ca_net < plancher - 0.01) {
          anomalies.push(`${jour} : ${raison}. Le journal ne donne que ${j.ca_net} EUR alors qu'une caisse `
            + `en declare deja ${plancher.toFixed(2)}. Lecture incomplete, journee non ecrite.`);
          return;
        }
        await db.collection('ventes').doc(jour).set(j, { merge: true });
        dire(`${jour} : ${raison} -> reconstituee depuis le journal des commandes. `
           + `CA ${j.ca_net} EUR, ${j.tickets} commandes sur ${j.pages_lues} page(s)`
           + (j.paiements_mixtes ? `, ${j.paiements_mixtes} encaissement(s) partage(s) : ventilation non publiee.`
                                 : `, espèces ${j.especes} / carte ${j.carte}.`));
      } catch (e) {
        anomalies.push(`${jour} : ${raison}, et le journal des commandes n'a pas pu etre lu (${e.message}).`);
      }
    };

    for (const jour of manquantes) {
      const lot = parJour[jour];
      if (!lot || !lot.length) {
        if (ouvert.get(jour) === false) { dire(`${jour} : guinguette fermee, rien a ecrire.`); continue; }
        await parLeJournal(jour, 'aucun rapport de caisse');
        continue;
      }

      const caisses = new Set(lot.map(s => String(s.caisse)));
      const attendues = CAISSES_CONNUES.filter(c => caisses.has(c));
      if (attendues.length < CAISSES_CONNUES.length) {
        /* C'etait la cause des trous : une seule caisse clôturee sur deux et la
           journee entiere partait a la poubelle. On ne devine toujours pas la
           moitie manquante — on va la chercher dans le journal. */
        let plancher = 0;
        try {
          for (const sess of lot) {
            const p = await lireRapport(page, sess.id, sess.caisse);
            plancher += Number(p.ca_net) || 0;
          }
        } catch (e) { dire(`${jour} : rapport partiel illisible (${e.message}), on continue sans plancher.`); plancher = 0; }
        await parLeJournal(jour, `${caisses.size} caisse(s) clôturee(s) sur ${CAISSES_CONNUES.length}`, plancher);
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
        source: 'flatpay-fin-de-journee', complet: true, maj: Date.now()
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

    /* Mix produit — isole : son echec ne doit pas emporter les journees. */
    try {
      const mix = await lireMixProduit(page);

      /* Garde-fou. Le tableau de Flatpay s'ouvre sur la journee du jour et
         garde un filtre de categories : sans y toucher on lit une poignee
         d'euros et on les ecrit comme s'ils etaient la saison. Si le total des
         produits ne pese pas au moins la moitie de ce que la caisse a encaisse,
         on refuse d'ecrire. */
      const totalMix = (mix.categories || []).reduce((t, c) => t + (Number(c.ca) || 0), 0);
      let caEncaisse = 0;
      (await db.collection('ventes').get()).forEach(d => caEncaisse += Number(d.data().ca_net) || 0);
      if (caEncaisse > 0 && totalMix < caEncaisse * 0.5)
        throw new Error(`mix incoherent : ${Math.round(totalMix)} EUR de produits contre `
          + `${Math.round(caEncaisse)} EUR encaisses — periode ou filtre de categories mal poses`);

      const { totauxLus, ...aEcrire } = mix;
      // "fin" date les MONTANTS, pas le mix. On ne l'avance que si les totaux
      // ont ete relus : sinon la page afficherait une date fraiche a cote de
      // chiffres perimes, ce que personne ne verrait passer.
      if (totauxLus) aEcrire.fin = aParis(new Date());
      aEcrire.mix_fin = aParis(new Date());
      await db.collection('ventes_meta').doc('saison').set(
        { ...aEcrire, maj: Date.now(), source: 'flatpay-ventes-par-produit' }, { merge: true });
      dire(`Mix produit mis a jour : ${mix.produits} produits, ${mix.unites} unites, ${mix.categories.length} categories.`);
      dire(totauxLus ? `  totaux de periode relus : ${mix.ca_ttc} TTC / ${mix.ca_ht} HT`
                     : `  totaux de periode NON relus : les montants de saison restent ceux du dernier relevé`);
    } catch (e) {
      /* Le mix produit est une piece a part. Depuis qu'il refuse d'ecrire des
         chiffres aberrants, il echoue tous les soirs — la page « Apercu des
         ventes » de Flatpay s'ouvre sur la journee du jour, avec un filtre de
         categories, et il n'y a pas encore de quoi la piloter. Ce n'est pas une
         panne : les journees, elles, sont remontees. On le dit dans le journal
         sans faire echouer le passage, sinon l'alerte devient du bruit et plus
         personne ne la lit — y compris le jour ou elle voudra dire quelque
         chose. La saisie manuelle du recapitulatif prend le relais en attendant.
         Passe une semaine sans rafraichissement, la, on alerte. */
      dire(`Mix produit NON mis a jour : ${e.message}`);
      const doc = await db.collection('ventes_meta').doc('saison').get();
      const vieux = doc.exists && doc.data().maj ? (Date.now() - Number(doc.data().maj)) / 86400000 : 999;
      /* Une alerte qui part a chaque passage n'est plus une alerte. Celle-ci
         ne repart qu'une fois par semaine, tant que le probleme dure. */
      const derniere = doc.exists ? Number(doc.data().mix_alerte_le || 0) : 0;
      if (vieux > 7 && (Date.now() - derniere) > 7 * 86400000) {
        anomalies.push(`Mix produit pas rafraichi depuis ${Math.floor(vieux)} jours — il faut reprendre l'export.`);
        await db.collection('ventes_meta').doc('saison').set({ mix_alerte_le: Date.now() }, { merge: true });
      } else if (vieux > 7) {
        dire(`  (perime depuis ${Math.floor(vieux)} jours — alerte deja envoyee cette semaine)`);
      } else {
        dire(`  (dernier rafraichissement il y a ${vieux.toFixed(1)} jour(s) — le reste de la remontee est bon)`);
      }
    }
  } finally {
    await navigateur.close();
  }

  // Une demande faite depuis le bouton de l'outil est marquee traitee,
  // que la remontee ait trouve quelque chose a ecrire ou non.
  try {
    await db.collection('commandes').doc('remontee').set({ traitee: Date.now() }, { merge: true });
  } catch (e) { dire('Marquage de la demande impossible : ' + e.message); }

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
