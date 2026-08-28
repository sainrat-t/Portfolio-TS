export type RGB = [number, number, number];

/** Bruit déterministe — même graine, même valeur, à chaque rendu. */
export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function hexToRgb(hex: string): RGB {
  const s = String(hex || '').replace('#', '');
  const v = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  const n = parseInt(v, 16);
  return isNaN(n) ? [196, 69, 43] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function css(c: RGB): string {
  return 'rgb(' + c.map(Math.round).join(',') + ')';
}

export function mix(a: RGB, b: RGB, t: number): string {
  return css(lerpRgb(a, b, t));
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** smoothstep — utilisée pour la butte, la tombée de la nuit et le lever de lune. */
export function smoothstep(t: number): number {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
}
