// Adobe-flavored Ascii85: <~ ... ~> wrappers, "z" for all-zero groups.

export function ascii85Encode(bytes: Uint8Array, wrap = false): string {
	let out = "";
	let i = 0;
	while (i < bytes.length) {
		const remaining = Math.min(4, bytes.length - i);
		let n = 0;
		for (let j = 0; j < remaining; j++) {
			n = n * 256 + bytes[i + j];
		}
		// Pad
		for (let j = remaining; j < 4; j++) n = n * 256;
		if (n === 0 && remaining === 4) {
			out += "z";
		} else {
			const chars = new Array(5).fill(0);
			for (let j = 4; j >= 0; j--) {
				chars[j] = (n % 85) + 33;
				n = Math.floor(n / 85);
			}
			const groupStr = chars.map((c) => String.fromCharCode(c)).join("");
			out += remaining < 4 ? groupStr.slice(0, remaining + 1) : groupStr;
		}
		i += 4;
	}
	return wrap ? `<~${out}~>` : out;
}

export function ascii85Decode(input: string): Uint8Array {
	let s = input.trim();
	if (s.startsWith("<~")) s = s.slice(2);
	if (s.endsWith("~>")) s = s.slice(0, -2);
	s = s.replace(/\s+/g, "");

	const out: number[] = [];
	let i = 0;
	while (i < s.length) {
		if (s[i] === "z") {
			out.push(0, 0, 0, 0);
			i++;
			continue;
		}
		const groupLen = Math.min(5, s.length - i);
		let group = s.slice(i, i + groupLen);
		const padded = groupLen < 5;
		while (group.length < 5) group += "u";
		let n = 0;
		for (const ch of group) {
			const v = ch.charCodeAt(0) - 33;
			if (v < 0 || v > 84) throw new Error(`Invalid Ascii85 character: ${ch}`);
			n = n * 85 + v;
		}
		const bytes = [
			(n >>> 24) & 0xff,
			(n >>> 16) & 0xff,
			(n >>> 8) & 0xff,
			n & 0xff
		];
		const take = padded ? groupLen - 1 : 4;
		for (let j = 0; j < take; j++) out.push(bytes[j]);
		i += groupLen;
	}
	return new Uint8Array(out);
}

export function bytesToText(bytes: Uint8Array): string {
	return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function textToBytes(s: string): Uint8Array {
	return new TextEncoder().encode(s);
}
