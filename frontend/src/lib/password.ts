export interface PasswordOptions {
	length: number;
	lowercase: boolean;
	uppercase: boolean;
	numbers: boolean;
	symbols: boolean;
	avoidAmbiguous: boolean;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";
const AMBIGUOUS = /[lI1O0o]/g;

export function generatePassword(opts: PasswordOptions): string {
	let alphabet = "";
	const required: string[] = [];

	if (opts.lowercase) {
		const set = opts.avoidAmbiguous ? LOWER.replace(AMBIGUOUS, "") : LOWER;
		alphabet += set;
		required.push(set);
	}
	if (opts.uppercase) {
		const set = opts.avoidAmbiguous ? UPPER.replace(AMBIGUOUS, "") : UPPER;
		alphabet += set;
		required.push(set);
	}
	if (opts.numbers) {
		const set = opts.avoidAmbiguous ? NUMS.replace(AMBIGUOUS, "") : NUMS;
		alphabet += set;
		required.push(set);
	}
	if (opts.symbols) {
		alphabet += SYMBOLS;
		required.push(SYMBOLS);
	}
	if (!alphabet) throw new Error("Select at least one character set.");

	const length = Math.max(required.length, Math.floor(opts.length));
	const chars = new Array<string>(length);

	for (let i = 0; i < required.length; i++) {
		chars[i] = randomChoice(required[i]);
	}
	for (let i = required.length; i < length; i++) {
		chars[i] = randomChoice(alphabet);
	}
	shuffle(chars);
	return chars.join("");
}

export interface PasswordStrength {
	score: 0 | 1 | 2 | 3 | 4;
	label: string;
	entropy: number;
}

export function passwordStrength(password: string, alphabetSize: number): PasswordStrength {
	if (!password) return { score: 0, label: "—", entropy: 0 };
	const entropy = password.length * Math.log2(Math.max(2, alphabetSize));
	let score: 0 | 1 | 2 | 3 | 4 = 0;
	if (entropy >= 28) score = 1;
	if (entropy >= 60) score = 2;
	if (entropy >= 80) score = 3;
	if (entropy >= 100) score = 4;
	const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;
	return { score, label: labels[score], entropy };
}

export function alphabetSizeFor(opts: PasswordOptions): number {
	let n = 0;
	if (opts.lowercase) n += opts.avoidAmbiguous ? LOWER.replace(AMBIGUOUS, "").length : LOWER.length;
	if (opts.uppercase) n += opts.avoidAmbiguous ? UPPER.replace(AMBIGUOUS, "").length : UPPER.length;
	if (opts.numbers) n += opts.avoidAmbiguous ? NUMS.replace(AMBIGUOUS, "").length : NUMS.length;
	if (opts.symbols) n += SYMBOLS.length;
	return n;
}

function randomChoice(set: string): string {
	const idx = randomInt(set.length);
	return set[idx];
}

function randomInt(max: number): number {
	const buf = new Uint32Array(1);
	const limit = Math.floor(0xffffffff / max) * max;
	let value: number;
	do {
		crypto.getRandomValues(buf);
		value = buf[0];
	} while (value >= limit);
	return value % max;
}

function shuffle<T>(arr: T[]) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = randomInt(i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
