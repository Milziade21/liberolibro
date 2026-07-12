// Crawler città-per-città delle librerie indipendenti e dell'usato in Italia.
// Fonte: OpenStreetMap (Overpass API) + geocoding Nominatim. Nessuna chiave, nessuno scraping HTML.
// Uso:  node collect.js                → tutte le città della lista
//       node collect.js Bologna Torino → solo le città indicate (utile per test)
//
// ponytail: usa i dati già strutturati di OSM invece di scrapare i siti delle librerie.
// Ceiling: copre solo ciò che è mappato su OSM. Upgrade: integrare altre fonti (es. ANARPI, cataloghi regionali).

const fs = require('fs');
const path = require('path');

const UA = 'LiberoLibro/1.0 (mappa spazi indipendenti; https://github.com/Milziade21/liberolibro)';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Città di default: capoluoghi + centri con scena indipendente attiva. Modificabile a piacere.
const CITTA = [
  'Torino', 'Milano', 'Genova', 'Venezia', 'Verona', 'Trieste', 'Bologna', 'Firenze',
  'Roma', 'Napoli', 'Bari', 'Palermo', 'Catania', 'Cagliari', 'Padova', 'Parma',
  'Modena', 'Ravenna', 'Perugia', 'Pisa', 'Livorno', 'Ancona', 'Pescara', 'Lecce',
  'Cosenza', 'Salerno', 'Brescia', 'Bergamo', 'Trento', 'Bolzano', 'Udine', 'Ferrara',
  // Sud e isole
  'Reggio Calabria', 'Catanzaro', 'Crotone', 'Vibo Valentia',
  'Messina', 'Siracusa', 'Trapani', 'Agrigento', 'Ragusa', 'Caltanissetta', 'Enna',
  'Sassari', 'Nuoro', 'Oristano', 'Olbia',
  'Taranto', 'Brindisi', 'Foggia', 'Barletta', 'Andria',
  'Caserta', 'Benevento', 'Avellino',
  'Potenza', 'Matera', 'Campobasso',
];

// Catene da escludere (match su sottostringa, case-insensitive).
// Solo brand di catena/franchising. NB: "coop" da solo NO — escluderebbe le
// cooperative indipendenti, che invece vogliamo. Match sul brand esteso.
const CATENE = [
  'feltrinelli', 'mondadori', 'giunti', 'ubik', 'libraccio', 'ibs',
  'libreria coop', 'librerie coop', 'librerie.coop', 'melbookstore', 'mel bookstore',
  'arion', 'ricordi',
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Retry con backoff su 429/5xx: gli endpoint pubblici rate-limitano spesso.
async function fetchRetry(url, opts = {}, tentativi = 4) {
  for (let i = 0; i < tentativi; i++) {
    const r = await fetch(url, opts);
    if (r.ok) return r;
    if (r.status !== 429 && r.status < 500) throw new Error(`HTTP ${r.status}`);
    if (i < tentativi - 1) await sleep(3000 * (i + 1)); // 3s, 6s, 9s
    else throw new Error(`HTTP ${r.status} dopo ${tentativi} tentativi`);
  }
}

async function geocodifica(citta) {
  const url = `${NOMINATIM}?q=${encodeURIComponent(citta + ', Italia')}&format=json&limit=1`;
  const r = await fetchRetry(url, { headers: { 'User-Agent': UA } });
  const [primo] = await r.json();
  if (!primo) return null;
  // boundingbox = [south, north, west, east] come stringhe
  return primo.boundingbox.map(Number);
}

async function libreriePerBbox([s, n, w, e]) {
  const query = `[out:json][timeout:90];(nwr["shop"="books"](${s},${w},${n},${e}););out center tags;`;
  const r = await fetchRetry(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query),
  });
  return (await r.json()).elements || [];
}

const isCatena = nome => {
  const l = nome.toLowerCase();
  return CATENE.some(c => l.includes(c));
};

function toLuogo(el, citta) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null || !t.name) return null;

  const usato = /^(only|yes)$/.test(t.second_hand || '') || /usato|remainder/i.test(t.name);
  const via = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const indirizzo = via || t['addr:full'] || `Indirizzo da verificare — ${citta}`;

  return {
    nome: t.name,
    categoria: 'libreria',
    citta,
    indirizzo,
    lat: +lat.toFixed(5),
    lon: +lon.toFixed(5),
    descrizione: usato
      ? `Libreria dell'usato a ${citta}. Scheda generata da OpenStreetMap: verificare i dettagli.`
      : `Libreria indipendente a ${citta}. Scheda generata da OpenStreetMap: verificare i dettagli.`,
    sito: t.website || t['contact:website'] || undefined,
    email: t.email || t['contact:email'] || undefined,
    usato: usato || undefined,
    fonte: 'osm',
    osm_id: `${el.type}/${el.id}`,
  };
}

async function main() {
  const citta = process.argv.slice(2).length ? process.argv.slice(2) : CITTA;
  const file = path.join(__dirname, 'luoghi.json');
  const esistenti = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const curati = esistenti.filter(l => l.fonte !== 'osm');
  // Parti dalle voci OSM già presenti: così rilanciare poche città è incrementale, non le cancella.
  const trovate = new Map(esistenti.filter(l => l.fonte === 'osm').map(l => [l.osm_id, l]));
  let scartate = 0;

  for (const c of citta) {
    try {
      const bbox = await geocodifica(c);
      await sleep(1100); // Nominatim: max ~1 req/s
      if (!bbox) { console.warn(`✗ ${c}: non geocodificata`); continue; }

      const elementi = await libreriePerBbox(bbox);
      await sleep(1100); // gentile con Overpass pubblico

      let ok = 0;
      for (const el of elementi) {
        const luogo = toLuogo(el, c);
        if (!luogo) continue;
        if (isCatena(luogo.nome)) { scartate++; continue; }
        trovate.set(luogo.osm_id, luogo); // ultima città vince, ma è la stessa entità
        ok++;
      }
      console.log(`✓ ${c}: ${ok} librerie (${elementi.length} punti grezzi)`);
    } catch (err) {
      console.warn(`✗ ${c}: ${err.message}`);
    }
  }

  // Unisci con i luoghi curati a mano; scarta le voci OSM che duplicano una voce curata (stesso nome+città).
  const chiave = l => `${l.nome}|${l.citta}`.toLowerCase().trim();
  const curatiKey = new Set(curati.map(chiave));
  const osmFiltrati = [...trovate.values()].filter(l => !curatiKey.has(chiave(l)));
  const finale = [...curati, ...osmFiltrati];

  fs.writeFileSync(file, JSON.stringify(finale, null, 2) + '\n');
  console.log(`\n${trovate.size} librerie da OSM · ${scartate} catene escluse · ${curati.length} voci curate mantenute → luoghi.json (${finale.length} totali)`);
}

main();
