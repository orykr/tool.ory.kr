<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import {
		generateWords,
		generateSentences,
		generateParagraphs
	} from "$lib/lorem";

	type Unit = "paragraphs" | "sentences" | "words";
	const labels: Record<Unit, string> = {
		paragraphs: "Paragraphs",
		sentences: "Sentences",
		words: "Words"
	};

	let unit = $state<Unit>("paragraphs");
	let count = $state(3);
	let startsWithLorem = $state(true);
	let output = $state("");
	let copied = $state(false);

	function generate() {
		const safeCount = Math.max(1, Math.min(200, Math.floor(count) || 1));
		if (unit === "words") output = generateWords(safeCount);
		else if (unit === "sentences") output = generateSentences(safeCount);
		else output = generateParagraphs(safeCount, startsWithLorem);
	}

	$effect(() => {
		void unit;
		void startsWithLorem;
		generate();
	});

	async function copyOut() {
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
		<h1 class="text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate placeholder text in paragraphs, sentences, or words.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Options</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="lorem-unit">Unit</Label>
					<Select.Root type="single" bind:value={unit as never}>
						<Select.Trigger id="lorem-unit" class="w-full">{labels[unit]}</Select.Trigger>
						<Select.Content>
							<Select.Item value="paragraphs">Paragraphs</Select.Item>
							<Select.Item value="sentences">Sentences</Select.Item>
							<Select.Item value="words">Words</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label for="lorem-count">Count</Label>
					<Input id="lorem-count" type="number" min="1" max="200" bind:value={count} />
				</div>
			</div>

			{#if unit === "paragraphs"}
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={startsWithLorem} class="h-4 w-4 rounded border" />
					Start with "Lorem ipsum dolor sit amet..."
				</label>
			{/if}

			<div class="flex gap-2">
				<Button onclick={generate}>
					<RefreshCw />
					Generate
				</Button>
				<Button variant="ghost" onclick={copyOut} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Output</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea value={output} readonly class="min-h-72 text-sm leading-relaxed" />
		</Card.Content>
	</Card.Root>
</main>
