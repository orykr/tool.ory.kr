const CRC32_TABLE: Uint32Array = (function () {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[i] = c >>> 0;
	}
	return table;
})();

export function crc32(bytes: Uint8Array): number {
	let crc = 0xffffffff;
	for (const b of bytes) {
		crc = (CRC32_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;
	}
	return (crc ^ 0xffffffff) >>> 0;
}

export function adler32(bytes: Uint8Array): number {
	const MOD = 65521;
	let a = 1;
	let b = 0;
	for (const byte of bytes) {
		a = (a + byte) % MOD;
		b = (b + a) % MOD;
	}
	return ((b << 16) | a) >>> 0;
}

export function fnv1a32(bytes: Uint8Array): number {
	let h = 0x811c9dc5;
	for (const b of bytes) {
		h ^= b;
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h >>> 0;
}

export function djb2(bytes: Uint8Array): number {
	let h = 5381;
	for (const b of bytes) {
		h = ((h << 5) + h + b) >>> 0;
	}
	return h >>> 0;
}

export function toHex(n: number, width = 8): string {
	return n.toString(16).padStart(width, "0");
}
