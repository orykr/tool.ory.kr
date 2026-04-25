<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Check from "@lucide/svelte/icons/check";
	import X from "@lucide/svelte/icons/x";

	let cidrText = $state(`10.0.0.0/8
192.168.0.0/16
172.16.0.0/12
2001:db8::/32`);
	let ipText = $state(`10.1.2.3
192.168.1.1
8.8.8.8
2001:db8:abcd::1
::1`);

	function ipv4ToBig(ip: string): bigint {
		const parts = ip.split(".");
		if (parts.length !== 4) throw new Error(`Invalid IPv4: ${ip}`);
		let n = 0n;
		for (const p of parts) {
			if (!/^\d+$/.test(p)) throw new Error(`Invalid octet: ${p}`);
			const x = Number(p);
			if (x < 0 || x > 255) throw new Error(`Octet out of range: ${p}`);
			n = (n << 8n) | BigInt(x);
		}
		return n;
	}

	function ipv6ToBig(ip: string): bigint {
		if (ip === "::") return 0n;
		const halves = ip.split("::");
		if (halves.length > 2) throw new Error(`Invalid IPv6: ${ip}`);
		const left = halves[0] ? halves[0].split(":") : [];
		const right = halves.length > 1 && halves[1] ? halves[1].split(":") : [];
		const explicit = left.length + right.length;
		if (halves.length === 1 && explicit !== 8) throw new Error(`IPv6 must have 8 groups: ${ip}`);
		if (halves.length === 2 && explicit > 7) throw new Error(`Too many groups: ${ip}`);
		const fill = halves.length === 2 ? 8 - explicit : 0;
		const groups = [
			...left,
			...new Array(fill).fill("0"),
			...right
		];
		let n = 0n;
		for (const g of groups) {
			if (!/^[0-9a-fA-F]{1,4}$/.test(g)) throw new Error(`Invalid IPv6 group: ${g}`);
			n = (n << 16n) | BigInt(parseInt(g, 16));
		}
		return n;
	}

	type ParsedCidr = { raw: string; version: 4 | 6; network: bigint; prefix: number };

	function parseCidr(line: string): ParsedCidr {
		const slashParts = line.split("/");
		if (slashParts.length !== 2) throw new Error(`Invalid CIDR: ${line}`);
		const [ip, prefixStr] = slashParts;
		if (!ip || !prefixStr) throw new Error(`Missing prefix: ${line}`);
		const prefix = Number(prefixStr);
		if (!Number.isInteger(prefix)) throw new Error(`Invalid prefix: ${prefixStr}`);
		const version: 4 | 6 = ip.includes(":") ? 6 : 4;
		const max = version === 4 ? 32 : 128;
		if (prefix < 0 || prefix > max) throw new Error(`Prefix out of range: ${prefix}`);
		const big = version === 4 ? ipv4ToBig(ip) : ipv6ToBig(ip);
		const shift = BigInt(max - prefix);
		const mask = shift === 0n ? (1n << BigInt(max)) - 1n : ((1n << BigInt(prefix)) - 1n) << shift;
		const network = big & mask;
		return { raw: line, version, network, prefix };
	}

	function ipMatches(ip: bigint, version: 4 | 6, cidr: ParsedCidr): boolean {
		if (cidr.version !== version) return false;
		const max = version === 4 ? 32 : 128;
		const shift = BigInt(max - cidr.prefix);
		const mask = shift === 0n ? (1n << BigInt(max)) - 1n : ((1n << BigInt(cidr.prefix)) - 1n) << shift;
		return (ip & mask) === cidr.network;
	}

	type Row = {
		ip: string;
		ok: boolean;
		matches: ParsedCidr[];
		error?: string;
	};

	let result = $derived.by<{ ok: true; rows: Row[]; cidrs: ParsedCidr[] } | { ok: false; error: string }>(() => {
		const cidrs: ParsedCidr[] = [];
		const cidrLines = cidrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
		for (const line of cidrLines) {
			try {
				cidrs.push(parseCidr(line));
			} catch (e) {
				return { ok: false, error: `CIDR parse error: ${(e as Error).message}` };
			}
		}
		const rows: Row[] = [];
		const ipLines = ipText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
		for (const ip of ipLines) {
			try {
				const version: 4 | 6 = ip.includes(":") ? 6 : 4;
				const big = version === 4 ? ipv4ToBig(ip) : ipv6ToBig(ip);
				const matches = cidrs.filter((c) => ipMatches(big, version, c));
				rows.push({ ip, ok: matches.length > 0, matches });
			} catch (e) {
				rows.push({ ip, ok: false, matches: [], error: (e as Error).message });
			}
		}
		return { ok: true, rows, cidrs };
	});
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">CIDR Contains</h1>
		<p class="text-muted-foreground mt-1">
			Check whether IPv4 / IPv6 addresses fall inside one or more CIDR blocks.
		</p>
	</header>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">CIDR blocks</Card.Title>
				<Card.Description>One CIDR per line, e.g. <code>10.0.0.0/8</code>.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={cidrText} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">IP addresses</Card.Title>
				<Card.Description>One IP per line. IPv4 or IPv6.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={ipText} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Results</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if !result.ok}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{result.error}
				</div>
			{:else if result.rows.length === 0}
				<p class="text-muted-foreground text-sm">No IPs to check.</p>
			{:else}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="px-2 py-2">IP</th>
							<th class="px-2 py-2">In</th>
							<th class="px-2 py-2">Matches</th>
						</tr>
					</thead>
					<tbody>
						{#each result.rows as r, i (i + ":" + r.ip)}
							<tr class="border-b last:border-0">
								<td class="px-2 py-1 font-mono">{r.ip}</td>
								<td class="px-2 py-1">
									{#if r.error}
										<span class="text-destructive inline-flex items-center gap-1"><X class="h-4 w-4" />error</span>
									{:else if r.ok}
										<span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Check class="h-4 w-4" />yes</span>
									{:else}
										<span class="text-muted-foreground inline-flex items-center gap-1"><X class="h-4 w-4" />no</span>
									{/if}
								</td>
								<td class="px-2 py-1 font-mono text-xs">
									{#if r.error}
										<span class="text-destructive">{r.error}</span>
									{:else}
										{r.matches.map((m) => m.raw).join(", ")}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
