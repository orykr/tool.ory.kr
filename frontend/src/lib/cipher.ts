export function caesarShift(text: string, shift: number): string {
	const s = ((shift % 26) + 26) % 26;
	let out = "";
	for (const ch of text) {
		const code = ch.charCodeAt(0);
		if (code >= 65 && code <= 90) {
			out += String.fromCharCode(((code - 65 + s) % 26) + 65);
		} else if (code >= 97 && code <= 122) {
			out += String.fromCharCode(((code - 97 + s) % 26) + 97);
		} else {
			out += ch;
		}
	}
	return out;
}

export function rot13(text: string): string {
	return caesarShift(text, 13);
}

export function atbash(text: string): string {
	let out = "";
	for (const ch of text) {
		const code = ch.charCodeAt(0);
		if (code >= 65 && code <= 90) out += String.fromCharCode(90 - (code - 65));
		else if (code >= 97 && code <= 122) out += String.fromCharCode(122 - (code - 97));
		else out += ch;
	}
	return out;
}

export function vigenere(text: string, key: string, encrypt: boolean): string {
	const cleanKey = key.replace(/[^a-zA-Z]/g, "");
	if (!cleanKey) return text;
	let out = "";
	let ki = 0;
	for (const ch of text) {
		const code = ch.charCodeAt(0);
		const isUpper = code >= 65 && code <= 90;
		const isLower = code >= 97 && code <= 122;
		if (!isUpper && !isLower) {
			out += ch;
			continue;
		}
		const base = isUpper ? 65 : 97;
		const keyChar = cleanKey[ki % cleanKey.length].toUpperCase();
		const shift = keyChar.charCodeAt(0) - 65;
		const sh = encrypt ? shift : 26 - shift;
		out += String.fromCharCode(((code - base + sh) % 26) + base);
		ki++;
	}
	return out;
}
