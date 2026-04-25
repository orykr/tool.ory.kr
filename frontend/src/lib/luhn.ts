export function luhnDigits(input: string): number[] {
	const digits: number[] = [];
	for (const ch of input) {
		if (ch >= "0" && ch <= "9") digits.push(ch.charCodeAt(0) - 48);
	}
	return digits;
}

export function luhnChecksum(digits: number[]): number {
	let sum = 0;
	const reversed = [...digits].reverse();
	for (let i = 0; i < reversed.length; i++) {
		let d = reversed[i];
		if (i % 2 === 1) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		sum += d;
	}
	return sum % 10;
}

export function isValidLuhn(input: string): boolean {
	const digits = luhnDigits(input);
	if (digits.length < 2) return false;
	return luhnChecksum(digits) === 0;
}

export function luhnCheckDigit(numberWithoutCheck: string): number {
	const digits = luhnDigits(numberWithoutCheck);
	const padded = [...digits, 0];
	const remainder = luhnChecksum(padded);
	return (10 - remainder) % 10;
}

const CARD_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
	{ name: "Visa", pattern: /^4\d{12}(\d{3})?(\d{3})?$/ },
	{ name: "Mastercard", pattern: /^(5[1-5]\d{14}|2(2[2-9][1-9]|2[3-9]\d{2}|[3-6]\d{3}|7[01]\d{2}|720\d)\d{12})$/ },
	{ name: "American Express", pattern: /^3[47]\d{13}$/ },
	{ name: "Diners Club", pattern: /^3(0[0-5]|[68]\d)\d{11}$/ },
	{ name: "Discover", pattern: /^6(011|5\d{2}|4[4-9]\d|22(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5])))\d{10,13}$/ },
	{ name: "JCB", pattern: /^35(2[89]|[3-8]\d)\d{12,15}$/ },
	{ name: "UnionPay", pattern: /^62\d{14,17}$/ }
];

export function detectCardBrand(input: string): string | null {
	const stripped = input.replace(/\D/g, "");
	for (const { name, pattern } of CARD_PATTERNS) {
		if (pattern.test(stripped)) return name;
	}
	return null;
}
