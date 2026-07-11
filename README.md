# LiberoLibro

Mappa collaborativa delle **librerie indipendenti e dell'usato**, degli **spazi
comunitari** e degli **eventi underground** d'Italia — per dare visibilità alle
realtà controculturali che vogliono raggiungere il pubblico più ampio possibile.

Niente catene, niente spazi puramente commerciali.

## Struttura

Zero build step. Un file di dati, una pagina, un crawler, un server.

| File | Cosa fa |
|------|---------|
| [index.html](index.html) | La mappa (Leaflet, base vettoriale bianco/nero) |
| [europa.geojson](europa.geojson) | Confini d'Europa (Natural Earth): Italia in nero, resto in grigio |
| [luoghi.json](luoghi.json) | Tutti i luoghi (curati a mano + raccolti da OSM) |
| [collect.js](collect.js) | Crawler città-per-città (Overpass + Nominatim) |
| [server.js](server.js) | Server statico per Railway (solo moduli nativi Node) |
| [check.js](check.js) | Validazione dei dati |
| [GEMINI_RESEARCH.md](GEMINI_RESEARCH.md) | Prompt di deep research per strutturare il progetto |

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
