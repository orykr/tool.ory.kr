const IRREGULAR: Array<[string, string]> = [
	["man", "men"],
	["woman", "women"],
	["child", "children"],
	["person", "people"],
	["foot", "feet"],
	["tooth", "teeth"],
	["mouse", "mice"],
	["goose", "geese"],
	["ox", "oxen"],
	["cactus", "cacti"],
	["focus", "foci"],
	["radius", "radii"],
	["fungus", "fungi"],
	["nucleus", "nuclei"],
	["syllabus", "syllabi"],
	["analysis", "analyses"],
	["diagnosis", "diagnoses"],
	["thesis", "theses"],
	["crisis", "crises"],
	["phenomenon", "phenomena"],
	["criterion", "criteria"],
	["datum", "data"],
	["medium", "media"],
	["alumnus", "alumni"],
	["alumna", "alumnae"]
];

const UNCOUNTABLE = new Set([
	"sheep", "fish", "deer", "moose", "series", "species", "aircraft", "salmon",
	"trout", "tuna", "swine", "rice", "money", "information", "equipment", "software",
	"news"
]);

const PLURAL_RULES: Array<[RegExp, string]> = [
	[/(quiz)$/i, "$1zes"],
	[/^(ox)$/i, "$1en"],
	[/([m|l])ouse$/i, "$1ice"],
	[/(matr|vert|ind)(?:ix|ex)$/i, "$1ices"],
	[/(x|ch|ss|sh)$/i, "$1es"],
	[/([^aeiouy]|qu)y$/i, "$1ies"],
	[/(hive)$/i, "$1s"],
	[/(?:([^f])fe|([lr])f)$/i, "$1$2ves"],
	[/sis$/i, "ses"],
	[/([ti])um$/i, "$1a"],
	[/(buffal|tomat|potat|her|ech)o$/i, "$1oes"],
	[/(bu)s$/i, "$1ses"],
	[/(alias|status)$/i, "$1es"],
	[/(octop|vir)us$/i, "$1i"],
	[/(ax|test)is$/i, "$1es"],
	[/s$/i, "s"],
	[/$/, "s"]
];

const SINGULAR_RULES: Array<[RegExp, string]> = [
	[/(quiz)zes$/i, "$1"],
	[/(matr)ices$/i, "$1ix"],
	[/(vert|ind)ices$/i, "$1ex"],
	[/^(ox)en/i, "$1"],
	[/(alias|status)es$/i, "$1"],
	[/(octop|vir)i$/i, "$1us"],
	[/(cris|ax|test)es$/i, "$1is"],
	[/(shoe)s$/i, "$1"],
	[/(o)es$/i, "$1"],
	[/(bus)es$/i, "$1"],
	[/([m|l])ice$/i, "$1ouse"],
	[/(x|ch|ss|sh)es$/i, "$1"],
	[/(m)ovies$/i, "$1ovie"],
	[/(s)eries$/i, "$1eries"],
	[/([^aeiouy]|qu)ies$/i, "$1y"],
	[/([lr])ves$/i, "$1f"],
	[/(tive)s$/i, "$1"],
	[/(hive)s$/i, "$1"],
	[/(li|wi|kni)ves$/i, "$1fe"],
	[/(shea|loa|lea|thie)ves$/i, "$1f"],
	[/(^analy)ses$/i, "$1sis"],
	[/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis"],
	[/([ti])a$/i, "$1um"],
	[/(n)ews$/i, "$1ews"],
	[/s$/i, ""]
];

function lower(s: string): string {
	return s.toLowerCase();
}

function preserveCase(original: string, replacement: string): string {
	if (original === original.toUpperCase()) return replacement.toUpperCase();
	if (original[0] === original[0].toUpperCase()) {
		return replacement[0].toUpperCase() + replacement.slice(1);
	}
	return replacement;
}

export function pluralize(word: string): string {
	if (!word) return word;
	if (UNCOUNTABLE.has(lower(word))) return word;
	for (const [s, p] of IRREGULAR) {
		if (lower(word) === s) return preserveCase(word, p);
	}
	for (const [pattern, replacement] of PLURAL_RULES) {
		if (pattern.test(word)) return word.replace(pattern, replacement);
	}
	return word;
}

export function singularize(word: string): string {
	if (!word) return word;
	if (UNCOUNTABLE.has(lower(word))) return word;
	for (const [s, p] of IRREGULAR) {
		if (lower(word) === p) return preserveCase(word, s);
	}
	for (const [pattern, replacement] of SINGULAR_RULES) {
		if (pattern.test(word)) return word.replace(pattern, replacement);
	}
	return word;
}
