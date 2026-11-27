/**
 * Beach umbrellas and sunbeds (places.ts `beachUmbrellas`), laid out on the sand from the coastline.
 *
 * The OSM data has the beach (natural=beach) and the coastline, and the bathing establishments only as points
 * (leisure=beach_resort, no outline). So the layout is generic, not surveyed: rows parallel to the shore, a free
 * strip along the water, the sand cut into stretches of BAY m, one establishment's colour each, a corridor
 * between stretches. Nothing stands on paths, piers, buildings or the areas drawn over the sand (pitches,
 * playgrounds, paving). page/ground.ts draws them flat on the ground; the painter turns them into umbrellas.
 */
type P2 = [number, number];
/** x, y (ENU m), landward unit normal (sunbeds point to the sea along it), colour index (page/ground.ts PARASOL) */
export type Parasol = [number, number, number, number, number];

export const PARASOLS = {
  along: 4.5,    // m between umbrellas in a row
  across: 4.5,   // m between rows
  seaGap: 14,    // m of free sand at the water's edge
  depth: 90,     // m inland at most
  edge: 2.5,     // m from the beach outline
  bay: 50,       // m of shore per establishment
  corridor: 3,   // m of passage between establishments
  colours: 8,
};

const dist = (p: P2, a: P2, b: P2) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
};

/** even-odd inside over all rings of one area */
export function insideRings(p: P2, rings: P2[][]): boolean {
  let c = false;
  for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * `sand`: the beach areas (rings of each); `coast`: the coastline chain, land on its left (OSM);
 * `blocked(p)`: a path, building or other area is there.
 */
export function beachParasols(sand: P2[][][], coast: P2[], blocked: (p: P2) => boolean, o = PARASOLS): Parasol[] {
  const out: Parasol[] = [];
  if (coast.length < 2 || !sand.length) return out;
  const boxes = sand.map((rings) => {
    const xs = rings.flatMap((r) => r.map((q) => q[0])), ys = rings.flatMap((r) => r.map((q) => q[1]));
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
  // another umbrella closer than 0.8 of a spacing (where the coast bends, the normals of two segments cross)
  const cell = o.along, grid = new Map<string, P2[]>(), key = (x: number, y: number) => `${Math.floor(x / cell)}_${Math.floor(y / cell)}`;
  const near = (p: P2) => {
    const cx = Math.floor(p[0] / cell), cy = Math.floor(p[1] / cell);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++)
      for (const q of grid.get(`${cx + i}_${cy + j}`) ?? []) if (Math.hypot(q[0] - p[0], q[1] - p[1]) < o.along * 0.8) return true;
    return false;
  };
  /** nearest coast distance, over the segments near index k */
  const coastDist = (p: P2, k: number) => {
    let d = Infinity;
    for (let i = Math.max(1, k - 60); i < Math.min(coast.length, k + 60); i++) d = Math.min(d, dist(p, coast[i - 1], coast[i]));
    return d;
  };
  // the coast by arc length: each establishment's grid is square to the chord of its stretch, so the rows stay
  // straight where the waterline wiggles
  const cum = [0];
  for (let k = 1; k < coast.length; k++) cum.push(cum[k - 1] + Math.hypot(coast[k][0] - coast[k - 1][0], coast[k][1] - coast[k - 1][1]));
  const at = (s: number): [P2, number] => {
    let k = 1;
    while (k < coast.length - 1 && cum[k] < s) k++;
    const a = coast[k - 1], b = coast[k], f = Math.max(0, Math.min(1, (s - cum[k - 1]) / (cum[k] - cum[k - 1] || 1)));
    return [[a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], k];
  };
  const total = cum[cum.length - 1];
  for (let bay = 0; bay * o.bay < total; bay++) {
    const [A, k] = at(bay * o.bay), [B] = at(Math.min(total, (bay + 1) * o.bay)), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    if (L < o.bay / 2) continue; // the chain's last scrap
    const t: P2 = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], n: P2 = [-t[1], t[0]]; // land on the left
    const colour = Math.floor(hash(bay) * o.colours);
    for (let u = o.corridor + o.along / 2; u < L; u += o.along) {
      const c: P2 = [A[0] + t[0] * u, A[1] + t[1] * u];
      for (let d = o.seaGap; d <= o.depth; d += o.across) {
        const p: P2 = [c[0] + n[0] * d, c[1] + n[1] * d];
        const area = sand.findIndex((rings, j) => {
          const bx = boxes[j];
          return p[0] >= bx[0] && p[0] <= bx[2] && p[1] >= bx[1] && p[1] <= bx[3] && insideRings(p, rings);
        });
        if (area < 0) continue;
        if (sand[area].some((r) => r.some((q, j) => dist(p, r[j === 0 ? r.length - 1 : j - 1], q) < o.edge))) continue;
        if (coastDist(p, k) < o.seaGap - 0.5 || blocked(p) || near(p)) continue;
        (grid.get(key(p[0], p[1])) ?? grid.set(key(p[0], p[1]), []).get(key(p[0], p[1]))!).push(p);
        out.push([Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10, Math.round(n[0] * 1000) / 1000, Math.round(n[1] * 1000) / 1000, colour]);
      }
    }
  }
  return out;
}
