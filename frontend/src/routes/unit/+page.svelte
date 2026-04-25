<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { CATEGORIES, type Category } from "$lib/units";

	const categoryLabels: Record<Category, string> = {
		length: "Length",
		weight: "Weight",
		temperature: "Temperature",
		data: "Data size",
		time: "Time"
	};

	let category = $state<Category>("length");
	let value = $state(1);
	let fromKey = $state("m");
	let units = $derived(CATEGORIES[category]);

	$effect(() => {
		const list = CATEGORIES[category];
		if (!list.find((u) => u.key === fromKey)) fromKey = list[0].key;
	});

	let conversions = $derived.by(() => {
		const from = units.find((u) => u.key === fromKey);
		if (!from) return [];
		const n = Number(value);
		if (!Number.isFinite(n)) return [];
		return units.map((u) => ({
			key: u.key,
			label: u.label,
			value: u.fromBase(from.toBase(n))
		}));
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function format(n: number): string {
		if (!Number.isFinite(n)) return String(n);
		const abs = Math.abs(n);
		if (abs !== 0 && (abs < 0.0001 || abs >= 1e12)) return n.toExponential(6);
		const fixed = n.toFixed(8);
		return fixed.replace(/\.?0+$/, "");
	}
</script>

<main class="container mx-auto max-w-3xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Unit Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between length, weight, temperature, data size, and time units.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Input</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="cat">Category</Label>
					<Select.Root type="single" bind:value={category as never}>
						<Select.Trigger id="cat" class="w-full">{categoryLabels[category]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(categoryLabels) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label for="from">From</Label>
					<Select.Root type="single" bind:value={fromKey}>
						<Select.Trigger id="from" class="w-full">
							{units.find((u) => u.key === fromKey)?.label ?? fromKey}
						</Select.Trigger>
						<Select.Content>
							{#each units as u (u.key)}
								<Select.Item value={u.key}>{u.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label for="value">Value</Label>
					<Input id="value" type="number" bind:value class="font-mono" />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Conversions</Card.Title>
		</Card.Header>
		<Card.Content>
			<dl class="divide-y">
				{#each conversions as c (c.key)}
					{@const formatted = format(c.value)}
					<div class="flex items-center justify-between gap-3 py-2">
						<dt class="text-sm">{c.label}</dt>
						<div class="flex items-center gap-2">
							<dd class="font-mono text-sm">{formatted}</dd>
							<Button variant="ghost" size="sm" onclick={() => copy(c.key, formatted)}>
								{#if copied === c.key}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					</div>
				{/each}
			</dl>
		</Card.Content>
	</Card.Root>
</main>
