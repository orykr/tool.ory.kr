<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import DOMPurify from "dompurify";

	const SAMPLE = `<h1>Hello, world!</h1>
<p>This is a <strong>preview</strong> with <em>some</em> formatting.</p>
<ul>
  <li>Item one</li>
  <li>Item <a href="https://example.com">two</a></li>
</ul>
<p>Inline <code>code</code> example:</p>
<pre><code>const x = 1;</code></pre>
<blockquote>A quoted block.</blockquote>
<table>
  <thead><tr><th>A</th><th>B</th></tr></thead>
  <tbody><tr><td>1</td><td>2</td></tr></tbody>
</table>
<!-- The following script is stripped by DOMPurify -->
<script>alert("xss")</script>
<img src="x" onerror="alert('xss')" alt="broken">`;

	let input = $state(SAMPLE);
	let strict = $state(true);
	let copied = $state(false);

	let sanitized = $derived.by(() => {
		try {
			if (typeof window === "undefined") return input;
			if (strict) {
				return DOMPurify.sanitize(input, {
					ALLOWED_TAGS: [
						"a", "p", "br", "hr", "strong", "em", "code", "pre", "blockquote",
						"ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
						"img", "table", "thead", "tbody", "tr", "td", "th", "div", "span"
					],
					ALLOWED_ATTR: ["href", "src", "alt", "title", "class"]
				});
			}
			return DOMPurify.sanitize(input);
		} catch (e) {
			return `<pre class="text-destructive">${(e as Error).message}</pre>`;
		}
	});

	async function copySanitized() {
		await navigator.clipboard.writeText(sanitized);
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
		<h1 class="text-3xl font-bold tracking-tight">HTML Preview</h1>
		<p class="text-muted-foreground mt-1">
			Render HTML in real time. Output is sanitized via DOMPurify; scripts are removed.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-center gap-3 pt-6 text-sm">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={strict} class="h-4 w-4 rounded border" />
				Strict tag allowlist (recommended)
			</label>
			<span class="text-muted-foreground text-xs">
				All output is sanitized — never trust user-submitted HTML in production.
			</span>
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
				<Card.Title class="text-base">Sanitized preview</Card.Title>
				<Button variant="ghost" size="sm" onclick={copySanitized}>
					{#if copied}<Check />Copied{:else}<Copy />Copy HTML{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<div class="html-preview min-h-96 overflow-auto rounded-md border p-4 text-sm">
					{@html sanitized}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>

<style>
	.html-preview :global(h1) {
		font-size: 1.4rem;
		font-weight: 700;
		margin: 0.6rem 0;
	}
	.html-preview :global(h2) {
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0.5rem 0;
	}
	.html-preview :global(h3) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.4rem 0;
	}
	.html-preview :global(p) {
		margin: 0.4rem 0;
	}
	.html-preview :global(ul),
	.html-preview :global(ol) {
		padding-left: 1.4rem;
		margin: 0.3rem 0;
	}
	.html-preview :global(a) {
		color: var(--primary);
		text-decoration: underline;
	}
	.html-preview :global(code) {
		background: var(--muted);
		padding: 0.1rem 0.3rem;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
	}
	.html-preview :global(pre) {
		background: var(--muted);
		padding: 0.6rem;
		border-radius: 6px;
		overflow-x: auto;
	}
	.html-preview :global(blockquote) {
		border-left: 3px solid var(--border);
		padding-left: 0.7rem;
		color: var(--muted-foreground);
	}
	.html-preview :global(table) {
		border-collapse: collapse;
		margin: 0.4rem 0;
	}
	.html-preview :global(th),
	.html-preview :global(td) {
		border: 1px solid var(--border);
		padding: 0.3rem 0.5rem;
	}
	.html-preview :global(img) {
		max-width: 100%;
	}
</style>
