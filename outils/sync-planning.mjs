/**
 * Synchronisation du planning, dans les deux sens.
 *
 *   Le tableau du Drive  <-->  la collection « planning » de la base
 *
 * Le tableau reste modifiable a la main : ses colonnes K et suivantes sont des
 * formules qui recalculent le statut. On n'y touche jamais. Seules les colonnes
 * C (horaires), D (duree) et E a J (les six personnes) sont ecrites.
 *
 * Qui gagne quand les deux cotes ont bouge le meme jour ? L'outil. C'est le
 * cas rare — il faut avoir modifie la meme journee des deux cotes entre deux
 * passages — et la valeur du Drive qui a ete ecrasee est recopiee dans le
 * champ « conflit » de la journee, donc rien ne disparait en silence.
 *
 * Variables d'environnement :
 *   FIREBASE_SERVICE_ACCOUNT  la cle du compte technique (JSON)
 *   PLANNING_CLASSEUR         l'identifiant du classeur (defaut : le notre)
 *   SENS                      'deux' (defaut), 'drive-vers-outil', 'outil-vers-drive'
 */

import admin from 'firebase-admin';
import { google } from 'googleapis';

const CLASSEUR = process.env.PLANNING_CLASSEUR
  || '1COVZ6vPQtMGqTO5UxW3UFqJl2lMjWnAKtgK8ydqiMJU';
const FEUILLE   = 'Planning';
const ANNEE     = Number(process.env.PLANNING_ANNEE || 2026);
const SENS      = process.env.SENS || 'deux';
const SOURCE    = 'drive:Planning_presence_Guinguette';

/* L'ordre fait foi : ce sont les colonnes E, F, G, H, I, J. */
const PERSONNES = ['Ema', 'Alban', 'Alex', 'Thomas', 'Guguss', 'Stéphanie'];

const MOIS = { janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
               juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11,
               decembre: 12 };
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/* ════════════════════════════════════════════════════════════════════
   Lecture d'une cellule
   ════════════════════════════════════════════════════════════════════ */

const sansAccent = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function dateISO(texte) {
  const t = sansAccent(String(texte || '').trim().toLowerCase());
  const m = t.match(/^(\d{1,2})\s+([a-z]+)/);
  if (!m) return null;
  const mois = MOIS[m[2]];
  if (!mois) return null;
  return `${ANNEE}-${String(mois).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
}

/** « 16h30 » -> 16.5 ; « 22 » -> 22 ; rien de lisible -> null */
function heure(texte) {
  const t = String(texte);
  let m = t.match(/(\d{1,2})\s*h\s*(\d{2})/);
  if (m) return Number(m[1]) + Number(m[2]) / 60;
  m = t.match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
}

const heureTexte = x => {
  const h = Math.floor(x + 1e-9), mn = Math.round((x - h) * 60);
  return mn ? `${h}h${String(mn).padStart(2, '0')}` : `${h}h`;
};

/** « 16h30 – 22h » -> [16.5, 22] */
function bornesOuverture(texte) {
  const t = String(texte || '').replace(/[–—]/g, '-');
  const p = t.split('-');
  if (p.length < 2) return null;
  const a = heure(p[0]), b = heure(p[p.length - 1]);
  return (a == null || b == null) ? null : [a, b];
}

/**
 * Une case de personne. Trois formes possibles :
 *   { creneaux: [{debut, fin}, …] }   des horaires
 *   { absence: 'repos' | 'congés' }   off / vac
 *   { note: '…' }                     du texte libre (un extra, un prenom)
 */
function lireCase(brut) {
  const texte = String(brut == null ? '' : brut).trim();
  if (!texte) return null;
  const bas = sansAccent(texte.toLowerCase());
  if (bas === 'off' || bas === 'repos')     return { absence: 'repos' };
  if (bas === 'vac' || bas === 'vacances' || bas === 'conges') return { absence: 'congés' };
  if (bas === 'absent')                     return { absence: 'absent' };

  const creneaux = [], notes = [];
  /* « 15h-17h30 18h-22h » : deux services dans la meme case, separes par une
     simple espace. Sans cette coupe, on lisait un seul creneau de 15h a 22h et
     la personne apparaissait presente pendant sa coupure. */
  const morceaux = [];
  for (const gros of texte.split(/[\n;+]/))
    for (const bout of gros.split(/\s+(?=\d{1,2}\s*h\d*\s*[-–—/])/)) morceaux.push(bout);
  for (let bout of morceaux) {
    bout = bout.trim().replace(/\?+$/, '').trim();
    if (!bout) continue;
    /* « 16h/22h » : entre deux chiffres, la barre oblique vaut un tiret. */
    const t = bout.replace(/[–—]/g, '-').replace(/(\d\s*h?)\s*\/\s*(?=\d)/g, '$1-');
    let paire = null;
    if (t.includes('-')) {
      const p = t.split('-');
      const a = heure(p[0]), b = heure(p[p.length - 1]);
      if (a != null && b != null) paire = [a, b];
    } else {
      const m = t.replace(/\s/g, '').match(/^(\d{1,2})h(\d{1,2})h?$/);
      if (m) paire = [Number(m[1]), Number(m[2])];
    }
    if (paire && paire[0] >= 0 && paire[0] < 24 && paire[1] > paire[0] && paire[1] <= 24)
      creneaux.push({ debut: paire[0], fin: paire[1] });
    else notes.push(bout);
  }
  if (creneaux.length) {
    const o = { creneaux };
    if (notes.length) o.note = notes.join(' ');
    return o;
  }
  return notes.length ? { note: notes.join(' ') } : null;
}

/** L'inverse : ce qu'on reecrit dans la case du tableau. */
function ecrireCase(e) {
  if (!e) return '';
  if (e.absence === 'repos')  return 'off';
  if (e.absence === 'congés') return 'vac';
  if (e.absence)              return e.absence;
  if (e.creneaux && e.creneaux.length) {
    const h = e.creneaux.map(c => `${heureTexte(c.debut)}-${heureTexte(c.fin)}`).join('\n');
    return e.note ? `${h}\n${e.note}` : h;
  }
  return e.note || '';
}

/* ════════════════════════════════════════════════════════════════════
   Une ligne du tableau -> une journee
   ════════════════════════════════════════════════════════════════════ */

function lireLigne(l) {
  const jour = String(l[0] || '').trim().toLowerCase();
  if (!JOURS.includes(jour)) return null;
  const date = dateISO(l[1]);
  if (!date) return null;

  const horaires = String(l[2] || '').trim();
  const ferme = !horaires || sansAccent(horaires.toLowerCase()).startsWith('ferme');
  const j = { date, jour, horaires: horaires || 'Fermé', ferme, source: SOURCE };

  if (!ferme) {
    const b = bornesOuverture(horaires);
    if (b) { j.ouverture = b[0]; j.fermeture = b[1]; }
    const d = Number(String(l[3] == null ? '' : l[3]).replace(',', '.').replace(/[^\d.]/g, ''));
    if (!Number.isNaN(d) && d > 0) { j.duree = d; j.duree_source = String(d).replace('.', ',') + ' h'; }
  }

  const equipe = {};
  PERSONNES.forEach((p, i) => { const e = lireCase(l[4 + i]); if (e) equipe[p] = e; });
  j.equipe = equipe;

  const statut = String(l[10] || '').trim();
  if (statut) j.statut_source = statut;
  return j;
}

/** Signature stable d'une journee : ce qui compte, et rien d'autre. */
function empreinte(j) {
  const eq = Object.keys(j.equipe || {}).sort().map(n => {
    const e = j.equipe[n];
    if (e.creneaux && e.creneaux.length)
      return n + '=' + e.creneaux.map(c => `${c.debut}-${c.fin}`).join(',') + (e.note ? '/' + e.note : '');
    if (e.absence) return n + '=a:' + e.absence;
    return n + '=n:' + (e.note || '');
  }).join('|');
  return [j.ferme ? 'F' : j.horaires, eq].join(';');
}

/* ════════════════════════════════════════════════════════════════════
   Le travail
   ════════════════════════════════════════════════════════════════════ */

const compte = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(compte) });
const db = admin.firestore();

const jwt = new google.auth.JWT({
  email: compte.client_email,
  key: compte.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const feuilles = google.sheets({ version: 'v4', auth: jwt });

const rep = await feuilles.spreadsheets.values.get({
  spreadsheetId: CLASSEUR,
  range: `${FEUILLE}!A1:K600`,
  valueRenderOption: 'FORMATTED_VALUE'
});
const lignes = rep.data.values || [];

/* Le numero de ligne du tableau, pour pouvoir y reecrire. */
const cote = new Map();   /* date -> { j, ligne } */
lignes.forEach((l, i) => {
  const j = lireLigne(l);
  if (j) cote.set(j.date, { j, ligne: i + 1 });
});
console.log(`Tableau : ${cote.size} journees lues.`);
if (!cote.size) { console.error('Tableau vide ou illisible — on ne touche a rien.'); process.exit(1); }

const enBase = new Map();
(await db.collection('planning').get()).forEach(d => enBase.set(d.id, d.data()));
console.log(`Base : ${enBase.size} journees.`);

const maintenant = Date.now();
const versBase = [];    /* journees a (re)ecrire dans la base */
const versDrive = [];   /* journees a reecrire dans le tableau */
const conflits = [];
const statuts = [];     /* journees dont seule la colonne « Statut » a bouge */

for (const [date, { j, ligne }] of cote) {
  const a = enBase.get(date);
  const emp = empreinte(j);

  if (!a) { versBase.push({ date, j, emp, motif: 'nouvelle' }); continue; }

  /* Une journee sans champ « sync » n'a jamais ete synchronisee : on part de
     ce que dit le tableau, sans rien lui renvoyer. C'est le cas de toutes les
     journees au premier passage. */
  const jamais      = !a.sync;
  const driveBouge  = jamais || a.sync.empreinte !== emp;
  const outilBouge  = !jamais && Number(a.maj || 0) > Number(a.sync.le || 0);

  if (driveBouge && outilBouge) {
    conflits.push({ date, drive: emp, outil: empreinte(a) });
    versDrive.push({ date, ligne, a, emp_drive: emp });
  } else if (driveBouge) {
    versBase.push({ date, j, emp, motif: jamais ? 'premiere synchronisation' : 'modifie dans le tableau' });
  } else if (outilBouge) {
    versDrive.push({ date, ligne, a });
  } else if ((j.statut_source || '') !== (a.statut_source || '')
          || (j.duree_source || '') !== (a.duree_source || '')) {
    /* La colonne « Statut » et la duree sont des formules du tableau : elles ne
       font pas partie de l'empreinte, sinon chaque recalcul passerait pour une
       modification. Mais quand l'outil vient d'ecrire dans le tableau, elles se
       recalculent et la base garde l'ancienne valeur — l'outil affichait alors
       « le tableau dit ❌, le recalcul dit ✅ » indefiniment. On les rafraichit
       a part, sans toucher au reste et sans declencher de conflit. */
    statuts.push({ date, statut_source: j.statut_source || null,
                   duree_source: j.duree_source || null, duree: j.duree ?? null });
  }
}

/* Journees presentes dans la base mais absentes du tableau : on le signale,
   on n'invente pas de ligne. */
const orphelines = [...enBase.keys()].filter(d => !cote.has(d));
if (orphelines.length)
  console.log(`Absentes du tableau (laissees telles quelles) : ${orphelines.join(', ')}`);

/* ── Le tableau vers la base ──────────────────────────────────────── */
if (SENS !== 'outil-vers-drive' && versBase.length) {
  let lot = db.batch(), n = 0;
  for (const { date, j, emp } of versBase) {
    const a = enBase.get(date) || {};
    const doc = { ...j, maj: maintenant, sync: { empreinte: emp, le: maintenant, sens: 'drive' } };
    if (a.concert) doc.concert = a.concert;     /* rattachements faits a la main */
    if (a.libelle) doc.libelle = a.libelle;
    lot.set(db.collection('planning').doc(date), doc);
    if (++n % 400 === 0) { await lot.commit(); lot = db.batch(); }
  }
  await lot.commit();
  console.log(`Base mise a jour : ${versBase.length} journees.`);
  versBase.slice(0, 20).forEach(x => console.log(`  ${x.date} — ${x.motif}`));
} else {
  console.log('Base : rien a mettre a jour.');
}

/* ── La base vers le tableau ──────────────────────────────────────── */
if (SENS !== 'drive-vers-outil' && versDrive.length) {
  const donnees = versDrive.map(({ ligne, a }) => ({
    range: `${FEUILLE}!C${ligne}:J${ligne}`,
    values: [[
      a.ferme ? 'Fermé' : (a.horaires || ''),
      a.ferme ? '' : (a.duree != null ? a.duree
                     : (a.ouverture != null && a.fermeture != null ? a.fermeture - a.ouverture : '')),
      ...PERSONNES.map(p => ecrireCase((a.equipe || {})[p]))
    ]]
  }));
  await feuilles.spreadsheets.values.batchUpdate({
    spreadsheetId: CLASSEUR,
    requestBody: { valueInputOption: 'RAW', data: donnees }
  });

  /* On rembobine l'empreinte : ce que l'outil vient d'ecrire est desormais
     ce que dit le tableau. */
  let lot = db.batch(), n = 0;
  for (const { date, a } of versDrive) {
    lot.update(db.collection('planning').doc(date), {
      sync: { empreinte: empreinte(a), le: maintenant, sens: 'outil' }
    });
    if (++n % 400 === 0) { await lot.commit(); lot = db.batch(); }
  }
  await lot.commit();
  console.log(`Tableau mis a jour : ${versDrive.length} journees.`);
  versDrive.slice(0, 20).forEach(x => console.log(`  ${x.date} — ligne ${x.ligne}`));

  /* Le tableau vient de recalculer sa colonne « Statut » et sa duree. On les
     relit tout de suite : sans cela la base garderait l'ancien statut pour
     toujours, puisque l'empreinte ne le regarde pas. */
  const relu = await feuilles.spreadsheets.values.get({
    spreadsheetId: CLASSEUR, range: `${FEUILLE}!A1:K600`, valueRenderOption: 'FORMATTED_VALUE'
  });
  const frais = new Map();
  (relu.data.values || []).forEach(l => { const x = lireLigne(l); if (x) frais.set(x.date, x); });
  for (const { date } of versDrive) {
    const x = frais.get(date);
    if (x) statuts.push({ date, statut_source: x.statut_source || null,
                          duree_source: x.duree_source || null, duree: x.duree ?? null });
  }
} else {
  console.log('Tableau : rien a mettre a jour.');
}

/* ── Le statut recalcule par le tableau ───────────────────────────── */
if (statuts.length) {
  let lot = db.batch(), n = 0;
  for (const st of statuts) {
    lot.set(db.collection('planning').doc(st.date),
            { statut_source: st.statut_source, duree_source: st.duree_source, duree: st.duree },
            { merge: true });
    if (++n % 400 === 0) { await lot.commit(); lot = db.batch(); }
  }
  await lot.commit();
  console.log(`Statut rafraichi depuis le tableau : ${statuts.length} journees.`);
  statuts.slice(0, 20).forEach(x => console.log(`  ${x.date} — « ${x.statut_source || '(vide)'} »`));
} else {
  console.log('Statut : rien a rafraichir.');
}

/* ── Les conflits, gardes en clair ────────────────────────────────── */
if (conflits.length) {
  const lot = db.batch();
  for (const c of conflits) {
    lot.update(db.collection('planning').doc(c.date), {
      conflit: { le: maintenant, tableau_ecrase: c.drive }
    });
    console.log(`CONFLIT ${c.date} — le tableau disait « ${c.drive} », l'outil a gagne.`);
  }
  await lot.commit();
}

/* ── Les concerts, eux aussi dans les deux sens ───────────────────────
   L'onglet « concerts » : colonne C le groupe, D le style, E la date,
   F le cachet. Les lignes sans vraie date (« Option jeudi 17 ou 24 ») sont
   conservees telles quelles, on ne fait que les recopier plus bas. */
try {
  const repC = await feuilles.spreadsheets.values.get({
    spreadsheetId: CLASSEUR, range: 'concerts!A1:F200', valueRenderOption: 'UNFORMATTED_VALUE'
  });
  const brut = (repC.data.values || []).slice(1);

  const dates = [], autres = [];
  for (const l of brut) {
    const [groupe, type, date, remu] = [l[2], l[3], l[4], l[5]];
    if (!groupe && !type && !date) continue;
    if (typeof date === 'number') {
      /* Le serial Sheets compte les jours depuis le 30/12/1899. */
      const d = new Date(Date.UTC(1899, 11, 30) + Math.round(date) * 86400000);
      dates.push({
        groupe: String(groupe || '').trim(),
        type: String(type || '').trim(),
        date: d.toISOString().slice(0, 10),
        remuneration: Number(remu) || 0
      });
    } else {
      autres.push([groupe, type, date, remu].map(x => x == null ? '' : x));
    }
  }
  const parDate   = l => [...l].sort((x, y) => x.date.localeCompare(y.date));
  const signature = l => parDate(l)
    .map(c => `${c.date}|${c.groupe}|${c.type}|${c.remuneration}`).join('#');

  const serieDrive = parDate(dates);
  const ref  = db.collection('planning_meta').doc('concerts');
  const snap = await ref.get();
  const a    = snap.exists ? snap.data() : {};

  const empDrive   = signature(serieDrive);
  const jamais     = !a.sync;
  const driveBouge = jamais || a.sync.empreinte !== empDrive;
  const outilBouge = !jamais && Number(a.maj || 0) > Number(a.sync.le || 0);

  let serie = serieDrive;

  if (outilBouge) {
    /* L'outil a la main : on reecrit l'onglet a partir de la base. */
    serie = parDate(a.liste || []);
    const texte = v => {
      const t = String(v == null ? '' : v);
      return t.startsWith('=') ? "'" + t : t;   /* jamais une formule par accident */
    };
    const lignes = serie.map(c => [texte(c.groupe), texte(c.type), c.date, c.remuneration || 0])
      .concat(autres);
    /* On efface ce qui depassait de l'ancienne liste. */
    const aEffacer = Math.max(0, brut.length - lignes.length);
    for (let i = 0; i < aEffacer; i++) lignes.push(['', '', '', '']);
    if (lignes.length) {
      await feuilles.spreadsheets.values.update({
        spreadsheetId: CLASSEUR,
        range: `concerts!C2:F${1 + lignes.length}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: lignes }
      });
    }
    await ref.set({ sync: { empreinte: signature(serie), le: maintenant, sens: 'outil' } },
                  { merge: true });
    console.log(`Concerts : ${serie.length} dates renvoyees vers le tableau.`);
  } else if (driveBouge) {
    await ref.set({ liste: serieDrive, maj: maintenant,
                    sync: { empreinte: empDrive, le: maintenant, sens: 'drive' } },
                  { merge: true });
    console.log(`Concerts : ${serieDrive.length} dates reprises du tableau.`);
  } else {
    console.log('Concerts : rien a mettre a jour.');
  }

  /* Chaque concert s'accroche a sa journee, pour s'afficher sur la carte du
     jour. Une date qui n'a plus de concert perd son etiquette. */
  const carte = new Map(serie.map(c => [c.date, c]));
  const lotC = db.batch();
  let poses = 0, retires = 0;
  for (const [date] of cote) {
    const j = enBase.get(date) || {};
    const c = carte.get(date);
    const identique = j.concert && c && j.concert.groupe === c.groupe
      && j.concert.type === c.type && Number(j.concert.remuneration) === Number(c.remuneration);
    if (c && !identique) {
      lotC.set(db.collection('planning').doc(date), { concert: c }, { merge: true });
      poses++;
    } else if (!c && j.concert) {
      lotC.set(db.collection('planning').doc(date),
               { concert: admin.firestore.FieldValue.delete() }, { merge: true });
      retires++;
    }
  }
  if (poses || retires) {
    await lotC.commit();
    console.log(`Concerts accroches aux journees : ${poses} pose(s), ${retires} retire(s).`);
  }
} catch (e) {
  console.log('Concerts : onglet illisible ou refus d ecriture, ignore. ' + e.message);
  process.exitCode = 1;
}

console.log('Synchronisation terminee.');
