type P2 = [number, number];

/**
 * Close an open coastline into a sea polygon. OSM keeps the land on the left, so the sea is on the right
 * of the chain. `off` is how far offshore the closing edge sits, in the same units as the chain (metres).
 * A northbound Adriatic coast closes to the east; a southbound Mediterranean coast closes to the west.
 */
export function seaRing(chain: P2[], off = 30000): P2[] {
  const a = chain[0], b = chain[chain.length - 1];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const rx = (dy / len) * off, ry = (-dx / len) * off;
  return [...chain, [b[0] + rx, b[1] + ry], [a[0] + rx, a[1] + ry]];
}
