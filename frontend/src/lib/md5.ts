// Simple MD5 implementation (RFC 1321). For non-cryptographic use only.

const S: number[] = [
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
	5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
	4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
	6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];

const K: number[] = (function () {
	const arr: number[] = [];
	for (let i = 0; i < 64; i++) {
		arr.push(Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) | 0);
	}
	return arr;
})();

function rotateLeft(x: number, n: number): number {
	return ((x << n) | (x >>> (32 - n))) | 0;
}

function add32(a: number, b: number): number {
	return (a + b) | 0;
}

export function md5(bytes: Uint8Array): string {
	const length = bytes.length;
	const bitLength = BigInt(length) * 8n;

	// Padding: append 0x80, then zeros until length ≡ 56 mod 64, then 8-byte length
	const paddedLen = length + 1 + ((56 - ((length + 1) % 64) + 64) % 64) + 8;
	const padded = new Uint8Array(paddedLen);
	padded.set(bytes);
	padded[length] = 0x80;
	const view = new DataView(padded.buffer);
	view.setBigUint64(paddedLen - 8, bitLength, true);

	let a0 = 0x67452301 | 0;
	let b0 = 0xefcdab89 | 0;
	let c0 = 0x98badcfe | 0;
	let d0 = 0x10325476 | 0;

	for (let chunk = 0; chunk < paddedLen; chunk += 64) {
		const M: number[] = [];
		for (let j = 0; j < 16; j++) {
			M.push(view.getInt32(chunk + j * 4, true));
		}
		let A = a0;
		let B = b0;
		let C = c0;
		let D = d0;

		for (let i = 0; i < 64; i++) {
			let F: number;
			let g: number;
			if (i < 16) {
				F = (B & C) | (~B & D);
				g = i;
			} else if (i < 32) {
				F = (D & B) | (~D & C);
				g = (5 * i + 1) % 16;
			} else if (i < 48) {
				F = B ^ C ^ D;
				g = (3 * i + 5) % 16;
			} else {
				F = C ^ (B | ~D);
				g = (7 * i) % 16;
			}
			F = add32(F, add32(A, add32(K[i], M[g])));
			A = D;
			D = C;
			C = B;
			B = add32(B, rotateLeft(F, S[i]));
		}

		a0 = add32(a0, A);
		b0 = add32(b0, B);
		c0 = add32(c0, C);
		d0 = add32(d0, D);
	}

	function toHex(n: number): string {
		let hex = "";
		for (let i = 0; i < 4; i++) {
			const byte = (n >>> (i * 8)) & 0xff;
			hex += byte.toString(16).padStart(2, "0");
		}
		return hex;
	}

	return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

export function md5Text(text: string): string {
	return md5(new TextEncoder().encode(text));
}
