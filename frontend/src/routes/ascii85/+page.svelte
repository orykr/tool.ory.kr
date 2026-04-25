<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { ascii85Encode, ascii85Decode, bytesToText, textToBytes } from "$lib/ascii85";

	let mode = $state<"encode" | "decode">("encode");
	let wrap = $state(true);
	let input = $state("Hello, world!");

	let output = $derived.by(() => {
		try {
			if (mode === "encode") return { ok: true as const, value: ascii85Encode(textToBytes(input), wrap) };
			return { ok: true as const, value: bytesToText(ascii85Decode(input)) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	function swap() {
		mode = mode === "encode" ? "decode" : "encode";
		if (output.ok) input = output.value;
	}

	let copied = $state(false);
	async function copy() {
		if (!output.ok) return;
		await navigator.clipboard.writeText(output.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Ascii85 (Base85)</h1>
		<p class="text-muted-foreground mt-1">
			Encode and decode bytes using the Adobe Ascii85 alphabet (with <code>&lt;~ ... ~&gt;</code> wrappers and <code>z</code> shorthand).
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">{mode === "encode" ? "Encode" : "Decode"}</Card.Title>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#if mode === "encode"}
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={wrap} class="h-4 w-4 rounded border" />
					Wrap with <code class="ml-1">&lt;~ ... ~&gt;</code>
				</label>
			{/if}

			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />

			<div class="flex items-center justify-between">
				<span class="text-muted-foreground text-xs">Output</span>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			{#if output.ok}
				<Textarea value={output.value} readonly class="min-h-32 font-mono text-sm" />
			{:else}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{output.error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
