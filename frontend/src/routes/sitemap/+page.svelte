<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Download from "@lucide/svelte/icons/download";

	let urls = $state(`https://example.com/
https://example.com/about
https://example.com/blog
https://example.com/contact`);
	let changefreq = $state<"" | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never">("weekly");
	let priority = $state("0.5");
	let lastmod = $state(new Date().toISOString().slice(0, 10));

	function escapeXml(value: string): string {
		return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}

	let xml = $derived.by(() => {
		const items = urls
			.split(/\r?\n/)
			.map((u) => u.trim())
			.filter(Boolean);
		const inner = items
			.map((u) => {
				const lines = [`  <url>`, `    <loc>${escapeXml(u)}</loc>`];
				if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
				if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
				if (priority) lines.push(`    <priority>${priority}</priority>`);
				lines.push(`  </url>`);
				return lines.join("\n");
			})
			.join("\n");
		return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${inner}\n</urlset>`;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(xml);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function download() {
		const blob = new Blob([xml], { type: "application/xml" });
		const u = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = u;
		a.download = "sitemap.xml";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(u);
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
		<h1 class="text-3xl font-bold tracking-tight">Sitemap.xml Builder</h1>
		<p class="text-muted-foreground mt-1">
			Build a Sitemap 0.9 XML from a URL list with lastmod, changefreq, and priority.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">URLs (one per line)</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<Textarea bind:value={urls} class="min-h-72 font-mono text-sm" />
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="lm">lastmod (YYYY-MM-DD)</Label>
						<Input id="lm" bind:value={lastmod} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="cf">changefreq</Label>
						<Select.Root type="single" bind:value={changefreq as never}>
							<Select.Trigger id="cf" class="w-full">{changefreq || "(none)"}</Select.Trigger>
							<Select.Content>
								<Select.Item value="">(none)</Select.Item>
								<Select.Item value="always">always</Select.Item>
								<Select.Item value="hourly">hourly</Select.Item>
								<Select.Item value="daily">daily</Select.Item>
								<Select.Item value="weekly">weekly</Select.Item>
								<Select.Item value="monthly">monthly</Select.Item>
								<Select.Item value="yearly">yearly</Select.Item>
								<Select.Item value="never">never</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-1.5">
						<Label for="pr">priority (0.0–1.0)</Label>
						<Input id="pr" bind:value={priority} class="font-mono" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">sitemap.xml</Card.Title>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={copy}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
					<Button variant="outline" size="sm" onclick={download}>
						<Download />
						Download
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{xml}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
