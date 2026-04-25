import { bufferToHex } from "$lib/hash";

export type HmacAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const HMAC_ALGORITHMS: HmacAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export type OutputFormat = "hex" | "base64";

export async function hmac(
	key: string,
	message: string,
	algorithm: HmacAlgorithm,
	output: OutputFormat
): Promise<string> {
	const enc = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		enc.encode(key),
		{ name: "HMAC", hash: algorithm },
		false,
		["sign"]
	);
	const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
	if (output === "hex") return bufferToHex(sig);
	return bufferToBase64(sig);
}

function bufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
}
