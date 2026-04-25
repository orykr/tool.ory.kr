export type Base = 2 | 8 | 10 | 16;

export interface BaseValues {
	bin: string;
	oct: string;
	dec: string;
	hex: string;
}

export const EMPTY_VALUES: BaseValues = { bin: "", oct: "", dec: "", hex: "" };

const BASE_KEYS: Record<Base, keyof BaseValues> = {
	2: "bin",
	8: "oct",
	10: "dec",
	16: "hex"
};

const BASE_PATTERNS: Record<Base, RegExp> = {
	2: /^-?[01]+$/,
	8: /^-?[0-7]+$/,
	10: /^-?\d+$/,
	16: /^-?[0-9a-fA-F]+$/
};

export function convertFromBase(input: string, base: Base): BaseValues | { error: string } {
	const trimmed = input.trim();
	if (!trimmed) return EMPTY_VALUES;

	const cleaned = stripPrefix(trimmed, base);
	if (!BASE_PATTERNS[base].test(cleaned)) {
		return { error: `Invalid digits for base ${base}.` };
	}

	let value: bigint;
	try {
		value = parseBigInt(cleaned, base);
	} catch (e) {
		return { error: (e as Error).message };
	}

	return {
		bin: formatSigned(value, 2),
		oct: formatSigned(value, 8),
		dec: value.toString(10),
		hex: formatSigned(value, 16).toUpperCase()
	};
}

export function baseKey(base: Base): keyof BaseValues {
	return BASE_KEYS[base];
}

function stripPrefix(input: string, base: Base): string {
	const negative = input.startsWith("-");
	const body = negative ? input.slice(1) : input;
	let stripped = body;
	if (base === 16 && /^0x/i.test(body)) stripped = body.slice(2);
	else if (base === 2 && /^0b/i.test(body)) stripped = body.slice(2);
	else if (base === 8 && /^0o/i.test(body)) stripped = body.slice(2);
	return negative ? `-${stripped}` : stripped;
}

function parseBigInt(input: string, base: Base): bigint {
	const negative = input.startsWith("-");
	const body = negative ? input.slice(1) : input;
	if (!body) throw new Error("Empty number.");
	const baseBig = BigInt(base);
	let result = 0n;
	for (const ch of body) {
		const digit = digitValue(ch);
		if (digit === null || digit >= base) throw new Error(`Invalid digit '${ch}' for base ${base}.`);
		result = result * baseBig + BigInt(digit);
	}
	return negative ? -result : result;
}

function digitValue(ch: string): number | null {
	const code = ch.charCodeAt(0);
	if (code >= 48 && code <= 57) return code - 48;
	if (code >= 97 && code <= 102) return code - 97 + 10;
	if (code >= 65 && code <= 70) return code - 65 + 10;
	return null;
}

function formatSigned(value: bigint, base: number): string {
	if (value < 0n) return `-${(-value).toString(base)}`;
	return value.toString(base);
}
