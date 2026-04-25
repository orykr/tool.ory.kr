export interface RGB {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface HSL {
	h: number;
	s: number;
	l: number;
	a: number;
}

export function parseColor(input: string): RGB | null {
	const value = input.trim().toLowerCase();
	if (!value) return null;
	const hex = parseHex(value);
	if (hex) return hex;
	const rgb = parseRgbFunc(value);
	if (rgb) return rgb;
	const hsl = parseHslFunc(value);
	if (hsl) return hslToRgb(hsl);
	return null;
}

function parseHex(value: string): RGB | null {
	const m = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
	if (!m) return null;
	let hex = m[1];
	if (hex.length === 3 || hex.length === 4) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
	return { r, g, b, a };
}

function parseRgbFunc(value: string): RGB | null {
	const m = value.match(
		/^rgba?\(\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/
	);
	if (!m) return null;
	const r = clamp255(Number(m[1]));
	const g = clamp255(Number(m[2]));
	const b = clamp255(Number(m[3]));
	const a = m[4] !== undefined ? parseAlpha(m[4]) : 1;
	if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
	return { r, g, b, a };
}

function parseHslFunc(value: string): HSL | null {
	const m = value.match(
		/^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/
	);
	if (!m) return null;
	const h = ((Number(m[1]) % 360) + 360) % 360;
	const s = Math.max(0, Math.min(100, Number(m[2])));
	const l = Math.max(0, Math.min(100, Number(m[3])));
	const a = m[4] !== undefined ? parseAlpha(m[4]) : 1;
	if ([h, s, l, a].some((n) => Number.isNaN(n))) return null;
	return { h, s, l, a };
}

function parseAlpha(input: string): number {
	if (input.endsWith("%")) return Math.max(0, Math.min(1, Number(input.slice(0, -1)) / 100));
	return Math.max(0, Math.min(1, Number(input)));
}

function clamp255(n: number): number {
	return Math.max(0, Math.min(255, Math.round(n)));
}

export function rgbToHsl({ r, g, b, a }: RGB): HSL {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	let h = 0;
	let s = 0;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
		else if (max === gn) h = (bn - rn) / d + 2;
		else h = (rn - gn) / d + 4;
		h *= 60;
	}
	return { h, s: s * 100, l: l * 100, a };
}

export function hslToRgb({ h, s, l, a }: HSL): RGB {
	const sn = s / 100;
	const ln = l / 100;
	const c = (1 - Math.abs(2 * ln - 1)) * sn;
	const hp = (h % 360) / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	let r1 = 0;
	let g1 = 0;
	let b1 = 0;
	if (0 <= hp && hp < 1) [r1, g1, b1] = [c, x, 0];
	else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
	else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
	else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
	else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
	else if (5 <= hp && hp < 6) [r1, g1, b1] = [c, 0, x];
	const m = ln - c / 2;
	return {
		r: Math.round((r1 + m) * 255),
		g: Math.round((g1 + m) * 255),
		b: Math.round((b1 + m) * 255),
		a
	};
}

export function rgbToHex({ r, g, b, a }: RGB): string {
	const hex = (n: number) => n.toString(16).padStart(2, "0");
	const base = `#${hex(r)}${hex(g)}${hex(b)}`;
	if (a < 1) return `${base}${hex(Math.round(a * 255))}`;
	return base;
}

export function rgbToCss({ r, g, b, a }: RGB): string {
	if (a < 1) return `rgba(${r}, ${g}, ${b}, ${roundAlpha(a)})`;
	return `rgb(${r}, ${g}, ${b})`;
}

export function hslToCss({ h, s, l, a }: HSL): string {
	const H = round(h, 1);
	const S = round(s, 1);
	const L = round(l, 1);
	if (a < 1) return `hsla(${H}, ${S}%, ${L}%, ${roundAlpha(a)})`;
	return `hsl(${H}, ${S}%, ${L}%)`;
}

export function relativeLuminance({ r, g, b }: RGB): number {
	const conv = (v: number) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * conv(r) + 0.7152 * conv(g) + 0.0722 * conv(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = Math.max(la, lb);
	const darker = Math.min(la, lb);
	return (lighter + 0.05) / (darker + 0.05);
}

function round(n: number, digits: number): number {
	const f = 10 ** digits;
	return Math.round(n * f) / f;
}

function roundAlpha(a: number): number {
	return Math.round(a * 1000) / 1000;
}
