<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let leftInput = $state("apple\nbanana\ncherry\ndate\nelderberry");
	let rightInput = $state("banana\ncherry\nfig\ngrape");
	let trim = $state(true);
	let caseInsensitive = $state(false);
	let dedup = $state(true);

	function lines(text: string): string[] {
		let arr = text.split(/\r?\n/);
		if (trim) arr = arr.map((l) => l.trim());
		arr = arr.filter((l) => l.length > 0);
		if (caseInsensitive) arr = arr.map((l) => l.toLowerCase());
		if (dedup) {
			const seen = new Set<string>();
			arr = arr.filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
		}
		return arr;
	}

	let left = $derived(lines(leftInput));
	let right = $derived(lines(rightInput));

	let union = $derived.by(() => {
		const seen = new Set<string>();
		const result: string[] = [];
		for (const l of [...left, ...right]) {
			if (!seen.has(l)) {
				seen.add(l);
				result.push(l);
			}
		}
		return result;
	});

	let intersection = $derived.by(() => {
		const rightSet = new Set(right);
		return left.filter((l) => rightSet.has(l));
	});

	let leftOnly = $derived.by(() => {
		const rightSet = new Set(right);
		return left.filter((l) => !rightSet.has(l));
	});

	let rightOnly = $derived.by(() => {
		const leftSet = new Set(left);
		return right.filter((l) => !leftSet.has(l));
	});

	let symmetric = $derived([...leftOnly, ...rightOnly]);

	let copied = $state<string | null>(null);
	async function copy(key: string, list: string[]) {
		await navigator.clipboard.writeText(list.join("\n"));
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Set Operations</h1>
		<p class="text-muted-foreground mt-1">
			Union, intersection, and difference of two line-based lists.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap gap-4 pt-6 text-sm">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={trim} class="h-4 w-4 rounded border" />
				Trim each line
			</label>
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={caseInsensitive} class="h-4 w-4 rounded border" />
				Case-insensitive
			</label>
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={dedup} class="h-4 w-4 rounded border" />
				Deduplicate inputs
			</label>
		</Card.Content>
	</Card.Root>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">List A</Card.Title>
				<span class="text-muted-foreground text-xs">{left.length} items</span>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={leftInput} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">List B</Card.Title>
				<span class="text-muted-foreground text-xs">{right.length} items</span>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={rightInput} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-3 md:grid-cols-2">
		{#each [
			{ k: "union", title: `A ∪ B (${union.length})`, list: union },
			{ k: "intersection", title: `A ∩ B (${intersection.length})`, list: intersection },
			{ k: "leftOnly", title: `A \\ B (${leftOnly.length})`, list: leftOnly },
			{ k: "rightOnly", title: `B \\ A (${rightOnly.length})`, list: rightOnly },
			{ k: "symmetric", title: `A △ B (${symmetric.length})`, list: symmetric }
		] as op (op.k)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">{op.title}</Card.Title>
					<Button variant="ghost" size="sm" onclick={() => copy(op.k, op.list)} disabled={!op.list.length}>
						{#if copied === op.k}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre class="bg-muted max-h-48 overflow-auto rounded-md p-2 font-mono text-xs">{op.list.join("\n") || "(empty)"}</pre>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
