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
	import { slugify } from "$lib/slugify";

	let input = $state("Hello, World! — A 가이드 for Slug Generation");
	let separator = $state("-");
	let lowercase = $state(true);
	let stripStopwords = $state(false);
	let maxLength = $state(0);

	const sepLabels: Record<string, string> = {
		"-": "Hyphen (-)",
		"_": "Underscore (_)",
		".": "Dot (.)",
		"": "(none)"
	};

	let slug = $derived(
		slugify(input, {
			separator,
			lowercase,
			stripStopwords,
			maxLength: maxLength > 0 ? maxLength : null
		})
	);

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(slug);
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
		<h1 class="text-3xl font-bold tracking-tight">Slugify</h1>
		<p class="text-muted-foreground mt-1">
			Turn any text into a URL-friendly slug. Unicode is normalized and diacritics removed.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Input</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Textarea bind:value={input} class="min-h-24 font-mono text-sm" />

			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="sep">Separator</Label>
					<Select.Root type="single" bind:value={separator}>
						<Select.Trigger id="sep" class="w-full">{sepLabels[separator] ?? separator}</Select.Trigger>
						<Select.Content>
							<Select.Item value="-">Hyphen (-)</Select.Item>
							<Select.Item value="_">Underscore (_)</Select.Item>
							<Select.Item value=".">Dot (.)</Select.Item>
							<Select.Item value="">(none)</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label for="maxlen">Max length (0 = unlimited)</Label>
					<Input id="maxlen" type="number" min="0" max="500" bind:value={maxLength} />
				</div>
			</div>

			<div class="grid gap-2 sm:grid-cols-2 text-sm">
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={lowercase} class="h-4 w-4 rounded border" />
					Lowercase
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={stripStopwords} class="h-4 w-4 rounded border" />
					Strip English stopwords
				</label>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Slug</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!slug}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<p class="bg-muted rounded-md p-3 font-mono text-sm break-all">{slug || "—"}</p>
			<p class="text-muted-foreground mt-2 text-xs">{slug.length} characters</p>
		</Card.Content>
	</Card.Root>
</main>
