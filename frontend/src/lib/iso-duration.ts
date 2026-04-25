export interface Duration {
	years: number;
	months: number;
	weeks: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export const ZERO: Duration = {
	years: 0,
	months: 0,
	weeks: 0,
	days: 0,
	hours: 0,
	minutes: 0,
	seconds: 0
};

export function parseIsoDuration(input: string): Duration {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Empty input.");
	const negative = trimmed.startsWith("-");
	const body = negative ? trimmed.slice(1) : trimmed;
	if (!body.startsWith("P")) throw new Error("ISO 8601 durations must start with 'P'.");

	const re =
		/^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
	const m = body.match(re);
	if (!m) throw new Error("Could not parse ISO 8601 duration.");
	if (body === "P" || body === "PT") throw new Error("Empty duration.");

	const num = (s: string | undefined) => (s ? Number(s) : 0);
	const sign = negative ? -1 : 1;
	return {
		years: sign * num(m[1]),
		months: sign * num(m[2]),
		weeks: sign * num(m[3]),
		days: sign * num(m[4]),
		hours: sign * num(m[5]),
		minutes: sign * num(m[6]),
		seconds: sign * num(m[7])
	};
}

export function formatIsoDuration(d: Duration): string {
	const fields = [d.years, d.months, d.weeks, d.days, d.hours, d.minutes, d.seconds];
	const allNegative = fields.every((v) => v <= 0) && fields.some((v) => v < 0);
	if (allNegative) {
		return "-" + formatIsoDuration(negate(d));
	}
	const date: string[] = [];
	if (d.years !== 0) date.push(`${d.years}Y`);
	if (d.months !== 0) date.push(`${d.months}M`);
	if (d.weeks !== 0) date.push(`${d.weeks}W`);
	if (d.days !== 0) date.push(`${d.days}D`);
	const time: string[] = [];
	if (d.hours !== 0) time.push(`${d.hours}H`);
	if (d.minutes !== 0) time.push(`${d.minutes}M`);
	if (d.seconds !== 0) time.push(`${d.seconds}S`);

	let out = "P" + date.join("");
	if (time.length) out += "T" + time.join("");
	if (out === "P") out = "PT0S";
	return out;
}

function negate(d: Duration): Duration {
	return {
		years: -d.years,
		months: -d.months,
		weeks: -d.weeks,
		days: -d.days,
		hours: -d.hours,
		minutes: -d.minutes,
		seconds: -d.seconds
	};
}

export function totalSeconds(d: Duration): number {
	const monthsToSec = (d.years * 365.25 + d.months * 30.4375) * 86400;
	return monthsToSec + d.weeks * 604800 + d.days * 86400 + d.hours * 3600 + d.minutes * 60 + d.seconds;
}

export function humanReadable(d: Duration): string {
	const parts: string[] = [];
	const a = (n: number) => Math.abs(n);
	if (a(d.years)) parts.push(`${a(d.years)} year${a(d.years) === 1 ? "" : "s"}`);
	if (a(d.months)) parts.push(`${a(d.months)} month${a(d.months) === 1 ? "" : "s"}`);
	if (a(d.weeks)) parts.push(`${a(d.weeks)} week${a(d.weeks) === 1 ? "" : "s"}`);
	if (a(d.days)) parts.push(`${a(d.days)} day${a(d.days) === 1 ? "" : "s"}`);
	if (a(d.hours)) parts.push(`${a(d.hours)} hour${a(d.hours) === 1 ? "" : "s"}`);
	if (a(d.minutes)) parts.push(`${a(d.minutes)} minute${a(d.minutes) === 1 ? "" : "s"}`);
	if (a(d.seconds)) parts.push(`${a(d.seconds)} second${a(d.seconds) === 1 ? "" : "s"}`);
	if (!parts.length) return "0 seconds";
	const sign = totalSeconds(d) < 0 ? "−" : "";
	return sign + parts.join(", ");
}
