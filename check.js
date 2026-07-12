// Controllo minimo dei dati: `node check.js`
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const luoghi = require('./luoghi.json');

assert(Array.isArray(luoghi) && luoghi.length > 0, 'luoghi.json deve essere un array non vuoto');

for (const l of luoghi) {
  const dove = `"${l.nome || '???'}"`;
  for (const campo of ['nome', 'categoria', 'citta', 'indirizzo', 'lat', 'lon', 'descrizione'])
    assert(l[campo] !== undefined && l[campo] !== '', `${dove}: manca il campo "${campo}"`);
  assert(['libreria', 'spazio', 'evento', 'lettura'].includes(l.categoria), `${dove}: categoria non valida "${l.categoria}"`);
  // Bounding box dell'Italia
  assert(l.lat > 35 && l.lat < 48 && l.lon > 6 && l.lon < 19, `${dove}: coordinate fuori dall'Italia (${l.lat}, ${l.lon})`);
  if (l.categoria === 'evento')
    assert(/^\d{4}-\d{2}-\d{2}$/.test(l.data), `${dove}: gli eventi richiedono "data" in formato AAAA-MM-GG`);
}

console.log(`OK — ${luoghi.length} luoghi validi`);

// Budget immagini: i disegni/foto locali devono stare entro 100 KB.
const LIMITE = 100 * 1024;
let immagini = 0;
for (const l of luoghi) {
  if (!l.foto || /^https?:/i.test(l.foto)) continue; // solo file nel repo
  const p = path.join(__dirname, l.foto);
  assert(fs.existsSync(p), `"${l.nome}": immagine mancante "${l.foto}"`);
  const kb = fs.statSync(p).size;
  assert(kb <= LIMITE, `"${l.nome}": immagine ${Math.round(kb / 1024)}KB > 100KB (${l.foto})`);
  immagini++;
}
if (immagini) console.log(`OK — ${immagini} immagini entro 100KB`);

// Blog: se presente, ogni post referenziato deve esistere e avere il front-matter.
const postsFile = path.join(__dirname, 'blog', 'posts.json');
if (fs.existsSync(postsFile)) {
  const posts = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
  for (const f of posts) {
    const p = path.join(__dirname, 'blog', f);
    assert(fs.existsSync(p), `blog: manca il file "${f}"`);
    const txt = fs.readFileSync(p, 'utf8');
    for (const campo of ['titolo', 'autore', 'tipo'])
      assert(new RegExp('^' + campo + ':', 'm').test(txt), `blog "${f}": manca "${campo}" nel front-matter`);
    assert(/^tipo:\s*(lettori|librai)\s*$/m.test(txt), `blog "${f}": "tipo" deve essere lettori|librai`);
  }
  console.log(`OK — ${posts.length} post del blog validi`);
}
