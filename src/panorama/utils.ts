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

/**
 * Luminance relative sRGB (0 → 1), au sens WCAG. Sert à savoir de quel côté
 * penche un fond : au-dessus, l'encre sombre se détache mieux ; en dessous,
 * c'est l'encre claire.
 */
export function luminance(c: RGB): number {
  const ch = c.map((v) => {
    const k = clamp01(v / 255);
    return k <= 0.03928 ? k / 12.92 : Math.pow((k + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** smoothstep — utilisée pour la butte, la tombée de la nuit et le lever de lune. */
export function smoothstep(t: number): number {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
}
