export const IBAN_LENGTHS: Record<string, number> = {
	AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
	BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29,
	ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
	HR: 21, HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
	LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
	MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24,
	RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23,
	TN: 24, TR: 26, UA: 29, VG: 24, XK: 20
};

export interface IbanResult {
	valid: boolean;
	error?: string;
	country?: string;
	checkDigits?: string;
	bban?: string;
	length?: number;
	expectedLength?: number;
	formatted?: string;
}

export function validateIban(input: string): IbanResult {
	const cleaned = input.replace(/\s+/g, "").toUpperCase();
	if (!cleaned) return { valid: false, error: "Empty input." };
	if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
		return { valid: false, error: "Invalid IBAN format." };
	}
	const country = cleaned.slice(0, 2);
	const checkDigits = cleaned.slice(2, 4);
	const bban = cleaned.slice(4);
	const expected = IBAN_LENGTHS[country];
	if (!expected) {
		return { valid: false, error: `Unknown country code: ${country}.`, country };
	}
	if (cleaned.length !== expected) {
		return {
			valid: false,
			error: `Wrong length for ${country}: expected ${expected}, got ${cleaned.length}.`,
			country,
			length: cleaned.length,
			expectedLength: expected
		};
	}

	const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
	let numeric = "";
	for (const ch of rearranged) {
		const code = ch.charCodeAt(0);
		if (code >= 48 && code <= 57) numeric += ch;
		else if (code >= 65 && code <= 90) numeric += String(code - 55);
	}
	const remainder = mod97(numeric);

	return {
		valid: remainder === 1,
		error: remainder === 1 ? undefined : "Mod-97 checksum does not match.",
		country,
		checkDigits,
		bban,
		length: cleaned.length,
		expectedLength: expected,
		formatted: cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned
	};
}

function mod97(numeric: string): number {
	let remainder = 0;
	for (const digit of numeric) {
		remainder = (remainder * 10 + Number(digit)) % 97;
	}
	return remainder;
}
