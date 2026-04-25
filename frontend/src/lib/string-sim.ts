export function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	const aArr = Array.from(a);
	const bArr = Array.from(b);
	if (aArr.length === 0) return bArr.length;
	if (bArr.length === 0) return aArr.length;
	let prev = Array.from({ length: bArr.length + 1 }, (_, i) => i);
	let curr = new Array(bArr.length + 1).fill(0);
	for (let i = 1; i <= aArr.length; i++) {
		curr[0] = i;
		for (let j = 1; j <= bArr.length; j++) {
			const cost = aArr[i - 1] === bArr[j - 1] ? 0 : 1;
			curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
		}
		[prev, curr] = [curr, prev];
	}
	return prev[bArr.length];
}

export function jaro(a: string, b: string): number {
	if (a === b) return 1;
	const aArr = Array.from(a);
	const bArr = Array.from(b);
	if (aArr.length === 0 || bArr.length === 0) return 0;
	const matchDistance = Math.max(0, Math.floor(Math.max(aArr.length, bArr.length) / 2) - 1);
	const aMatches = new Array(aArr.length).fill(false);
	const bMatches = new Array(bArr.length).fill(false);
	let matches = 0;
	for (let i = 0; i < aArr.length; i++) {
		const start = Math.max(0, i - matchDistance);
		const end = Math.min(i + matchDistance + 1, bArr.length);
		for (let j = start; j < end; j++) {
			if (bMatches[j]) continue;
			if (aArr[i] !== bArr[j]) continue;
			aMatches[i] = true;
			bMatches[j] = true;
			matches++;
			break;
		}
	}
	if (matches === 0) return 0;
	let transpositions = 0;
	let k = 0;
	for (let i = 0; i < aArr.length; i++) {
		if (!aMatches[i]) continue;
		while (!bMatches[k]) k++;
		if (aArr[i] !== bArr[k]) transpositions++;
		k++;
	}
	transpositions /= 2;
	return (
		(matches / aArr.length + matches / bArr.length + (matches - transpositions) / matches) / 3
	);
}

export function jaroWinkler(a: string, b: string, p = 0.1): number {
	const j = jaro(a, b);
	if (j < 0.7) return j;
	let l = 0;
	const aArr = Array.from(a);
	const bArr = Array.from(b);
	while (l < 4 && l < aArr.length && l < bArr.length && aArr[l] === bArr[l]) l++;
	return j + l * p * (1 - j);
}

export function diceCoefficient(a: string, b: string): number {
	if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
	const bigrams = (s: string): Map<string, number> => {
		const map = new Map<string, number>();
		for (let i = 0; i < s.length - 1; i++) {
			const bg = s.slice(i, i + 2);
			map.set(bg, (map.get(bg) ?? 0) + 1);
		}
		return map;
	};
	const aGrams = bigrams(a);
	const bGrams = bigrams(b);
	let intersection = 0;
	for (const [g, c] of aGrams) {
		const bc = bGrams.get(g);
		if (bc !== undefined) intersection += Math.min(c, bc);
	}
	const total = a.length + b.length - 2;
	return (2 * intersection) / total;
}

export function hammingDistance(a: string, b: string): number | null {
	const aArr = Array.from(a);
	const bArr = Array.from(b);
	if (aArr.length !== bArr.length) return null;
	let count = 0;
	for (let i = 0; i < aArr.length; i++) if (aArr[i] !== bArr[i]) count++;
	return count;
}
