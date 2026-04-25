export function dmsToDecimal(deg: number, min: number, sec: number, hemisphere: "N" | "S" | "E" | "W"): number {
	const sign = hemisphere === "S" || hemisphere === "W" ? -1 : 1;
	return sign * (Math.abs(deg) + Math.abs(min) / 60 + Math.abs(sec) / 3600);
}

export interface DMS {
	deg: number;
	min: number;
	sec: number;
	hemisphere: "N" | "S" | "E" | "W";
}

export function decimalToDms(decimal: number, axis: "lat" | "lon"): DMS {
	const positive = decimal >= 0;
	const abs = Math.abs(decimal);
	const deg = Math.floor(abs);
	const minFloat = (abs - deg) * 60;
	const min = Math.floor(minFloat);
	const sec = (minFloat - min) * 60;
	const hemisphere = axis === "lat" ? (positive ? "N" : "S") : positive ? "E" : "W";
	return { deg, min, sec: Number(sec.toFixed(4)), hemisphere };
}

export function formatDms(dms: DMS): string {
	return `${dms.deg}° ${dms.min}' ${dms.sec.toFixed(4)}" ${dms.hemisphere}`;
}

export function parseDmsString(input: string, axis: "lat" | "lon"): number {
	const m = input
		.trim()
		.replace(/\s+/g, " ")
		.match(/^(-?\d+(?:\.\d+)?)°?\s*(\d+(?:\.\d+)?)?[′']?\s*(\d+(?:\.\d+)?)?[″"]?\s*([NSEW])?$/i);
	if (!m) throw new Error("Invalid DMS format.");
	const deg = parseFloat(m[1]);
	const min = m[2] ? parseFloat(m[2]) : 0;
	const sec = m[3] ? parseFloat(m[3]) : 0;
	let hem = (m[4] ?? "").toUpperCase() as "N" | "S" | "E" | "W" | "";
	if (!hem) hem = axis === "lat" ? (deg < 0 ? "S" : "N") : deg < 0 ? "W" : "E";
	return dmsToDecimal(deg, min, sec, hem);
}
