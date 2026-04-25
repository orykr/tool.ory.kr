<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const SAMPLE = [
		"# Article",
		"",
		"Banner image:",
		'![Hero banner](https://example.com/hero.jpg "Welcome")',
		"",
		"Some inline image: ![icon](https://example.com/icon.svg)",
		"",
		"Reference style: ![diagram][diag]",
		'[diag]: https://example.com/diagram.png "System diagram"',
		"",
		'HTML image: <img src="https://example.com/photo.jpg" alt="A photo" width="600">'
	].join("\n");

	let input = $state(SAMPLE);

	type Image = { kind: "inline" | "ref" | "html"; alt: string; src: string; title?: string };

	let images = $derived.by(() => {
		const out: Image[] = [];
		const seen = new Set<string>();

		const refs = new Map<string, { url: string; title?: string }>();
		const refDef = /^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+"([^"]*)")?$/gm;
		let m: RegExpExecArray | null;
		while ((m = refDef.exec(input)) !== null) {
			refs.set(m[1].toLowerCase(), { url: m[2], title: m[3] });
		}

		const inlineRe = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
		while ((m = inlineRe.exec(input)) !== null) {
			out.push({ kind: "inline", alt: m[1], src: m[2], title: m[3] });
		}

		const refRe = /!\[([^\]]*)\]\[([^\]]*)\]/g;
		while ((m = refRe.exec(input)) !== null) {
			const id = (m[2] || m[1]).toLowerCase();
			const def = refs.get(id);
			if (def) out.push({ kind: "ref", alt: m[1], src: def.url, title: def.title });
		}

		const htmlRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*?(?:\balt=["']([^"']*)["'][^>]*?)?\/?>/gi;
		while ((m = htmlRe.exec(input)) !== null) {
			out.push({ kind: "html", alt: m[2] ?? "", src: m[1] });
		}

		const filtered: Image[] = [];
		for (const im of out) {
			const key = `${im.kind}::${im.src}::${im.alt}`;
			if (seen.has(key)) continue;
			seen.add(key);
			filtered.push(im);
		}
		return filtered;
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function copyAll() {
		copy("all", images.map((i) => i.src).join("\n"));
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Image Extractor</h1>
		<p class="text-muted-foreground mt-1">
			Extract image references (inline, reference, and HTML) from Markdown text.
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
			<Card.Title class="text-base">Images ({images.length})</Card.Title>
			<Button variant="outline" size="sm" onclick={copyAll} disabled={!images.length}>
				{#if copied === "all"}<Check />Copied{:else}<Copy />Copy URLs{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			{#if images.length === 0}
				<p class="text-muted-foreground text-sm">No images found.</p>
			{:else}
				<ul class="space-y-2">
					{#each images as im, i (i + im.src)}
						<li class="bg-muted flex items-center gap-3 rounded-md p-2">
							<div class="bg-background h-12 w-12 shrink-0 overflow-hidden rounded border">
								<img src={im.src} alt={im.alt} class="h-full w-full object-cover" loading="lazy" />
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-xs">
									<span class="text-muted-foreground font-mono">{im.kind}</span>
									{#if im.alt}<span class="ml-2">alt: <span class="font-mono">{im.alt}</span></span>{/if}
								</p>
								<p class="font-mono text-xs break-all">
									<a href={im.src} target="_blank" rel="noopener" class="text-primary underline">{im.src}</a>
								</p>
							</div>
							<Button variant="ghost" size="sm" onclick={() => copy(`s${i}`, im.src)}>
								{#if copied === `s${i}`}<Check />{:else}<Copy />{/if}
							</Button>
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
