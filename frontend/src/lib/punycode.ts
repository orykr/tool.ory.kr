const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = "-";

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
	delta = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
	delta += Math.floor(delta / numPoints);
	let k = 0;
	while (delta > ((BASE - TMIN) * TMAX) / 2) {
		delta = Math.floor(delta / (BASE - TMIN));
		k += BASE;
	}
	return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
}

function encodeDigit(digit: number): string {
	return String.fromCharCode(digit + 22 + 75 * (digit < 26 ? 1 : 0));
}

function decodeDigit(codePoint: number): number {
	if (codePoint >= 48 && codePoint <= 57) return codePoint - 22;
	if (codePoint >= 65 && codePoint <= 90) return codePoint - 65;
	if (codePoint >= 97 && codePoint <= 122) return codePoint - 97;
	return BASE;
}

export function punyEncode(input: string): string {
	const codePoints = Array.from(input).map((c) => c.codePointAt(0)!);
	const basicSet: number[] = [];
	const nonBasicSet: number[] = [];
	for (const cp of codePoints) {
		if (cp < 0x80) basicSet.push(cp);
		else nonBasicSet.push(cp);
	}
	const output: string[] = basicSet.map((cp) => String.fromCodePoint(cp));
	const handledLength = basicSet.length;
	if (handledLength > 0 && nonBasicSet.length > 0) output.push(DELIMITER);
	if (nonBasicSet.length === 0) return output.join("");

	let n = INITIAL_N;
	let delta = 0;
	let bias = INITIAL_BIAS;
	let h = handledLength;
	const total = codePoints.length;

	while (h < total) {
		let m = Number.MAX_SAFE_INTEGER;
		for (const cp of codePoints) if (cp >= n && cp < m) m = cp;
		delta += (m - n) * (h + 1);
		n = m;
		for (const cp of codePoints) {
			if (cp < n) {
				delta++;
			} else if (cp === n) {
				let q = delta;
				let k = BASE;
				while (true) {
					const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
					if (q < t) break;
					output.push(encodeDigit(t + ((q - t) % (BASE - t))));
					q = Math.floor((q - t) / (BASE - t));
					k += BASE;
				}
				output.push(encodeDigit(q));
				bias = adapt(delta, h + 1, h === handledLength);
				delta = 0;
				h++;
			}
		}
		delta++;
		n++;
	}

	return output.join("");
}

export function punyDecode(input: string): string {
	const lastDelim = input.lastIndexOf(DELIMITER);
	const basic = lastDelim < 0 ? "" : input.slice(0, lastDelim);
	const extended = lastDelim < 0 ? input : input.slice(lastDelim + 1);
	const output: number[] = [];
	for (const ch of basic) output.push(ch.codePointAt(0)!);

	let n = INITIAL_N;
	let i = 0;
	let bias = INITIAL_BIAS;
	let pos = 0;

	while (pos < extended.length) {
		const oldI = i;
		let w = 1;
		let k = BASE;
		while (true) {
			if (pos >= extended.length) throw new Error("Punycode: unexpected end of input.");
			const digit = decodeDigit(extended.charCodeAt(pos++));
			if (digit >= BASE) throw new Error("Punycode: invalid digit.");
			i += digit * w;
			const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
			if (digit < t) break;
			w *= BASE - t;
			k += BASE;
		}
		const out = output.length + 1;
		bias = adapt(i - oldI, out, oldI === 0);
		n += Math.floor(i / out);
		i %= out;
		output.splice(i, 0, n);
		i++;
	}

	return output.map((cp) => String.fromCodePoint(cp)).join("");
}

export function encodeIdn(domain: string): string {
	return domain
		.toLowerCase()
		.split(".")
		.map((label) => {
			if (/^[\x00-\x7F]+$/.test(label)) return label;
			return "xn--" + punyEncode(label);
		})
		.join(".");
}

export function decodeIdn(domain: string): string {
	return domain
		.split(".")
		.map((label) => (/^xn--/i.test(label) ? punyDecode(label.slice(4)) : label))
		.join(".");
}
