<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Download from "@lucide/svelte/icons/download";

	let firstName = $state("Ada");
	let lastName = $state("Lovelace");
	let organization = $state("Analytical Engine Co.");
	let title = $state("Mathematician");
	let email = $state("ada@example.com");
	let phone = $state("+44 20 7946 0958");
	let url = $state("https://example.com");
	let address = $state("12 St James's Square, London, SW1Y 4LE, UK");
	let note = $state("First computer programmer.");

	function escapeVcard(value: string): string {
		return value
			.replace(/\\/g, "\\\\")
			.replace(/\n/g, "\\n")
			.replace(/,/g, "\\,")
			.replace(/;/g, "\\;");
	}

	let vcard = $derived.by(() => {
		const lines: string[] = ["BEGIN:VCARD", "VERSION:4.0"];
		const fn = `${firstName} ${lastName}`.trim();
		lines.push(`N:${escapeVcard(lastName)};${escapeVcard(firstName)};;;`);
		if (fn) lines.push(`FN:${escapeVcard(fn)}`);
		if (organization) lines.push(`ORG:${escapeVcard(organization)}`);
		if (title) lines.push(`TITLE:${escapeVcard(title)}`);
		if (email) lines.push(`EMAIL;TYPE=internet:${escapeVcard(email)}`);
		if (phone) lines.push(`TEL;TYPE=cell:${escapeVcard(phone)}`);
		if (url) lines.push(`URL:${escapeVcard(url)}`);
		if (address) lines.push(`ADR:;;${escapeVcard(address)};;;;`);
		if (note) lines.push(`NOTE:${escapeVcard(note)}`);
		lines.push(`REV:${new Date().toISOString().replace(/\.\d{3}/, "")}`);
		lines.push("END:VCARD");
		return lines.join("\r\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(vcard);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function download() {
		const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
		const u = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = u;
		a.download = `${firstName}_${lastName}.vcf`.replace(/\s+/g, "_") || "contact.vcf";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(u);
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
		<h1 class="text-3xl font-bold tracking-tight">vCard Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build a vCard 4.0 contact file (<code>.vcf</code>) from form fields.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Contact</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="fn">First name</Label>
						<Input id="fn" bind:value={firstName} />
					</div>
					<div class="space-y-1.5">
						<Label for="ln">Last name</Label>
						<Input id="ln" bind:value={lastName} />
					</div>
				</div>
				<div class="space-y-1.5">
					<Label for="org">Organization</Label>
					<Input id="org" bind:value={organization} />
				</div>
				<div class="space-y-1.5">
					<Label for="ti">Title</Label>
					<Input id="ti" bind:value={title} />
				</div>
				<div class="space-y-1.5">
					<Label for="em">Email</Label>
					<Input id="em" type="email" bind:value={email} />
				</div>
				<div class="space-y-1.5">
					<Label for="ph">Phone</Label>
					<Input id="ph" bind:value={phone} />
				</div>
				<div class="space-y-1.5">
					<Label for="ur">URL</Label>
					<Input id="ur" bind:value={url} />
				</div>
				<div class="space-y-1.5">
					<Label for="ad">Address</Label>
					<Input id="ad" bind:value={address} />
				</div>
				<div class="space-y-1.5">
					<Label for="nt">Note</Label>
					<Textarea id="nt" bind:value={note} class="min-h-20" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">vCard output</Card.Title>
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
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{vcard}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
