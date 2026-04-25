<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import JSON5 from "json5";

	let input = $state(`// Loose JS-style object — JSON5 is accepted
const config = {
  name: 'app',
  version: 1.0,
  port: 0xff,
  features: ['fast', 'safe',], // trailing comma OK
  meta: { author: "Ada", tags: ['math', 'cs'] },
  active: true,
  notes: \`multi
line\`,
}`);

	function extractValue(src: string): string {
		// strip leading "const x = " / "let x = " / "var x = " / "export default" / "module.exports = "
		let s = src.trim();
		s = s.replace(/^module\.exports\s*=\s*/, "");
		s = s.replace(/^export\s+default\s+/, "");
		s = s.replace(/^(?:const|let|var)\s+[\w$]+\s*=\s*/, "");
		s = s.replace(/;[\s\n]*$/, "");
		return s;
	}

	let output = $derived.by(() => {
		try {
			const cleaned = extractValue(input);
			if (!cleaned.trim()) return { ok: true as const, value: "" };
			const parsed = JSON5.parse(cleaned);
			return { ok: true as const, value: JSON.stringify(parsed, null, 2) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		if (!output.ok) return;
		await navigator.clipboard.writeText(output.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">JS Object → JSON</h1>
		<p class="text-muted-foreground mt-1">
			Convert relaxed JavaScript object literals (single quotes, comments, trailing commas, hex
			numbers, …) to strict JSON. Strips <code>const</code> / <code>module.exports =</code> /
			<code>export default</code> prefixes.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">JS / JSON5</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Strict JSON</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok || !output.value}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if output.ok}
					<Textarea value={output.value} readonly class="min-h-96 font-mono text-sm" />
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{output.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
