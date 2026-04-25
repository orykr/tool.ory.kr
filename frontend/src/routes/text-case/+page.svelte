<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import {
		toCamel,
		toPascal,
		toSnake,
		toScreamingSnake,
		toKebab,
		toTitle,
		toSentence,
		toUpper,
		toLower,
		reverse
	} from "$lib/text-case";

	let input = $state("hello world example");

	const conversions: Array<{ key: string; label: string; fn: (s: string) => string }> = [
		{ key: "camel", label: "camelCase", fn: toCamel },
		{ key: "pascal", label: "PascalCase", fn: toPascal },
		{ key: "snake", label: "snake_case", fn: toSnake },
		{ key: "screaming", label: "SCREAMING_SNAKE_CASE", fn: toScreamingSnake },
		{ key: "kebab", label: "kebab-case", fn: toKebab },
		{ key: "title", label: "Title Case", fn: toTitle },
		{ key: "sentence", label: "Sentence case", fn: toSentence },
		{ key: "upper", label: "UPPERCASE", fn: toUpper },
		{ key: "lower", label: "lowercase", fn: toLower },
		{ key: "reverse", label: "Reversed", fn: reverse }
	];

	let stats = $derived.by(() => {
		const characters = input.length;
		const charactersNoSpaces = input.replace(/\s/g, "").length;
		const words = input.trim() ? input.trim().split(/\s+/).length : 0;
		const lines = input.split(/\r?\n/).length;
		return { characters, charactersNoSpaces, words, lines };
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Text Case Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between camelCase, snake_case, kebab-case, and more, with text statistics.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Input</Card.Title>
			<Button variant="ghost" size="sm" onclick={() => (input = "")} disabled={!input}>
				<Trash2 />
				Clear
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
			<div class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
				<span>{stats.characters} chars</span>
				<span>{stats.charactersNoSpaces} chars (no spaces)</span>
				<span>{stats.words} words</span>
				<span>{stats.lines} lines</span>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-3 md:grid-cols-2">
		{#each conversions as conv (conv.key)}
			{@const value = conv.fn(input)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-3">
					<Card.Title class="text-sm">{conv.label}</Card.Title>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => copy(conv.key, value)}
						disabled={!value}
					>
						{#if copied === conv.key}
							<Check />
						{:else}
							<Copy />
						{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<p class="bg-muted rounded-md p-2 font-mono text-sm break-all">{value || "—"}</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
