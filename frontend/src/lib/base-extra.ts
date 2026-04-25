const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base32Encode(bytes: Uint8Array): string {
	if (bytes.length === 0) return "";
	let bits = 0;
	let value = 0;
	let out = "";
	for (const b of bytes) {
		value = (value << 8) | b;
		bits += 8;
		while (bits >= 5) {
			out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
			bits -= 5;
		}
	}
	if (bits > 0) {
		out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
	}
	while (out.length % 8 !== 0) out += "=";
	return out;
}

export function base32Decode(input: string): Uint8Array {
	const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
	for (const ch of cleaned) {
		if (BASE32_ALPHABET.indexOf(ch) === -1) throw new Error(`Invalid base32 character: ${ch}`);
	}
	const bytes: number[] = [];
	let bits = 0;
	let value = 0;
	for (const ch of cleaned) {
		value = (value << 5) | BASE32_ALPHABET.indexOf(ch);
		bits += 5;
		if (bits >= 8) {
			bytes.push((value >>> (bits - 8)) & 0xff);
			bits -= 8;
		}
	}
	return new Uint8Array(bytes);
}

export function base58Encode(bytes: Uint8Array): string {
	if (bytes.length === 0) return "";
	let zeros = 0;
	while (zeros < bytes.length && bytes[zeros] === 0) zeros++;

	let value = 0n;
	for (const b of bytes) value = (value << 8n) | BigInt(b);

	let out = "";
	while (value > 0n) {
		const rem = Number(value % 58n);
		out = BASE58_ALPHABET[rem] + out;
		value /= 58n;
	}
	return "1".repeat(zeros) + out;
}

export function base58Decode(input: string): Uint8Array {
	if (!input) return new Uint8Array();
	let zeros = 0;
	while (zeros < input.length && input[zeros] === "1") zeros++;

	let value = 0n;
	for (const ch of input) {
		const idx = BASE58_ALPHABET.indexOf(ch);
		if (idx === -1) throw new Error(`Invalid base58 character: ${ch}`);
		value = value * 58n + BigInt(idx);
	}

	const bytes: number[] = [];
	while (value > 0n) {
		bytes.unshift(Number(value & 0xffn));
		value >>= 8n;
	}
	const result = new Uint8Array(zeros + bytes.length);
	for (let i = 0; i < bytes.length; i++) result[zeros + i] = bytes[i];
	return result;
}

export function bytesToString(bytes: Uint8Array): string {
	return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function stringToBytes(s: string): Uint8Array {
	return new TextEncoder().encode(s);
}
