<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { marked } from "marked";
	import DOMPurify from "dompurify";

	const SAMPLE = `# Markdown Preview

A live, **client-side** preview of your Markdown.

## Features

- Lists, *italic*, **bold**, ~~strikethrough~~
- Inline \`code\`
- [Links](https://tool.ory.kr)

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}!\`;
greet("world");
\`\`\`

> Quoted block.

| Col A | Col B |
| ----- | ----- |
| 1     | One   |
| 2     | Two   |
`;

	let input = $state(SAMPLE);
	let copied = $state(false);

	marked.setOptions({ gfm: true, breaks: false });

	let html = $derived.by(() => {
		try {
			const raw = marked.parse(input, { async: false }) as string;
			if (typeof window === "undefined") return raw;
			return DOMPurify.sanitize(raw);
		} catch (e) {
			return `<pre class="text-destructive">${(e as Error).message}</pre>`;
		}
	});

	async function copyHtml() {
		await navigator.clipboard.writeText(html);
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Preview</h1>
		<p class="text-muted-foreground mt-1">
			GitHub-flavored Markdown rendered live with DOMPurify sanitization.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Markdown</Card.Title>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-[32rem] font-mono text-sm" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Preview</Card.Title>
				<Button variant="ghost" size="sm" onclick={copyHtml} disabled={!html}>
					{#if copied}<Check />Copied HTML{:else}<Copy />Copy HTML{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<div
					class="md-preview min-h-[32rem] overflow-x-auto rounded-md border p-4 text-sm leading-relaxed"
				>
					{@html html}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>

<style>
	.md-preview :global(h1) {
		font-size: 1.6rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.4rem;
	}
	.md-preview :global(h2) {
		font-size: 1.3rem;
		font-weight: 700;
		margin-top: 1.25rem;
		margin-bottom: 0.6rem;
	}
	.md-preview :global(h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.4rem;
	}
	.md-preview :global(p) {
		margin: 0.5rem 0;
	}
	.md-preview :global(ul),
	.md-preview :global(ol) {
		padding-left: 1.4rem;
		margin: 0.4rem 0;
	}
	.md-preview :global(li) {
		margin: 0.15rem 0;
	}
	.md-preview :global(code) {
		background-color: var(--muted);
		padding: 0.1rem 0.3rem;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.85em;
	}
	.md-preview :global(pre) {
		background-color: var(--muted);
		padding: 0.75rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 0.6rem 0;
	}
	.md-preview :global(pre code) {
		background-color: transparent;
		padding: 0;
	}
	.md-preview :global(blockquote) {
		border-left: 3px solid var(--border);
		padding-left: 0.75rem;
		color: var(--muted-foreground);
		margin: 0.6rem 0;
	}
	.md-preview :global(a) {
		color: var(--primary);
		text-decoration: underline;
	}
	.md-preview :global(table) {
		border-collapse: collapse;
		margin: 0.6rem 0;
	}
	.md-preview :global(th),
	.md-preview :global(td) {
		border: 1px solid var(--border);
		padding: 0.4rem 0.6rem;
	}
	.md-preview :global(th) {
		background-color: var(--muted);
	}
	.md-preview :global(hr) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 1rem 0;
	}
	.md-preview :global(img) {
		max-width: 100%;
	}
</style>
