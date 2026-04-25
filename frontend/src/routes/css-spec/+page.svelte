<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import { calculateSpecificity } from "$lib/css-spec";

	let input = $state(
		`#main .article a:hover
nav ul li:nth-child(2) a
[type="text"]:focus
:is(h1, h2, h3) + p
.btn:not(.disabled)
*`
	);

	let lines = $derived(input.split(/\r?\n/).filter((l) => l.trim()));
	let results = $derived(
		lines.map((sel) => ({ selector: sel.trim(), spec: calculateSpecificity(sel) }))
	);

	function rank(spec: { a: number; b: number; c: number }): number {
		return spec.a * 10000 + spec.b * 100 + spec.c;
	}

	let sorted = $derived([...results].sort((x, y) => rank(y.spec) - rank(x.spec)));
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
		<h1 class="text-3xl font-bold tracking-tight">CSS Specificity Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Compute specificity (a,b,c) for selectors. Higher tuples win the cascade.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Selectors (one per line)</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Results (sorted by specificity)</Card.Title>
		</Card.Header>
		<Card.Content>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Selector</th>
						<th class="px-2 py-2">a (IDs)</th>
						<th class="px-2 py-2">b (classes)</th>
						<th class="px-2 py-2">c (types)</th>
						<th class="px-2 py-2">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as r, i (i + r.selector)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1 font-mono break-all">{r.selector}</td>
							<td class="px-2 py-1 font-mono">{r.spec.a}</td>
							<td class="px-2 py-1 font-mono">{r.spec.b}</td>
							<td class="px-2 py-1 font-mono">{r.spec.c}</td>
							<td class="px-2 py-1 font-mono font-semibold">{r.spec.total}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="text-muted-foreground mt-3 text-xs">
				a = ID selectors · b = classes / attributes / pseudo-classes · c = type selectors / pseudo-elements.
				<code>:where()</code> contributes 0; <code>:is()</code> uses the highest variant; <code>:not()</code> uses its argument's specificity.
			</p>
		</Card.Content>
	</Card.Root>
</main>
