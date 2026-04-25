<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(
		`<h1>Hello, World!</h1>
<p>This is a <strong>paragraph</strong> with a <a href="https://example.com">link</a>.</p>
<ul>
  <li>Item one</li>
  <li>Item <em>two</em></li>
</ul>
<script>alert("xss")<\/script>
<style>p { color: red; }</style>
<p>End of document.</p>`
	);

	let preserveLinks = $state(false);
	let collapseSpaces = $state(true);

	let stripped = $derived.by(() => {
		try {
			if (typeof DOMParser === "undefined") return input;
			const parser = new DOMParser();
			const doc = parser.parseFromString(`<body>${input}</body>`, "text/html");
			doc.querySelectorAll("script, style, noscript").forEach((n) => n.remove());

			if (preserveLinks) {
				doc.querySelectorAll("a[href]").forEach((a) => {
					const href = a.getAttribute("href");
					if (href) a.textContent = `${a.textContent ?? ""} (${href})`;
				});
			}

			let text = doc.body?.textContent ?? "";
			if (collapseSpaces) {
				text = text.replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
			}
			return text;
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(stripped);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">HTML Stripper</h1>
		<p class="text-muted-foreground mt-1">
			Extract plain text from HTML. Strips script/style and (optionally) preserves link URLs.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap gap-4 pt-6 text-sm">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={preserveLinks} class="h-4 w-4 rounded border" />
				Append link URLs after anchor text
			</label>
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={collapseSpaces} class="h-4 w-4 rounded border" />
				Collapse whitespace
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">HTML</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Plain text</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={stripped} readonly class="min-h-72 text-sm" />
			</Card.Content>
		</Card.Root>
	</div>
</main>
