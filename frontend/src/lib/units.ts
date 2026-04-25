export type Category = "length" | "weight" | "temperature" | "data" | "time";

export interface Unit {
	key: string;
	label: string;
	toBase: (v: number) => number;
	fromBase: (v: number) => number;
}

export const CATEGORIES: Record<Category, Unit[]> = {
	length: [
		{ key: "mm", label: "Millimeter (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
		{ key: "cm", label: "Centimeter (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
		{ key: "m", label: "Meter (m)", toBase: (v) => v, fromBase: (v) => v },
		{ key: "km", label: "Kilometer (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
		{ key: "in", label: "Inch (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
		{ key: "ft", label: "Foot (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
		{ key: "yd", label: "Yard (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
		{ key: "mi", label: "Mile (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 }
	],
	weight: [
		{ key: "mg", label: "Milligram (mg)", toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
		{ key: "g", label: "Gram (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
		{ key: "kg", label: "Kilogram (kg)", toBase: (v) => v, fromBase: (v) => v },
		{ key: "t", label: "Tonne (t)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
		{ key: "oz", label: "Ounce (oz)", toBase: (v) => v * 0.02834952, fromBase: (v) => v / 0.02834952 },
		{ key: "lb", label: "Pound (lb)", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 }
	],
	temperature: [
		{ key: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
		{ key: "f", label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
		{ key: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 }
	],
	data: [
		{ key: "b", label: "Byte (B)", toBase: (v) => v, fromBase: (v) => v },
		{ key: "kb", label: "Kilobyte (KB)", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
		{ key: "mb", label: "Megabyte (MB)", toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
		{ key: "gb", label: "Gigabyte (GB)", toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
		{ key: "tb", label: "Terabyte (TB)", toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
		{ key: "bit", label: "Bit", toBase: (v) => v / 8, fromBase: (v) => v * 8 }
	],
	time: [
		{ key: "ms", label: "Millisecond (ms)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
		{ key: "s", label: "Second (s)", toBase: (v) => v, fromBase: (v) => v },
		{ key: "min", label: "Minute (min)", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
		{ key: "h", label: "Hour (h)", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
		{ key: "d", label: "Day (d)", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
		{ key: "wk", label: "Week (wk)", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 }
	]
};

export function convert(value: number, from: Unit, to: Unit): number {
	return to.fromBase(from.toBase(value));
}
