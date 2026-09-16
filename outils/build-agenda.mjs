/**
 * Régénération automatique de l'agenda des concerts (page publique agenda.html).
 *
 *   L'onglet « concerts » du Google Sheet  ->  les sections de agenda.html
 *
 * Lit l'onglet « concerts » (colonnes C groupe, D style, E date, F cachet),
 * RETIRE le cachet (jamais publié), répartit les concerts en « À venir » et
 * « Déjà passés » selon la date du jour (Europe/Paris), et réécrit trois zones
 * de agenda.html, repérées par la structure existante :
 *     le bloc <script type="application/ld+json"> … </script>
 *     les cartes entre <div id="a-venir"> … </div>
 *     les cartes entre <div id="passes"> … </div>
 *
 * Le design, les descriptions maison et les images sont conservés grâce à la
 * table OVERRIDES (par date). Un concert inconnu reçoit une description et une
 * image générées, pour que la page reste correcte même sans intervention.
 *
 * Fail-closed : si une balise manque, si le Sheet est vide ou illisible, on
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

const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août',
              'septembre','octobre','novembre','décembre'];
const MOIS_NUM = { janvier:1, fevrier:2, mars:3, avril:4, mai:5, juin:6,
                   juillet:7, aout:8, septembre:9, octobre:10, novembre:11, decembre:12 };

const sansAccent = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = s => sansAccent(s).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Dimensions intrinsèques des images d'ambiance (évite le décalage de mise en page). */
const PHOTO_DIMS = {
  photo7:[640,853], photo10:[640,480], photo11:[640,360], photo12:[640,961],
  photo13:[640,426], photo15:[640,961], photo16:[640,961], photo21:[640,961], photo22:[640,961]
};
const POOL = ['photo10','photo7','photo21','photo15','photo12','photo11','photo13','photo16','photo22'];

/* ── Contenu éditorial par date (repris de la page existante) ───────── */
const OVERRIDES = {
  '2026-09-17': { id:'roxane-septembre', title:'Roxane en concert', type:'Concert', heure:'19:00–21:00', img:'photo21',
    alt:'Concert de variété française en plein air à la Guinguette du Dispensaire, Sartrouville',
    desc:"Roxane revient à la guinguette : sa voix, en variété française et pop internationale, pour une soirée à l'ombre des arbres du Parc du Dispensaire.", perf:'MusicGroup' },
  '2026-09-18': { id:'supernova-player-septembre', title:'Supernova Player en DJ set', type:'DJ set', heure:'19:00–21:30', img:'photo11',
    alt:'Soirée DJ à La Guinguette du Dispensaire, Parc du Dispensaire à Sartrouville',
    desc:'Supernova Player réinstalle ses platines pour un DJ set en plein air, sous les arbres du Parc du Dispensaire.', perf:'Person' },
  '2026-09-19': { id:'the-gates-septembre', title:'The Gates en concert', type:'Concert', heure:'19:00–21:00', img:'photo7',
    alt:'Concert rock en live sur la terrasse de la Guinguette du Dispensaire, Sartrouville',
    desc:'Les grands classiques du rock, des années 50 aux années 2000, joués en live sur la terrasse de la guinguette.', perf:'MusicGroup' },
  '2026-09-24': { id:'burning-legs-septembre', title:'Burning Legs en concert', type:'Concert', heure:'19:00–21:00', img:'photo12',
    alt:'Bal et reprises rock à la Guinguette du Dispensaire, Sartrouville',
    desc:'Le retour de Burning Legs et ses reprises des grands classiques du rock, pour faire danser la terrasse de la guinguette.', perf:'MusicGroup' },
  '2026-09-25': { id:'gregoire-delahaye-septembre', title:'Grégoire Delahaye en DJ set', type:'DJ set', heure:'19:00–21:30', img:'photo13',
    alt:'Tables sous les arbres du Parc du Dispensaire à Sartrouville, un soir de DJ set à la guinguette',
    desc:'Grégoire Delahaye referme le mois de septembre avec un DJ set en terrasse, sous les arbres du Parc du Dispensaire.', perf:'Person' },
  '2026-09-26': { id:'brother-yacin', title:'Brother Yacin en concert', type:'Concert', heure:'19:00–21:30', img:'photo10',
    alt:'Concert en plein air à la Guinguette du Dispensaire, Sartrouville',
    desc:'Brother Yacin apporte ses sonorités reggae à la guinguette pour une soirée chaleureuse en plein air, au cœur du Parc du Dispensaire.', perf:'MusicGroup' },
  '2026-10-02': { id:'elsinha', title:'Elsinha en concert', type:'Concert', heure:'19:00–21:30', img:'photo16',
    alt:'Soirée dansante en plein air à la Guinguette du Dispensaire, Sartrouville',
    desc:"Elsinha fait souffler un vent latino sur la terrasse : rythmes ensoleillés et ambiance dansante au cœur du Parc du Dispensaire.", perf:'MusicGroup' },
  '2026-10-03': { id:'chapeau-solo', title:'Chapeau solo en concert', type:'Concert', heure:'19:00–21:00', img:'photo22',
    alt:'Soirée musicale conviviale à la Guinguette du Dispensaire, Sartrouville',
    desc:'Chapeau solo, en reprises jazz, pour une soirée feutrée et conviviale sous les arbres du Parc du Dispensaire.', perf:'MusicGroup' },
  '2026-10-10': { id:'black-noodles', title:'Black Noodles en concert', type:'Concert', heure:'19:00–21:30', img:'photo15',
    alt:'Concert rock live sur la terrasse de la Guinguette du Dispensaire, Sartrouville',
    desc:"Black Noodles clôt la saison en rock : de l'énergie live sur la terrasse de la guinguette pour un dernier grand soir.", perf:'MusicGroup' },

  '2026-09-10': { id:'yipikiyay', title:'Yipikiyay en concert', type:'Concert', heure:'19:00–21:30', img:'photo10',
    alt:'Yipikiyay en concert à la Guinguette du Dispensaire, Sartrouville',
    desc:'Yipikiyay monte sur la scène de la guinguette pour une soirée en plein air sous les arbres du parc. Accès libre et gratuit.', perf:'MusicGroup', src:'instagram' },
  '2026-09-03': { id:'gregoire-delahaye', title:'Grégoire Delahaye en DJ set', type:'DJ set', heure:'19:00–21:30', img:'photo13',
    alt:'Tables sous les arbres du Parc du Dispensaire à Sartrouville, un soir de DJ set à la guinguette',
    desc:'Grégoire Delahaye ouvre le mois de septembre avec un DJ set en terrasse, sous les arbres du Parc du Dispensaire.', perf:'Person', src:'instagram' },
  '2026-08-27': { id:'supernova-player', title:'Supernova player en DJ set', type:'DJ set', heure:'19:00–21:30', img:'photo11',
    alt:'Soirée DJ à La Guinguette du Dispensaire, Parc du Dispensaire à Sartrouville',
    desc:'Supernova player installe ses platines à la guinguette pour une soirée en plein air sous les arbres du parc.', perf:'Person', src:'instagram' },
  '2026-07-23': { id:'roxane', title:'Roxane en concert', type:'Concert', heure:'19:00–21:00', img:'photo21',
    alt:'Roxane en concert à la Guinguette du Dispensaire, Sartrouville',
    desc:"Roxane et sa voix, en variété française et pop internationale, pour une soirée à l'ombre des arbres du Parc du Dispensaire.", perf:'MusicGroup', src:'facebook' },
  '2026-07-16': { id:'the-gates', title:'The Gates en concert', type:'Concert', heure:'19:00–21:00', img:'photo7',
    alt:'The Gates en concert à la Guinguette du Dispensaire, Sartrouville',
    desc:'Les grands classiques du rock, des années 50 aux années 2000, joués en live sur la terrasse de la guinguette.', perf:'MusicGroup', src:'facebook' },
  '2026-07-10': { id:'sylvain-sayim', title:'Sylvain Sayim en concert', type:'Concert', heure:'18:30–21:00', img:'photo15',
    alt:'Sylvain Sayim en concert à la Guinguette du Dispensaire, Sartrouville',
    desc:'Concert solo de Sylvain Sayim, artiste sartrouvillois : pop-rock et variété française, un moment musical et convivial au cœur du parc.', perf:'MusicGroup', src:'instagram' },
  '2026-07-02': { id:'bal-burning-legs', title:'Bal Burning Legs', type:'Concert', heure:'19:00–21:00', img:'photo12',
    alt:'Bal Burning Legs à la Guinguette du Dispensaire, Sartrouville',
    desc:'Reprises des grands classiques du rock, entrée libre, bar et planches sur place.', perf:'MusicGroup', src:'facebook' },
  '2026-06-20': { id:'dj-set-ouverture', title:'DJ David — première soirée musicale de la saison', type:'Soirée', heure:'19:00–21:00', img:'photo22',
    alt:'DJ David en DJ set, première soirée musicale de la saison à la Guinguette du Dispensaire, Sartrouville',
    desc:'Le tout premier événement musical de la guinguette : un DJ set en plein air pour lancer la saison 2026.', perf:'Person', src:'facebook' }
};

/* Événements réels non présents dans l'onglet « concerts » du Sheet. */
const EXTRAS = [
  { date:'2026-07-30', id:'blind-test', groupe:'La Guinguette du Dispensaire', title:'Blind test musical', type:'Animation', heure:'19:00–21:00', img:'photo16',
    alt:'Blind test musical à la Guinguette du Dispensaire, Sartrouville',
    desc:"Soirée musique, fun et challenge : en équipe ou entre amis, on teste ses connaissances musicales et on découvre qui est le vrai mélomane du groupe.", perf:'Organization', src:'instagram' }
];

const LIBRE = 'Accès libre et gratuit — le parc est un espace public, seules les consommations sont payantes.';
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
  // Date ISO tapée en texte : « 2026-09-17 » ou « 2026/9/17 ».
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(Number(iso[2])).padStart(2,'0')}-${String(Number(iso[3])).padStart(2,'0')}`;
  // Date française : « jeudi 2 juillet », « 5 septembre »…
  const s = sansAccent(raw).toLowerCase();
  const m = s.match(/(\d{1,2})\s+([a-zûôé]+)/);
  if (!m) return null;
  const mois = MOIS_NUM[m[2]];
  if (!mois) return null;
  return `${SAISON}-${String(mois).padStart(2,'0')}-${String(Number(m[1])).padStart(2,'0')}`;
}
function humain(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}
function aujourdhuiParis() {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit' });
  return f.format(new Date()); // AAAA-MM-JJ
}

/* ── Type / description / image par défaut pour un concert inconnu ───── */
function typeLabel(groupe, style) {
  const g = sansAccent(groupe).toLowerCase(), s = sansAccent(style).toLowerCase();
  if (g.includes('blind test')) return 'Animation';
  if (g.includes('cinema') || g.includes('cine ')) return 'Soirée';
  if (s.includes('dj') || g.includes('dj ')) return 'DJ set';
  return 'Concert';
}
function descDefaut(groupe, type, style) {
  const st = String(style || '').trim();
  const styleClause = st ? ` (${st})` : '';
  if (type === 'DJ set') return `${groupe} installe ses platines à la guinguette pour un DJ set en plein air, sous les arbres du Parc du Dispensaire.`;
  if (type === 'Animation') return `${groupe} : une soirée musique et bonne humeur à la guinguette, sous les arbres du Parc du Dispensaire.`;
  if (type === 'Soirée') return `${groupe} à la guinguette : une soirée en plein air au cœur du Parc du Dispensaire.`;
  return `${groupe}${styleClause} monte sur la scène de la guinguette pour une soirée en plein air, sous les arbres du Parc du Dispensaire.`;
}
function titreDefaut(groupe, type) {
  if (type === 'DJ set') return `${groupe} en DJ set`;
  if (type === 'Concert') return `${groupe} en concert`;
  return groupe;
}
function imageDefaut(iso) {
  let h = 0; for (const c of iso) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return POOL[h % POOL.length];
}
function perfDefaut(type) { return type === 'DJ set' ? 'Person' : 'MusicGroup'; }

/* ── Normalisation d'un concert -> objet d'affichage complet ────────── */
function normaliser(base) {
  const o = OVERRIDES[base.date] || {};
  const type = o.type || base.type || typeLabel(base.groupe || '', base.style || '');
  const ev = {
    date: base.date,
    groupe: base.groupe || o.title || '',
    type,
    heure: o.heure || base.heure || (type === 'Concert' ? '19:00–21:00' : '19:00–21:30'),
    img: o.img || base.img || imageDefaut(base.date),
    id: o.id || base.id || (slug(base.groupe || 'concert') + '-' + base.date),
    title: o.title || base.title || titreDefaut(base.groupe || '', type),
    desc: o.desc || base.desc || descDefaut(base.groupe || '', type, base.style || ''),
    alt: o.alt || base.alt || `Concert en plein air à la Guinguette du Dispensaire, Sartrouville`,
    perf: o.perf || base.perf || perfDefaut(type),
    src: o.src || base.src || null
  };
  return ev;
}

/* ── Rendu d'une carte ──────────────────────────────────────────────── */
function carte(ev, passe) {
  const [w, h] = PHOTO_DIMS[ev.img] || [640, 480];
  const cls = 'ev' + (passe ? ' ev-passe' : '');
  const srcLine = (passe && ev.src && SRC_URL[ev.src])
    ? `\n      <p class="ev-src"><a href="${SRC_URL[ev.src]}" target="_blank" rel="noopener">Annonce d'origine</a></p>`
    : '';
  return `  <article class="${cls}" id="${esc(ev.id)}" data-date="${ev.date}">
    <div class="ev-img"><picture><source srcset="${ev.img}-640.webp 640w, ${ev.img}-960.webp 960w" sizes="(max-width:700px) 92vw, 320px" type="image/webp"><img src="${ev.img}-640.jpg" srcset="${ev.img}-640.jpg 640w, ${ev.img}-960.jpg 960w" sizes="(max-width:700px) 92vw, 320px" alt="${esc(ev.alt)}" loading="lazy" decoding="async" width="${w}" height="${h}"></picture></div>
    <div class="ev-txt">
      <p class="ev-date"><time datetime="${ev.date}">${humain(ev.date)}</time> · ${ev.heure} · ${esc(ev.type)}</p>
      <h3>${esc(ev.title)}</h3>
      <p>${esc(ev.desc)}</p>
      <p class="ev-libre">${LIBRE}</p>${srcLine}
    </div>
  </article>`;
}

/* ── Rendu d'un événement JSON-LD (schema.org) ──────────────────────── */
function heureBornes(h) {
  const m = String(h).replace(/[–—]/g, '-').match(/(\d{1,2})[:h](\d{2})\s*-\s*(\d{1,2})[:h](\d{2})/);
  if (m) return [`${m[1].padStart(2,'0')}:${m[2]}`, `${m[3].padStart(2,'0')}:${m[4]}`];
  return ['19:00', '21:30'];
}
function jsonldEvent(ev) {
  const [d, f] = heureBornes(ev.heure);
  return {
    '@context':'https://schema.org', '@type':'Event',
    name: `${ev.title} — La Guinguette du Dispensaire`,
    startDate: `${ev.date}T${d}:00+02:00`,
    endDate: `${ev.date}T${f}:00+02:00`,
    eventStatus:'https://schema.org/EventScheduled',
    eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
    description: /accès libre/i.test(ev.desc) ? ev.desc : `${ev.desc} Accès libre et gratuit.`,
    location:{ '@type':'Place', name:'La Guinguette du Dispensaire', address:{ '@type':'PostalAddress',
      streetAddress:'Parc du Dispensaire, 1 Avenue Maurice Berteaux', addressLocality:'Sartrouville',
      postalCode:'78500', addressRegion:'Île-de-France', addressCountry:'FR' },
      geo:{ '@type':'GeoCoordinates', latitude:48.9439033, longitude:2.1619547 },
      publicAccess:true, isAccessibleForFree:true },
    organizer:{ '@type':'Organization', name:'La Guinguette du Dispensaire', url:`${BASE}/` },
    isAccessibleForFree:true,
    image:[`${BASE}/${ev.img}-960.jpg`],
    url:`${BASE}/agenda.html#${ev.id}`,
    offers:{ '@type':'Offer', price:'0', priceCurrency:'EUR', availability:'https://schema.org/InStock',
      url:`${BASE}/agenda.html`, validFrom:`${SAISON}-06-01` },
    performer:{ '@type':ev.perf, name:ev.groupe }
  };
}

/* ── Remplacement d'une zone, repérée par la structure existante ─────── */
function remplacer(html, re, produire, label) {
  if (!re.test(html)) throw new Error(`Zone « ${label} » introuvable dans ${FICHIER}.`);
  return html.replace(re, () => produire());   // fonction : pas d'interprétation de $ dans le contenu
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
  let date = null;
  if (typeof cell === 'number') date = dateDepuisSerial(cell);
  else date = dateDepuisTexte(cell);
  if (!date) continue;                       // ligne « Option jeudi 17 ou 24 » : ignorée
  brut.push({ date, groupe, style });        // le cachet (colonne F) n'est jamais lu
}

if (!brut.length) { console.error('Onglet « concerts » vide ou illisible — on ne touche à rien.'); process.exit(1); }

/* Fusion Sheet + EXTRAS, dédoublonnage par date (le Sheet gagne). */
const parDate = new Map();
for (const e of EXTRAS) parDate.set(e.date, e);
for (const e of brut)   parDate.set(e.date, e);

const events = [...parDate.values()].map(normaliser);
const today = aujourdhuiParis();
const avenir = events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
const passes = events.filter(e => e.date <  today).sort((a, b) => b.date.localeCompare(a.date));

console.log(`Concerts lus : ${events.length}  (à venir : ${avenir.length}, passés : ${passes.length}, aujourd'hui : ${today})`);

const avenirHTML = avenir.map(e => carte(e, false)).join('\n\n') || '';
const passesHTML = passes.map(e => carte(e, true)).join('\n');

const ld = [...avenir.map(jsonldEvent), ...passes.map(jsonldEvent), {
  '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
    { '@type':'ListItem', position:1, name:'Accueil', item:`${BASE}/` },
    { '@type':'ListItem', position:2, name:'Agenda des concerts et animations', item:`${BASE}/agenda.html` }
  ]
}];
const jsonldHTML = '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 1) + '\n</script>';

let html = await readFile(FICHIER, 'utf8');
const avant = html;

// 1) Le bloc JSON-LD (il n'y en a qu'un dans la page).
html = remplacer(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  () => jsonldHTML, 'JSON-LD');

// 2) Les cartes « À venir » — entre <div id="a-venir"> et la section « Déjà passés ».
html = remplacer(html, /<div id="a-venir">[\s\S]*?<\/div>\s*<div class="agenda-sec">\s*<h2>Déjà pass/,
  () => `<div id="a-venir">\n${avenirHTML}\n</div>\n\n<div class="agenda-sec">\n<h2>Déjà pass`, 'à venir');

// 3) Les cartes « Déjà passés » — entre <div id="passes"> et la section « Aussi au Parc ».
html = remplacer(html, /<div id="passes">[\s\S]*?<\/div>\s*<div class="agenda-sec">\s*<h2>Aussi au Parc/,
  () => `<div id="passes">\n${passesHTML}\n</div>\n\n<div class="agenda-sec">\n<h2>Aussi au Parc`, 'passés');

if (html === avant) { console.log('Agenda déjà à jour — aucun changement.'); }
else { await writeFile(FICHIER, html); console.log('agenda.html régénéré.'); }
