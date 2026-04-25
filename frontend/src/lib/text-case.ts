export function splitWords(input: string): string[] {
	if (!input) return [];
	return input
		.replace(/([a-z\d])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
}

export function toCamel(input: string): string {
	const words = splitWords(input);
	return words
		.map((w, i) =>
			i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()
		)
		.join("");
}

export function toPascal(input: string): string {
	return splitWords(input)
		.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
		.join("");
}

export function toSnake(input: string): string {
	return splitWords(input)
		.map((w) => w.toLowerCase())
		.join("_");
}

export function toScreamingSnake(input: string): string {
	return splitWords(input)
		.map((w) => w.toUpperCase())
		.join("_");
}

export function toKebab(input: string): string {
	return splitWords(input)
		.map((w) => w.toLowerCase())
		.join("-");
}

export function toTitle(input: string): string {
	return splitWords(input)
		.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

export function toSentence(input: string): string {
	const words = splitWords(input).map((w) => w.toLowerCase());
	if (!words.length) return "";
	return words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
}

export function toUpper(input: string): string {
	return input.toUpperCase();
}

export function toLower(input: string): string {
	return input.toLowerCase();
}

export function reverse(input: string): string {
	return Array.from(input).reverse().join("");
}
