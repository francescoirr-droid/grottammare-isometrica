import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { AREAS } from "./areas.ts";
import { seaRing } from "./coast.ts";
import { nightness, sunElevation, weatherLabel } from "../../web/src/scripts/ambient.ts";
import { CITIES, DEFAULT_CITY, REGIONS } from "./places.ts";
import { GROTTAMMARE_LOCAL } from "./grottammare-local.ts";
import { sanPioVolumes, torrioneVolumes } from "./landmarks/grottammare.ts";
import { quietLane, stoneLane } from "./roadspec.ts";
import { beachParasols, PARASOLS } from "./beach.ts";
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
  assert.equal(region.geoidM, 42.96);
  assert.equal(region.groundH, 46.96);
  assert.equal(region.heightBase, undefined);
  assert.ok(287 + region.geoidM < 555);
  assert.equal(region.stoneLanes, true);
  assert.deepEqual(region.outline, {
    relations: [42253],
    add: [[42.9572, 13.860, 43.0100, 13.890]],
    clip: [42.9572, 13.848, 43.0100, 13.890],
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

test("le targhette stanno sui luoghi OSM, e solo qui", () => {
  assert.deepEqual(region.plates, [
    { name: "Piazza Peretti", at: [42.9957635, 13.8665218], h: 90.9 },
    { name: "San Pio V", at: [42.991097, 13.868416], h: 48.5 },
    { name: "Santa Lucia", at: [42.996468, 13.866471], h: 92.2 },
    { name: "Le Logge", at: [42.995637, 13.866601], h: 88.7 },
    { name: "San Giovanni Battista", at: [42.995609, 13.866402], h: 93.8 },
    { name: "Torrione della Battaglia", at: [42.995837, 13.866963], h: 80.5 },
  ]);
  for (const id of Object.keys(REGIONS)) {
    if (id !== "grottammare") assert.equal(REGIONS[id].plates, undefined, id);
  }
});

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
  for (const id of Object.keys(REGIONS)) {
    if (id !== "grottammare") assert.equal(REGIONS[id].stoneLanes, undefined, id);
  }
});

test("i vicoli chiusi e il selciato sono pietra, e solo se la regione lo chiede", () => {
  assert.equal(stoneLane({ highway: "residential", motor_vehicle: "no", surface: "paved" }, true), true);
  assert.equal(stoneLane({ highway: "residential", surface: "unhewn_cobblestone" }, true), true);
  assert.equal(stoneLane({ highway: "service", surface: "sett" }, true), true);
  assert.equal(stoneLane({ highway: "residential", surface: "cobblestone" }, true), true);
  assert.equal(stoneLane({ highway: "residential", surface: "paved" }, true), false);
  assert.equal(stoneLane({ highway: "residential", surface: "asphalt" }, true), false);
  assert.equal(stoneLane({ highway: "primary", surface: "asphalt" }, true), false);
  assert.equal(stoneLane({ highway: "track", motor_vehicle: "no", surface: "ground" }, true), false);
  assert.equal(stoneLane({ highway: "residential", motor_vehicle: "no" }, false), false);
  assert.equal(quietLane({ highway: "service", access: "no" }, true), true);
  assert.equal(quietLane({ highway: "residential", motor_vehicle: "no" }, true), true);
  assert.equal(quietLane({ highway: "residential", surface: "unhewn_cobblestone" }, true), false);
  assert.equal(quietLane({ highway: "residential", motor_vehicle: "no" }, false), false);
});

test("San Pio V sta sul suo rettangolo OSM, con la torre all'angolo sud-est", () => {
  // ENU rectangle, CCW: west-south, east-south, east-north, west-north. 40 m east-west, 30 m north-south.
  const ring: [number, number][] = [[0, 0], [40, 0], [40, 30], [0, 30]];
  const parts = sanPioVolumes(ring);
  assert.equal(parts[0].ring, ring);
  assert.equal(parts[0].h, 13);
  const [drum, shaft, cap, pin] = parts.slice(1);
  assert.ok(drum.h > 13 && shaft.h > drum.h && cap.h > shaft.h && pin.h > cap.h);
  const centre = (r: [number, number][]) => [r.reduce((s, p) => s + p[0], 0) / r.length, r.reduce((s, p) => s + p[1], 0) / r.length];
  const [dx, dy] = centre(drum.ring);
  assert.ok(Math.abs(dx - 20) < 0.01 && Math.abs(dy - 15) < 0.01);
  const [sx, sy] = centre(shaft.ring);
  assert.ok(sx > 36 && sx < 41 && sy > 0 && sy < 4, `${sx},${sy}`);
  assert.ok(shaft.ring.every(([x, y]) => x >= -0.01 && x <= 40.4 && y >= -0.4 && y <= 30.01));
});

test("il Torrione sta sulla sua impronta, più alto di una casa, con cinque merli", () => {
  const ring: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ring.push([4 * Math.cos(a), 4 * Math.sin(a)]);
  }
  const parts = torrioneVolumes(ring);
  assert.equal(parts[0].ring, ring);
  assert.equal(parts[0].h, 16);
  const merlons = parts.slice(1);
  assert.equal(merlons.length, 5);
  assert.ok(merlons.every((m) => m.h > parts[0].h && m.style === 4));
  for (const m of merlons) {
    const cx = m.ring.reduce((s, p) => s + p[0], 0) / m.ring.length;
    const cy = m.ring.reduce((s, p) => s + p[1], 0) / m.ring.length;
    const d = Math.hypot(cx, cy);
    assert.ok(d > 1.6 && d < 2.8, `${d}`);
    assert.ok(m.ring.every(([x, y]) => Math.hypot(x, y) < 4.2));
  }
});

test("la camera è bloccata", () => {
  const places = readFileSync(new URL("./places.ts", import.meta.url), "utf8");
  assert.match(places, /headingDeg: 260, \/\/ locked/);
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
  assert.match(blob, /Pale ground in image 1 is stone paving/);
  assert.match(GROTTAMMARE_LOCAL.trees, /trees-stuttgart\.png$/);
  assert.equal(GROTTAMMARE_LOCAL.inventionChecks, undefined);
  const paint = readFileSync(new URL("./paint.ts", import.meta.url), "utf8");
  assert.match(paint, /grottammare: GROTTAMMARE_LOCAL/);
});

test("il footer non cade su Tel Aviv", () => {
  assert.deepEqual(regionSourceLines("grottammare"), [
    `<a href="https://open-meteo.com/">Open-Meteo</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
    `<a href="https://geoportale.agea.gov.it/">Ortofoto AGEA 2022</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> (modificata)`,
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

test("il mare si chiude al largo, a destra della costa", () => {
  const east = seaRing([[0, 0], [0, 1000]], 30000);
  assert.ok(east.at(-2)![0] > 1000);
  assert.ok(east.at(-1)![0] > 1000);
  const west = seaRing([[0, 1000], [0, 0]], 30000);
  assert.ok(west.at(-2)![0] < -1000);
  assert.ok(west.at(-1)![0] < -1000);
});

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

test("ATTRIBUTION nomina Grottammare e non la Regione Marche", () => {
  const text = readFileSync(new URL("../../ATTRIBUTION.md", import.meta.url), "utf8");
  assert.match(text, /Grottammare/);
  assert.match(text, /Open-Meteo/);
  assert.match(text, /CC BY 4\.0/);
  assert.equal(text.includes("Regione Marche"), false);
});

test("gli ombrelloni stanno in file sulla sabbia, lontani dall'acqua, e solo se la regione lo chiede", () => {
  assert.equal(REGIONS.grottammare.beachUmbrellas, true);
  for (const [id, r] of Object.entries(REGIONS)) if (id !== "grottammare") assert.equal(r.beachUmbrellas, undefined, id);
  // a straight coast running north (land on its left, to the west), a beach 60 m wide on it
  const coast: Array<[number, number]> = [[0, -200], [0, 200]];
  const sand: Array<Array<Array<[number, number]>>> = [[[[0, -150], [0, 150], [-60, 150], [-60, -150]]]];
  const path = (p: [number, number]) => Math.abs(p[1] - 20) < 2; // a boardwalk across the beach at y = 20
  const ps = beachParasols(sand, coast, path);
  assert.ok(ps.length > 100, `${ps.length}`);
  for (const [x, y, nx, ny, c] of ps) {
    assert.ok(x <= -PARASOLS.seaGap + 0.5 && x >= -60 + PARASOLS.edge, `x ${x}`); // inland of the free strip, on the sand
    assert.ok(Math.abs(y) <= 150 - PARASOLS.edge, `y ${y}`);
    assert.ok(Math.abs(y - 20) >= 2, `on the boardwalk at ${y}`);
    assert.deepEqual([nx, ny], [-1, 0]); // sunbeds face the sea, east
    assert.ok(c >= 0 && c < PARASOLS.colours);
  }
  // rows: every umbrella of a row at the same distance from the water
  const rows = new Set(ps.map((p) => p[0]));
  assert.ok(rows.size >= 8 && rows.size <= 11, `${rows.size} rows`);
  // one colour per stretch of shore, a corridor between stretches
  const byBay = new Map<number, Set<number>>();
  for (const p of ps) { const b = Math.floor((p[1] + 200) / PARASOLS.bay); (byBay.get(b) ?? byBay.set(b, new Set()).get(b)!).add(p[4]); }
  for (const s of byBay.values()) assert.equal(s.size, 1);
  assert.equal(ps.some((p) => (p[1] + 200) % PARASOLS.bay < PARASOLS.corridor - 1e-6), false);
  assert.deepEqual(beachParasols([], coast, path), []);
});

test("il prompt dice che i dischi colorati sulla sabbia sono ombrelloni", () => {
  assert.match(GROTTAMMARE_LOCAL.materials, /beach umbrellas/);
});

test("le ville liberty e i monumenti hanno la loro nota di facciata, solo per Grottammare", () => {
  const paint = readFileSync(new URL("./paint.ts", import.meta.url), "utf8");
  const facades = paint.slice(paint.indexOf("const FACADES"), paint.indexOf("const CONTINUATION"));
  for (const name of ["Villa Laureati", "Villa Helvetia", "Villino Matricardi", "Villa Azzolino", "Torrione della Battaglia", "Teatro dell'Arancio", "San Giovanni Battista", "Santa Lucia", "San Pio V", "Sant'Agostino"])
    assert.ok(facades.includes(name), name);
  assert.match(facades, /liberty/);
  assert.match(facades, /three round \\?\s*arches/); // the loggia's arches, onto the piazza
  assert.equal(facades.includes("towards the sea, opens in three"), false);
  assert.equal((facades.match(/region: "grottammare"/g) ?? []).length, 8); // the three stucco villas share one entry
  // the regional prompt still names none of them
  for (const name of ["Laureati", "Helvetia", "Matricardi", "Azzolino"]) assert.equal(JSON.stringify(GROTTAMMARE_LOCAL).includes(name), false, name);
});
