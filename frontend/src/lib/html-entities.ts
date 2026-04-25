const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	copy: "©",
	reg: "®",
	trade: "™",
	hellip: "…",
	mdash: "—",
	ndash: "–",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”"
};

const REVERSE_NAMED: Record<string, string> = Object.fromEntries(
	Object.entries(NAMED_ENTITIES).map(([k, v]) => [v, `&${k};`])
);

export function encodeEntities(input: string, mode: "named" | "numeric" | "minimal"): string {
	if (mode === "minimal") return input.replace(/[&<>"']/g, (c) => REVERSE_NAMED[c] ?? c);
	const out: string[] = [];
	for (const ch of input) {
		const code = ch.codePointAt(0)!;
		if (mode === "named" && REVERSE_NAMED[ch]) {
			out.push(REVERSE_NAMED[ch]);
			continue;
		}
		if (code < 0x20 || code > 0x7e) {
			out.push(`&#${code};`);
		} else if (mode === "named" && /[&<>"']/.test(ch)) {
			out.push(REVERSE_NAMED[ch] ?? ch);
		} else {
			out.push(ch);
		}
	}
	return out.join("");
}

export function decodeEntities(input: string): string {
	return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, body: string) => {
		if (body[0] === "#") {
			const isHex = body[1] === "x" || body[1] === "X";
			const num = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
			if (Number.isFinite(num) && num > 0 && num <= 0x10ffff) {
				try {
					return String.fromCodePoint(num);
				} catch {
					return full;
				}
			}
			return full;
		}
		return NAMED_ENTITIES[body] ?? full;
	});
}
