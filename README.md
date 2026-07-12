# LiberoLibro

Mappa collaborativa delle **librerie indipendenti e dell'usato**, degli **spazi
comunitari** e degli **eventi underground** d'Italia — per dare visibilità alle
realtà controculturali che vogliono raggiungere il pubblico più ampio possibile.

Niente catene, niente spazi puramente commerciali.

## Struttura

Zero build step. Un file di dati, una pagina, un crawler, un server.

| File | Cosa fa |
|------|---------|
| [index.html](index.html) | L'app: SVG puro, split-screen, zoom per regione, foto mascherate nella sagoma (nessuna dipendenza) |
| [regioni.geojson](regioni.geojson) | Confini delle 20 regioni italiane (ISTAT via Openpolis, coordinate arrotondate) |
| [luoghi.json](luoghi.json) | Tutti i luoghi (curati a mano + raccolti da OSM) |
| [collect.js](collect.js) | Crawler città-per-città (Overpass + Nominatim) |
| [server.js](server.js) | Server statico per Railway (solo moduli nativi Node) |
| [check.js](check.js) | Validazione dei dati |
| [messaggio-contributo.txt](messaggio-contributo.txt) | Template per chiedere ai librai foto, specialità, consigli, AbeBooks |
| [messaggi.js](messaggi.js) | Mail-merge: genera `messaggi.csv` dai luoghi con email |
| [GEMINI_RESEARCH.md](GEMINI_RESEARCH.md) | Prompt di deep research per strutturare il progetto |

## Cosa rende "indipendente" una libreria

Due filtri, dal più netto al più fine:

1. **Blocklist catene** (`CATENE` in `collect.js`): Feltrinelli, Mondadori, Giunti,
   Ubik, Libraccio, Athesia, ecc.
2. **Omonimi = flag** (`annota()` in `collect.js`): un nome presente in **più città**
   è un conglomerato/franchising, non una singola realtà indipendente. Queste voci
   restano sulla mappa ma con `indip: false`; il toggle **"Solo indipendenti"** le
   nasconde. Rilancia il flag senza crawlare con `node collect.js --annota`.

Campi opzionali per libreria: `specialita`, `consiglio`, `abebooks`, `universitaria`,
`foto`. Compaiono nella mini-scheda quando presenti; si popolano via contributo dei librai.

## Dove leggere (Amici del libro)

Accanto alle librerie, la mappa segna i **posti dove leggere** in città: parchi,
moli, angoli book-friendly (categoria `lettura`, chip "Dove leggere").

Alcuni posti si condividono con tutti; altri si tengono per sé. I luoghi con
`"riservato": true` sono **nascosti di default** e compaiono solo attivando il
toggle **"Riservati"**.

```json
{ "nome": "Molo Audace", "categoria": "lettura", "citta": "Trieste",
  "indirizzo": "Molo Audace", "lat": 45.6494, "lon": 13.7636,
  "descrizione": "…", "tipo": "molo", "riservato": false }
```

## Contributo dei librai

Foto, specialità, consigli e link al catalogo si chiedono direttamente ai luoghi.
Il template [messaggio-contributo.txt](messaggio-contributo.txt) è pensato per
un'associazione no-profit (nessuna finalità commerciale) e chiede sempre il
**consenso a pubblicare**.

```sh
node messaggi.js   # -> messaggi.csv (email, oggetto, messaggio) per il mail-merge
```

Solo una parte dei luoghi ha un'email su OpenStreetMap; per gli altri il contatto
va recuperato (sito, social).

### Immagini: un disegno per ogni libreria

Preferiamo un **disegno** fatto da chi la libreria la vive, così ogni scheda ha uno
stile suo (in alternativa foto d'epoca/d'archivio; no Street View). I file vanno in
[`foto/`](foto/), il campo `foto` di ogni luogo punta al file, **budget 100 KB max**
per immagine — `node check.js` fa fallire ogni immagine oltre soglia.

## Il progetto e l'opt-out

[progetto.html](progetto.html) racconta chi siamo e lo spirito del progetto, e
contiene un **form di opt-out** (chi non vuole comparire): senza backend, compone
una mail di rimozione via `mailto`. Linkata dall'header della mappa.

## Roadmap (da decidere)

- **Blog "consigli dei lettori / dei librai"**: contributi editoriali. Approccio
  lazy proposto = post in Markdown nel repo, contribuibili via pull request o form
  che apre una issue — nessun backend. Da confermare prima di costruirlo.
- Integrazione con canali istituzionali (es. Radio 3) per la promozione della lettura.

## Come funziona la mappa

Nessuna tile, nessun Leaflet: è un SVG disegnato dai confini regionali. Il `viewBox`
viene animato per lo zoom (bordi netti con `vector-effect`), i luoghi sono assegnati
alla regione con un point-in-polygon, e la foto di un luogo selezionato viene
mascherata dentro la sagoma della regione (`clipPath`) con dissolvenza.

Le **foto** dei luoghi sono per ora placeholder generati al volo; il campo `foto`
in `luoghi.json` le rende definitive. L'idea è popolarlo con Google Street View /
Maps API (tier gratuito).

## Sviluppo locale

```sh
npm start          # server su http://localhost:8642
npm run check      # valida luoghi.json
npm run collect                 # crawla tutte le città della lista
npm run collect -- Bologna Roma # crawla solo alcune città (utile per test)
```

## Come funziona il crawler

Non fa scraping dei siti. Per ogni città:

1. **Nominatim** geocodifica il nome in un bounding box.
2. **Overpass** restituisce i punti `shop=books` dentro quel box.
3. Le **catene** vengono filtrate con una blocklist (`CATENE` in `collect.js`).
4. Il risultato viene unito a `luoghi.json`, **preservando le voci curate a mano**
   (tutto ciò che non ha `"fonte": "osm"`).

Le schede da OSM sono generate automaticamente: **indirizzi e nomi vanno
verificati** prima di considerarli definitivi.

## Deploy su Railway

1. Collega questa repository a un nuovo progetto Railway.
2. Railway rileva Node da `package.json` ed esegue `npm start`.
3. Il server legge la porta da `process.env.PORT` (già gestito).

Il crawler (`npm run collect`) va eseguito periodicamente per aggiornare i dati:
in locale e committando il JSON, oppure come scheduled job su Railway.

## Aggiungere un luogo a mano

Aggiungi una voce a `luoghi.json` (senza `"fonte": "osm"`, così il crawler non la
sovrascrive):

```json
{
  "nome": "Nome del luogo",
  "categoria": "libreria | spazio | evento",
  "citta": "Città",
  "indirizzo": "Via e numero",
  "lat": 41.9,
  "lon": 12.5,
  "descrizione": "Una o due frasi.",
  "sito": "https://... (opzionale)",
  "data": "AAAA-MM-GG (solo per gli eventi)"
}
```

Poi `npm run check`.

## Criteri di inclusione

Realtà indipendenti, autogestite o no-profit che vogliono visibilità pubblica:
librerie indipendenti e dell'usato, biblioteche popolari, centri sociali, spazi
di comunità, festival e rassegne autoprodotte.

## Dati e licenze

I dati delle librerie derivano da [OpenStreetMap](https://www.openstreetmap.org/copyright)
(licenza ODbL): l'attribuzione è obbligatoria ed è mostrata sulla mappa.
