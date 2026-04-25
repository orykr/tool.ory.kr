export type WordDiffOp = "equal" | "insert" | "delete";

export interface WordDiff {
	op: WordDiffOp;
	text: string;
}

export function tokenize(text: string): string[] {
	const tokens: string[] = [];
	const re = /\s+|[^\s]+/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		tokens.push(m[0]);
	}
	return tokens;
}

export function wordDiff(a: string, b: string): WordDiff[] {
	const aTok = tokenize(a);
	const bTok = tokenize(b);
	const ops = lcsOps(aTok, bTok);
	const result: WordDiff[] = [];
	let li = 0;
	let ri = 0;
	for (const op of ops) {
		if (op === "equal") {
			result.push({ op, text: aTok[li] });
			li++;
			ri++;
		} else if (op === "delete") {
			result.push({ op, text: aTok[li] });
			li++;
		} else {
			result.push({ op, text: bTok[ri] });
			ri++;
		}
	}
	return result;
}

function lcsOps(a: string[], b: string[]): WordDiffOp[] {
	const n = a.length;
	const m = b.length;
	const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
			else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}
	const ops: WordDiffOp[] = [];
	let i = n;
	let j = m;
	while (i > 0 && j > 0) {
		if (a[i - 1] === b[j - 1]) {
			ops.push("equal");
			i--;
			j--;
		} else if (dp[i - 1][j] >= dp[i][j - 1]) {
			ops.push("delete");
			i--;
		} else {
			ops.push("insert");
			j--;
		}
	}
	while (i > 0) {
		ops.push("delete");
		i--;
	}
	while (j > 0) {
		ops.push("insert");
		j--;
	}
	return ops.reverse();
}
