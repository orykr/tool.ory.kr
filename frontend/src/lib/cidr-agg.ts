function ipToInt(ip: string): bigint {
	const parts = ip.split(".");
	if (parts.length !== 4) throw new Error(`Invalid IPv4: ${ip}`);
	let result = 0n;
	for (const p of parts) {
		const n = Number(p);
		if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error(`Invalid octet in ${ip}`);
		result = (result << 8n) | BigInt(n);
	}
	return result;
}

function intToIp(n: bigint): string {
	return [
		Number((n >> 24n) & 0xffn),
		Number((n >> 16n) & 0xffn),
		Number((n >> 8n) & 0xffn),
		Number(n & 0xffn)
	].join(".");
}

export interface ParsedRange {
	start: bigint;
	end: bigint;
	source: string;
}

export function parseEntry(input: string): ParsedRange {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Empty entry.");

	if (trimmed.includes("/")) {
		const [ipStr, prefixStr] = trimmed.split("/");
		const prefix = Number(prefixStr);
		if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
			throw new Error(`Invalid prefix: ${prefixStr}`);
		}
		const ipNum = ipToInt(ipStr);
		const mask = prefix === 0 ? 0n : (~0n << BigInt(32 - prefix)) & 0xffffffffn;
		const start = ipNum & mask;
		const size = 1n << BigInt(32 - prefix);
		const end = start + size - 1n;
		return { start, end, source: trimmed };
	}

	if (trimmed.includes("-")) {
		const [a, b] = trimmed.split("-").map((s) => s.trim());
		const start = ipToInt(a);
		const end = ipToInt(b);
		if (end < start) throw new Error("Range end < start.");
		return { start, end, source: trimmed };
	}

	const ip = ipToInt(trimmed);
	return { start: ip, end: ip, source: trimmed };
}

function rangeToCidrs(start: bigint, end: bigint): string[] {
	const result: string[] = [];
	while (start <= end) {
		const lowestBit = start === 0n ? 32 : Number(lowZeroBits(start));
		let prefix = 32 - lowestBit;
		// Ensure block doesn't exceed end
		while (prefix < 32 && start + (1n << BigInt(32 - prefix)) - 1n > end) {
			prefix++;
		}
		result.push(`${intToIp(start)}/${prefix}`);
		start += 1n << BigInt(32 - prefix);
	}
	return result;
}

function lowZeroBits(n: bigint): bigint {
	let count = 0n;
	while ((n & 1n) === 0n && count < 32n) {
		n >>= 1n;
		count++;
	}
	return count;
}

export function aggregate(input: string): {
	ok: true;
	merged: string[];
	ranges: Array<{ start: string; end: string; size: bigint }>;
	totalAddresses: bigint;
	originalCount: number;
} | { ok: false; error: string } {
	const lines = input
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l && !l.startsWith("#"));
	if (lines.length === 0) {
		return { ok: true, merged: [], ranges: [], totalAddresses: 0n, originalCount: 0 };
	}

	let parsed: ParsedRange[];
	try {
		parsed = lines.map(parseEntry);
	} catch (e) {
		return { ok: false, error: (e as Error).message };
	}

	parsed.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

	const ranges: Array<{ start: bigint; end: bigint }> = [];
	for (const p of parsed) {
		const last = ranges[ranges.length - 1];
		if (last && p.start <= last.end + 1n) {
			if (p.end > last.end) last.end = p.end;
		} else {
			ranges.push({ start: p.start, end: p.end });
		}
	}

	const merged: string[] = [];
	let total = 0n;
	for (const r of ranges) {
		merged.push(...rangeToCidrs(r.start, r.end));
		total += r.end - r.start + 1n;
	}

	return {
		ok: true,
		merged,
		ranges: ranges.map((r) => ({
			start: intToIp(r.start),
			end: intToIp(r.end),
			size: r.end - r.start + 1n
		})),
		totalAddresses: total,
		originalCount: parsed.length
	};
}
