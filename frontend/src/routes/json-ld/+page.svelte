<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	// Person
	let pName = $state("Ada Lovelace");
	let pUrl = $state("https://example.com");
	let pImage = $state("https://example.com/avatar.jpg");
	let pJob = $state("Mathematician");
	let pEmail = $state("ada@example.com");
	let pSameAs = $state("https://twitter.com/example\nhttps://github.com/example");

	// Organization
	let oName = $state("Acme Corp");
	let oUrl = $state("https://acme.example.com");
	let oLogo = $state("https://acme.example.com/logo.png");
	let oDesc = $state("We make widgets.");
	let oTel = $state("+1-555-0100");

	// Product
	let prName = $state("Widget Pro");
	let prImage = $state("https://example.com/widget.png");
	let prDesc = $state("The best widget on the market.");
	let prSku = $state("WGT-001");
	let prBrand = $state("Acme");
	let prPrice = $state("99.99");
	let prCurrency = $state("USD");
	let prAvailability = $state<"InStock" | "OutOfStock" | "PreOrder">("InStock");

	// Article
	let aHeadline = $state("Hello World");
	let aAuthor = $state("Ada Lovelace");
	let aDate = $state(new Date().toISOString().slice(0, 10));
	let aImage = $state("https://example.com/article.jpg");
	let aDesc = $state("An introductory article.");

	// FAQ
	let faqText = $state(`Q: What is this?
A: A demo FAQ.

Q: How do I use it?
A: Type questions and answers.`);

	function clean(obj: unknown): unknown {
		if (Array.isArray(obj)) return obj.map(clean).filter((v) => v !== undefined);
		if (obj && typeof obj === "object") {
			const out: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
				const c = clean(v);
				if (c === undefined || c === "" || (Array.isArray(c) && c.length === 0)) continue;
				out[k] = c;
			}
			return out;
		}
		return obj;
	}

	function format(obj: unknown): string {
		const inner = JSON.stringify(clean(obj), null, 2);
		return `<script type="application/ld+json">\n${inner}\n<\/script>`;
	}

	let person = $derived(
		format({
			"@context": "https://schema.org",
			"@type": "Person",
			name: pName,
			url: pUrl,
			image: pImage,
			jobTitle: pJob,
			email: pEmail,
			sameAs: pSameAs.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
		})
	);

	let organization = $derived(
		format({
			"@context": "https://schema.org",
			"@type": "Organization",
			name: oName,
			url: oUrl,
			logo: oLogo,
			description: oDesc,
			telephone: oTel
		})
	);

	let product = $derived(
		format({
			"@context": "https://schema.org",
			"@type": "Product",
			name: prName,
			image: prImage,
			description: prDesc,
			sku: prSku,
			brand: prBrand ? { "@type": "Brand", name: prBrand } : undefined,
			offers: {
				"@type": "Offer",
				price: prPrice,
				priceCurrency: prCurrency,
				availability: `https://schema.org/${prAvailability}`
			}
		})
	);

	let article = $derived(
		format({
			"@context": "https://schema.org",
			"@type": "Article",
			headline: aHeadline,
			author: aAuthor ? { "@type": "Person", name: aAuthor } : undefined,
			datePublished: aDate,
			image: aImage,
			description: aDesc
		})
	);

	let faq = $derived.by(() => {
		const blocks = faqText.split(/\n\s*\n/);
		const items: Array<{ q: string; a: string }> = [];
		for (const block of blocks) {
			const qMatch = block.match(/^\s*Q[:.]?\s*(.+)/im);
			const aMatch = block.match(/^\s*A[:.]?\s*(.+)/im);
			if (qMatch && aMatch) items.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
		}
		return format({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: items.map((item) => ({
				"@type": "Question",
				name: item.q,
				acceptedAnswer: { "@type": "Answer", text: item.a }
			}))
		});
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">JSON-LD Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate Schema.org structured data for Person, Organization, Product, Article, and FAQ.
		</p>
	</header>

	<Tabs.Root value="person">
		<Tabs.List class="grid w-full grid-cols-5">
			<Tabs.Trigger value="person">Person</Tabs.Trigger>
			<Tabs.Trigger value="org">Organization</Tabs.Trigger>
			<Tabs.Trigger value="product">Product</Tabs.Trigger>
			<Tabs.Trigger value="article">Article</Tabs.Trigger>
			<Tabs.Trigger value="faq">FAQ</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="person">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Fields</Card.Title></Card.Header>
					<Card.Content class="space-y-3">
						<div class="space-y-1.5"><Label for="pn">Name</Label><Input id="pn" bind:value={pName} /></div>
						<div class="space-y-1.5"><Label for="pu">URL</Label><Input id="pu" bind:value={pUrl} /></div>
						<div class="space-y-1.5"><Label for="pi">Image</Label><Input id="pi" bind:value={pImage} /></div>
						<div class="space-y-1.5"><Label for="pj">Job title</Label><Input id="pj" bind:value={pJob} /></div>
						<div class="space-y-1.5"><Label for="pe">Email</Label><Input id="pe" bind:value={pEmail} /></div>
						<div class="space-y-1.5"><Label for="ps">SameAs (one URL per line)</Label><Textarea id="ps" bind:value={pSameAs} class="min-h-20 font-mono text-sm" /></div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON-LD</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("p", person)}>
							{#if copied === "p"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{person}</pre>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="org">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Fields</Card.Title></Card.Header>
					<Card.Content class="space-y-3">
						<div class="space-y-1.5"><Label for="on">Name</Label><Input id="on" bind:value={oName} /></div>
						<div class="space-y-1.5"><Label for="ou">URL</Label><Input id="ou" bind:value={oUrl} /></div>
						<div class="space-y-1.5"><Label for="ol">Logo</Label><Input id="ol" bind:value={oLogo} /></div>
						<div class="space-y-1.5"><Label for="od">Description</Label><Textarea id="od" bind:value={oDesc} class="min-h-20" /></div>
						<div class="space-y-1.5"><Label for="ot">Telephone</Label><Input id="ot" bind:value={oTel} /></div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON-LD</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("o", organization)}>
							{#if copied === "o"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{organization}</pre>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="product">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Fields</Card.Title></Card.Header>
					<Card.Content class="space-y-3">
						<div class="space-y-1.5"><Label for="prn">Name</Label><Input id="prn" bind:value={prName} /></div>
						<div class="space-y-1.5"><Label for="pri">Image</Label><Input id="pri" bind:value={prImage} /></div>
						<div class="space-y-1.5"><Label for="prd">Description</Label><Textarea id="prd" bind:value={prDesc} class="min-h-20" /></div>
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="space-y-1.5"><Label for="prs">SKU</Label><Input id="prs" bind:value={prSku} /></div>
							<div class="space-y-1.5"><Label for="prb">Brand</Label><Input id="prb" bind:value={prBrand} /></div>
							<div class="space-y-1.5"><Label for="prp">Price</Label><Input id="prp" bind:value={prPrice} /></div>
							<div class="space-y-1.5"><Label for="prc">Currency</Label><Input id="prc" bind:value={prCurrency} /></div>
						</div>
						<div class="space-y-1.5"><Label for="pra">Availability</Label>
							<select bind:value={prAvailability} class="bg-background w-full rounded border p-2 font-mono text-sm">
								<option value="InStock">InStock</option>
								<option value="OutOfStock">OutOfStock</option>
								<option value="PreOrder">PreOrder</option>
							</select>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON-LD</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("pr", product)}>
							{#if copied === "pr"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{product}</pre>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="article">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Fields</Card.Title></Card.Header>
					<Card.Content class="space-y-3">
						<div class="space-y-1.5"><Label for="ah">Headline</Label><Input id="ah" bind:value={aHeadline} /></div>
						<div class="space-y-1.5"><Label for="aa">Author</Label><Input id="aa" bind:value={aAuthor} /></div>
						<div class="space-y-1.5"><Label for="ad">Date published</Label><Input id="ad" type="date" bind:value={aDate} class="font-mono" /></div>
						<div class="space-y-1.5"><Label for="ai">Image</Label><Input id="ai" bind:value={aImage} /></div>
						<div class="space-y-1.5"><Label for="aD">Description</Label><Textarea id="aD" bind:value={aDesc} class="min-h-20" /></div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON-LD</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("a", article)}>
							{#if copied === "a"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{article}</pre>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="faq">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Q&A pairs</Card.Title>
						<Card.Description>Use <code>Q:</code> and <code>A:</code> prefixes; separate pairs with blank lines.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Textarea bind:value={faqText} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON-LD</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("f", faq)}>
							{#if copied === "f"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{faq}</pre>
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</main>
