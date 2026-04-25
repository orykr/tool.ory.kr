<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state("listen");
	let dictionary = $state(
		"silent\nelisten\ninlets\ntinsel\nlistens\nlasso\nresort\nsorter\nroster\nstone\ntones\nnotes\nonset\nseton\nsteno\ndusty\nstudy\ndiary\ndairy"
	);
	let caseInsensitive = $state(true);

	function key(s: string): string {
		const cleaned = s.replace(/[^A-Za-z]/g, "");
		const value = caseInsensitive ? cleaned.toLowerCase() : cleaned;
		return value.split("").sort().join("");
	}

	let inputKey = $derived(key(input));

	let matches = $derived.by(() => {
		const target = inputKey;
		const inputClean = caseInsensitive ? input.replace(/[^A-Za-z]/g, "").toLowerCase() : input.replace(/[^A-Za-z]/g, "");
		return dictionary
			.split(/\r?\n/)
			.map((w) => w.trim())
			.filter((w) => w && key(w) === target)
			.filter((w) => {
				const cleaned = caseInsensitive ? w.replace(/[^A-Za-z]/g, "").toLowerCase() : w.replace(/[^A-Za-z]/g, "");
				return cleaned !== inputClean;
			});
	});

	function* permute(arr: string[]): Generator<string[]> {
		if (arr.length <= 1) {
			yield arr;
			return;
		}
		for (let i = 0; i < arr.length; i++) {
			const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
			for (const p of permute(rest)) yield [arr[i], ...p];
		}
	}

	let permutations = $derived.by(() => {
		const raw = input.replace(/[^A-Za-z]/g, "");
		const cleaned = caseInsensitive ? raw.toLowerCase() : raw;
		if (!cleaned) return [];
		if (cleaned.length > 8) return null;
		const set = new Set<string>();
		for (const p of permute(cleaned.split(""))) {
			set.add(p.join(""));
		}
		return Array.from(set).sort();
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
		<h1 class="text-3xl font-bold tracking-tight">Anagram Finder</h1>
		<p class="text-muted-foreground mt-1">
			Find anagrams of a word against a custom dictionary, plus enumerate all letter permutations.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="w">Word or phrase</Label>
				<Input id="w" bind:value={input} class="font-mono" />
			</div>
			<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={caseInsensitive} class="h-4 w-4 rounded border" />
				Case-insensitive (recommended)
			</label>
			<p class="text-muted-foreground text-xs">
				Sorted-letter key: <span class="font-mono">{inputKey || "(empty)"}</span>
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Dictionary (one word per line)</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea bind:value={dictionary} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Dictionary matches ({matches.length})</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if matches.length === 0}
				<p class="text-muted-foreground text-sm">
					No anagrams found in the dictionary.
				</p>
			{:else}
				<div class="flex flex-wrap gap-1">
					{#each matches as m, i (i + m)}
						<button
							type="button"
							class="bg-muted hover:bg-foreground/10 rounded border px-2 py-0.5 font-mono text-sm"
							onclick={() => copy(`m${i}`, m)}
						>
							{m}{#if copied === `m${i}`}<Check class="ml-1 inline h-3 w-3" />{/if}
						</button>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">
				All letter permutations
				{#if permutations}({permutations.length}){/if}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if permutations === null}
				<p class="text-muted-foreground text-sm">
					Word too long to enumerate (≤ 8 letters supported here).
				</p>
			{:else if permutations.length === 0}
				<p class="text-muted-foreground text-sm">No letters.</p>
			{:else}
				<pre class="bg-muted max-h-64 overflow-auto rounded-md p-3 font-mono text-xs">{permutations.join(" ")}</pre>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
