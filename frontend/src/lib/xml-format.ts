export type XmlFormatResult =
	| { ok: true; output: string }
	| { ok: false; error: string };

export function formatXml(input: string, indent: string): XmlFormatResult {
	const trimmed = input.trim();
	if (!trimmed) return { ok: true, output: "" };

	if (typeof DOMParser !== "undefined") {
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(trimmed, "application/xml");
			const errEl = doc.querySelector("parsererror");
			if (errEl) {
				return { ok: false, error: errEl.textContent?.trim() || "Invalid XML." };
			}
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	}

	try {
		const tokens = tokenize(trimmed);
		const out: string[] = [];
		let depth = 0;
		let prevType: TokenType | null = null;

		for (const tok of tokens) {
			if (tok.type === "close") depth = Math.max(0, depth - 1);
			const needNewline = out.length > 0 && tok.type !== "text" && prevType !== "text";
			if (needNewline) out.push("\n" + indent.repeat(depth));
			else if (out.length === 0 && tok.type !== "text") {
				// no leading newline
			}
			out.push(tok.value);
			if (tok.type === "open") depth++;
			prevType = tok.type;
		}
		return { ok: true, output: out.join("").trim() };
	} catch (e) {
		return { ok: false, error: (e as Error).message };
	}
}

export function minifyXml(input: string): string {
	return input.replace(/>\s+</g, "><").trim();
}

type TokenType = "open" | "close" | "self" | "comment" | "decl" | "text" | "cdata";

function tokenize(input: string): Array<{ type: TokenType; value: string }> {
	const tokens: Array<{ type: TokenType; value: string }> = [];
	let i = 0;
	const len = input.length;

	while (i < len) {
		if (input[i] === "<") {
			if (input.startsWith("<!--", i)) {
				const end = input.indexOf("-->", i + 4);
				if (end < 0) throw new Error("Unterminated comment.");
				tokens.push({ type: "comment", value: input.slice(i, end + 3) });
				i = end + 3;
				continue;
			}
			if (input.startsWith("<![CDATA[", i)) {
				const end = input.indexOf("]]>", i + 9);
				if (end < 0) throw new Error("Unterminated CDATA.");
				tokens.push({ type: "cdata", value: input.slice(i, end + 3) });
				i = end + 3;
				continue;
			}
			let end = i;
			let inQuote: '"' | "'" | null = null;
			while (end < len) {
				const c = input[end];
				if (inQuote) {
					if (c === inQuote) inQuote = null;
				} else if (c === '"' || c === "'") {
					inQuote = c;
				} else if (c === ">") {
					break;
				}
				end++;
			}
			if (end >= len) throw new Error("Unterminated tag.");
			const value = input.slice(i, end + 1);
			let type: TokenType = "open";
			if (value.startsWith("</")) type = "close";
			else if (value.endsWith("/>")) type = "self";
			else if (value.startsWith("<?") || value.startsWith("<!")) type = "decl";
			tokens.push({ type, value });
			i = end + 1;
		} else {
			let end = input.indexOf("<", i);
			if (end < 0) end = len;
			const text = input.slice(i, end);
			if (text.trim()) tokens.push({ type: "text", value: text.trim() });
			i = end;
		}
	}
	return tokens;
}
