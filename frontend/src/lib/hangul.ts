// Revised Romanization of Korean (RR), simplified.

const INITIALS = [
	"g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s",
	"ss", "", "j", "jj", "ch", "k", "t", "p", "h"
];
const MEDIALS = [
	"a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa",
	"wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"
];
const FINALS = [
	"", "g", "kk", "gs", "n", "nj", "nh", "d", "l", "lg",
	"lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs", "s",
	"ss", "ng", "j", "ch", "k", "t", "p", "h"
];

const INITIAL_NAMES = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const MEDIAL_NAMES = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const FINAL_NAMES = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const SYLLABLE_BASE = 0xac00;
const SYLLABLE_END = 0xd7a3;

export interface Decomposed {
	initial: string;
	medial: string;
	final: string;
	initialJamo: string;
	medialJamo: string;
	finalJamo: string;
}

export function decompose(syllable: string): Decomposed | null {
	const cp = syllable.codePointAt(0);
	if (cp === undefined || cp < SYLLABLE_BASE || cp > SYLLABLE_END) return null;
	const offset = cp - SYLLABLE_BASE;
	const finalIdx = offset % 28;
	const medialIdx = Math.floor(offset / 28) % 21;
	const initialIdx = Math.floor(offset / (28 * 21));
	return {
		initial: INITIALS[initialIdx],
		medial: MEDIALS[medialIdx],
		final: FINALS[finalIdx],
		initialJamo: INITIAL_NAMES[initialIdx],
		medialJamo: MEDIAL_NAMES[medialIdx],
		finalJamo: FINAL_NAMES[finalIdx]
	};
}

export function romanize(text: string): string {
	let out = "";
	for (const ch of text) {
		const d = decompose(ch);
		if (d) {
			out += d.initial + d.medial + d.final;
		} else {
			out += ch;
		}
	}
	return out;
}

export function splitJamo(text: string): Array<{ char: string; parts: string[] }> {
	const result: Array<{ char: string; parts: string[] }> = [];
	for (const ch of text) {
		const d = decompose(ch);
		if (d) {
			const parts = [d.initialJamo, d.medialJamo];
			if (d.finalJamo) parts.push(d.finalJamo);
			result.push({ char: ch, parts });
		} else {
			result.push({ char: ch, parts: [ch] });
		}
	}
	return result;
}

const SINO_DIGITS = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SINO_PLACES = ["", "십", "백", "천"];
const SINO_BIG = ["", "만", "억", "조", "경"];

export function numberToHangulSino(n: number): string {
	if (!Number.isInteger(n) || n < 0) return "";
	if (n === 0) return SINO_DIGITS[0];
	const groups: string[] = [];
	let i = 0;
	while (n > 0 && i < SINO_BIG.length) {
		const chunk = n % 10000;
		if (chunk > 0) {
			let str = "";
			let c = chunk;
			let p = 0;
			while (c > 0) {
				const d = c % 10;
				if (d > 0) {
					if ((d === 1 && p > 0) || d === 0) {
						str = SINO_PLACES[p] + str;
					} else {
						str = SINO_DIGITS[d] + SINO_PLACES[p] + str;
					}
				}
				c = Math.floor(c / 10);
				p++;
			}
			groups.unshift(str + SINO_BIG[i]);
		}
		n = Math.floor(n / 10000);
		i++;
	}
	return groups.join("");
}
