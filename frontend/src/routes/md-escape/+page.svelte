<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let mode = $state<"escape" | "unescape">("escape");
	let input = $state("Use _underscores_ and **asterisks** for emphasis. Hash header: # Title");

	const ESCAPE_CHARS = ["\\", "`", "*", "_", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!", "|", ">", "<"];

	function escapeMd(s: string): string {
		let out = "";
		for (const ch of s) {
			if (ESCAPE_CHARS.includes(ch)) out += "\\" + ch;
			else out += ch;
		}
		return out;
	}

	function unescapeMd(s: string): string {
		return s.replace(/\\([\\`*_{}\[\]()#+\-.!|><])/g, "$1");
	}

	let output = $derived(mode === "escape" ? escapeMd(input) : unescapeMd(input));

	function swap() {
		mode = mode === "escape" ? "unescape" : "escape";
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Escape</h1>
		<p class="text-muted-foreground mt-1">
			Escape Markdown special characters to display them literally (or unescape).
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">{mode === "escape" ? "Escape" : "Unescape"}</Card.Title>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
			<div class="flex items-center justify-between">
				<span class="text-muted-foreground text-xs">Output</span>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			<Textarea value={output} readonly class="min-h-32 font-mono text-sm" />
			<p class="text-muted-foreground text-xs">
				Escapes: <code>{ESCAPE_CHARS.join(" ")}</code>
			</p>
		</Card.Content>
	</Card.Root>
</main>
