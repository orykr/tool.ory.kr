export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const HASH_ALGORITHMS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
	const data = new TextEncoder().encode(text);
	return hashBytes(data, algorithm);
}

export async function hashBytes(data: ArrayBufferView | ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
	const buffer = await crypto.subtle.digest(algorithm, data);
	return bufferToHex(buffer);
}

export function bufferToHex(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let hex = "";
	for (const b of bytes) hex += b.toString(16).padStart(2, "0");
	return hex;
}
