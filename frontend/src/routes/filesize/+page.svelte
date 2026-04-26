<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { Button } from "$lib/components/ui/button/index.js";

	const BIN_UNITS: Array<[string, bigint]> = [
		["B", 1n],
		["KiB", 1024n],
		["MiB", 1024n ** 2n],
		["GiB", 1024n ** 3n],
		["TiB", 1024n ** 4n],
		["PiB", 1024n ** 5n],
		["EiB", 1024n ** 6n]
	];

	const SI_UNITS: Array<[string, bigint]> = [
		["B", 1n],
		["KB", 1000n],
		["MB", 1000n ** 2n],
		["GB", 1000n ** 3n],
		["TB", 1000n ** 4n],
		["PB", 1000n ** 5n],
		["EB", 1000n ** 6n]
	];

	function unitMap(): Map<string, bigint> {
		const m = new Map<string, bigint>();
		for (const [u, v] of BIN_UNITS) m.set(u.toLowerCase(), v);
		for (const [u, v] of SI_UNITS) m.set(u.toLowerCase(), v);
		m.set("k", 1024n);
		m.set("kb", 1000n);
		m.set("m", 1024n ** 2n);
		m.set("g", 1024n ** 3n);
		m.set("t", 1024n ** 4n);
		return m;
	}

	const UNITS = unitMap();

	function parseSize(input: string): bigint {
		const trimmed = input.trim();
		if (!trimmed) throw new Error("Empty input.");
		const m = trimmed.match(/^([0-9]+(?:\.[0-9]+)?|\.[0-9]+)\s*([A-Za-z]+)?$/);
		if (!m) throw new Error("Format: number + unit (e.g. 1.5 GB).");
		const num = m[1];
		const unit = (m[2] ?? "B").toLowerCase();
		const factor = UNITS.get(unit);
		if (factor === undefined) throw new Error(`Unknown unit: ${m[2]}`);
		const dot = num.indexOf(".");
		if (dot < 0) {
			return BigInt(num) * factor;
		}
		const intPart = num.slice(0, dot);
		const fracPart = num.slice(dot + 1);
		const intBig = BigInt(intPart || "0");
		const fracBig = BigInt(fracPart || "0");
		const fracDen = 10n ** BigInt(fracPart.length);
		return intBig * factor + (fracBig * factor) / fracDen;
	}

	function formatBigBytes(bytes: bigint, table: Array<[string, bigint]>): Array<{ unit: string; value: string }> {
		const out: Array<{ unit: string; value: string }> = [];
		for (const [unit, factor] of table) {
			if (factor === 1n) {
				out.push({ unit, value: bytes.toString() });
				continue;
			}
			const whole = bytes / factor;
			const remainder = bytes % factor;
			const scale = 1000000n;
			const fraction = (remainder * scale) / factor;
			const fracStr = fraction.toString().padStart(6, "0").replace(/0+$/, "");
			const value = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
			out.push({ unit, value });
		}
		return out;
	}

	let humanInput = $state("1.5 GB");
	let bytesInput = $state("1500000000");

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, bytes: parseSize(humanInput) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let formatted = $derived.by(() => {
		try {
			const trimmed = bytesInput.trim();
			if (!trimmed) throw new Error("Empty input.");
			if (!/^\d+$/.test(trimmed)) throw new Error("Must be an integer number of bytes.");
			const big = BigInt(trimmed);
			return {
				ok: true as const,
				binary: formatBigBytes(big, BIN_UNITS),
				si: formatBigBytes(big, SI_UNITS)
			};
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state<string | null>(null);
	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = text;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">File Size Converter</h1>
		<p class="text-muted-foreground mt-1">
			Parse human file size strings (1.5 GB, 200 MiB) into bytes, or break a byte count down into binary (KiB) and SI (KB) units.
		</p>
	</header>

	<Tabs.Root value="parse">
		<Tabs.List>
			<Tabs.Trigger value="parse">Parse</Tabs.Trigger>
			<Tabs.Trigger value="format">Format</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="parse">
			<Card.Root class="mb-4">
				<Card.Content class="space-y-1.5 pt-6">
					<Label for="hi">Human size</Label>
					<Input id="hi" bind:value={humanInput} class="font-mono" placeholder="e.g. 1.5 GB or 200 MiB" />
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Bytes</Card.Title>
					{#if parsed.ok}
						<Button variant="ghost" size="sm" onclick={() => copy(parsed.bytes.toString())}>
							{#if copied === parsed.bytes.toString()}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					{/if}
				</Card.Header>
				<Card.Content>
					{#if parsed.ok}
						<p class="font-mono text-2xl">{parsed.bytes.toString()}</p>
					{:else}
						<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
							{parsed.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="format">
			<Card.Root class="mb-4">
				<Card.Content class="space-y-1.5 pt-6">
					<Label for="bi">Bytes</Label>
					<Input id="bi" bind:value={bytesInput} class="font-mono" />
				</Card.Content>
			</Card.Root>

			{#if formatted.ok}
				<div class="grid gap-4 md:grid-cols-2">
					<Card.Root>
						<Card.Header><Card.Title class="text-base">Binary (1024-based)</Card.Title></Card.Header>
						<Card.Content>
							<dl class="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 font-mono text-sm">
								{#each formatted.binary as row, i (i + row.unit)}
									<dt class="text-muted-foreground">{row.unit}</dt>
									<dd class="text-right">{row.value}</dd>
									<Button variant="ghost" size="sm" onclick={() => copy(`${row.value} ${row.unit}`)}>
										{#if copied === `${row.value} ${row.unit}`}<Check class="h-3 w-3" />{:else}<Copy class="h-3 w-3" />{/if}
									</Button>
								{/each}
							</dl>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header><Card.Title class="text-base">SI (1000-based)</Card.Title></Card.Header>
						<Card.Content>
							<dl class="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 font-mono text-sm">
								{#each formatted.si as row, i (i + row.unit)}
									<dt class="text-muted-foreground">{row.unit}</dt>
									<dd class="text-right">{row.value}</dd>
									<Button variant="ghost" size="sm" onclick={() => copy(`${row.value} ${row.unit}`)}>
										{#if copied === `${row.value} ${row.unit}`}<Check class="h-3 w-3" />{:else}<Copy class="h-3 w-3" />{/if}
									</Button>
								{/each}
							</dl>
						</Card.Content>
					</Card.Root>
				</div>
			{:else}
				<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
					{formatted.error}
				</div>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</main>
