const PAIRS: Array<[number, string]> = [
	[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
	[100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
	[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
];

export function intToRoman(n: number): string {
	if (!Number.isInteger(n) || n <= 0 || n > 3999) {
		throw new Error("Roman numerals support integers 1–3999.");
	}
	let result = "";
	for (const [value, symbol] of PAIRS) {
		while (n >= value) {
			result += symbol;
			n -= value;
		}
	}
	return result;
}

export function romanToInt(input: string): number {
	const s = input.trim().toUpperCase();
	if (!s || !/^[MDCLXVI]+$/.test(s)) throw new Error("Invalid Roman numeral.");
	const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
	let total = 0;
	for (let i = 0; i < s.length; i++) {
		const cur = map[s[i]];
		const next = map[s[i + 1]];
		if (next > cur) {
			total += next - cur;
			i++;
		} else {
			total += cur;
		}
	}
	if (intToRoman(total) !== s) throw new Error("Non-canonical Roman numeral.");
	return total;
}
