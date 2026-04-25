const ONES = [
	"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
	"ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
	"eighteen", "nineteen"
];
const TENS = [
	"", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
];
const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion"];

export function numberToWords(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return "";
	if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
		throw new Error("Invalid number.");
	}

	let value = trimmed;
	let negative = false;
	if (value.startsWith("-")) {
		negative = true;
		value = value.slice(1);
	}

	const [intPart, decPart] = value.split(".");
	const intWords = integerToWords(intPart);

	let out = intWords || "zero";
	if (decPart && /[1-9]/.test(decPart)) {
		const decWords = decPart
			.split("")
			.map((d) => ONES[Number(d)])
			.join(" ");
		out += " point " + decWords;
	}
	return negative ? "negative " + out : out;
}

function integerToWords(num: string): string {
	const cleaned = num.replace(/^0+/, "") || "0";
	if (cleaned === "0") return "zero";

	const groups: string[] = [];
	let rest = cleaned;
	while (rest.length > 3) {
		groups.unshift(rest.slice(-3));
		rest = rest.slice(0, -3);
	}
	if (rest.length > 0) groups.unshift(rest);

	if (groups.length > SCALES.length) throw new Error("Number too large.");

	const parts: string[] = [];
	for (let i = 0; i < groups.length; i++) {
		const n = Number(groups[i]);
		if (n === 0) continue;
		const scaleIdx = groups.length - 1 - i;
		const words = threeDigitToWords(n);
		if (SCALES[scaleIdx]) parts.push(`${words} ${SCALES[scaleIdx]}`);
		else parts.push(words);
	}
	return parts.join(" ");
}

function threeDigitToWords(n: number): string {
	const out: string[] = [];
	const hundreds = Math.floor(n / 100);
	const rest = n % 100;
	if (hundreds > 0) out.push(`${ONES[hundreds]} hundred`);
	if (rest > 0) {
		if (rest < 20) out.push(ONES[rest]);
		else {
			const tens = Math.floor(rest / 10);
			const ones = rest % 10;
			if (ones === 0) out.push(TENS[tens]);
			else out.push(`${TENS[tens]}-${ONES[ones]}`);
		}
	}
	return out.join(" ");
}

export function numberToOrdinal(input: string): string {
	const words = numberToWords(input);
	const map: Record<string, string> = {
		one: "first", two: "second", three: "third", four: "fourth", five: "fifth",
		six: "sixth", seven: "seventh", eight: "eighth", nine: "ninth", ten: "tenth",
		eleven: "eleventh", twelve: "twelfth", thirteen: "thirteenth", fourteen: "fourteenth",
		fifteen: "fifteenth", sixteen: "sixteenth", seventeen: "seventeenth", eighteen: "eighteenth",
		nineteen: "nineteenth", twenty: "twentieth", thirty: "thirtieth", forty: "fortieth",
		fifty: "fiftieth", sixty: "sixtieth", seventy: "seventieth", eighty: "eightieth",
		ninety: "ninetieth", hundred: "hundredth", thousand: "thousandth", million: "millionth",
		billion: "billionth", trillion: "trillionth"
	};
	const tokens = words.split(/([\s-])/);
	for (let i = tokens.length - 1; i >= 0; i--) {
		const w = tokens[i];
		if (map[w]) {
			tokens[i] = map[w];
			return tokens.join("");
		}
	}
	return words + "th";
}
