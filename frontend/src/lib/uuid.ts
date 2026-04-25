export function generateUuidV4(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	return formatUuid(bytes);
}

export function generateUuidV7(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	const ts = BigInt(Date.now());
	bytes[0] = Number((ts >> 40n) & 0xffn);
	bytes[1] = Number((ts >> 32n) & 0xffn);
	bytes[2] = Number((ts >> 24n) & 0xffn);
	bytes[3] = Number((ts >> 16n) & 0xffn);
	bytes[4] = Number((ts >> 8n) & 0xffn);
	bytes[5] = Number(ts & 0xffn);
	bytes[6] = (bytes[6] & 0x0f) | 0x70;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	return formatUuid(bytes);
}

export function generateNanoId(size = 21): string {
	const alphabet = "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const bytes = new Uint8Array(size);
	crypto.getRandomValues(bytes);
	let id = "";
	for (let i = 0; i < size; i++) id += alphabet[bytes[i] & 63];
	return id;
}

function formatUuid(bytes: Uint8Array): string {
	const hex: string[] = [];
	for (const b of bytes) hex.push(b.toString(16).padStart(2, "0"));
	return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}
