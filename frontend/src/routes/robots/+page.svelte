<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Group = {
		id: number;
		userAgent: string;
		allow: string;
		disallow: string;
		crawlDelay: string;
	};

	let groups = $state<Group[]>([
		{ id: 1, userAgent: "*", allow: "/", disallow: "/admin\n/private", crawlDelay: "" }
	]);
	let nextId = 2;
	let sitemap = $state("https://example.com/sitemap.xml");

	function addGroup() {
		groups = [
			...groups,
			{ id: nextId++, userAgent: "Googlebot", allow: "", disallow: "", crawlDelay: "" }
		];
	}

	function removeGroup(id: number) {
		if (groups.length <= 1) return;
		groups = groups.filter((g) => g.id !== id);
	}

	let output = $derived.by(() => {
		const blocks: string[] = [];
		for (const g of groups) {
			const ua = g.userAgent.trim() || "*";
			const lines: string[] = [`User-agent: ${ua}`];
			for (const path of g.allow.split(/\r?\n/)) {
				const p = path.trim();
				if (p) lines.push(`Allow: ${p}`);
			}
			for (const path of g.disallow.split(/\r?\n/)) {
				const p = path.trim();
				if (p) lines.push(`Disallow: ${p}`);
			}
			if (g.crawlDelay.trim()) lines.push(`Crawl-delay: ${g.crawlDelay.trim()}`);
			blocks.push(lines.join("\n"));
		}
		const result = blocks.join("\n\n");
		const sm = sitemap.trim();
		return sm ? `${result}\n\nSitemap: ${sm}` : result;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">robots.txt Builder</h1>
		<p class="text-muted-foreground mt-1">
			Build a robots.txt for crawlers — User-agent groups, Allow/Disallow paths, sitemap.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Groups</Card.Title>
			<Button variant="outline" size="sm" onclick={addGroup}>
				<Plus />
				Add group
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each groups as g, i (g.id)}
				<div class="bg-muted/40 space-y-3 rounded-md border p-3">
					<div class="flex items-end gap-2">
						<div class="flex-1 space-y-1.5">
							<Label for={`ua-${g.id}`}>User-agent</Label>
							<Input id={`ua-${g.id}`} bind:value={groups[i].userAgent} class="font-mono" placeholder="*" />
						</div>
						<div class="w-32 space-y-1.5">
							<Label for={`cd-${g.id}`}>Crawl-delay</Label>
							<Input id={`cd-${g.id}`} bind:value={groups[i].crawlDelay} class="font-mono" placeholder="(blank)" />
						</div>
						<Button variant="ghost" size="icon" onclick={() => removeGroup(g.id)}>
							<Trash2 />
						</Button>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for={`al-${g.id}`}>Allow paths (one per line)</Label>
							<Textarea id={`al-${g.id}`} bind:value={groups[i].allow} class="min-h-20 font-mono text-sm" />
						</div>
						<div class="space-y-1.5">
							<Label for={`dl-${g.id}`}>Disallow paths (one per line)</Label>
							<Textarea id={`dl-${g.id}`} bind:value={groups[i].disallow} class="min-h-20 font-mono text-sm" />
						</div>
					</div>
				</div>
			{/each}
			<div class="space-y-1.5">
				<Label for="sm">Sitemap URL (optional)</Label>
				<Input id="sm" bind:value={sitemap} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">robots.txt</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{output}</pre>
		</Card.Content>
	</Card.Root>
</main>
