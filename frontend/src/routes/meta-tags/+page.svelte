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

	let title = $state("Awesome Project");
	let description = $state("A short summary of the page.");
	let url = $state("https://example.com");
	let image = $state("https://example.com/og.png");
	let imageAlt = $state("Project banner");
	let siteName = $state("Example");
	let twitterHandle = $state("@example");
	let twitterCard = $state<"summary" | "summary_large_image" | "app" | "player">("summary_large_image");
	let locale = $state("en_US");
	let themeColor = $state("#0070f3");

	function escape(value: string): string {
		return value
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	let html = $derived.by(() => {
		const lines: string[] = [];
		if (title) {
			lines.push(`<title>${escape(title)}</title>`);
			lines.push(`<meta name="title" content="${escape(title)}" />`);
		}
		if (description) lines.push(`<meta name="description" content="${escape(description)}" />`);
		if (themeColor) lines.push(`<meta name="theme-color" content="${escape(themeColor)}" />`);

		if (url || title || description || image || siteName) {
			lines.push("");
			lines.push("<!-- Open Graph -->");
			if (url) lines.push(`<meta property="og:url" content="${escape(url)}" />`);
			lines.push(`<meta property="og:type" content="website" />`);
			if (title) lines.push(`<meta property="og:title" content="${escape(title)}" />`);
			if (description) lines.push(`<meta property="og:description" content="${escape(description)}" />`);
			if (image) lines.push(`<meta property="og:image" content="${escape(image)}" />`);
			if (imageAlt) lines.push(`<meta property="og:image:alt" content="${escape(imageAlt)}" />`);
			if (siteName) lines.push(`<meta property="og:site_name" content="${escape(siteName)}" />`);
			if (locale) lines.push(`<meta property="og:locale" content="${escape(locale)}" />`);
		}

		lines.push("");
		lines.push("<!-- Twitter -->");
		lines.push(`<meta name="twitter:card" content="${escape(twitterCard)}" />`);
		if (twitterHandle) lines.push(`<meta name="twitter:site" content="${escape(twitterHandle)}" />`);
		if (title) lines.push(`<meta name="twitter:title" content="${escape(title)}" />`);
		if (description) lines.push(`<meta name="twitter:description" content="${escape(description)}" />`);
		if (image) lines.push(`<meta name="twitter:image" content="${escape(image)}" />`);
		if (imageAlt) lines.push(`<meta name="twitter:image:alt" content="${escape(imageAlt)}" />`);

		if (url) {
			lines.push("");
			lines.push(`<link rel="canonical" href="${escape(url)}" />`);
		}

		return lines.join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(html);
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
		<h1 class="text-3xl font-bold tracking-tight">Meta Tags Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build SEO, Open Graph, and Twitter Card meta tags for the document head.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Page details</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="t">Title</Label>
					<Input id="t" bind:value={title} />
				</div>
				<div class="space-y-1.5">
					<Label for="d">Description</Label>
					<Textarea id="d" bind:value={description} class="min-h-20" />
				</div>
				<div class="space-y-1.5">
					<Label for="u">Canonical URL</Label>
					<Input id="u" bind:value={url} />
				</div>
				<div class="space-y-1.5">
					<Label for="i">Image URL</Label>
					<Input id="i" bind:value={image} />
				</div>
				<div class="space-y-1.5">
					<Label for="ia">Image alt</Label>
					<Input id="ia" bind:value={imageAlt} />
				</div>
				<div class="space-y-1.5">
					<Label for="sn">Site name</Label>
					<Input id="sn" bind:value={siteName} />
				</div>
				<div class="space-y-1.5">
					<Label for="lc">Locale</Label>
					<Input id="lc" bind:value={locale} />
				</div>
				<div class="space-y-1.5">
					<Label for="tc">Twitter card</Label>
					<Select.Root type="single" bind:value={twitterCard as never}>
						<Select.Trigger id="tc" class="w-full">{twitterCard}</Select.Trigger>
						<Select.Content>
							<Select.Item value="summary">summary</Select.Item>
							<Select.Item value="summary_large_image">summary_large_image</Select.Item>
							<Select.Item value="app">app</Select.Item>
							<Select.Item value="player">player</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="th">Twitter handle</Label>
					<Input id="th" bind:value={twitterHandle} />
				</div>
				<div class="space-y-1.5">
					<Label for="tm">Theme color</Label>
					<Input id="tm" bind:value={themeColor} />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">HTML</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{html}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
