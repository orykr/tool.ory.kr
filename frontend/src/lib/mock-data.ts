const FIRST_NAMES = [
	"Aiden", "Bella", "Cody", "Dana", "Ethan", "Fiona", "Gavin", "Hana", "Ivy", "Jude",
	"Kira", "Leo", "Mina", "Nash", "Olive", "Pax", "Quincy", "Rita", "Soren", "Tara",
	"Uma", "Vince", "Wren", "Xena", "Yuna", "Zane"
];
const LAST_NAMES = [
	"Adler", "Brennan", "Cho", "Doyle", "Ellis", "Foster", "Garza", "Hwang", "Iqbal", "Jansen",
	"Kim", "Lee", "Marsh", "Nakamura", "Owen", "Park", "Quinn", "Ramos", "Sato", "Tan",
	"Umar", "Vance", "Walsh", "Xu", "Yates", "Zhao"
];
const DOMAINS = ["example.com", "test.dev", "demo.io", "mail.com", "company.net"];
const STREETS = ["Maple", "Oak", "Pine", "Cedar", "Elm", "Birch", "Spruce"];
const CITIES = ["Seoul", "Tokyo", "Singapore", "Berlin", "Paris", "Toronto", "Lisbon"];
const COUNTRIES = ["KR", "JP", "SG", "DE", "FR", "CA", "PT"];
const COMPANIES = ["Acme", "Globex", "Initech", "Umbrella", "Stark", "Wayne", "Hooli"];

export type Field =
	| "id"
	| "uuid"
	| "firstName"
	| "lastName"
	| "fullName"
	| "email"
	| "phone"
	| "street"
	| "city"
	| "country"
	| "company"
	| "jobTitle"
	| "boolean"
	| "integer"
	| "float"
	| "date"
	| "isoDate";

export const FIELD_OPTIONS: Array<{ value: Field; label: string }> = [
	{ value: "id", label: "id (sequential)" },
	{ value: "uuid", label: "uuid (v4)" },
	{ value: "firstName", label: "firstName" },
	{ value: "lastName", label: "lastName" },
	{ value: "fullName", label: "fullName" },
	{ value: "email", label: "email" },
	{ value: "phone", label: "phone" },
	{ value: "street", label: "street" },
	{ value: "city", label: "city" },
	{ value: "country", label: "country (ISO 2)" },
	{ value: "company", label: "company" },
	{ value: "jobTitle", label: "jobTitle" },
	{ value: "boolean", label: "boolean" },
	{ value: "integer", label: "integer" },
	{ value: "float", label: "float" },
	{ value: "date", label: "date (YYYY-MM-DD)" },
	{ value: "isoDate", label: "isoDate" }
];

function pick<T>(arr: T[]): T {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	return arr[buf[0] % arr.length];
}

function randInt(min: number, max: number): number {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	return min + (buf[0] % (max - min + 1));
}

function randFloat(min: number, max: number): number {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	const r = buf[0] / 0xffffffff;
	return Number((min + r * (max - min)).toFixed(2));
}

function randDate(): Date {
	const start = Date.UTC(2000, 0, 1);
	const end = Date.now();
	return new Date(start + Math.floor(Math.random() * (end - start)));
}

function uuidV4(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	const hex: string[] = [];
	for (const b of bytes) hex.push(b.toString(16).padStart(2, "0"));
	return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

const JOB_TITLES = [
	"Software Engineer", "Product Manager", "Designer", "QA Engineer",
	"Data Analyst", "DevOps Engineer", "Security Researcher", "Tech Lead"
];

export function generateField(field: Field, index: number): unknown {
	switch (field) {
		case "id":
			return index + 1;
		case "uuid":
			return uuidV4();
		case "firstName":
			return pick(FIRST_NAMES);
		case "lastName":
			return pick(LAST_NAMES);
		case "fullName":
			return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
		case "email": {
			const f = pick(FIRST_NAMES).toLowerCase();
			const l = pick(LAST_NAMES).toLowerCase();
			return `${f}.${l}@${pick(DOMAINS)}`;
		}
		case "phone":
			return `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
		case "street":
			return `${randInt(1, 9999)} ${pick(STREETS)} St`;
		case "city":
			return pick(CITIES);
		case "country":
			return pick(COUNTRIES);
		case "company":
			return pick(COMPANIES);
		case "jobTitle":
			return pick(JOB_TITLES);
		case "boolean":
			return randInt(0, 1) === 1;
		case "integer":
			return randInt(1, 1000);
		case "float":
			return randFloat(0, 1000);
		case "date":
			return randDate().toISOString().slice(0, 10);
		case "isoDate":
			return randDate().toISOString();
	}
}

export function generateRows(fields: Array<{ name: string; type: Field }>, count: number): Record<string, unknown>[] {
	const rows: Record<string, unknown>[] = [];
	for (let i = 0; i < count; i++) {
		const row: Record<string, unknown> = {};
		for (const f of fields) {
			row[f.name] = generateField(f.type, i);
		}
		rows.push(row);
	}
	return rows;
}
