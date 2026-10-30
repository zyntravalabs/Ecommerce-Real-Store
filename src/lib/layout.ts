// Store floor plan (pure data, no React/three). Units in metres. Entrance at +z.
export const SHELF = { zMin: -20, zMax: -4, depth: 1.2, height: 2.4, levels: 4 };
export const UNIT_X = [-16, -8, 0, 8, 16];
export const BOUNDS = { xMin: -19, xMax: 19, zMin: -23, zMax: 12 };
export const COUNTER = { x: 0, z: 4.5, w: 5, d: 1.2 };

// Each face: which shelf unit, which side faces the walker (+1 = east / -1 = west).
export type Face = { category: string; x: number; side: 1 | -1 };
export const FACES: Face[] = [
  { category: "fruits", x: -16, side: 1 },
  { category: "dairy", x: -8, side: -1 },
  { category: "snacks", x: -8, side: 1 },
  { category: "beverages", x: 0, side: -1 },
  { category: "rice", x: 0, side: 1 },
  { category: "personal", x: 8, side: -1 },
  { category: "cleaning", x: 8, side: 1 },
  { category: "electronics", x: 16, side: -1 },
  { category: "bakery", x: -16, side: -1 },
];

/** Standing spot in front of a face, looking at it. */
export function faceSpot(f: Face) {
  return { x: f.x + f.side * 3, z: (SHELF.zMin + SHELF.zMax) / 2, yaw: f.side > 0 ? Math.PI / 2 : -Math.PI / 2 };
}

/** Push a point out of shelves/counter. r = body radius. */
export function collide(x: number, z: number, r = 0.4) {
  x = Math.min(BOUNDS.xMax, Math.max(BOUNDS.xMin, x));
  z = Math.min(BOUNDS.zMax, Math.max(BOUNDS.zMin, z));
  const boxes = [
    ...UNIT_X.map((ux) => ({ x0: ux - SHELF.depth, x1: ux + SHELF.depth, z0: SHELF.zMin, z1: SHELF.zMax })),
    { x0: COUNTER.x - COUNTER.w / 2, x1: COUNTER.x + COUNTER.w / 2, z0: COUNTER.z - COUNTER.d / 2, z1: COUNTER.z + COUNTER.d / 2 },
  ];
  for (const b of boxes) {
    const x0 = b.x0 - r, x1 = b.x1 + r, z0 = b.z0 - r, z1 = b.z1 + r;
    if (x > x0 && x < x1 && z > z0 && z < z1) {
      const d = [x - x0, x1 - x, z - z0, z1 - z];
      const m = Math.min(...d);
      if (m === d[0]) x = x0; else if (m === d[1]) x = x1; else if (m === d[2]) z = z0; else z = z1;
    }
  }
  return { x, z };
}
