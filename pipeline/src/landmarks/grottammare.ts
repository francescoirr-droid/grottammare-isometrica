/**
 * Grottammare landmarks that the painted renderer can draw (extruded footprints; look stays "painted").
 *
 * San Pio V (OSM way 226244048) is one flat rectangle: no height, no roof:shape, no tower part.
 * Written sources, not photos: the nave has an octagonal drum and an eight-pitch dome at the crossing
 * (Turismo Marche, "Chiesa di S. Pio V"); the campanile is a square tower with four plastered faces,
 * a bell chamber and a cross (L'Ancora, 3 Oct 2018; Picenotime, 10 Oct 2017). That notice names the
 * sidewalk of Via Laureati. In the area's roads, Via Pietro Laureati is the street along the south
 * wall and Via Fratelli Cairoli the street along the east wall, so the shaft stands in that corner.
 * No published height: the nave keeps the untagged default (13 m); the drum, shaft and cap are only
 * tall enough to read as a church. No photograph was used.
 */
type P2 = [number, number];
export type Volume = { ring: P2[]; h: number; style: number };

const NAVE_H = 13;
const DRUM_H = 19;
const SHAFT_H = 28;
const CAP_H = 33;
const PIN_H = 37;
const SHAFT = 6.5;
const PROUD = 0.35; // south and east faces clear of the nave wall

// Torrione della Battaglia (OSM way 935851144): a brick cylinder, flat roof, no height.
// Visit Grottammare: cylindrical body, semicircular base, two floors, five merlons rounded on top.
// The trilobed corbels are not extruded (no min-height). No published metres: the shaft is only
// tall enough to read as a tower on this footprint. No photograph was used.
const TORRE_H = 16;
const MERLON_H = 21;
const MERLONS = 5;

function square(x0: number, y0: number, x1: number, y1: number): P2[] {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; // CCW in ENU (x east, y north)
}

function octagon(cx: number, cy: number, r: number): P2[] {
  const ring: P2[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return ring;
}

/** Nave on the OSM ring, a drum at its centre, a shaft in the south-east corner. */
export function sanPioVolumes(ring: P2[]): Volume[] {
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const tx0 = x1 - SHAFT, ty0 = y0 - PROUD, tx1 = x1 + PROUD, ty1 = y0 + SHAFT;
  const mx = (tx0 + tx1) / 2, my = (ty0 + ty1) / 2;
  const cap = (w: number) => square(mx - w / 2, my - w / 2, mx + w / 2, my + w / 2);
  return [
    { ring, h: NAVE_H, style: 2 },
    { ring: octagon((x0 + x1) / 2, (y0 + y1) / 2, 3.6), h: DRUM_H, style: 3 },
    { ring: square(tx0, ty0, tx1, ty1), h: SHAFT_H, style: 3 },
    { ring: cap(4.2), h: CAP_H, style: 3 },
    { ring: cap(1.6), h: PIN_H, style: 3 },
  ];
}

/**
 * The OSM ring is the shaft. Five rounded merlons sit inside the rim so only their tops show.
 * Style 4 is the plain shed shader: no window grid and no roof clutter, so the paint can make brick
 * rather than a glazed block.
 */
export function torrioneVolumes(ring: P2[]): Volume[] {
  const c = ring.reduce((s, p) => [s[0] + p[0], s[1] + p[1]] as P2, [0, 0] as P2);
  c[0] /= ring.length;
  c[1] /= ring.length;
  const radius = ring.reduce((s, p) => s + Math.hypot(p[0] - c[0], p[1] - c[1]), 0) / ring.length;
  const merlons: Volume[] = [];
  for (let i = 0; i < MERLONS; i++) {
    const a = (i / MERLONS) * Math.PI * 2 - Math.PI / 2;
    merlons.push({
      ring: octagon(c[0] + Math.cos(a) * radius * 0.52, c[1] + Math.sin(a) * radius * 0.52, 1.05),
      h: MERLON_H,
      style: 4,
    });
  }
  return [{ ring, h: TORRE_H, style: 4 }, ...merlons];
}
