<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { inspectChar, splitChars, fromCodePoint } from "$lib/unicode";

	let input = $state("Hello, 한국어! 🚀");
	let cpInput = $state("U+1F680");

	let chars = $derived(splitChars(input).map((c) => inspectChar(c)));
	let cpChar = $derived(fromCodePoint(cpInput));

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function fmtBytes(bytes: number[]): string {
		return bytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
	}

	function fmtUnits(units: number[]): string {
		return units.map((u) => u.toString(16).padStart(4, "0").toUpperCase()).join(" ");
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
		<h1 class="text-3xl font-bold tracking-tight">Unicode Inspector</h1>
		<p class="text-muted-foreground mt-1">
			Inspect each character's code point, UTF-8/16 encoding, HTML/JS escapes, and Unicode block.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Text</Card.Title></Card.Header>
		<Card.Content>
			<Input bind:value={input} class="font-mono" />
			<p class="text-muted-foreground mt-2 text-xs">
				{chars.length} code points · {input.length} UTF-16 code units
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Characters</Card.Title></Card.Header>
		<Card.Content class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Char</th>
						<th class="px-2 py-2">U+hex</th>
						<th class="px-2 py-2">UTF-8</th>
						<th class="px-2 py-2">UTF-16</th>
						<th class="px-2 py-2">JS</th>
						<th class="px-2 py-2">HTML</th>
						<th class="px-2 py-2">Block</th>
					</tr>
				</thead>
				<tbody>
					{#each chars as c, i (i + c.char)}
						<tr class="border-b font-mono last:border-0">
							<td class="bg-muted/50 px-2 py-1 text-center text-lg">{c.char}</td>
							<td class="px-2 py-1">U+{c.hex}</td>
							<td class="px-2 py-1 text-xs">{fmtBytes(c.utf8Bytes)}</td>
							<td class="px-2 py-1 text-xs">{fmtUnits(c.utf16Units)}</td>
							<td class="px-2 py-1 text-xs">{c.jsEscape}</td>
							<td class="px-2 py-1 text-xs">{c.htmlEntity}</td>
							<td class="text-muted-foreground px-2 py-1 font-sans text-xs">{c.block}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Code Point → Character</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="cp">Code point (U+1F680, 0x1F680, 1F680)</Label>
				<Input id="cp" bind:value={cpInput} class="font-mono" />
			</div>
			{#if cpChar !== null}
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<p class="text-3xl">{cpChar}</p>
					<Button variant="ghost" size="sm" onclick={() => copy("cc", cpChar!)}>
						{#if copied === "cc"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
			{:else if cpInput.trim()}
				<p class="text-destructive text-xs">Invalid code point.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
