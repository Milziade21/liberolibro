// Genera i messaggi di richiesta foto (mail-merge) dal template + luoghi.json.
// Uso: node messaggi.js  ->  scrive messaggi.csv (email, oggetto, messaggio)
// Il CSV si importa in un qualsiasi strumento di mail-merge (Gmail, ecc.).

const fs = require('fs');

// ponytail: mittente hardcoded, cambialo con l'email reale dell'associazione.
const MITTENTE = 'LiberoLibro <info@liberolibro.it>';

const tpl = fs.readFileSync(__dirname + '/messaggio-contributo.txt', 'utf8');
const [rigaOggetto, ...corpo] = tpl.split('\n');
const oggetto = rigaOggetto.replace(/^Oggetto:\s*/, '');
const testoBase = corpo.join('\n').trim();

const luoghi = JSON.parse(fs.readFileSync(__dirname + '/luoghi.json', 'utf8'));
const conEmail = luoghi.filter(l => l.email);

const riempi = (s, l) => s
  .replaceAll('{nome}', l.nome)
  .replaceAll('{citta}', l.citta || '')
  .replaceAll('{email_mittente}', MITTENTE);

const csvCell = s => `"${String(s).replaceAll('"', '""')}"`;
const righe = [['email', 'nome', 'oggetto', 'messaggio'].map(csvCell).join(',')];
for (const l of conEmail) {
  righe.push([l.email, l.nome, riempi(oggetto, l), riempi(testoBase, l)].map(csvCell).join(','));
}
fs.writeFileSync(__dirname + '/messaggi.csv', righe.join('\n') + '\n');

console.log(`${conEmail.length}/${luoghi.length} luoghi hanno un'email → messaggi.csv`);
console.log(`${luoghi.length - conEmail.length} senza email: contatti da recuperare (sito, social, di persona).`);
