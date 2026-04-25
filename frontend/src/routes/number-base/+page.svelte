<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { convertFromBase, EMPTY_VALUES, type Base, type BaseValues } from "$lib/number-base";

	const fields: Array<{ base: Base; key: keyof BaseValues; label: string; placeholder: string }> = [
		{ base: 2, key: "bin", label: "Binary (base 2)", placeholder: "1010" },
		{ base: 8, key: "oct", label: "Octal (base 8)", placeholder: "12" },
		{ base: 10, key: "dec", label: "Decimal (base 10)", placeholder: "10" },
		{ base: 16, key: "hex", label: "Hexadecimal (base 16)", placeholder: "A" }
	];

	let values = $state<BaseValues>({ ...EMPTY_VALUES });
	let error = $state<string | null>(null);
	let copiedKey = $state<keyof BaseValues | null>(null);
	let lastEdited: keyof BaseValues | null = null;

	function handleInput(key: keyof BaseValues, base: Base) {
		lastEdited = key;
		const raw = values[key];
		const result = convertFromBase(raw, base);
		if ("error" in result) {
			error = result.error;
			return;
		}
		error = null;
		const next = { ...values };
		(Object.keys(next) as Array<keyof BaseValues>).forEach((k) => {
			if (k !== key) next[k] = result[k];
		});
		values = next;
	}

	function clearAll() {
		values = { ...EMPTY_VALUES };
		error = null;
	}

	async function copy(key: keyof BaseValues) {
		const v = values[key];
		if (!v) return;
		await navigator.clipboard.writeText(v);
		copiedKey = key;
		setTimeout(() => (copiedKey = null), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Number Base Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between binary, octal, decimal, and hex. Supports arbitrary-precision integers and
			negative numbers.
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Values</Card.Title>
			<Button variant="ghost" size="sm" onclick={clearAll}>Clear</Button>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each fields as field (field.base)}
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<Label for={`base-${field.base}`}>{field.label}</Label>
						<Button variant="ghost" size="sm" onclick={() => copy(field.key)} disabled={!values[field.key]}>
							{#if copiedKey === field.key}
								<Check />
								Copied
							{:else}
								<Copy />
								Copy
							{/if}
						</Button>
					</div>
					<Input
						id={`base-${field.base}`}
						bind:value={values[field.key]}
						oninput={() => handleInput(field.key, field.base)}
						placeholder={field.placeholder}
						class="font-mono"
						spellcheck={false}
						autocomplete="off"
					/>
				</div>
			{/each}

			{#if error}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{error}
				</div>
			{/if}

			<p class="text-muted-foreground text-xs">
				Prefixes <code>0b</code>, <code>0o</code>, <code>0x</code> are accepted on input.
			</p>
		</Card.Content>
	</Card.Root>
</main>
