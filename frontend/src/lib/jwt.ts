export interface JwtParts {
	header: unknown;
	payload: unknown;
	signature: string;
	rawHeader: string;
	rawPayload: string;
}

export function decodeJwt(token: string): JwtParts {
	const trimmed = token.trim();
	if (!trimmed) throw new Error("Empty token.");

	const parts = trimmed.split(".");
	if (parts.length !== 3) {
		throw new Error("Invalid JWT: expected 3 segments separated by '.'.");
	}

	const [headerSeg, payloadSeg, signatureSeg] = parts;
	const header = parseSegment(headerSeg, "header");
	const payload = parseSegment(payloadSeg, "payload");

	return {
		header,
		payload,
		signature: signatureSeg,
		rawHeader: headerSeg,
		rawPayload: payloadSeg
	};
}

function parseSegment(segment: string, name: string): unknown {
	try {
		const json = base64UrlDecode(segment);
		return JSON.parse(json);
	} catch (e) {
		throw new Error(`Failed to decode ${name}: ${(e as Error).message}`);
	}
}

function base64UrlDecode(input: string): string {
	const padded = input.replace(/-/g, "+").replace(/_/g, "/");
	const padLen = (4 - (padded.length % 4)) % 4;
	const padStr = padded + "=".repeat(padLen);
	const binary = atob(padStr);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function describeTimeClaim(value: unknown): string | null {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	try {
		const date = new Date(value * 1000);
		if (Number.isNaN(date.getTime())) return null;
		return date.toISOString();
	} catch {
		return null;
	}
}
