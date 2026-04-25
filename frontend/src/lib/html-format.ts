const VOID_TAGS = new Set([
	"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
	"param", "source", "track", "wbr"
]);

const INLINE_TAGS = new Set([
	"a", "abbr", "b", "bdo", "br", "cite", "code", "dfn", "em", "i", "img",
	"input", "kbd", "label", "mark", "q", "s", "samp", "small", "span", "strong",
	"sub", "sup", "time", "u", "var", "wbr"
]);

const PRESERVE_TAGS = new Set(["pre", "textarea", "script", "style"]);

type Token =
	| { kind: "open"; tag: string; attrs: string; selfClosing: boolean; raw: string }
	| { kind: "close"; tag: string; raw: string }
	| { kind: "text"; raw: string }
	| { kind: "comment"; raw: string }
	| { kind: "doctype"; raw: string }
	| { kind: "cdata"; raw: string };

function tokenize(input: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	while (i < input.length) {
		if (input.startsWith("<!--", i)) {
			const end = input.indexOf("-->", i + 4);
			if (end < 0) throw new Error("Unterminated comment.");
			tokens.push({ kind: "comment", raw: input.slice(i, end + 3) });
			i = end + 3;
			continue;
		}
		if (input.startsWith("<![CDATA[", i)) {
			const end = input.indexOf("]]>", i + 9);
			if (end < 0) throw new Error("Unterminated CDATA.");
			tokens.push({ kind: "cdata", raw: input.slice(i, end + 3) });
			i = end + 3;
			continue;
		}
		if (input.startsWith("<!", i) || input.startsWith("<?", i)) {
			const end = input.indexOf(">", i);
			if (end < 0) throw new Error("Unterminated declaration.");
			tokens.push({ kind: "doctype", raw: input.slice(i, end + 1) });
			i = end + 1;
			continue;
		}
		if (input[i] === "<" && /[a-zA-Z\/]/.test(input[i + 1] ?? "")) {
			let end = i + 1;
			let inQuote: '"' | "'" | null = null;
			while (end < input.length) {
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
			if (end >= input.length) throw new Error("Unterminated tag.");
			const raw = input.slice(i, end + 1);
			i = end + 1;

			if (raw.startsWith("</")) {
				const tag = raw.slice(2, -1).trim().toLowerCase();
				tokens.push({ kind: "close", tag, raw });
			} else {
				let inside = raw.slice(1, -1).trim();
				let selfClosing = false;
				if (inside.endsWith("/")) {
					selfClosing = true;
					inside = inside.slice(0, -1).trim();
				}
				const m = inside.match(/^([a-zA-Z][\w:-]*)(.*)$/s);
				if (!m) throw new Error(`Invalid tag: ${raw}`);
				const tag = m[1].toLowerCase();
				const attrs = m[2].trim();
				tokens.push({ kind: "open", tag, attrs, selfClosing, raw });
			}
			continue;
		}
		// Text
		const next = input.indexOf("<", i);
		const end = next < 0 ? input.length : next;
		tokens.push({ kind: "text", raw: input.slice(i, end) });
		i = end;
	}
	return tokens;
}

export function formatHtml(input: string, indentStr = "  "): string {
	if (!input.trim()) return "";
	const tokens = tokenize(input);
	const out: string[] = [];
	let depth = 0;
	const stack: string[] = [];
	let preserve = 0;

	function indent(): string {
		return indentStr.repeat(depth);
	}

	for (const tok of tokens) {
		if (preserve > 0) {
			if (tok.kind === "close" && tok.tag === stack[stack.length - 1]) {
				stack.pop();
				out.push(tok.raw);
				preserve--;
				if (preserve === 0) out.push("\n");
			} else {
				out.push(tok.raw);
			}
			continue;
		}

		if (tok.kind === "doctype" || tok.kind === "comment") {
			out.push(indent() + tok.raw + "\n");
			continue;
		}
		if (tok.kind === "cdata") {
			out.push(indent() + tok.raw + "\n");
			continue;
		}
		if (tok.kind === "text") {
			const trimmed = tok.raw.trim();
			if (trimmed) {
				out.push(indent() + trimmed + "\n");
			}
			continue;
		}
		if (tok.kind === "close") {
			depth = Math.max(0, depth - 1);
			stack.pop();
			out.push(indent() + tok.raw + "\n");
			continue;
		}
		if (tok.kind === "open") {
			const isVoid = VOID_TAGS.has(tok.tag) || tok.selfClosing;
			out.push(indent() + tok.raw + "\n");
			if (!isVoid) {
				depth++;
				stack.push(tok.tag);
				if (PRESERVE_TAGS.has(tok.tag)) preserve = 1;
			}
		}
	}

	return out.join("").trim() + "\n";
}

export function minifyHtml(input: string): string {
	const tokens = tokenize(input);
	let out = "";
	let preserve = false;
	const preserveStack: string[] = [];

	for (const tok of tokens) {
		if (preserve) {
			out += tok.raw;
			if (tok.kind === "close" && tok.tag === preserveStack[preserveStack.length - 1]) {
				preserveStack.pop();
				if (preserveStack.length === 0) preserve = false;
			}
			continue;
		}
		if (tok.kind === "comment") continue;
		if (tok.kind === "text") {
			const collapsed = tok.raw.replace(/\s+/g, " ");
			if (collapsed.trim()) out += collapsed;
			continue;
		}
		if (tok.kind === "open" && PRESERVE_TAGS.has(tok.tag)) {
			preserve = true;
			preserveStack.push(tok.tag);
		}
		out += tok.raw;
	}
	return out;
}
