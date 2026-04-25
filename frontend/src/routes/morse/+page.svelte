<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { textToMorse, morseToText } from "$lib/morse";

	let mode = $state<"encode" | "decode">("encode");
	let input = $state("Hello world");
	let output = $derived(mode === "encode" ? textToMorse(input) : morseToText(input));

	function swap() {
		mode = mode === "encode" ? "decode" : "encode";
		input = output;
	}

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
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
		<h1 class="text-3xl font-bold tracking-tight">Morse Code</h1>
		<p class="text-muted-foreground mt-1">
			Translate between text and Morse code (international standard).
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">{mode === "encode" ? "Text → Morse" : "Morse → Text"}</Card.Title>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-1.5">
				<Label for="m-input">Input</Label>
				<Textarea id="m-input" bind:value={input} class="min-h-24 font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label for="m-output">Output</Label>
					<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<Textarea id="m-output" value={output} readonly class="min-h-24 font-mono text-sm" />
			</div>

			{#if mode === "decode"}
				<p class="text-muted-foreground text-xs">
					Letters separated by single spaces, words by 3+ spaces or <code>/</code>.
				</p>
			{:else}
				<p class="text-muted-foreground text-xs">
					Unsupported characters are silently dropped.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
