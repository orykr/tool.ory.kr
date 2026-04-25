<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import TurndownService from "turndown";

	const SAMPLE = `<h1>Title</h1>
<p>This is a <strong>bold</strong> paragraph with a <a href="https://example.com">link</a>.</p>
<ul><li>Item one</li><li>Item two</li></ul>
<pre><code>const x = 1;</code></pre>
<blockquote><p>Quoted text.</p></blockquote>
<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>`;

	let input = $state(SAMPLE);
	let headingStyle = $state<"setext" | "atx">("atx");
	let bulletMarker = $state<"-" | "*" | "+">("-");
	let codeBlockStyle = $state<"fenced" | "indented">("fenced");
	let copied = $state(false);

	let output = $derived.by(() => {
		try {
			const td = new TurndownService({
				headingStyle,
				bulletListMarker: bulletMarker,
				codeBlockStyle
			});
			return { ok: true as const, value: td.turndown(input) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

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
		<h1 class="text-3xl font-bold tracking-tight">HTML → Markdown</h1>
		<p class="text-muted-foreground mt-1">
			Convert HTML to Markdown using Turndown.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="hs">Heading style</Label>
				<Select.Root type="single" bind:value={headingStyle as never}>
					<Select.Trigger id="hs" class="w-full">{headingStyle}</Select.Trigger>
					<Select.Content>
						<Select.Item value="atx">ATX (#)</Select.Item>
						<Select.Item value="setext">Setext (===)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="bm">List marker</Label>
				<Select.Root type="single" bind:value={bulletMarker as never}>
					<Select.Trigger id="bm" class="w-full">{bulletMarker}</Select.Trigger>
					<Select.Content>
						<Select.Item value="-">Hyphen (-)</Select.Item>
						<Select.Item value="*">Asterisk (*)</Select.Item>
						<Select.Item value="+">Plus (+)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="cs">Code blocks</Label>
				<Select.Root type="single" bind:value={codeBlockStyle as never}>
					<Select.Trigger id="cs" class="w-full">{codeBlockStyle}</Select.Trigger>
					<Select.Content>
						<Select.Item value="fenced">Fenced (```)</Select.Item>
						<Select.Item value="indented">Indented (4 spaces)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">HTML</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Markdown</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok}>
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
