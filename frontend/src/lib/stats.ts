export interface StatsResult {
	count: number;
	sum: number;
	mean: number;
	median: number;
	mode: number[];
	min: number;
	max: number;
	range: number;
	variance: number;
	stdDev: number;
	q1: number;
	q3: number;
	iqr: number;
	geometricMean: number | null;
	harmonicMean: number | null;
}

export function parseNumbers(input: string): number[] {
	const tokens = input
		.split(/[\s,;]+/)
		.map((t) => t.trim())
		.filter(Boolean);
	const result: number[] = [];
	for (const t of tokens) {
		const n = Number(t);
		if (Number.isFinite(n)) result.push(n);
	}
	return result;
}

export function computeStats(values: number[]): StatsResult | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const sum = values.reduce((a, b) => a + b, 0);
	const mean = sum / values.length;
	const min = sorted[0];
	const max = sorted[sorted.length - 1];

	const median = quantile(sorted, 0.5);
	const q1 = quantile(sorted, 0.25);
	const q3 = quantile(sorted, 0.75);

	const variance =
		values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
	const stdDev = Math.sqrt(variance);

	const counts = new Map<number, number>();
	for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
	let maxCount = 0;
	for (const c of counts.values()) if (c > maxCount) maxCount = c;
	const mode =
		maxCount > 1
			? Array.from(counts.entries())
					.filter(([, c]) => c === maxCount)
					.map(([v]) => v)
					.sort((a, b) => a - b)
			: [];

	const allPositive = values.every((v) => v > 0);
	const geometricMean = allPositive
		? Math.exp(values.reduce((acc, v) => acc + Math.log(v), 0) / values.length)
		: null;
	const harmonicMean = allPositive
		? values.length / values.reduce((acc, v) => acc + 1 / v, 0)
		: null;

	return {
		count: values.length,
		sum,
		mean,
		median,
		mode,
		min,
		max,
		range: max - min,
		variance,
		stdDev,
		q1,
		q3,
		iqr: q3 - q1,
		geometricMean,
		harmonicMean
	};
}

function quantile(sorted: number[], q: number): number {
	if (sorted.length === 0) return NaN;
	if (sorted.length === 1) return sorted[0];
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	}
	return sorted[base];
}
