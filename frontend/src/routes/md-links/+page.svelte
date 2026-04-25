<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const SAMPLE = `# Sample document

Visit our [website](https://example.com) and check out the
[docs](https://example.com/docs "Documentation").

Reference style: [API][api]
[api]: https://api.example.com

Bare URL: <https://github.com> and another https://example.org/path?q=1

Image: ![Logo](https://example.com/logo.png)

Email: <hello@example.com>`;

	let input = $state(SAMPLE);

	type Link = { kind: "inline" | "image" | "ref" | "auto" | "raw"; text: string; url: string; title?: string };

	let links = $derived.by(() => {
		const out: Link[] = [];
		const seen = new Set<string>();

		// Reference definitions: [id]: url "title"
		const refs = new Map<string, { url: string; title?: string }>();
		const refDefRe = /^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+"([^"]*)")?$/gm;
		let m: RegExpExecArray | null;
		while ((m = refDefRe.exec(input)) !== null) {
			refs.set(m[1].toLowerCase(), { url: m[2], title: m[3] });
		}

		// Inline images
		const imgRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
		while ((m = imgRe.exec(input)) !== null) {
			out.push({ kind: "image", text: m[1], url: m[2], title: m[3] });
		}

		// Inline links (excluding images)
		const inlineRe = /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
		while ((m = inlineRe.exec(input)) !== null) {
			out.push({ kind: "inline", text: m[1], url: m[2], title: m[3] });
		}

		// Reference-style links: [text][id]
		const refUseRe = /\[([^\]]+)\]\[([^\]]*)\]/g;
		while ((m = refUseRe.exec(input)) !== null) {
			const id = (m[2] || m[1]).toLowerCase();
			const def = refs.get(id);
			if (def) out.push({ kind: "ref", text: m[1], url: def.url, title: def.title });
		}

		// Autolinks <https://...>
		const autoRe = /<((?:https?|mailto):[^>\s]+)>/g;
		while ((m = autoRe.exec(input)) !== null) {
			out.push({ kind: "auto", text: m[1], url: m[1] });
		}

		// Bare URLs
		const bareRe = /(?:^|[\s])(https?:\/\/[^\s<>\)\]"]+)/g;
		while ((m = bareRe.exec(input)) !== null) {
			out.push({ kind: "raw", text: m[1], url: m[1] });
		}

		// Dedupe by kind+url
		const filtered: Link[] = [];
		for (const l of out) {
			const key = `${l.kind}::${l.url}::${l.text}`;
			if (seen.has(key)) continue;
			seen.add(key);
			filtered.push(l);
		}
		return filtered;
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function copyAllUrls() {
		copy("all", links.map((l) => l.url).join("\n"));
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Link Extractor</h1>
		<p class="text-muted-foreground mt-1">
			Pull out inline, reference, autolink, and bare URLs from Markdown text.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Markdown</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-48 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Links ({links.length})</Card.Title>
			<Button variant="outline" size="sm" onclick={copyAllUrls} disabled={!links.length}>
				{#if copied === "all"}<Check />Copied{:else}<Copy />Copy URLs{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			{#if links.length === 0}
				<p class="text-muted-foreground text-sm">No links found.</p>
			{:else}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="px-2 py-2">Kind</th>
							<th class="px-2 py-2">Text</th>
							<th class="px-2 py-2">URL</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each links as l, i (i)}
							<tr class="border-b last:border-0">
								<td class="px-2 py-1 font-mono text-xs">{l.kind}</td>
								<td class="px-2 py-1 break-all">{l.text}</td>
								<td class="px-2 py-1 font-mono text-xs break-all">
									<a href={l.url} target="_blank" rel="noopener" class="text-primary underline">
										{l.url}
									</a>
								</td>
								<td class="px-2 py-1 text-right">
									<Button variant="ghost" size="sm" onclick={() => copy(`l${i}`, l.url)}>
										{#if copied === `l${i}`}<Check />{:else}<Copy />{/if}
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
