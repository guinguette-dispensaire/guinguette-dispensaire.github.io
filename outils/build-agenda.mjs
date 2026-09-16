/**
 * Régénération automatique de l'agenda des concerts (page publique agenda.html).
 *
 *   L'onglet « concerts » du Google Sheet  ->  les sections de agenda.html
 *
 * Lit l'onglet « concerts » (colonnes C groupe, D style, E date, F cachet),
 * RETIRE le cachet (jamais publié), ne garde que les événements À VENIR
 * (date >= aujourd'hui, Europe/Paris), et réécrit deux zones de agenda.html,
 * repérées par la structure existante :
 *     le bloc <script type="application/ld+json"> … </script>
 *     les lignes entre <div id="a-venir"> … </div>
 *
 * Présentation façon affiche : une ligne compacte par événement
 *     Jour date · heure · type · Nom (+ sous-titre éventuel)
 * Pas de « accès libre et gratuit » répété : il est indiqué une fois en intro.
 * Les libellés (type, heure, sous-titre) viennent de la table OVERRIDES ; un
 * événement inconnu reçoit des valeurs générées, pour que la page reste correcte.
 *
 * Fail-closed : si une zone manque, ou si le Sheet est vide/illisible, on
 * n'écrit rien et on sort en erreur — la page en ligne n'est jamais corrompue.
 *
 * Variables d'environnement :
 *   FIREBASE_SERVICE_ACCOUNT  clé du compte technique (JSON) — accès Sheets
 *   PLANNING_CLASSEUR         id du classeur (défaut : le nôtre)
 *   SAISON                    année des dates en texte (défaut : 2026)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { google } from 'googleapis';

const CLASSEUR = process.env.PLANNING_CLASSEUR
  || '1COVZ6vPQtMGqTO5UxW3UFqJl2lMjWnAKtgK8ydqiMJU';
const SAISON  = Number(process.env.SAISON || 2026);
const FICHIER = 'agenda.html';
const BASE    = 'https://laguinguettedudispensaire.fr';
const IMG_DEFAUT = `${BASE}/photo10-960.jpg`;   // image générique pour le partage / SEO

const MOIS  = ['janvier','février','mars','avril','mai','juin','juillet','août',
               'septembre','octobre','novembre','décembre'];
const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MOIS_NUM = { janvier:1, fevrier:2, mars:3, avril:4, mai:5, juin:6,
                   juillet:7, aout:8, septembre:9, octobre:10, novembre:11, decembre:12 };

const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = s => sansAccent(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const p2 = n => String(n).padStart(2, '0');

/* ── Contenu par date (repris de l'affiche « Agenda de la rentrée ») ──
   Champs : type, heure (libellé affiché), title, sub (sous-titre éventuel),
   perf ('MusicGroup' | 'Person' | 'Organization'), src ('instagram' | 'facebook'). */
const OVERRIDES = {
  // À venir
  '2026-09-17': { id:'roxane-septembre', type:'Concert live', heure:'19h – 21h30', title:'Roxane', perf:'MusicGroup' },
  '2026-09-18': { id:'supernova-player-septembre', type:'DJ set', heure:'19h – 21h30', title:'Supernova Player', perf:'Person' },
  '2026-09-19': { id:'the-gates-septembre', type:'Concert live', heure:'19h – 21h30', title:'The Gates', perf:'MusicGroup' },
  '2026-09-24': { id:'burning-legs-septembre', type:'Concert live', heure:'19h – 21h30', title:'Burning Legs', perf:'MusicGroup' },
  '2026-09-25': { id:'gregoire-delahaye-septembre', type:'DJ set', heure:'19h – 21h30', title:'Grégoire Delahaye', perf:'Person' },
  '2026-09-26': { id:'brother-yacin', type:'Concert live', heure:'19h – 21h30', title:'Brother Yacin', sub:'Reggae', perf:'MusicGroup' },
  '2026-10-02': { id:'elsinha', type:'Concert live', heure:'19h – 21h30', title:'Elsinha', sub:'Latino', perf:'MusicGroup' },
  '2026-10-03': { id:'chapeau-solo', type:'Concert live', heure:'19h – 21h', title:'Chapeau solo', sub:'Reprises jazz', perf:'MusicGroup' },
  '2026-10-10': { id:'black-noodles', type:'Concert live', heure:'19h – 21h30', title:'Black Noodles', sub:'Rock', perf:'MusicGroup' },
  // Déjà passés (conservés pour référence — non affichés sur la page)
  '2026-09-10': { id:'yipikiyay', type:'Concert live', heure:'19h – 21h30', title:'Yipikiyay', perf:'MusicGroup', src:'instagram' },
  '2026-09-05': { id:'blind-test-paella', type:'Animation', heure:'dès 19h', title:'Blind test', sub:'avec la paëlla de la Mama Valentina', perf:'Organization', src:'instagram' },
  '2026-09-03': { id:'gregoire-delahaye', type:'DJ set', heure:'19h – 21h30', title:'Grégoire Delahaye', perf:'Person', src:'instagram' },
  '2026-08-29': { id:'cinema-plein-air', type:'Cinéma', heure:'dès 19h', title:'Projection en plein air', sub:'Organisée par la mairie', perf:'Organization' },
  '2026-08-28': { id:'sylvain-sayim-aout', type:'Concert live', heure:'19h – 21h30', title:'Sylvain Sayim', perf:'MusicGroup' },
  '2026-08-27': { id:'supernova-player', type:'DJ set', heure:'19h – 21h30', title:'Supernova Player', perf:'Person', src:'instagram' },
  '2026-08-13': { id:'blind-test-enzo', type:'Animation', heure:'19h – 21h30', title:'Blind test', perf:'Organization', src:'instagram' },
  '2026-07-30': { id:'blind-test', type:'Animation', heure:'19h – 21h', title:'Blind test musical', perf:'Organization', src:'instagram' },
  '2026-07-23': { id:'roxane', type:'Concert live', heure:'19h – 21h', title:'Roxane', perf:'MusicGroup', src:'facebook' },
  '2026-07-16': { id:'the-gates', type:'Concert live', heure:'19h – 21h', title:'The Gates', perf:'MusicGroup', src:'facebook' },
  '2026-07-10': { id:'sylvain-sayim', type:'Concert live', heure:'18h30 – 21h', title:'Sylvain Sayim', perf:'MusicGroup', src:'instagram' },
  '2026-07-02': { id:'bal-burning-legs', type:'Concert live', heure:'19h – 21h', title:'Bal Burning Legs', perf:'MusicGroup', src:'facebook' },
  '2026-06-20': { id:'dj-set-ouverture', type:'DJ set', heure:'19h – 21h', title:'DJ David', sub:'Première soirée de la saison', perf:'Person', src:'facebook' }
};

/* Événements réels non présents dans l'onglet « concerts » du Sheet. */
const EXTRAS = [
  { date:'2026-07-30' }   // Blind test musical : détails dans OVERRIDES ci-dessus
];

const SRC_URL = {
  instagram: 'https://www.instagram.com/guinguette.du.dispensaire/',
  facebook:  'https://www.facebook.com/profile.php?id=61590190707357'
};

/* ── Dates ──────────────────────────────────────────────────────────── */
function dateDepuisSerial(n) {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
  return d.toISOString().slice(0, 10);
}
function dateDepuisTexte(t) {
  const raw = String(t == null ? '' : t).trim();
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${p2(Number(iso[2]))}-${p2(Number(iso[3]))}`;
  const s = sansAccent(raw).toLowerCase();
  const m = s.match(/(\d{1,2})\s+([a-z]+)/);
  if (!m) return null;
  const mois = MOIS_NUM[m[2]];
  if (!mois) return null;
  return `${SAISON}-${p2(mois)}-${p2(Number(m[1]))}`;
}
function jourNom(iso) { return JOURS[new Date(iso + 'T12:00:00Z').getUTCDay()]; }
function dateCourte(iso) { const [, m, d] = iso.split('-').map(Number); return `${d} ${MOIS[m - 1]}`; }
function aujourdhuiParis() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}

/* ── Défauts pour un événement inconnu ──────────────────────────────── */
function typeDefaut(groupe, style) {
  const g = sansAccent(groupe).toLowerCase(), s = sansAccent(style).toLowerCase();
  if (g.includes('blind test')) return 'Animation';
  if (g.includes('cinema') || g.includes('projection')) return 'Cinéma';
  if (g.includes('paella') || g.includes('plancha') || g.includes('food')) return 'Food';
  if (g.includes('bourse') || s.includes('anim')) return 'Animation';
  if (s.includes('dj') || g.includes('dj ')) return 'DJ set';
  return 'Concert live';
}
function perfDefaut(type) { return type === 'DJ set' ? 'Person' : (type === 'Concert live' ? 'MusicGroup' : 'Organization'); }

/* ── Normalisation ──────────────────────────────────────────────────── */
function normaliser(base) {
  const o = OVERRIDES[base.date] || {};
  const type = o.type || typeDefaut(base.groupe || '', base.style || '');
  return {
    date: base.date,
    type,
    heure: o.heure || '19h – 21h30',
    title: o.title || base.groupe || 'À la guinguette',
    sub: o.sub || (base.style && !o.title ? base.style : null),
    id: o.id || (slug(base.groupe || 'evenement') + '-' + base.date),
    perf: o.perf || perfDefaut(type),
    src: o.src || null
  };
}

/* ── Rendu d'une ligne ──────────────────────────────────────────────── */
function ligne(ev, passe) {
  const cls = 'ev' + (passe ? ' ev-passe' : '');
  const sub = ev.sub ? `<p class="ev-s">${esc(ev.sub)}</p>` : '';
  const src = (passe && ev.src && SRC_URL[ev.src])
    ? ` <a class="ev-src" href="${SRC_URL[ev.src]}" target="_blank" rel="noopener">↗</a>` : '';
  return `  <article class="${cls}" id="${esc(ev.id)}" data-date="${ev.date}">` +
    `<div class="ev-when"><span class="ev-j">${jourNom(ev.date)}</span>` +
    `<time class="ev-d" datetime="${ev.date}">${dateCourte(ev.date)}</time></div>` +
    `<div class="ev-h">${esc(ev.heure)}</div>` +
    `<div class="ev-t">${esc(ev.type)}</div>` +
    `<div class="ev-n"><h3>${esc(ev.title)}${src}</h3>${sub}</div>` +
    `</article>`;
}

/* ── JSON-LD (schema.org) ───────────────────────────────────────────── */
function heureBornes(h) {
  const s = String(h).replace(/[–—]/g, '-').toLowerCase();
  let m = s.match(/(\d{1,2})h(\d{2})?\s*-\s*(\d{1,2})h(\d{2})?/);
  if (m) return [`${p2(m[1])}:${m[2] || '00'}`, `${p2(m[3])}:${m[4] || '00'}`];
  m = s.match(/(\d{1,2})h(\d{2})?/);
  if (m) { const st = Number(m[1]); return [`${p2(st)}:${m[2] || '00'}`, `${p2(Math.min(st + 3, 23))}:${m[2] || '00'}`]; }
  return ['19:00', '21:30'];
}
function jsonldEvent(ev) {
  const [d, f] = heureBornes(ev.heure);
  const desc = `${ev.title}${ev.sub ? ' — ' + ev.sub : ''} à la Guinguette du Dispensaire, au Parc du Dispensaire à Sartrouville. Accès libre et gratuit.`;
  return {
    '@context':'https://schema.org', '@type':'Event',
    name: `${ev.title} — La Guinguette du Dispensaire`,
    startDate: `${ev.date}T${d}:00+02:00`,
    endDate: `${ev.date}T${f}:00+02:00`,
    eventStatus:'https://schema.org/EventScheduled',
    eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
    description: desc,
    location:{ '@type':'Place', name:'La Guinguette du Dispensaire', address:{ '@type':'PostalAddress',
      streetAddress:'Parc du Dispensaire, 1 Avenue Maurice Berteaux', addressLocality:'Sartrouville',
      postalCode:'78500', addressRegion:'Île-de-France', addressCountry:'FR' },
      geo:{ '@type':'GeoCoordinates', latitude:48.9439033, longitude:2.1619547 },
      publicAccess:true, isAccessibleForFree:true },
    organizer:{ '@type':'Organization', name:'La Guinguette du Dispensaire', url:`${BASE}/` },
    isAccessibleForFree:true,
    image:[IMG_DEFAUT],
    url:`${BASE}/agenda.html#${ev.id}`,
    offers:{ '@type':'Offer', price:'0', priceCurrency:'EUR', availability:'https://schema.org/InStock',
      url:`${BASE}/agenda.html`, validFrom:`${SAISON}-06-01` },
    performer:{ '@type':ev.perf, name: ev.perf === 'Organization' ? 'La Guinguette du Dispensaire' : ev.title }
  };
}

/* ── Remplacement d'une zone, repérée par la structure existante ─────── */
function remplacer(html, re, produire, label) {
  if (!re.test(html)) throw new Error(`Zone « ${label} » introuvable dans ${FICHIER}.`);
  return html.replace(re, () => produire());
}

/* ════════════════════════════════════════════════════════════════════ */

const compte = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const jwt = new google.auth.JWT({
  email: compte.client_email, key: compte.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});
const sheets = google.sheets({ version: 'v4', auth: jwt });

const rep = await sheets.spreadsheets.values.get({
  spreadsheetId: CLASSEUR, range: 'concerts!A1:F200', valueRenderOption: 'UNFORMATTED_VALUE'
});
const lignes = (rep.data.values || []).slice(1);

const brut = [];
for (const l of lignes) {
  const groupe = String(l[2] == null ? '' : l[2]).trim();
  const style  = String(l[3] == null ? '' : l[3]).trim();
  const cell   = l[4];
  if (!groupe && (cell == null || cell === '')) continue;
  const date = (typeof cell === 'number') ? dateDepuisSerial(cell) : dateDepuisTexte(cell);
  if (!date) continue;
  brut.push({ date, groupe, style });          // le cachet (colonne F) n'est jamais lu
}
if (!brut.length) { console.error('Onglet « concerts » vide ou illisible — on ne touche à rien.'); process.exit(1); }

const parDate = new Map();
for (const e of EXTRAS) parDate.set(e.date, e);
for (const e of brut)   parDate.set(e.date, e);

const events = [...parDate.values()].map(normaliser);
const today = aujourdhuiParis();
const avenir = events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
const passes = events.filter(e => e.date <  today).sort((a, b) => b.date.localeCompare(a.date));
console.log(`Événements : ${events.length}  (à venir : ${avenir.length}, passés : ${passes.length}, aujourd'hui : ${today})`);

const avenirHTML = avenir.map(e => ligne(e, false)).join('\n');

const ld = [...avenir.map(jsonldEvent), {
  '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
    { '@type':'ListItem', position:1, name:'Accueil', item:`${BASE}/` },
    { '@type':'ListItem', position:2, name:'Agenda des concerts et animations', item:`${BASE}/agenda.html` }
  ]
}];
const jsonldHTML = '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 1) + '\n</script>';

let html = await readFile(FICHIER, 'utf8');
const avant = html;
html = remplacer(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  () => jsonldHTML, 'JSON-LD');
html = remplacer(html, /<div id="a-venir">[\s\S]*?<\/div>\s*<div class="agenda-sec">\s*<h2>Aussi au Parc/,
  () => `<div id="a-venir">\n${avenirHTML}\n</div>\n\n<div class="agenda-sec">\n<h2>Aussi au Parc`, 'à venir');

if (html === avant) console.log('Agenda déjà à jour — aucun changement.');
else { await writeFile(FICHIER, html); console.log('agenda.html régénéré.'); }
