# Pubblicare Grottammare isometrica

Il sito è **autonomo**: non usa i server di Isometric World. La build mette pagine, tessere e dati della mappa in
un'unica cartella, `web/dist/` (circa 33 MB, circa 2300 file), che si carica così com'è su qualsiasi hosting statico.

## 1. Prima di andare online (obblighi di licenza)

- [x] **Rendere pubblico il codice** (ODbL): fatto il 2026-11-27, il repository è pubblico (email dei commit
      sostituita con l'indirizzo anonimo di GitHub). La mappa è un'opera derivata da OpenStreetMap: dove la si mostra al
      pubblico, deve essere pubblico anche il metodo per ricostruire i dati derivati, cioè `pipeline/`: il
      repository deve **restare pubblico** finché il sito è online. Il link "Codice e metodo (ODbL)" nel footer
      (`SOURCE_URL`) punta lì.
      Il repository non contiene foto né chiavi: `.env`, `data/` e `Screenshot/` sono esclusi.
- [ ] **Dominio**: quando lo conosci, mettilo in `.env` come `SITE_DOMAIN=grottammare.esempio.it` e rifai la
      build, così le anteprime social (og:image, canonical) hanno indirizzi assoluti.
- [ ] **Meteo**: l'API gratuita di Open-Meteo è per uso non commerciale (fino a 10.000 chiamate al giorno). Se il
      sito diventa commerciale (pubblicità, servizio a pagamento) serve il loro piano a pagamento.

Già a posto nel sito costruito:

| Obbligo | Dove |
|---|---|
| © OpenStreetMap contributors (ODbL) | footer della mappa, card social |
| Copernicus DEM © DLR, Airbus DS | footer (testo completo al passaggio del mouse), card social |
| Ortofoto AGEA 2022, CC BY 4.0, modificata | footer, card social, `ATTRIBUTION.md` |
| Open-Meteo, CC BY 4.0 | footer |
| "Painted with AI" | footer, video |
| Licenza MIT del codice (Dmytro Krasun, Domenico Gagliardi) | `/LICENSE.txt` nel sito, `LICENSE` nel repository, riga "Made by" nel footer |
| Librerie incluse nel sito (OpenSeadragon BSD-3, three.js MIT, Astro MIT) | `/THIRD-PARTY-NOTICES.txt` |

Le foto in `Screenshot/` (comprese quelle © Dino Cappelletti) non vengono pubblicate: sono servite solo come
descrizione testuale.

## 2. Costruire il sito

Va fatto su questo computer, perché le tessere stanno in `data/` (non in git):

```sh
npm run export -- peretti lungomare abitato   # solo se hai cambiato dipinti o render
npm run og -- grottammare                     # solo se è cambiata la vista d'apertura
npm run build                                 # → web/dist/
```

`.env` deve contenere `SITE_REGIONS=grottammare` (già impostato). Il sito ha solo Grottammare: `/` e `/grottammare`.

Per provarlo in locale come farebbe un hosting qualsiasi: `npx astro preview` dentro `web/`, oppure un server statico
qualsiasi puntato su `web/dist/`.

## 3. Caricarlo

**Consigliato: Cloudflare** (piano gratuito: file statici senza limite di traffico, fino a 20.000 file per sito, va
bene anche per progetti futuri). Una volta sola:

```sh
# 1. crea un account gratuito su dash.cloudflare.com (lo fai tu)
npx wrangler@4 login        # si apre il browser: autorizza Wrangler
```

Ogni volta che vuoi pubblicare:

```sh
npm run build
npm run deploy:site         # carica web/dist con wrangler.site.jsonc → https://grottammare-isometrica.<tuo-account>.workers.dev
```

Il dominio tuo si collega poi da dashboard (Workers → grottammare-isometrica → Domains). Mettilo anche in `.env`
come `SITE_DOMAIN` e rifai build e deploy.

Altri hosting statici funzionano allo stesso modo: carica **il contenuto** di `web/dist/` (non la cartella `web/`):

- **Netlify**: trascina `web/dist` su app.netlify.com/drop, oppure `npx netlify deploy --dir web/dist --prod`.
  Legge `_headers` (cache) e `_redirects`.
- **Cloudflare Pages**: Direct Upload della cartella `web/dist` (limite 20.000 file: siamo a circa 2.300). Legge
  `_headers` e `_redirects`.
- **GitHub Pages**: va bene anche se ignora `_headers`/`_redirects`; `404.html` funziona.
- Qualsiasi hosting statico (anche FTP), purché serva i file `.avif` come `image/avif` (lo fanno tutti quelli moderni).

## 4. Da non fare

- `npm run publish` e `npm run deploy` sono gli strumenti del progetto originale (bucket R2 e Worker di Isometric
  World). Con `SITE_REGIONS` impostato si rifiutano di partire.
- Non chiamare il sito "Isometric World" e non usare i suoi domini: è un progetto tuo, basato sul loro codice.
