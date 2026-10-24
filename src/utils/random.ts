/** Deterministic PRNG helpers — demo data must never change between renders. */

export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(key: string): () => number {
  return mulberry32(hashString(key));
}

/** Approximate standard-normal sample (sum of uniforms), clamped to ±3. */
export function gaussian(rng: () => number): number {
  const u = (rng() + rng() + rng() + rng() + rng() + rng() - 3) / 1.732;
  return Math.max(-3, Math.min(3, u));
}

export function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}
