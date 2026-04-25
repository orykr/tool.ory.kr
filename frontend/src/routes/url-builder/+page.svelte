<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Param = { id: number; key: string; value: string; enabled: boolean };

	let protocol = $state("https");
	let username = $state("");
	let password = $state("");
	let host = $state("api.example.com");
	let port = $state("");
	let path = $state("/v1/users/42");
	let hash = $state("");
	let params = $state<Param[]>([
		{ id: 1, key: "search", value: "hello world", enabled: true },
		{ id: 2, key: "limit", value: "10", enabled: true }
	]);
	let nextId = 3;

	function addParam() {
		params = [...params, { id: nextId++, key: "", value: "", enabled: true }];
	}
	function removeParam(id: number) {
		params = params.filter((p) => p.id !== id);
	}

	let url = $derived.by(() => {
		try {
			let auth = "";
			if (username) {
				auth = encodeURIComponent(username);
				if (password) auth += ":" + encodeURIComponent(password);
				auth += "@";
			}
			const portPart = port ? `:${port}` : "";
			const hashPart = hash ? `#${hash}` : "";
			const search = params
				.filter((p) => p.enabled && p.key)
				.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
				.join("&");
			const searchPart = search ? `?${search}` : "";
			const cleanPath = path && !path.startsWith("/") ? "/" + path : path;
			return `${protocol}://${auth}${host}${portPart}${cleanPath}${searchPart}${hashPart}`;
		} catch (e) {
			return "(error)";
		}
	});

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, value: new URL(url) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(url);
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
		<h1 class="text-3xl font-bold tracking-tight">URL Builder</h1>
		<p class="text-muted-foreground mt-1">
			Compose URLs from individual parts with auto-encoding of query parameters.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Components</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="pr">Protocol</Label>
					<Input id="pr" bind:value={protocol} class="font-mono" />
				</div>
				<div class="space-y-1.5 sm:col-span-2">
					<Label for="ho">Host</Label>
					<Input id="ho" bind:value={host} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="po">Port</Label>
					<Input id="po" bind:value={port} placeholder="(default)" class="font-mono" />
				</div>
				<div class="space-y-1.5 sm:col-span-2">
					<Label for="pa">Path</Label>
					<Input id="pa" bind:value={path} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="us">Username</Label>
					<Input id="us" bind:value={username} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="pw">Password</Label>
					<Input id="pw" bind:value={password} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="ha">Hash (#fragment)</Label>
					<Input id="ha" bind:value={hash} class="font-mono" />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Query parameters</Card.Title>
			<Button variant="outline" size="sm" onclick={addParam}>
				<Plus />
				Add
			</Button>
		</Card.Header>
		<Card.Content>
			<div class="space-y-2">
				{#each params as p, i (p.id)}
					<div class="flex items-center gap-2">
						<input type="checkbox" bind:checked={params[i].enabled} class="h-4 w-4 rounded border" />
						<Input bind:value={params[i].key} placeholder="key" class="h-8 font-mono" />
						<Input bind:value={params[i].value} placeholder="value" class="h-8 font-mono" />
						<Button variant="ghost" size="icon" onclick={() => removeParam(p.id)}>
							<Trash2 />
						</Button>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">URL</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{url}</pre>
			{#if !parsed.ok}
				<p class="text-destructive mt-2 text-xs">Not a valid URL: {parsed.error}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
