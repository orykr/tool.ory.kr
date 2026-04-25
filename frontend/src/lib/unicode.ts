export interface CharInfo {
	char: string;
	codePoint: number;
	hex: string;
	utf8Bytes: number[];
	utf16Units: number[];
	htmlEntity: string;
	cssEscape: string;
	jsEscape: string;
	urlEncoded: string;
	block: string;
	category: string;
}

const BLOCKS: Array<[number, number, string]> = [
	[0x0000, 0x007f, "Basic Latin"],
	[0x0080, 0x00ff, "Latin-1 Supplement"],
	[0x0100, 0x017f, "Latin Extended-A"],
	[0x0180, 0x024f, "Latin Extended-B"],
	[0x0250, 0x02af, "IPA Extensions"],
	[0x0300, 0x036f, "Combining Diacritical Marks"],
	[0x0370, 0x03ff, "Greek and Coptic"],
	[0x0400, 0x04ff, "Cyrillic"],
	[0x0590, 0x05ff, "Hebrew"],
	[0x0600, 0x06ff, "Arabic"],
	[0x0900, 0x097f, "Devanagari"],
	[0x0e00, 0x0e7f, "Thai"],
	[0x1100, 0x11ff, "Hangul Jamo"],
	[0x2000, 0x206f, "General Punctuation"],
	[0x2070, 0x209f, "Superscripts and Subscripts"],
	[0x20a0, 0x20cf, "Currency Symbols"],
	[0x2100, 0x214f, "Letterlike Symbols"],
	[0x2150, 0x218f, "Number Forms"],
	[0x2190, 0x21ff, "Arrows"],
	[0x2200, 0x22ff, "Mathematical Operators"],
	[0x2300, 0x23ff, "Miscellaneous Technical"],
	[0x2500, 0x257f, "Box Drawing"],
	[0x2580, 0x259f, "Block Elements"],
	[0x25a0, 0x25ff, "Geometric Shapes"],
	[0x2600, 0x26ff, "Miscellaneous Symbols"],
	[0x2700, 0x27bf, "Dingbats"],
	[0x3000, 0x303f, "CJK Symbols and Punctuation"],
	[0x3040, 0x309f, "Hiragana"],
	[0x30a0, 0x30ff, "Katakana"],
	[0x3130, 0x318f, "Hangul Compatibility Jamo"],
	[0x3400, 0x4dbf, "CJK Unified Ideographs Extension A"],
	[0x4e00, 0x9fff, "CJK Unified Ideographs"],
	[0xac00, 0xd7af, "Hangul Syllables"],
	[0xe000, 0xf8ff, "Private Use Area"],
	[0xfb00, 0xfb4f, "Alphabetic Presentation Forms"],
	[0xfe70, 0xfeff, "Arabic Presentation Forms-B"],
	[0xff00, 0xffef, "Halfwidth and Fullwidth Forms"],
	[0x1d400, 0x1d7ff, "Mathematical Alphanumeric Symbols"],
	[0x1f300, 0x1f5ff, "Miscellaneous Symbols and Pictographs"],
	[0x1f600, 0x1f64f, "Emoticons"],
	[0x1f680, 0x1f6ff, "Transport and Map Symbols"],
	[0x1f900, 0x1f9ff, "Supplemental Symbols and Pictographs"],
	[0x20000, 0x2a6df, "CJK Unified Ideographs Extension B"]
];

export function blockOf(codePoint: number): string {
	for (const [from, to, name] of BLOCKS) {
		if (codePoint >= from && codePoint <= to) return name;
	}
	return "Unknown";
}

export function categoryOf(char: string): string {
	const cp = char.codePointAt(0) ?? 0;
	if (cp <= 0x1f || cp === 0x7f) return "Control";
	if (/\s/.test(char)) return "Whitespace";
	if (/\d/.test(char)) return "Digit";
	if (/[a-zA-Z]/.test(char)) return "Letter (ASCII)";
	if (/\p{L}/u.test(char)) return "Letter";
	if (/\p{N}/u.test(char)) return "Number";
	if (/\p{P}/u.test(char)) return "Punctuation";
	if (/\p{S}/u.test(char)) return "Symbol";
	if (/\p{Mark}/u.test(char)) return "Mark";
	return "Other";
}

export function inspectChar(char: string): CharInfo {
	const cp = char.codePointAt(0)!;
	const utf8 = new TextEncoder().encode(char);
	const utf16: number[] = [];
	for (let i = 0; i < char.length; i++) utf16.push(char.charCodeAt(i));
	return {
		char,
		codePoint: cp,
		hex: cp.toString(16).toUpperCase().padStart(4, "0"),
		utf8Bytes: Array.from(utf8),
		utf16Units: utf16,
		htmlEntity: `&#${cp};`,
		cssEscape: "\\" + cp.toString(16),
		jsEscape: cp <= 0xffff ? `\\u${cp.toString(16).padStart(4, "0")}` : `\\u{${cp.toString(16)}}`,
		urlEncoded: encodeURIComponent(char),
		block: blockOf(cp),
		category: categoryOf(char)
	};
}

export function splitChars(input: string): string[] {
	return Array.from(input);
}

export function fromCodePoint(input: string): string | null {
	const trimmed = input.trim().replace(/^(U\+|0x|\\u\{?|\\u)/i, "").replace(/[}\s]/g, "");
	if (!/^[0-9a-fA-F]+$/.test(trimmed)) return null;
	const cp = parseInt(trimmed, 16);
	if (cp < 0 || cp > 0x10ffff) return null;
	try {
		return String.fromCodePoint(cp);
	} catch {
		return null;
	}
}
