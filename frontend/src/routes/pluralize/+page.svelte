<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { pluralize, singularize } from "$lib/pluralize";

	let input = $state("apple\nchild\nperson\nmouse\nphenomenon\nseries\nbox\ncrisis");

	let result = $derived.by(() => {
		const words = input.split(/\r?\n/);
		return words.map((w) => ({
			word: w,
			plural: pluralize(w),
			singular: singularize(w)
		}));
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">English Pluralizer</h1>
		<p class="text-muted-foreground mt-1">
			Convert English nouns between singular and plural forms (handles irregulars).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Words (one per line)</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="overflow-x-auto pt-6">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Input</th>
						<th class="px-2 py-2">Plural</th>
						<th class="px-2 py-2">Singular</th>
					</tr>
				</thead>
				<tbody>
					{#each result as r, i (i + r.word)}
						{#if r.word.trim()}
							<tr class="border-b last:border-0">
								<td class="px-2 py-1 font-mono">{r.word}</td>
								<td class="px-2 py-1 font-mono">
									<span class="inline-flex items-center gap-1">
										{r.plural}
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground"
											onclick={() => copy(`p${i}`, r.plural)}
										>
											{#if copied === `p${i}`}<Check class="h-3 w-3" />{:else}<Copy class="h-3 w-3" />{/if}
										</button>
									</span>
								</td>
								<td class="px-2 py-1 font-mono">
									<span class="inline-flex items-center gap-1">
										{r.singular}
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground"
											onclick={() => copy(`s${i}`, r.singular)}
										>
											{#if copied === `s${i}`}<Check class="h-3 w-3" />{:else}<Copy class="h-3 w-3" />{/if}
										</button>
									</span>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</main>
