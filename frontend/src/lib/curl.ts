export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type BodyKind = "none" | "json" | "form" | "raw";

export interface Header {
	id: number;
	name: string;
	value: string;
}

export interface FormField {
	id: number;
	name: string;
	value: string;
}

export interface CurlInput {
	url: string;
	method: Method;
	headers: Header[];
	bodyKind: BodyKind;
	jsonBody: string;
	rawBody: string;
	rawContentType: string;
	formFields: FormField[];
	user: string;
	password: string;
	bearer: string;
	insecure: boolean;
	followRedirects: boolean;
	verbose: boolean;
	includeHead: boolean;
}

function shellEscape(value: string): string {
	if (value === "") return "''";
	if (/^[A-Za-z0-9_./:=@]+$/.test(value)) return value;
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

function sanitizeHeader(value: string): string {
	return value.replace(/[\r\n]+/g, " ");
}

export function buildCurl(input: CurlInput): string {
	const parts: string[] = ["curl"];
	const flags: string[] = [];

	flags.push(`-X ${input.method}`);
	if (input.followRedirects) flags.push("-L");
	if (input.insecure) flags.push("-k");
	if (input.verbose) flags.push("-v");
	if (input.includeHead) flags.push("-i");

	const headers: Header[] = input.headers
		.filter((h) => h.name.trim())
		.map((h) => ({ id: h.id, name: sanitizeHeader(h.name).trim(), value: sanitizeHeader(h.value) }));
	const isJson = input.bodyKind === "json";
	const isForm = input.bodyKind === "form";
	const isRaw = input.bodyKind === "raw";

	const hasContentType = headers.some((h) => h.name.toLowerCase() === "content-type");
	if (isJson && !hasContentType) {
		headers.push({ id: -1, name: "Content-Type", value: "application/json" });
	}
	if (isRaw && input.rawContentType && !hasContentType) {
		headers.push({ id: -2, name: "Content-Type", value: sanitizeHeader(input.rawContentType) });
	}

	const hasAuthHeader = headers.some((h) => h.name.toLowerCase() === "authorization");
	if (input.bearer && !hasAuthHeader) {
		headers.push({ id: -3, name: "Authorization", value: `Bearer ${sanitizeHeader(input.bearer)}` });
	}

	for (const h of headers) {
		flags.push(`-H ${shellEscape(`${h.name}: ${h.value}`)}`);
	}

	if (input.user) {
		const credential = input.password ? `${input.user}:${input.password}` : input.user;
		flags.push(`-u ${shellEscape(credential)}`);
	}

	if (isJson) {
		flags.push(`--data-raw ${shellEscape(input.jsonBody)}`);
	} else if (isRaw) {
		flags.push(`--data-raw ${shellEscape(input.rawBody)}`);
	} else if (isForm) {
		for (const f of input.formFields.filter((f) => f.name)) {
			flags.push(`--data-urlencode ${shellEscape(`${f.name}=${f.value}`)}`);
		}
	}

	const url = input.url || "https://example.com";
	flags.push("--");
	flags.push(shellEscape(url));

	const sep = " \\\n  ";
	return parts.concat(flags).join(sep);
}
