export type IpVersion = 4 | 6;

export interface IpInfo {
	version: IpVersion;
	original: string;
	canonical: string;
	hex: string;
	decimal: string;
	binary: string;
	classification: string;
}

export function inspectIp(input: string): IpInfo {
	const value = input.trim();
	if (!value) throw new Error("Empty input.");
	if (value.includes(":")) return inspectIpv6(value);
	return inspectIpv4(value);
}

function inspectIpv4(input: string): IpInfo {
	const parts = input.split(".");
	if (parts.length !== 4) throw new Error("IPv4 must have 4 octets.");
	const octets = parts.map((p) => {
		if (!/^\d+$/.test(p)) throw new Error(`Octet '${p}' is not numeric.`);
		const n = Number(p);
		if (n < 0 || n > 255) throw new Error(`Octet ${n} out of range (0–255).`);
		return n;
	});
	const big = (BigInt(octets[0]) << 24n) | (BigInt(octets[1]) << 16n) | (BigInt(octets[2]) << 8n) | BigInt(octets[3]);

	return {
		version: 4,
		original: input,
		canonical: octets.join("."),
		hex: "0x" + big.toString(16).padStart(8, "0").toUpperCase(),
		decimal: big.toString(10),
		binary: octets.map((o) => o.toString(2).padStart(8, "0")).join("."),
		classification: classifyIpv4(octets, big)
	};
}

function classifyIpv4(octets: number[], n: bigint): string {
	if (octets[0] === 10) return "Private (10.0.0.0/8)";
	if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return "Private (172.16.0.0/12)";
	if (octets[0] === 192 && octets[1] === 168) return "Private (192.168.0.0/16)";
	if (octets[0] === 127) return "Loopback (127.0.0.0/8)";
	if (octets[0] === 169 && octets[1] === 254) return "Link-local (169.254.0.0/16)";
	if (octets[0] >= 224 && octets[0] <= 239) return "Multicast (224.0.0.0/4)";
	if (octets[0] >= 240) return "Reserved (240.0.0.0/4)";
	if (octets[0] === 0) return "Reserved (0.0.0.0/8)";
	return "Public";
}

function inspectIpv6(input: string): IpInfo {
	const groups = expandIpv6(input);
	const big = groups.reduce((acc, g) => (acc << 16n) | BigInt(g), 0n);

	const canonical = compressIpv6(groups);
	return {
		version: 6,
		original: input,
		canonical,
		hex: "0x" + big.toString(16).padStart(32, "0"),
		decimal: big.toString(10),
		binary: groups.map((g) => g.toString(2).padStart(16, "0")).join(":"),
		classification: classifyIpv6(groups, big)
	};
}

function expandIpv6(input: string): number[] {
	if (input === "::") return new Array(8).fill(0);
	const parts = input.split("::");
	if (parts.length > 2) throw new Error("Invalid IPv6: multiple '::' segments.");

	const left = parts[0] ? parts[0].split(":") : [];
	const right = parts.length > 1 && parts[1] ? parts[1].split(":") : [];

	const allHex = [...left, ...right];
	for (const h of allHex) {
		if (!/^[0-9a-fA-F]{1,4}$/.test(h)) throw new Error(`Invalid IPv6 group: ${h}`);
	}

	const explicit = left.length + right.length;
	if (parts.length === 1 && explicit !== 8) throw new Error("IPv6 must have 8 groups.");
	if (parts.length === 2 && explicit > 7) throw new Error("Too many groups for '::' shorthand.");

	const fillCount = parts.length === 2 ? 8 - explicit : 0;
	const result = [
		...left.map((h) => parseInt(h, 16)),
		...new Array(fillCount).fill(0),
		...right.map((h) => parseInt(h, 16))
	];
	return result;
}

function compressIpv6(groups: number[]): string {
	const hexGroups = groups.map((g) => g.toString(16));
	let bestStart = -1;
	let bestLen = 0;
	let curStart = -1;
	let curLen = 0;
	for (let i = 0; i < hexGroups.length; i++) {
		if (groups[i] === 0) {
			if (curStart < 0) curStart = i;
			curLen++;
			if (curLen > bestLen) {
				bestLen = curLen;
				bestStart = curStart;
			}
		} else {
			curStart = -1;
			curLen = 0;
		}
	}
	if (bestLen < 2) return hexGroups.join(":");
	const before = hexGroups.slice(0, bestStart).join(":");
	const after = hexGroups.slice(bestStart + bestLen).join(":");
	return `${before}::${after}`;
}

function classifyIpv6(groups: number[], n: bigint): string {
	if (n === 0n) return "Unspecified (::)";
	if (n === 1n) return "Loopback (::1)";
	if ((groups[0] & 0xfe00) === 0xfc00) return "Unique local (fc00::/7)";
	if ((groups[0] & 0xffc0) === 0xfe80) return "Link-local (fe80::/10)";
	if ((groups[0] & 0xff00) === 0xff00) return "Multicast (ff00::/8)";
	if (groups[0] === 0x2001 && groups[1] === 0xdb8) return "Documentation (2001:db8::/32)";
	return "Global unicast";
}
