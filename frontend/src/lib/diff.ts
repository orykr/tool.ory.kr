export type DiffOp = "equal" | "insert" | "delete";

export interface DiffLine {
	op: DiffOp;
	leftNumber: number | null;
	rightNumber: number | null;
	text: string;
}

export function diffLines(a: string, b: string): DiffLine[] {
	const aLines = a.split(/\r?\n/);
	const bLines = b.split(/\r?\n/);
	const ops = lcsDiff(aLines, bLines);
	const result: DiffLine[] = [];
	let li = 0;
	let ri = 0;
	for (const op of ops) {
		if (op === "equal") {
			result.push({ op, leftNumber: ++li, rightNumber: ++ri, text: aLines[li - 1] });
		} else if (op === "delete") {
			result.push({ op, leftNumber: ++li, rightNumber: null, text: aLines[li - 1] });
		} else {
			result.push({ op, leftNumber: null, rightNumber: ++ri, text: bLines[ri - 1] });
		}
	}
	return result;
}

function lcsDiff(a: string[], b: string[]): DiffOp[] {
	const n = a.length;
	const m = b.length;
	const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
			else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}
	const ops: DiffOp[] = [];
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

export function diffStats(lines: DiffLine[]): { added: number; removed: number; same: number } {
	let added = 0;
	let removed = 0;
	let same = 0;
	for (const l of lines) {
		if (l.op === "insert") added++;
		else if (l.op === "delete") removed++;
		else same++;
	}
	return { added, removed, same };
}
