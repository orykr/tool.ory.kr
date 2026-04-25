import { base32Decode } from "$lib/base-extra";

export type Algorithm = "SHA-1" | "SHA-256" | "SHA-512";

export async function generateTotp(
	secret: string,
	timestamp: number,
	period = 30,
	digits = 6,
	algorithm: Algorithm = "SHA-1"
): Promise<string> {
	const counter = Math.floor(timestamp / 1000 / period);
	return generateHotp(secret, counter, digits, algorithm);
}

export async function generateHotp(
	secret: string,
	counter: number,
	digits = 6,
	algorithm: Algorithm = "SHA-1"
): Promise<string> {
	const keyBytes = base32Decode(secret);
	const counterBuf = new ArrayBuffer(8);
	const view = new DataView(counterBuf);
	view.setUint32(0, Math.floor(counter / 0x100000000));
	view.setUint32(4, counter >>> 0);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
		{ name: "HMAC", hash: algorithm },
		false,
		["sign"]
	);
	const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, counterBuf));
	const offset = sig[sig.length - 1] & 0x0f;
	const code =
		((sig[offset] & 0x7f) << 24) |
		((sig[offset + 1] & 0xff) << 16) |
		((sig[offset + 2] & 0xff) << 8) |
		(sig[offset + 3] & 0xff);
	const mod = 10 ** digits;
	return String(code % mod).padStart(digits, "0");
}

export function buildOtpauthUri(opts: {
	type: "totp" | "hotp";
	label: string;
	issuer?: string;
	secret: string;
	algorithm?: Algorithm;
	digits?: number;
	period?: number;
	counter?: number;
}): string {
	const params = new URLSearchParams();
	params.set("secret", opts.secret.replace(/=+$/, ""));
	if (opts.issuer) params.set("issuer", opts.issuer);
	if (opts.algorithm) params.set("algorithm", opts.algorithm.replace("-", ""));
	if (opts.digits) params.set("digits", String(opts.digits));
	if (opts.type === "totp" && opts.period) params.set("period", String(opts.period));
	if (opts.type === "hotp" && opts.counter !== undefined) params.set("counter", String(opts.counter));
	const label = opts.issuer ? `${opts.issuer}:${opts.label}` : opts.label;
	return `otpauth://${opts.type}/${encodeURIComponent(label)}?${params.toString()}`;
}

export function generateRandomSecret(bytes = 20): string {
	const buf = new Uint8Array(bytes);
	crypto.getRandomValues(buf);
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	let bits = 0;
	let value = 0;
	let out = "";
	for (const b of buf) {
		value = (value << 8) | b;
		bits += 8;
		while (bits >= 5) {
			out += alphabet[(value >>> (bits - 5)) & 0x1f];
			bits -= 5;
		}
	}
	if (bits > 0) out += alphabet[(value << (5 - bits)) & 0x1f];
	return out;
}
