type TokenType =
	| "num"
	| "ident"
	| "op"
	| "lparen"
	| "rparen"
	| "comma";

interface Token {
	type: TokenType;
	value: string;
	pos: number;
}

const FUNCS: Record<string, (...args: number[]) => number> = {
	abs: Math.abs,
	sqrt: Math.sqrt,
	cbrt: Math.cbrt,
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	asin: Math.asin,
	acos: Math.acos,
	atan: Math.atan,
	atan2: Math.atan2,
	log: Math.log,
	log2: Math.log2,
	log10: Math.log10,
	exp: Math.exp,
	floor: Math.floor,
	ceil: Math.ceil,
	round: Math.round,
	sign: Math.sign,
	min: (...a) => Math.min(...a),
	max: (...a) => Math.max(...a),
	hypot: (...a) => Math.hypot(...a),
	pow: Math.pow,
	mod: (a, b) => a - Math.floor(a / b) * b
};

const CONSTS: Record<string, number> = {
	pi: Math.PI,
	e: Math.E,
	tau: Math.PI * 2,
	inf: Infinity
};

export function evaluate(expr: string): number {
	const tokens = tokenize(expr);
	let pos = 0;

	function peek(): Token | undefined {
		return tokens[pos];
	}
	function consume(): Token {
		return tokens[pos++];
	}

	function parseExpr(): number {
		return parseAddSub();
	}
	function parseAddSub(): number {
		let v = parseMulDiv();
		while (peek()?.type === "op" && (peek()!.value === "+" || peek()!.value === "-")) {
			const op = consume().value;
			const r = parseMulDiv();
			v = op === "+" ? v + r : v - r;
		}
		return v;
	}
	function parseMulDiv(): number {
		let v = parseUnary();
		while (
			peek()?.type === "op" &&
			(peek()!.value === "*" || peek()!.value === "/" || peek()!.value === "%")
		) {
			const op = consume().value;
			const r = parseUnary();
			if (op === "*") v *= r;
			else if (op === "/") v /= r;
			else v -= Math.floor(v / r) * r;
		}
		return v;
	}
	function parseUnary(): number {
		if (peek()?.type === "op" && (peek()!.value === "+" || peek()!.value === "-")) {
			const op = consume().value;
			const v = parseUnary();
			return op === "-" ? -v : v;
		}
		return parsePow();
	}
	function parsePow(): number {
		const base = parsePrimary();
		if (peek()?.type === "op" && peek()!.value === "^") {
			consume();
			const exp = parseUnary();
			return Math.pow(base, exp);
		}
		return base;
	}
	function parsePrimary(): number {
		const tok = peek();
		if (!tok) throw new Error("Unexpected end of expression.");
		if (tok.type === "num") {
			consume();
			return Number(tok.value);
		}
		if (tok.type === "lparen") {
			consume();
			const v = parseExpr();
			expect("rparen", ")");
			return v;
		}
		if (tok.type === "ident") {
			const name = consume().value.toLowerCase();
			if (peek()?.type === "lparen") {
				consume();
				const args: number[] = [];
				if (peek()?.type !== "rparen") {
					args.push(parseExpr());
					while (peek()?.type === "comma") {
						consume();
						args.push(parseExpr());
					}
				}
				expect("rparen", ")");
				const fn = FUNCS[name];
				if (!fn) throw new Error(`Unknown function: ${name}`);
				return fn(...args);
			}
			if (name in CONSTS) return CONSTS[name];
			throw new Error(`Unknown identifier: ${name}`);
		}
		throw new Error(`Unexpected token: ${tok.value} at position ${tok.pos}`);
	}
	function expect(type: TokenType, value: string) {
		const tok = peek();
		if (!tok || tok.type !== type) {
			throw new Error(`Expected ${value} at position ${tok?.pos ?? expr.length}.`);
		}
		consume();
	}

	const result = parseExpr();
	if (pos < tokens.length) {
		throw new Error(`Unexpected token at position ${tokens[pos].pos}.`);
	}
	return result;
}

function tokenize(expr: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	while (i < expr.length) {
		const ch = expr[i];
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		if (/[\d.]/.test(ch)) {
			const start = i;
			const re = /\d+(\.\d*)?([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?/y;
			re.lastIndex = i;
			const match = re.exec(expr);
			if (!match) throw new Error(`Invalid number at position ${i}.`);
			const s = match[0];
			i += s.length;
			const num = Number(s);
			if (!Number.isFinite(num)) throw new Error(`Invalid number "${s}" at position ${start}.`);
			tokens.push({ type: "num", value: s, pos: start });
			continue;
		}
		if (/[a-zA-Z_]/.test(ch)) {
			let s = "";
			while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) s += expr[i++];
			tokens.push({ type: "ident", value: s, pos: i - s.length });
			continue;
		}
		if ("+-*/%^".includes(ch)) {
			tokens.push({ type: "op", value: ch, pos: i });
			i++;
			continue;
		}
		if (ch === "(") {
			tokens.push({ type: "lparen", value: ch, pos: i });
			i++;
			continue;
		}
		if (ch === ")") {
			tokens.push({ type: "rparen", value: ch, pos: i });
			i++;
			continue;
		}
		if (ch === ",") {
			tokens.push({ type: "comma", value: ch, pos: i });
			i++;
			continue;
		}
		throw new Error(`Unexpected character '${ch}' at position ${i}.`);
	}
	return tokens;
}
