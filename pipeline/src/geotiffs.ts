/**
 * Local GeoTIFF orthophotos (AGEA's downloads): uncompressed, chunky RGB(A), north-up, one strip per row or
 * more, georeferenced by a tie point and a pixel scale (PixelIsArea). Reads only the rows a window needs, so
 * 1 GB sheets cost nothing to open. No GDAL needed.
 *
 *   const set = openGeoTiffs(dir);              // every *.tif under dir (recursive)
 *   const rgb = set.window(e0, n1, w, h, res);  // w×h RGB, top-left corner at (e0, n1), res m per px
 *
 * Pixels no sheet covers (or that are transparent in all of them) stay 0,0,0; real black is lifted to 1,1,1
 * so callers can tell the two apart. The grid must be the sheets' own (same res, corners on their pixel grid).
 */
import { closeSync, openSync, readdirSync, readSync, statSync } from "node:fs";
import { join } from "node:path";

interface Sheet {
  file: string; fd: number | null; w: number; h: number; spp: number;
  rowsPerStrip: number; strips: number[]; x0: number; y0: number; res: number;
}

function parse(file: string): Sheet {
  const fd = openSync(file, "r");
  const read = (pos: number, len: number) => { const b = Buffer.alloc(len); readSync(fd, b, 0, len, pos); return b; };
  const head = read(0, 8);
  const le = head.toString("latin1", 0, 2) === "II";
  const u16 = (b: Buffer, o: number) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
  const u32 = (b: Buffer, o: number) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
  const f64 = (b: Buffer, o: number) => (le ? b.readDoubleLE(o) : b.readDoubleBE(o));
  if (u16(head, 2) !== 42) throw new Error(`${file}: not a classic TIFF (BigTIFF is not supported)`);
  const ifd = u32(head, 4), n = u16(read(ifd, 2), 0), ents = read(ifd + 2, n * 12);
  const SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 11: 4, 12: 8, 16: 8 };
  const tag = new Map<number, number[]>();
  for (let k = 0; k < n; k++) {
    const e = k * 12, id = u16(ents, e), type = u16(ents, e + 2), count = u32(ents, e + 4), sz = SIZE[type] ?? 1;
    if (![256, 257, 258, 259, 273, 277, 278, 284, 33550, 33922].includes(id)) continue;
    const data = count * sz <= 4 ? ents.subarray(e + 8, e + 12) : read(u32(ents, e + 8), count * sz);
    const vals: number[] = [];
    for (let c = 0; c < count; c++) vals.push(type === 3 ? u16(data, c * 2) : type === 4 ? u32(data, c * 4) : type === 12 ? f64(data, c * 8) : data[c]);
    tag.set(id, vals);
  }
  closeSync(fd);
  const get = (id: number) => { const v = tag.get(id); if (!v) throw new Error(`${file}: TIFF tag ${id} missing`); return v; };
  if ((tag.get(259)?.[0] ?? 1) !== 1) throw new Error(`${file}: compressed TIFF (compression ${tag.get(259)}) is not supported`);
  if ((tag.get(284)?.[0] ?? 1) !== 1) throw new Error(`${file}: planar TIFF is not supported`);
  if (get(258).some((b) => b !== 8)) throw new Error(`${file}: only 8-bit samples are supported`);
  const scale = get(33550), tie = get(33922);
  if (Math.abs(scale[0] - scale[1]) > 1e-9) throw new Error(`${file}: non-square pixels`);
  const w = get(256)[0], h = get(257)[0];
  return {
    file, fd: null, w, h, spp: tag.get(277)?.[0] ?? 3, rowsPerStrip: tag.get(278)?.[0] ?? h, strips: get(273),
    res: scale[0], x0: tie[3] - tie[0] * scale[0], y0: tie[4] + tie[1] * scale[1],
  };
}

export interface GeoTiffSet {
  sheets: { file: string; e0: number; n0: number; e1: number; n1: number }[];
  /** w×h RGB at res m/px, top-left corner (e0, n1) in the sheets' CRS. Uncovered = 0,0,0. */
  window(e0: number, n1: number, w: number, h: number, res: number): Buffer;
  close(): void;
}

export function openGeoTiffs(dir: string): GeoTiffSet {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tiff?$/i.test(f)) files.push(p);
    }
  };
  walk(dir);
  if (!files.length) throw new Error(`no GeoTIFFs under ${dir}`);
  const sheets = files.sort().map(parse);
  return {
    sheets: sheets.map((s) => ({ file: s.file, e0: s.x0, n0: s.y0 - s.h * s.res, e1: s.x0 + s.w * s.res, n1: s.y0 })),
    window(e0, n1, w, h, res) {
      const out = Buffer.alloc(w * h * 3), done = new Uint8Array(w * h);
      for (const s of sheets) {
        if (Math.abs(s.res - res) > 1e-9) throw new Error(`${s.file}: ${s.res} m/px, asked for ${res}`);
        // window pixel (0,0) in sheet pixels; must be integral (same grid)
        const ox = (e0 - s.x0) / res, oy = (s.y0 - n1) / res;
        const ix = Math.round(ox), iy = Math.round(oy);
        if (Math.abs(ox - ix) > 1e-6 || Math.abs(oy - iy) > 1e-6) throw new Error(`window not on the grid of ${s.file}`);
        const xa = Math.max(0, ix), xb = Math.min(s.w, ix + w), ya = Math.max(0, iy), yb = Math.min(s.h, iy + h);
        if (xa >= xb || ya >= yb) continue;
        s.fd ??= openSync(s.file, "r");
        const rowBytes = s.w * s.spp, len = (xb - xa) * s.spp, buf = Buffer.alloc(len);
        for (let y = ya; y < yb; y++) {
          const strip = Math.floor(y / s.rowsPerStrip);
          readSync(s.fd, buf, 0, len, s.strips[strip] + (y - strip * s.rowsPerStrip) * rowBytes + xa * s.spp);
          const wy = y - iy;
          for (let x = xa; x < xb; x++) {
            const p = wy * w + (x - ix);
            if (done[p]) continue;
            const b = (x - xa) * s.spp;
            if (s.spp === 4 && buf[b + 3] === 0) continue; // transparent: another sheet may have it
            const o = p * 3;
            out[o] = buf[b]; out[o + 1] = buf[b + 1]; out[o + 2] = buf[b + 2];
            if (!out[o] && !out[o + 1] && !out[o + 2]) out[o] = out[o + 1] = out[o + 2] = 1;
            done[p] = 1;
          }
        }
      }
      return out;
    },
    close() { for (const s of sheets) if (s.fd !== null) { closeSync(s.fd); s.fd = null; } },
  };
}
