# Grottammare isometrica — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un sito locale in italiano che apre sulla veduta cartolina di Grottammare, dipinta edificio per edificio da dati aperti, da far guardare e poi portare al sindaco.

**Architecture:** Si clona krasun/isometricworld (MIT) e si aggiunge una regione nuova, lontana da Tel Aviv, Stoccarda, Zagabria e Wieliczka. Da dg996/mondoisometrico si copiano solo luce, meteo e lampioni. Auto e treno restano quelli già nel clone. Origine e angolo si bloccano prima di dipingere. Due sì dell'autore fermano il lavoro: il render nudo, poi la prova dipinta.

**Tech Stack:** Node 24, TypeScript, npm workspaces (`pipeline`, `web`), Astro 7, OpenSeadragon, Three.js, Chrome via `CHROME_PATH`, osmium, Codex CLI per la pittura, test con `node:test` lanciato da `tsx`.

**Spec:** docs/superpowers/specs/2026-11-23-grottammare-isometrica-design.md

## Global Constraints

- Node come da `.node-version` del clone (24). Il sito richiede Node `>=22.23.4`. Se `node -v` non è 22 o 24, fermarsi e chiedere. Non installare Node di nascosto.
- Dati aperti soltanto. Vietati Google, Apple, Bing, Mapbox satellite, anche come riferimento di pittura o per «controllare».
- Non partire da dg996/mondoisometrico. Non copiare `ctrn.ts`, `transit.ts`, `trams.ts`, `live-traffic.ts`, `api/traffic.ts`, `api/feedback.ts`, `api/p.ts`, `city-walls.ts`, `roma-style.ts`, i monumenti di Roma, `traffic.ts` di Roma, i test col nome `roma`.
- Non impostare `sources` (`tlv`, `lgl`, `zg3d`, `gugik`). Edifici e alberi da OSM, terreno Copernicus.
- Non impostare `rail`. Il binario Adriatico usa i treni già in `web/src/scripts/trains.ts`. Non modellare Trenitalia. Non impostare `stock: "zet"`.
- `life` è solo `{ vehicles: "detailed" }`. Niente `foreground`, aeroporto, piccioni, insegne, airfield.
- Pittura: Codex CLI (`codex exec`). Se l'utente non è loggato, fermarsi e chiedere. Non creare `FAL_KEY`, non impostare `PAINT_BACKEND=fal`, non spendere.
- `CHROME_PATH` in `.env` non committato. Ordine: `C:\Program Files\Google\Chrome\Application\chrome.exe`, poi `(x86)`, poi Edge solo se Chrome manca. Scrivere nel messaggio quale binario è stato usato.
- Estratto OSM: `https://download.geofabrik.de/europe/italy/centro-latest.osm.pbf`. Serve `osmium`. Non scaricare l'Italia intera.
- Origine provvisoria, nodo OSM del paese (70980633): `{ lat: 42.9904967, lon: 13.8687605, h: 0 }`. `headingDeg` provvisorio `260`. Dopo che esistono tessere non si cambiano più. Si cancellano `data/derived/<area>` di Grottammare e `data/web/regions/grottammare` solo fra una prova di angolo e l'altra, prima del lucchetto. Mai il derived di un'altra regione, mai `data/web-state`, mai dopo il lucchetto.
- `center` e `widthM` non spostano le tessere. I valori fissati sono `[42.993, 13.872]` e `2200`. Si correggono solo se il primo schermo non contiene mare e borgo, e si aggiorna il test nello stesso passaggio.
- Interfaccia in italiano solo per Grottammare. Le altre città restano in inglese. Non cancellarle. Non accendere i parrocchetti (`israel-center`). Non toccare `pipeline/src/film.ts` né `pipeline/src/tour.ts`. Lasciare lo script Pirsch com'è.
- Footer senza il cognome dell'autore. Immagini della mappa CC BY 4.0. Il codice resta MIT.
- Open-Meteo è CC BY 4.0, gratuito per uso non commerciale. Va bene per questa versione. Non è un prodotto del Comune.
- Nessuna Carta Tecnica né DTM della Regione Marche in questi task. Se il Paese Alto nel render nudo è un rialzo piatto, fermarsi e chiedere. Non scrivere un lettore.
- Non eseguire `npm run publish`, `npm run deploy`, `npm run archive`. Non puntare `TILES_BUCKET` a `isometricworldtiles`. Non creare bucket né dominio.
- Non fermare un `astro dev` che l'utente aveva già aperto. Si può fermare solo il server avviato dal task, dopo il controllo.
- I commit stanno sul branch `grottammare`. Non fare push. Non committare `.env`, `node_modules`, `data/`.

## Review Focus

Queste sono le cinque modalità che la specifica implica e che un task potrebbe lasciare scoperte. Il test sta nel task indicato.

1. Il prompt regionale nomina un monumento e il modello lo ridipinge in ogni finestra. Task 2: il test rifiuta `Torrione`, `Peretti`, `Arancio`, `Santa Lucia`, `San Giovanni`, `San Pio` dentro `GROTTAMMARE_LOCAL`.
2. Il footer di una regione sconosciuta cita il comune di Tel Aviv. Task 2: `map.ts` non contiene più `Tel Aviv-Yafo Municipality`; `regionSourceLines("grottammare")` non la contiene; `madeByLine("grottammare")` nomina Krasun e Gagliardi.
3. Open-Meteo non risponde e la mappa si rompe, oppure l'etichetta resta in inglese. Task 6: `weatherLabel(0) === "sereno"`, `weatherLabel(63) === "pioggia"`, il sorgente di `ambient.ts` contiene `meteo non disponibile` e le coordinate dell'origine, e non contiene `41.8955` né `12.4823`. Il controllo nel browser (task 11) copre il fallimento di rete.
4. Qualcuno cambia `origin` o `headingDeg` dopo le tessere. Task 2 fissa i numeri nel test. Task 5, dopo il sì, cambia prima il numero atteso (il test fallisce) e poi `places.ts`.
5. Le auto vanno contromano su un senso unico, o il treno non sta sul binario, perché è stato copiato il traffico di Roma o è stato messo `stock: "zet"`. Task 2: `rail` è `undefined` e `life.vehicles` è `"detailed"`. Task 7: `lights.ts` importa `Road` da `./traffic.ts` e `map.ts` non legge `.lit`. Task 11: `traffictest` sulla stazione; se gli overlap in senso opposto stanno su vie a senso unico, ci si ferma.

---

## Mappa dei file

- Creare: `references/UPSTREAM.txt`, `pipeline/src/grottammare-local.ts`, `pipeline/src/grottammare.test.ts`, `web/src/scripts/credits.ts`, `web/src/scripts/ambient.ts`, `web/src/scripts/lights.ts`, `web/src/scripts/share.ts`, `pipeline/landmarks/<nome>/overview.txt` e `key.txt` per `torrione`, `peretti`, `santa-lucia`, `san-pio-v`.
- Modificare: `README.md` (una riga con lo SHA), `pipeline/src/places.ts`, `pipeline/src/areas.ts`, `pipeline/src/paint.ts` (una riga in `LOCAL`), `web/src/scripts/map.ts`, `web/src/components/MapPage.astro`, `web/src/pages/index.astro`, `ATTRIBUTION.md`.
- Spostare: i due `Screenshot_20261114_*.jpg` dalla radice a `references/`.
- Non creare un modulo TypeScript di monumenti sul modello di Zagabria (`REBUILDS` in `pipeline/src/landmarks/zagreb.ts`). I ritagli passano dal comando `landmark` e dai file di testo.
- `LOCAL` in `paint.ts` non si esporta e il file esegue la pittura al caricamento. Il test importa `GROTTAMMARE_LOCAL` dal modulo nuovo e non importa `paint.ts`.

I task 4, 8 e 10 si fermano e aspettano l'autore. Non si va al task dopo senza quel sì.

---

### Task 1: Clone e ambiente

**Files:**
- Create: `references/UPSTREAM.txt`
- Modify: `README.md` (una riga dopo il titolo)
- Move: `Screenshot_20261114_140714_X.jpg`, `Screenshot_20261114_140719_X.jpg` → `references/`
- Test: nessuno (il controllo è il typecheck e la home ancora su Tel Aviv)

**Interfaces:**
- Consumes: niente
- Produces: repository git sul branch `grottammare`, dipendenze installate, `references/UPSTREAM.txt` con l'URL e lo SHA completo del commit clonato

- [ ] **Step 1: Spostare gli screenshot e clonare senza cancellare `docs/` né `references/`**

Dalla radice del workspace, in PowerShell:

```powershell
$dst = (Get-Location).Path
$tmp = Join-Path $env:TEMP "iw-clone"
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
git clone https://github.com/krasun/isometricworld.git $tmp
if ($LASTEXITCODE -ne 0) { throw "clone failed" }
$sha = (git -C $tmp rev-parse HEAD).Trim()
New-Item -ItemType Directory -Force -Path "$dst\references" | Out-Null
@("https://github.com/krasun/isometricworld.git", $sha) | Set-Content -Encoding utf8 "$dst\references\UPSTREAM.txt"
Get-ChildItem $dst -Filter "Screenshot_*.jpg" | Move-Item -Destination "$dst\references"
cmd /c "robocopy `"$tmp`" `"$dst`" /E /NFL /NDL /NJH /NJS /nc /ns /np"
if ($LASTEXITCODE -ge 8) { throw "robocopy failed: $LASTEXITCODE" }
Remove-Item -Recurse -Force $tmp
```

`robocopy` unisce i file. Non cancella `docs/superpowers/` né gli screenshot appena spostati.

- [ ] **Step 2: Annotare lo SHA e creare il branch**

In `README.md`, subito dopo il titolo, una riga:

```markdown
Upstream clonato: https://github.com/krasun/isometricworld/commit/<sha>
```

`<sha>` è la seconda riga di `references/UPSTREAM.txt`. Poi:

```powershell
git checkout -b grottammare
$sha = (Get-Content references\UPSTREAM.txt)[1].Trim()
if (-not (Select-String -Path README.md -Pattern $sha -Quiet)) { throw "SHA missing from README" }
node -v
```

Se la major di Node non è 22 né 24, fermarsi.

- [ ] **Step 3: Installare e verificare che il progetto originale parte**

```powershell
npm install
npm run typecheck
```

Atteso: typecheck con exit 0.

Poi `npm run dev`. Quando stampa la porta, chiedere `http://localhost:<porta>/` e verificare che il corpo contenga `Tel Aviv`. Fermare solo questo processo. `DEFAULT_CITY` è ancora `tel-aviv-yafo`: è il controllo che l'ambiente funziona prima di toccare Grottammare.

```powershell
git check-ignore -q .env
```

Se `.env` non è ignorato, aggiungere una riga `.env` a `.gitignore` prima di creare il file. Non committare `.env`.

- [ ] **Step 4: Commit**

```powershell
git add README.md .gitignore references docs
git commit -m "docs: keep the Grottammare notes beside the isometricworld clone"
```

Aggiungere `.gitignore` solo se lo step 3 l'ha modificato. Non aggiungere altri file del clone: sono già nel commit di upstream.

---

### Task 2: Regione, prompt, crediti

**Files:**
- Create: `pipeline/src/grottammare-local.ts`, `pipeline/src/grottammare.test.ts`, `web/src/scripts/credits.ts`
- Modify: `pipeline/src/places.ts`, `pipeline/src/paint.ts`, `web/src/scripts/map.ts`, `ATTRIBUTION.md`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: `REGIONS`, `CITIES`, `DEFAULT_CITY` da `pipeline/src/places.ts`; `Local` resta privato in `paint.ts`
- Produces:
  - `export const GROTTAMMARE_LOCAL` in `pipeline/src/grottammare-local.ts` (campi `ground`, `country`, `render`, `treesOf`, `treeHint`, `materials`, `trees`; niente `inventionChecks`)
  - `export function regionSourceLines(region: string): string[]` in `web/src/scripts/credits.ts`
  - `export function madeByLine(region: string): string` nello stesso file
  - `REGIONS.grottammare`, `CITIES.grottammare`, `DEFAULT_CITY === "grottammare"`

- [ ] **Step 1: Calcolare il geoide, senza inventare il numero**

`geographiclib` e `cs2cs` non sono installati. Non scrivere un `geoidM` a mano e non usare `0`.

```powershell
pip install geographiclib
python -c "from geographiclib.geoid import Geoid; g=Geoid('egm2008-1'); print(g(42.9904967, 13.8687605))"
```

Il comando scarica la griglia EGM2008. Chiamare `G` il valore arrotondato a 2 decimali. Se `pip` o lo scaricamento fallisce, fermarsi e chiedere. Non proseguire con un numero plausibile.

Controllo a mano, prima del test: `30 < G < 60` e `287 + G < 555`. Se il secondo è falso, fermarsi: il picco comunale non entra nell'intervallo di default del height pass e `heightBase` va deciso insieme, non inventato.

- [ ] **Step 2: Scrivere il test che fallisce**

Creare `pipeline/src/grottammare.test.ts`. `G` e `groundH` sono i numeri dello step 1 (`groundH = G + 4`, entrambi a 2 decimali).

```typescript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CITIES, DEFAULT_CITY, REGIONS } from "./places.ts";
import { GROTTAMMARE_LOCAL } from "./grottammare-local.ts";
import { madeByLine, regionSourceLines } from "../../web/src/scripts/credits.ts";

const region = REGIONS.grottammare;

test("camera e dati di Grottammare", () => {
  assert.equal(region.title, "Grottammare");
  assert.deepEqual(region.origin, { lat: 42.9904967, lon: 13.8687605, h: 0 });
  assert.equal(region.headingDeg, 260);
  assert.equal(region.country, "Italy");
  assert.deepEqual(region.municipalities, ["Grottammare"]);
  assert.equal(region.sources, undefined);
  assert.ok(region.look === undefined || region.look === "painted");
  assert.equal(region.rail, undefined);
  assert.equal(region.airport, undefined);
  assert.equal(region.pigeons, undefined);
  assert.equal(region.signs, undefined);
  assert.equal(region.airfield, undefined);
  assert.deepEqual(region.life, { vehicles: "detailed" });
  assert.deepEqual(region.effects, { search: true });
  assert.equal(region.osmExtract, "https://download.geofabrik.de/europe/italy/centro-latest.osm.pbf");
  assert.equal(region.boundariesFrom, "extract");
  assert.equal(region.geoidM, GEOID); // GEOID è G, già arrotondato a 2 decimali
  assert.equal(region.groundH, GROUND); // GROUND è G + 4, scritto come letterale a 2 decimali, non come somma
  assert.equal(region.heightBase, undefined);
  assert.ok(287 + region.geoidM < 555);
  assert.deepEqual(region.outline, {
    relations: [42253],
    add: [[42.9572, 13.875, 43.0100, 13.890]],
  });
  const credits = region.credits.join("\n");
  for (const s of ["© OpenStreetMap contributors", "Copernicus DEM", "Painted with AI", "Open-Meteo"]) {
    assert.equal(credits.includes(s), true, s);
  }
});

test("la home del codice apre Grottammare", () => {
  assert.equal(DEFAULT_CITY, "grottammare");
  assert.deepEqual(CITIES.grottammare, {
    title: "Grottammare",
    region: "grottammare",
    center: [42.993, 13.872],
    widthM: 2200,
  });
  assert.ok(CITIES["tel-aviv-yafo"]);
  assert.ok(CITIES.stuttgart);
  assert.ok(CITIES.zagreb);
  assert.ok(CITIES.wieliczka);
});

test("il prompt regionale non nomina i monumenti", () => {
  const blob = Object.values(GROTTAMMARE_LOCAL).filter((v) => typeof v === "string").join("\n");
  for (const w of ["Torrione", "Peretti", "Arancio", "Santa Lucia", "San Giovanni", "San Pio"]) {
    assert.equal(blob.includes(w), false, w);
  }
  assert.match(blob, /Adriatic/);
  assert.match(blob, /clay-tile/);
  assert.match(blob, /palm/i);
  assert.match(blob, /liberty|stucco/i);
  assert.match(blob, /railway between the sea and the lower town/);
  assert.match(GROTTAMMARE_LOCAL.trees, /trees-stuttgart\.png$/);
  assert.equal(GROTTAMMARE_LOCAL.inventionChecks, undefined);
  const paint = readFileSync(new URL("./paint.ts", import.meta.url), "utf8");
  assert.match(paint, /grottammare: GROTTAMMARE_LOCAL/);
});

test("il footer non cade su Tel Aviv", () => {
  assert.deepEqual(regionSourceLines("grottammare"), [
    `<a href="https://open-meteo.com/">Open-Meteo</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
  ]);
  assert.equal(regionSourceLines("grottammare").join("").includes("Tel Aviv"), false);
  assert.equal(
    regionSourceLines("israel-center").join(""),
    `<a href="https://opendatasource.tel-aviv.gov.il/">Tel Aviv-Yafo Municipality</a>`,
  );
  assert.match(regionSourceLines("stuttgart").join("\n"), /dl-de\/by-2-0/);
  assert.match(regionSourceLines("zagreb").join("\n"), /Otvorena dozvola/);
  assert.match(regionSourceLines("wieliczka").join("\n"), /GUGiK/);
  assert.equal(
    madeByLine("grottammare"),
    `Grottammare isometrica · <a href="https://dmytrokrasun.com">Dmytro Krasun</a> (Isometric World) · luce e meteo adattati da <a href="https://github.com/dg996/mondoisometrico">Domenico Gagliardi</a> (Mondo Isometrico)`,
  );
  assert.equal(madeByLine("grottammare").includes("@"), false);
  assert.equal(madeByLine("israel-center"), `Made by <a href="https://dmytrokrasun.com">Dmytro Krasun</a>`);
  assert.match(madeByLine("stuttgart"), /Lukas Hermann/);
  assert.match(madeByLine("zagreb"), /Andrej Šimunaj/);
  assert.match(madeByLine("wieliczka"), /Maciek Chmura/);
  const map = readFileSync(new URL("../../web/src/scripts/map.ts", import.meta.url), "utf8");
  assert.equal(map.includes("Tel Aviv-Yafo Municipality"), false);
  assert.match(map, /regionSourceLines\(REGION\)/);
  assert.match(map, /madeByLine\(REGION\)/);
});

test("ATTRIBUTION nomina Grottammare e non la Regione Marche", () => {
  const text = readFileSync(new URL("../../ATTRIBUTION.md", import.meta.url), "utf8");
  assert.match(text, /Grottammare/);
  assert.match(text, /Open-Meteo/);
  assert.match(text, /CC BY 4\.0/);
  assert.equal(text.includes("Regione Marche"), false);
});
```

Sostituire `GEOID` e `GROUND` con due letterali. Se la stampa è `47.212`, si scrive `47.21` e `51.21`. Non scrivere `47.21 + 4` nell'asserzione: la somma binaria non è garantita a due decimali.

- [ ] **Step 3: Lanciare il test e vederlo fallire**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: FAIL perché `REGIONS.grottammare` o i moduli nuovi non esistono.

- [ ] **Step 4: Implementare regione, prompt e crediti**

In `pipeline/src/grottammare-local.ts` esportare questo oggetto. Il testo è fisso. Non aggiungere nomi di monumenti.

```typescript
import { join } from "node:path";
import { PIPELINE } from "./paths.ts";

export const GROTTAMMARE_LOCAL = {
  ground: "Streets, squares, the beach, the promenade and the sea",
  country: "Italy",
  render: `The layout is exact; the colours are flat placeholders (grey = asphalt with lane markings, pale = pavement/plaza, green = grass/park, sand = beach, blue = water, brown lines = rail). Tree crowns are colour-coded (see image 4). The town sits on a hill above an Adriatic beach.`,
  treesOf: "the central Adriatic coast",
  treeHint: " (stone pines and maritime pines, palm crowns with a visible trunk, oleander, orange trees; not spruce)",
  materials: `Draw believable Grottammare materials: ochre and cream plaster houses, red clay-tile roofs, a medieval hill town, a seaside promenade with palms, early-1900s liberty villas in pale stucco along the shore, the railway between the sea and the lower town. Draw a church, tower or loggia only where image 1 shows one. Woods, parks, beach and water stay exactly that: never add buildings where image 1 shows trees, sand or water. Tall towers stay tall. Draw no cars, trains or buses (they are animated on top): leave rails and streets empty of vehicles.`,
  trees: join(PIPELINE, "style", "trees-stuttgart.png"),
};
```

In `paint.ts` importare `GROTTAMMARE_LOCAL` e aggiungere `grottammare: GROTTAMMARE_LOCAL` dentro `LOCAL`. Non impostare `inventionChecks`.

In `places.ts` aggiungere la regione e la città con i valori che il test afferma. Commento su `geoidM`: il comando Python dello step 1 e i metri stampati. Commento su `groundH`: livello del mare più 4 m, più il geoide. Commento su `headingDeg`: `260` provvisorio, guarda verso l'interno (ovest-sud-ovest), non ancora bloccato. `outline.add` è il mare a est della spiaggia, così lo sfumato non taglia la battigia: la relazione 42253 (admin_level 8, nome Grottammare, letta da OSM il 2026-11-23) da sola non contiene l'acqua. `credits` è questo array, non un'altra formulazione:

```typescript
credits: [
  "Map data © OpenStreetMap contributors",
  "Terrain: Copernicus DEM © DLR, Airbus DS · Painted with AI",
  "Weather: Open-Meteo, CC BY 4.0",
],
```

`DEFAULT_CITY = "grottammare"`. Non toccare le altre regioni.

`web/src/scripts/credits.ts`: spostare lì, parola per parola, i tre rami già in `map.ts` (Stoccarda, Zagabria, Wieliczka) e il ramo finale di Tel Aviv. Aggiungere il ramo `grottammare` con le stringhe esatte del test. `map.ts` importa le due funzioni e le chiama al posto dei ternari. La riga OSM, lo span Copernicus, il piano di Hondius, `Painted with AI`, il link Source e il `.map(...)` finale restano in `map.ts`.

In `ATTRIBUTION.md` aggiungere una sezione `## Grottammare`: OSM ODbL con la frase `© OpenStreetMap contributors`, Copernicus rimandando al testo già presente nel file (non riscriverlo), Open-Meteo CC BY 4.0, Painted with AI, immagini derivate CC BY 4.0, codice MIT, luce e meteo adattati da Mondo Isometrico (MIT, Domenico Gagliardi). Nessuna Regione Marche.

La home non è più la galleria: i crediti che il visitatore legge stanno nel footer della mappa. Non aggiungere record `PEOPLE` / `SOURCES` che nessuno renderizza. Quella sostituzione della pagina è il task 6.

- [ ] **Step 5: Lanciare il test e il typecheck**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
npm run typecheck
```

Atteso: PASS e typecheck exit 0.

- [ ] **Step 6: Commit**

```powershell
git add pipeline/src/places.ts pipeline/src/paint.ts pipeline/src/grottammare-local.ts pipeline/src/grottammare.test.ts web/src/scripts/credits.ts web/src/scripts/map.ts ATTRIBUTION.md
git commit -m "feat: add the grottammare region and its credits"
```

---

### Task 3: Aree di prova

**Files:**
- Modify: `pipeline/src/areas.ts`, `pipeline/src/grottammare.test.ts`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: `REGIONS.grottammare` dal task 2
- Produces: `AREAS.peretti` e `AREAS.lungomare`, entrambe con `region: "grottammare"`

`peretti` copre la piazza e arriva verso il paese basso, ma il suo est (`13.878`) resta sotto `13.88`: non è il riquadro del mare. `lungomare` va dall'acqua fino a `13.865`, così le due aree si sovrappongono di almeno un chilometro (`0,012°` in longitudine a questa latitudine). L'export tiene la tessera dell'area in cui cade più all'interno, e un bordo senza overlap resta semitrasparente. L'est di `lungomare` (`13.886`) supera il confine comunale (`13.8819778`) di proposito: l'acqua sta in `outline.add`.

- [ ] **Step 1: Aggiungere al test**

```typescript
import { AREAS } from "./areas.ts";

function inBox(box: readonly [number, number, number, number], lat: number, lon: number) {
  const [s, w, n, e] = box;
  return lat >= s && lat <= n && lon >= w && lon <= e;
}

test("peretti copre la piazza e non il mare", () => {
  assert.equal(AREAS.peretti.region, "grottammare");
  assert.deepEqual(AREAS.peretti.bbox, [42.9911, 13.8606, 43.0001, 13.878]);
  assert.equal(inBox(AREAS.peretti.bbox, 42.9956132, 13.8666023), true);
  assert.ok(AREAS.peretti.bbox[3] < 13.88);
});

test("lungomare arriva al mare e si sovrappone a peretti di almeno un chilometro", () => {
  assert.equal(AREAS.lungomare.region, "grottammare");
  assert.deepEqual(AREAS.lungomare.bbox, [42.990, 13.865, 42.999, 13.886]);
  assert.equal(inBox(AREAS.lungomare.bbox, 42.992, 13.880), true);
  assert.ok(AREAS.lungomare.bbox[3] >= 13.88);
  assert.ok(AREAS.peretti.bbox[3] - AREAS.lungomare.bbox[1] >= 0.012);
});
```

- [ ] **Step 2: Lanciare il test e vederlo fallire**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: FAIL su `AREAS.peretti`.

- [ ] **Step 3: Aggiungere le due aree in `AREAS`**

Titoli: `Piazza Peretti` e `Lungomare`. Bbox esatti del test. Nessun `mine`.

- [ ] **Step 4: Lanciare il test**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: PASS.

- [ ] **Step 5: Commit**

```powershell
git add pipeline/src/areas.ts pipeline/src/grottammare.test.ts
git commit -m "feat: add the peretti and lungomare test areas"
```

---

### Task 4: Render nudo e scelta dell'angolo

**Files:**
- Modify: nessuno, finché l'autore non sceglie. `.env` solo in locale.
- Test: la checklist qui sotto, guardando `http://localhost:<porta>/grottammare`

**Interfaces:**
- Consumes: `AREAS.peretti`, `AREAS.lungomare`, `REGIONS.grottammare` con `headingDeg === 260`
- Produces: tessere non dipinte in cache, e un sì o un no dell'autore. Nessun lucchetto ancora: quello è il task 5.

Questo task non ha un commit. Non committare `data/`. Fermarsi allo step 5.

- [ ] **Step 1: Chrome e osmium**

Scrivere in `.env` la riga `CHROME_PATH=<percorso>` con l'ordine del vincolo globale. Verificare:

```powershell
osmium --version
```

Se `osmium` manca, fermarsi e dirlo. Non scaricare l'Italia a mano.

- [ ] **Step 2: Confini, fetch, terreno, scena, render, export delle due aree**

```powershell
npm -w pipeline run boundaries -- grottammare
npm run fetch -- peretti
npm run fetch -- lungomare
npm run ground -- peretti
npm run ground -- lungomare
npm run scene -- peretti
npm run scene -- lungomare
npm run render -- peretti -j 2
npm run render -- lungomare -j 2
npm run export -- peretti lungomare
```

Non lanciare `paint`. Non lanciare `publish`.

- [ ] **Step 3: Aprire la veduta e guardarla**

`npm run dev`. Aprire `http://localhost:<porta>/grottammare`. La vista iniziale è `widthM` 2200 sul centro `[42.993, 13.872]`. Il tasto `B` accende il confine: deve essere il comune di Grottammare (relazione 42253). Se il confine è un altro comune, fermarsi. Non indovinare un altro id.

Checklist, da riportare all'autore insieme all'indirizzo:

- il mare è in primo piano
- il lungomare attraversa l'inquadratura
- il Paese Alto sta in alto
- di un isolato si vedono due facciate
- il Paese Alto non è un rialzo piatto senza scarpata

Se il Paese Alto è piatto, fermarsi e chiedere. Non importare il DTM regionale.

Se mare e borgo non stanno nello stesso schermo, non cambiare ancora `origin` né `headingDeg`. Provare prima un altro `headingDeg` allo step 4. `center` e `widthM` si toccano solo nel task 5, se l'angolo giusto tiene ancora fuori uno dei due.

- [ ] **Step 4: Se il 260 non convince, provare 240, poi 280, poi 300**

Un angolo alla volta. Prima di rilanciare, cancellare solo:

- `data/derived/peretti`
- `data/derived/lungomare`
- `data/web/regions/grottammare`

Non cancellare `data/raw`, non cancellare altre regioni, non cancellare `data/web-state`. Aggiornare `headingDeg` in `places.ts`, poi di nuovo `ground`, `scene`, `render`, `export` delle due aree. Il fetch si rifà solo se lo step 2 non ha lasciato i raw. Mostrare ogni prova prima di passare alla successiva.

- [ ] **Step 5: Fermarsi**

Scrivere all'autore quale angolo è sullo schermo e l'esito della checklist. Non iniziare il task 5 senza il suo sì. Non dipingere.

---

### Task 5: Bloccare la camera

**Files:**
- Modify: `pipeline/src/places.ts`, `pipeline/src/grottammare.test.ts`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: il `headingDeg` che l'autore ha accettato nel task 4. Se ha accettato il 260, il numero non cambia.
- Produces: `headingDeg` e `origin` uguali al test, con un commento `// locked` sulla stessa riga di `headingDeg`. Dopo questo task quei due campi non si modificano più.

`origin` resta `{ lat: 42.9904967, lon: 13.8687605, h: 0 }` salvo l'autore abbia indicato un altro punto nel task 4. In quel caso il test e `places.ts` ricevono quel punto, e si rifà il render come per un angolo nuovo, prima di qualsiasi pittura.

- [ ] **Step 1: Aggiornare il numero atteso**

Aggiungere questo test. `260` è l'angolo accettato: se l'autore ne ha scelto un altro, quel numero sta sia qui sia in `assert.equal(region.headingDeg, 260)`, al posto di `260`.

```typescript
test("la camera è bloccata", () => {
  const places = readFileSync(new URL("./places.ts", import.meta.url), "utf8");
  assert.match(places, /headingDeg: 260, \/\/ locked/);
});
```

La riga in `places.ts` va scritta così, data compresa, sulla stessa riga: `headingDeg: 260, // locked 2026-11-23`.

Se il primo schermo non conteneva mare e borgo, cambiare nello stesso test `center` e, se serve, `widthM`, ai valori che lo step di prova ha mostrato giusti. Non cambiare `origin` per raddrizzare l'inquadratura: l'origine resta il nodo del paese.

- [ ] **Step 2: Lanciare il test**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Se il numero è cambiato, atteso FAIL su `headingDeg`. Se il numero è rimasto 260, atteso FAIL solo perché manca la parola `locked`.

- [ ] **Step 3: Allineare `places.ts`**

Impostare la riga `headingDeg: <n>, // locked <data del sì>`. Non cambiare `geoidM`, `groundH`, `outline`. Se `center` o `widthM` sono stati corretti nel test, copiare gli stessi numeri nella città.

- [ ] **Step 4: Se l'angolo o l'origine sono cambiati, rifare le tessere una volta**

Stesse cancellazioni del task 4 (solo le due aree e la cache web della regione), poi `ground`, `scene`, `render`, `export`. Se non è cambiato nulla tranne il commento, non rifare il render.

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: PASS.

- [ ] **Step 5: Commit**

```powershell
git add pipeline/src/places.ts pipeline/src/grottammare.test.ts
git commit -m "feat: lock the grottammare camera"
```

---

### Task 6: Ora, meteo, pagina in italiano

**Files:**
- Create: `web/src/scripts/ambient.ts` (copia adattata)
- Modify: `web/src/components/MapPage.astro`, `web/src/pages/index.astro`, `web/src/scripts/map.ts`, `pipeline/src/grottammare.test.ts`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: `REGIONS.grottammare.origin` dal task 2; `startAmbient(): Ambient` come esportato dal file di Roma
- Produces: `weatherLabel`, `rainLevel`, `sunElevation`, `nightness`, `grade`, `fetchWeather`, `startAmbient` da `web/src/scripts/ambient.ts`. `DayMode` è `"live" | "giorno" | "pomeriggio" | "notte"`. Il pannello usa `#ambient-tint`, `#ambient-wash`, `#ambient-clock`, `#ambient-weather`, `#daytime` con `button[data-mode]`.

Non copiare l'interruttore TomTom (`#live`) né il testo di aiuto di Roma.

- [ ] **Step 1: Aggiungere al test**

```typescript
import { nightness, sunElevation, weatherLabel } from "../../web/src/scripts/ambient.ts";

test("etichette meteo e coordinate di Grottammare", () => {
  assert.equal(weatherLabel(0), "sereno");
  assert.equal(weatherLabel(63), "pioggia");
  assert.equal(weatherLabel(45), "nebbia");
  assert.equal(weatherLabel(95), "temporale");
  assert.equal(nightness(10), 0);
  assert.equal(nightness(-6), 1);
  const t = new Date("2026-06-21T10:00:00Z");
  assert.notEqual(sunElevation(t), sunElevation(t, 41.8955, 12.4823));
  const src = readFileSync(new URL("../../web/src/scripts/ambient.ts", import.meta.url), "utf8");
  assert.match(src, /REGIONS\.grottammare\.origin/);
  assert.match(src, /timezone=Europe%2FRome/);
  assert.match(src, /meteo non disponibile/);
  assert.match(src, /gm-weather-v1/);
  assert.equal(src.includes("41.8955"), false);
  assert.equal(src.includes("12.4823"), false);
});

test("la pagina di Grottammare è in italiano e la home è la mappa", () => {
  const page = readFileSync(new URL("../../web/src/components/MapPage.astro", import.meta.url), "utf8");
  assert.match(page, /c\.region === "grottammare" \? "it" : "en"/);
  assert.match(page, /Grottammare isometrica/);
  assert.match(page, /id="ambient-clock"/);
  assert.match(page, /id="daytime"/);
  assert.match(page, /data-mode="notte"/);
  assert.equal(page.includes("TomTom"), false);
  assert.equal(page.includes("Traffico in tempo reale"), false);
  const index = readFileSync(new URL("../../web/src/pages/index.astro", import.meta.url), "utf8");
  assert.match(index, /city="grottammare"/);
  assert.equal(index.includes("Pick one and scroll"), false);
});
```

- [ ] **Step 2: Lanciare il test e vederlo fallire**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: FAIL perché `ambient.ts` non c'è.

- [ ] **Step 3: Copiare `ambient.ts` e innestare il pannello**

Copiare `https://raw.githubusercontent.com/dg996/mondoisometrico/main/web/src/scripts/ambient.ts` in `web/src/scripts/ambient.ts`.

Adattare solo questo:

- importare `REGIONS` da `../../../pipeline/src/places.ts` e sostituire le costanti `LAT` e `LON` con `REGIONS.grottammare.origin.lat` e `.lon`
- `CACHE_KEY = "gm-weather-v1"`
- i commenti che dicono che il luogo è Roma diventano Grottammare. Il fuso `Europe/Rome` e il parametro `timezone=Europe%2FRome` restano
- non riscrivere `weatherLabel`, `rainLevel`, `grade`, `nightness`, la formula del sole

In `MapPage.astro`:

- `const lang = c.region === "grottammare" ? "it" : "en"` e `lang={lang}` sull'elemento `html`
- se `c.region === "grottammare"`, `title` è `Grottammare isometrica` e la description è `Grottammare, edificio per edificio, da dati aperti.` Altrimenti titolo e description restano quelli attuali
- copiare da `MapPage.astro` di Mondo Isometrico il markup e il CSS di `#ambient-tint`, `#ambient-wash`, `#ambient`, `#daytime`, `#share`. Non copiare `#live` né `#help`
- il testo visibile dell'orologio dice `Grottammare`, non `Roma`
- i pulsanti, in ordine: `Adesso` (`data-mode="live"`, `aria-checked="true"`, title `L'ora e la luce reali di Grottammare, adesso`), `Giorno`, `Pomeriggio`, `Notte`
- `aria-label` del gruppo: `Ora e meteo`. Quello del radiogroup: `Luce`

In `map.ts` chiamare `startAmbient()` una volta, accanto al loop `frame`, e alla fine del disegno dell'overlay chiamare `ambient.draw(ctx, w, hgt, dt)`. I lampioni arrivano nel task 7: qui il ritorno di `startAmbient` deve restare in una variabile raggiungibile da `frame`.

Sostituire `web/src/pages/index.astro` con una pagina che renderizza `<MapPage city="grottammare" />`. Niente galleria. `[city].astro` non si modifica: `/grottammare` continua a funzionare. Le altre città restano nelle loro route.

`?ora=` e `?meteo=` restano com'erano nel file copiato: funzionano solo se `import.meta.env.DEV` è vero.

- [ ] **Step 4: Lanciare il test e il typecheck**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
npm run typecheck
```

Atteso: PASS e typecheck exit 0.

- [ ] **Step 5: Commit**

```powershell
git add web/src/scripts/ambient.ts web/src/scripts/map.ts web/src/components/MapPage.astro web/src/pages/index.astro pipeline/src/grottammare.test.ts
git commit -m "feat: add Italian light and weather for Grottammare"
```

---

### Task 7: Lampioni e condividi

**Files:**
- Create: `web/src/scripts/lights.ts`, `web/src/scripts/share.ts`
- Modify: `web/src/scripts/map.ts`, `web/src/components/MapPage.astro` (lo script che importa `share.ts`, e il CSS di `#lights` se non è già arrivato con la copia del task 6), `pipeline/src/grottammare.test.ts`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: `Road` da `web/src/scripts/traffic.ts` (campi usati: `c`, `o`, `l`, `w`, `a`, `s`). `Ambient.night(): number` e `Ambient.draw` dal task 6. `Traffic` del clone non ha un array `.lit`.
- Produces: `export class Lights` e `export interface CarLight` da `lights.ts`. `draw(..., cars: CarLight[])` viene chiamato con `[]`. I fari delle auto sono quelli già disegnati da `life.vehicles: "detailed"`. Se nel task 11 di notte le auto sono buie, solo allora si legge come il `traffic.ts` del clone disegna le luci e si aggiunge un lettore. Non si importa il traffico di Roma.

- [ ] **Step 1: Aggiungere al test**

```typescript
test("i lampioni sono il modulo di Roma innestato sul traffico del clone", () => {
  const lights = readFileSync(new URL("../../web/src/scripts/lights.ts", import.meta.url), "utf8");
  assert.match(lights, /export class Lights/);
  assert.match(lights, /const SPACING = 100 \/ 3\.6/);
  assert.match(lights, /import type \{ Road \} from "\.\/traffic\.ts"/);
  assert.equal(lights.includes("ATAC"), false);
  assert.equal(lights.includes("TomTom"), false);
  const map = readFileSync(new URL("../../web/src/scripts/map.ts", import.meta.url), "utf8");
  assert.match(map, /new Lights\(/);
  assert.match(map, /drawPosts\(/);
  assert.equal(map.includes(".lit"), false);
  const share = readFileSync(new URL("../../web/src/scripts/share.ts", import.meta.url), "utf8");
  assert.match(share, /location\.origin \+ location\.pathname \+ location\.hash/);
  assert.equal(share.includes("api/p"), false);
});
```

- [ ] **Step 2: Lanciare il test e vederlo fallire**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: FAIL perché `lights.ts` non c'è.

- [ ] **Step 3: Copiare i due file e collegarli**

Copiare `lights.ts` da `https://raw.githubusercontent.com/dg996/mondoisometrico/main/web/src/scripts/lights.ts`. L'import di `Road` è già `./traffic.ts`: lasciarlo. Non riscrivere la matematica. Non cambiare `SPACING`. Riscrivere solo il commento in testa: non esiste un catasto aperto dei lampioni di Grottammare; la densità è quella copiata (3,6 ogni 100 m) e si allarga solo se il lungomare notturno della prova dipinta sembra un'autostrada.

Copiare `share.ts` da `https://raw.githubusercontent.com/dg996/mondoisometrico/main/web/src/scripts/share.ts` così com'è. Non dipende da `api/p.ts`. Il pulsante `#share` con testo `Condividi` è nel pannello copiato al task 6. In `MapPage.astro` lo script importa anche `../scripts/share.ts`.

In `map.ts`, dentro `loadAnimations`, dopo la costruzione di `Traffic`:

```typescript
if (roads.length && REGION === "grottammare") lights = new Lights(roads, world.enu2px, () => true);
```

`Lights` si importa insieme agli altri moduli dinamici di `loadAnimations`. In `frame`, dopo `traffic.draw`, chiamare `lights.drawPosts(ctx, toScreen, w, hgt, ambient.night())`. Su un canvas `#lights` separato, ridimensionato come l'overlay, chiamare `lights.draw(lctx, toScreen, w, hgt, ambient.night(), [])`. Non leggere `traffic.lit`. Non ritagliare su una maschera di attività: Grottammare non ce l'ha. Copiare da Roma il CSS di `#lights` (fisso, sopra la mappa, `pointer-events: none`, `mix-blend-mode: screen`) se non è già nella pagina.

Non costruire `Lights` per le altre regioni.

- [ ] **Step 4: Lanciare il test**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
npm run typecheck
```

Atteso: PASS e typecheck exit 0.

- [ ] **Step 5: Commit**

```powershell
git add web/src/scripts/lights.ts web/src/scripts/share.ts web/src/scripts/map.ts web/src/components/MapPage.astro pipeline/src/grottammare.test.ts
git commit -m "feat: add street lamps and share for Grottammare"
```

---

### Task 8: Pittura di prova

**Files:**
- Modify: solo se la prova fallisce. Foglio alberi: `pipeline/src/grottammare-local.ts` e `ATTRIBUTION.md`. Lampioni: la costante `SPACING` in `lights.ts` e l'asserzione del task 7.
- Test: gli occhi dell'autore su `/grottammare`

**Interfaces:**
- Consumes: tessere del task 4 o 5, `GROTTAMMARE_LOCAL`, `Lights`, `startAmbient`
- Produces: finestre dipinte di `peretti` e `lungomare`, e un sì o un no. Senza il sì non esiste il task 9 né il task 10.

Nessun commit se la prova va bene al primo colpo: le pitture stanno in `data/derived`, che non si committa. Fermarsi allo step 4.

- [ ] **Step 1: Verificare Codex, senza spendere**

```powershell
codex login status
```

Se non è loggato, fermarsi e chiedere. Non impostare `FAL_KEY`. Non impostare `PAINT_BACKEND`.

- [ ] **Step 2: Dipingere le due aree piccole**

`npm run paint -- --help` e usare il flag che parte dal centro. I centri sono `42.9956132,13.8666023` per `peretti` e `42.992,13.880` per `lungomare`.

```powershell
npm run paint -- peretti --center 42.9956132,13.8666023
npm run paint -- lungomare --center 42.992,13.880
npm run export -- peretti lungomare
```

Se il comando dipinge l'area intera in un colpo solo, va bene: sono due riquadri piccoli. Non lanciare `paint` su un'area `abitato`. Non nominare monumenti nel prompt.

- [ ] **Step 3: Guardare giorno, pomeriggio e notte**

Sul dev server, `http://localhost:<porta>/grottammare`. Provare i quattro pulsanti. Di notte anche `?ora=23:30` (solo in dev).

Checklist da riportare:

- Torrione della Battaglia e Piazza Peretti si riconoscono, anche se i ritagli fini arrivano dopo
- sul lungomare non ci sono abeti al posto di palme e pini
- i lampioni di notte non coprono la carreggiata

Se sul lungomare ci sono abeti: copiare `pipeline/style/trees-roma.png` da Mondo Isometrico, puntare `GROTTAMMARE_LOCAL.trees` a quel file, citarlo in `ATTRIBUTION.md`, aggiornare il test (`trees-roma.png` al posto di `trees-stuttgart.png`), ridipingere solo i riquadri di prova, rifare vedere. Commit di quel solo cambiamento: `fix: use the Adriatic tree sheet on the lungomare`.

Se i lampioni coprono la strada: alzare solo `SPACING` (partire dal doppio, `200 / 3.6`), aggiornare l'asserzione del task 7 con lo stesso numero, rilanciare il test, rifare vedere la notte. Non riscrivere il resto di `lights.ts`. Commit: `fix: space the Grottammare lamps farther apart`.

- [ ] **Step 4: Fermarsi**

Senza un sì dell'autore non si dipinge il resto del paese e non si parte con i monumenti.

---

### Task 9: Paese abitato

**Files:**
- Modify: `pipeline/src/places.ts` (`outline.clip`), `pipeline/src/areas.ts`, `pipeline/src/grottammare.test.ts`
- Test: `pipeline/src/grottammare.test.ts`

**Interfaces:**
- Consumes: camera bloccata, prova dipinta accettata nel task 8
- Produces: `AREAS.abitato` e `outline.clip` di partenza `[42.9572, 13.835, 43.0100, 13.890]`

Il clip taglia la relazione 42253 e anche il riquadro di mare aggiunto nel task 2. L'ovest `13.835` è un punto di partenza, circa 2,5 km a ovest di Piazza Peretti. Non è un confine definitivo: se nel render nudo si vede l'industria del Tesino (Valtesino, Bore Tesino), si sposta l'ovest prima di dipingere e si aggiorna il test.

L'export (`export.ts`) assegna ogni tessera all'area in cui il centro della tessera è più lontano dal bordo. `abitato` è più profonda di `peretti` e di `lungomare` in tutto l'interno: quando il paese è dipinto, in mappa si vede la pittura di `abitato`. La pittura delle due prove resta il sì del task 8. Non si ridipinge per «rimettere» quei pixel. I ritagli del task 10 stanno su `abitato`, perché lo strato `cutout` sostituisce la tessera dipinta e deve essere composto sulla pittura che resta visibile.

- [ ] **Step 1: Aggiungere al test**

```typescript
test("il clip tiene piazza, stazione e mare, e lascia fuori la campagna a ovest", () => {
  const clip = REGIONS.grottammare.outline!.clip!;
  const add = REGIONS.grottammare.outline!.add![0];
  assert.deepEqual(clip, AREAS.abitato.bbox);
  assert.equal(inBox(clip, 42.9956132, 13.8666023), true);
  assert.equal(inBox(clip, 42.99388, 13.86967), true);
  assert.equal(inBox(clip, 42.992, 13.880), true);
  assert.equal(inBox(add, 42.992, 13.880), true);
  assert.equal(inBox(clip, 42.98, 13.820), false);
  assert.ok(clip[0] <= 42.97);
  assert.ok(clip[3] >= 13.886);
  assert.equal(AREAS.abitato.region, "grottammare");
});
```

Lo step 1 del task 3 ha già definito `inBox` nello stesso file.

- [ ] **Step 2: Lanciare il test e vederlo fallire**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: FAIL perché `clip` è `undefined`.

- [ ] **Step 3: Aggiungere area e clip**

`abitato`: titolo `Grottammare abitato`, bbox `[42.9572, 13.835, 43.0100, 13.890]`. `outline.clip` è lo stesso array. Non cambiare `relations`, `add`, `origin`, `headingDeg`. Il sud resta `42.9572` (sotto `42.97`, così Ischia ci sta). L'est resta almeno `13.886`.

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
```

Atteso: PASS. Commit di questo stato, prima della pittura lunga:

```powershell
git add pipeline/src/places.ts pipeline/src/areas.ts pipeline/src/grottammare.test.ts
git commit -m "feat: clip the Grottammare map to the inhabited town"
```

- [ ] **Step 4: Render nudo dell'abitato, poi eventualmente stringere l'ovest**

```powershell
npm run fetch -- abitato
npm run ground -- abitato
npm run scene -- abitato
npm run render -- abitato -j 2
npm run export -- abitato peretti lungomare
```

Guardare il bordo ovest e il Tesino. Se compare l'area industriale, spostare l'ovest del clip e del bbox verso est tanto quanto basta a lasciarla fuori. I tre punti interni del test devono restare interni, `42.98, 13.820` deve restare esterno, il sud non sale sopra `42.97`. Aggiornare i numeri nel test e in `places.ts` / `areas.ts` insieme, rilanciare il test, cancellare solo `data/derived/abitato` e la cache `data/web/regions/grottammare`, rifare ground, scene, render, export. Non toccare le tessere già dipinte di `peretti` e `lungomare` se il loro bbox non è cambiato: la cancellazione della cache web le ricostruisce dall'export, non dalla pittura. Rifare `export` di `peretti` e `lungomare` dopo, così la cache non perde la prova già accettata.

Commit solo se i numeri sono cambiati: `fix: keep the Tesino industrial edge outside the painted town`.

- [ ] **Step 5: Dipingere l'abitato e riesportare man mano**

```powershell
npm run paint -- abitato --center 42.993,13.872
```

Codex, come al task 8. Se non è loggato, fermarsi. Non lanciare fal.ai.

`pipeline/watch-export.sh` è bash. Su Windows, a ogni blocco di finestre completato, lanciare a mano:

```powershell
npm run export -- abitato peretti lungomare
```

Non cancellare `data/derived`. Non pubblicare. Non ridipingere `peretti` e `lungomare`.

---

### Task 10: Monumenti, uno alla volta

**Files:**
- Create: `pipeline/landmarks/torrione/overview.txt`, `pipeline/landmarks/torrione/key.txt`, e le stesse due coppie per `peretti`, `santa-lucia`, `san-pio-v`
- Modify: `ATTRIBUTION.md` solo se entra una foto CC BY
- Test: nessuno automatico. Il sì è sul ritaglio, prima di `cutout.ts`.

**Interfaces:**
- Consumes: `abitato` già dipinto (task 9). Comando: `npm run landmark -- abitato <name> overview|edit|key`, poi `npm -w pipeline exec tsx src/cutout.ts abitato`
- Produces: una voce in `data/derived/abitato/cutouts.json` per ogni monumento accettato. I dati non si committano. Si committano i testi dei prompt.

Non creare `pipeline/src/landmarks/grottammare.ts`. Non aggiungere questi nomi a `GROTTAMMARE_LOCAL`. L'area è sempre `abitato`.

| nome | cosa deve riconoscersi |
|---|---|
| `torrione` | Torrione della Battaglia |
| `peretti` | un solo ritaglio di gruppo: loggiato del Teatro dell'Arancio, torre civica / altana, San Giovanni Battista |
| `santa-lucia` | Santa Lucia con il campanile in mattoni |
| `san-pio-v` | il campanile alto di San Pio V, nel paese basso |

- [ ] **Step 1: Trovare l'edificio su OSM e una foto lecita**

Cercare nell'estratto il way o il nodo con quel nome. Se i candidati sono più d'uno, fermarsi e chiedere. Non aprire Google, Apple, Bing o Mapbox per scegliere.

Il `--frame` è in pixel d'arte globali, rapporto 3:2 oppure 2:3, calcolato con la camera già bloccata così che l'edificio riempia il quadro. Non inventare i pixel prima di proiettarli.

`--ref` solo se l'autore consegna un suo scatto, oppure un file già in mano con licenza PD, CC0 o CC BY. Senza un riferimento, l'`overview.txt` descrive l'edificio a parole e si mostra il risultato: se non si riconosce, ci si ferma e si chiede una foto. Non si scarica un'immagine proprietaria. Una foto CC BY si cita in `ATTRIBUTION.md` prima del commit dei prompt.

- [ ] **Step 2: Per ciascun nome, overview, poi il sì, poi il ritaglio**

`overview.txt` è in inglese, come gli altri prompt del clone. Nomina questo solo edificio (qui il nome ci vuole: il file non è il prompt regionale). `key.txt` chiede il magenta piatto `#FF00FF` su tutto il resto, come si aspetta `landmark.ts`.

```powershell
npm run landmark -- abitato torrione overview --frame x,y,w,h --base paint
```

`--base paint` perché `abitato` è già dipinto. Mostrare `art.png`. Se serve un ritocco, `edit` con un `--box`, non un secondo overview alla cieca.

Solo dopo il sì:

```powershell
npm run landmark -- abitato torrione key
npm -w pipeline exec tsx src/cutout.ts abitato
npm run export -- abitato
```

Stessi comandi per `peretti`, `santa-lucia` e `san-pio-v`, sempre sull'area `abitato`. Un sì ciascuno. Un no ferma quel monumento: non si passa al compose e si chiede cosa non torna.

- [ ] **Step 3: Commit dei testi**

```powershell
git add pipeline/landmarks ATTRIBUTION.md
git commit -m "feat: add Grottammare landmark prompts"
```

Omettere `ATTRIBUTION.md` se non è cambiato. Non aggiungere `data/`.

---

### Task 11: Controllo nel browser

**Files:**
- Modify: solo i difetti trovati qui, con un test che fallisce prima della correzione se il difetto è in un valore già asserito
- Test: la lista sotto, più `npm run typecheck` e `traffictest`

**Interfaces:**
- Consumes: tutto il resto
- Produces: un elenco puntato, un rigo per voce, con quello che si è visto. Nessuna pubblicazione.

- [ ] **Step 1: Typecheck**

```powershell
npx tsx --test pipeline/src/grottammare.test.ts
npm run typecheck
```

Atteso: PASS e typecheck exit 0. Il typecheck del clone è `npm -w pipeline run typecheck` e `npm -w web run astro -- check`, già riuniti in `npm run typecheck`.

- [ ] **Step 2: Percorrere il sito**

`npm run dev`. Finestra larga e finestra stretta (390 px). Non basta uno screenshot. Per ogni voce, fare il gesto e annotare l'esito.

- `http://localhost:<porta>/` e `http://localhost:<porta>/grottammare` aprono la stessa veduta cartolina, titolo `Grottammare isometrica`, senza errori in console
- l'orologio mostra un'ora di Grottammare (`Europe/Rome`), non `--:--` fermo
- Adesso, Giorno, Pomeriggio e Notte cambiano la luce. Di notte si vedono i lampioni. I fari delle auto si vedono. Se le auto restano buie, vale il vincolo del task 7: un lettore delle luci già disegnate dal traffico del clone, non il file di Roma
- il meteo mostra un'etichetta italiana (`sereno`, `poco nuvoloso`, `coperto`, `nebbia`, `pioggerella`, `pioggia`, `neve`, `temporale`, `variabile`). Se la rete fallisce, il testo è `meteo non disponibile` e la mappa resta usabile
- trascinando si arriva alla stazione (`42.99388, 13.86967`) e a Ischia, verso sud. Il bordo sfuma. Fuori dal costruito non compare un secondo paese
- un'auto percorre una via a senso unico nel verso giusto
- il treno sta sul binario della stazione, non in mezzo agli isolati
- Torrione, gruppo di Piazza Peretti, Santa Lucia e San Pio V sono al loro posto
- il footer cita OpenStreetMap, Copernicus, Open-Meteo, `Painted with AI`, Krasun e Gagliardi, e non cita il comune di Tel Aviv né un cognome dell'autore
- Condividi copia un URL che, riaperto, mostra la stessa vista (`origin + pathname + hash`)
- le altre città (`/tel-aviv-yafo`, `/stuttgart`, `/zagreb`, `/wieliczka`) si aprono ancora in inglese

- [ ] **Step 3: Traffico sulla stazione**

Con il dev server acceso e Chrome in `CHROME_PATH`:

```powershell
npm -w pipeline exec tsx src/traffictest.ts "http://localhost:<porta>/grottammare?at=42.99388,13.86967,1.2" 2
```

Lo script stampa gli overlap, compresi quelli in senso opposto, e può uscire con codice 0 anche se ce ne sono. Leggere il testo. Se un overlap in senso opposto sta su una via a senso unico (`o === 1` o `o === -1`), fermarsi e riportarlo. Non dichiarare il verso giusto solo perché il processo è uscito 0.

- [ ] **Step 4: Non pubblicare**

Non lanciare `npm run publish`, `npm run deploy`, `npm run og`, `npm run archive`. La card social si fa quando l'autore chiede di mettere il sito online.

```powershell
git status --short
```

Atteso: nessun file di pubblicazione, nessun `.env`, nessun `data/` in stage. Se gli step 2 o 3 hanno richiesto una correzione di sorgente, il commit di quella correzione sta già nel suo task; questo step non ne aggiunge uno vuoto.

---

## Fuori da questo piano

- Pubblicazione su Cloudflare R2, dominio, `npm run publish` e `npm run deploy`: solo dopo un sì esplicito, e mai verso il bucket `isometricworldtiles`.
- DTM o CTR della Regione Marche: solo se l'autore, visto il render nudo, dice di valutarli. La voce di credito si scrive prima di usare il dato.
- Il nome di chi regala il sito, nel footer: solo se l'autore lo chiede.
- Filmato per i social, interfaccia inglese, modulo «Segnala un problema», accorciatore di link.
