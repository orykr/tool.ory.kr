<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(`# Title

This is a **bold** paragraph with *italic*, ~~strikethrough~~, and \`inline code\`.

[Link text](https://example.com) and ![image](https://example.com/img.png).

> A blockquote line.
> Another quote line.

- bullet one
- bullet two
  - nested

1. first
2. second

\`\`\`js
const x = 1;
\`\`\`

| Col A | Col B |
| ----- | ----- |
| 1     | one   |

A horizontal rule:

---

End.`);

	let stripped = $derived.by(() => {
		let s = input;
		// Remove fenced code blocks (preserve content)
		s = s.replace(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/gm, "$1");
		// HTML comments
		s = s.replace(/<!--[\s\S]*?-->/g, "");
		// Reference-style link defs
		s = s.replace(/^\s*\[[^\]]+\]:\s*.+$/gm, "");
		// Images: ![alt](url) -> alt
		s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
		// Inline links: [text](url) -> text
		s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
		// Reference links: [text][id] -> text
		s = s.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
		// Autolinks: <https://...>
		s = s.replace(/<((?:https?|mailto):[^>\s]+)>/g, "$1");
		// Headings
		s = s.replace(/^#{1,6}\s+/gm, "");
		// Blockquote markers
		s = s.replace(/^\s*>\s?/gm, "");
		// List markers
		s = s.replace(/^(\s*)[-*+]\s+/gm, "$1");
		s = s.replace(/^(\s*)\d+\.\s+/gm, "$1");
		// Bold/italic/strikethrough
		s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
		s = s.replace(/__([^_]+)__/g, "$1");
		s = s.replace(/\*([^*]+)\*/g, "$1");
		s = s.replace(/_([^_]+)_/g, "$1");
		s = s.replace(/~~([^~]+)~~/g, "$1");
		// Inline code
		s = s.replace(/`([^`]+)`/g, "$1");
		// Tables: keep cell text only
		s = s.replace(/^\s*\|.*$/gm, (line) =>
			line
				.replace(/^\s*\|/, "")
				.replace(/\|\s*$/, "")
				.split("|")
				.map((c) => c.trim())
				.filter(Boolean)
				.join(" ")
		);
		// Table separator lines
		s = s.replace(/^\s*[-:|\s]+$/gm, "");
		// Horizontal rules
		s = s.replace(/^[-*_]{3,}$/gm, "");
		// Collapse extra blank lines
		s = s.replace(/\n{3,}/g, "\n\n").trim();
		return s;
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Stripper</h1>
		<p class="text-muted-foreground mt-1">
			Strip Markdown formatting and produce plain text suitable for snippets, summaries, or word counts.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Markdown</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
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
				<Textarea value={stripped} readonly class="min-h-96 text-sm" />
			</Card.Content>
		</Card.Root>
	</div>
</main>
