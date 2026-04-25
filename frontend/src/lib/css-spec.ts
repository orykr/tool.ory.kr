export interface Specificity {
	a: number;
	b: number;
	c: number;
	total: string;
}

export function calculateSpecificity(selector: string): Specificity {
	let s = selector.trim();
	let a = 0;
	let b = 0;
	let c = 0;

	// Strip strings inside attribute selectors but keep the attribute counted
	s = s.replace(/\[[^\]]*\]/g, () => {
		b++;
		return "";
	});

	// IDs
	s = s.replace(/#[A-Za-z_-][\w-]*/g, () => {
		a++;
		return "";
	});

	// Pseudo-classes (excluding pseudo-elements which use ::)
	s = s.replace(/:not\(([^)]+)\)/g, (_, inner: string) => {
		const sub = calculateSpecificity(inner);
		a += sub.a;
		b += sub.b;
		c += sub.c;
		return "";
	});
	s = s.replace(/:is\(([^)]+)\)/g, (_, inner: string) => {
		const variants = inner.split(",").map((v) => calculateSpecificity(v.trim()));
		const max = variants.reduce(
			(acc, v) => (compareSpec(v, acc) > 0 ? v : acc),
			{ a: 0, b: 0, c: 0, total: "0,0,0" }
		);
		a += max.a;
		b += max.b;
		c += max.c;
		return "";
	});
	s = s.replace(/:where\([^)]+\)/g, () => "");

	// Pseudo-elements (::before, ::after etc.) — count as type selector
	s = s.replace(/::[A-Za-z_-][\w-]*/g, () => {
		c++;
		return "";
	});

	// Remaining single-colon pseudo-classes
	s = s.replace(/:[A-Za-z_-][\w-]*(\([^)]*\))?/g, () => {
		b++;
		return "";
	});

	// Classes
	s = s.replace(/\.[A-Za-z_-][\w-]*/g, () => {
		b++;
		return "";
	});

	// Type selectors / element names
	s = s.replace(/(?:^|\s|[+>~])([a-zA-Z][\w-]*)/g, (_, name: string) => {
		if (name === "html" || /^[a-zA-Z]/.test(name)) c++;
		return " ";
	});

	return { a, b, c, total: `${a},${b},${c}` };
}

function compareSpec(x: { a: number; b: number; c: number }, y: { a: number; b: number; c: number }): number {
	if (x.a !== y.a) return x.a - y.a;
	if (x.b !== y.b) return x.b - y.b;
	return x.c - y.c;
}
