<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Trash2 from "@lucide/svelte/icons/trash-2";

	let mode = $state<"encode" | "decode">("encode");
	let component = $state(true);
	let input = $state("");
	let output = $state("");
	let error = $state<string | null>(null);
	let copied = $state(false);

	$effect(() => {
		void input;
		void mode;
		void component;
		run();
	});

	function run() {
		error = null;
		if (!input) {
			output = "";
			return;
		}
		try {
			if (mode === "encode") {
				output = component ? encodeURIComponent(input) : encodeURI(input);
			} else {
				output = component ? decodeURIComponent(input) : decodeURI(input);
			}
		} catch (e) {
			output = "";
			error = (e as Error).message;
		}
	}

	function swap() {
		mode = mode === "encode" ? "decode" : "encode";
		if (output) input = output;
	}

	async function copyOut() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function clear() {
		input = "";
		output = "";
		error = null;
	}

	type UrlPart = { id: string; key: string; value: string };
	let parsedUrl = $state<{ ok: true; parts: UrlPart[] } | { ok: false; error: string } | null>(
		null
	);
	let urlInput = $state("");

	$effect(() => {
		if (!urlInput.trim()) {
			parsedUrl = null;
			return;
		}
		try {
			const u = new URL(urlInput);
			const parts: UrlPart[] = [
				{ id: "protocol", key: "protocol", value: u.protocol },
				{ id: "host", key: "host", value: u.host },
				{ id: "hostname", key: "hostname", value: u.hostname },
				{ id: "port", key: "port", value: u.port || "(default)" },
				{ id: "pathname", key: "pathname", value: u.pathname },
				{ id: "search", key: "search", value: u.search || "(none)" },
				{ id: "hash", key: "hash", value: u.hash || "(none)" },
				{ id: "origin", key: "origin", value: u.origin }
			];
			let i = 0;
			u.searchParams.forEach((value, key) => {
				parts.push({ id: `q-${i++}`, key: `query.${key}`, value });
			});
			parsedUrl = { ok: true, parts };
		} catch (e) {
			parsedUrl = { ok: false, error: "Invalid URL." };
		}
	});
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
		<h1 class="text-3xl font-bold tracking-tight">URL Encoder / Decoder</h1>
		<p class="text-muted-foreground mt-1">
			Encode and decode URI components, and inspect URL structure.
		</p>
	</header>

	<Tabs.Root value="codec" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="codec">Encode / Decode</Tabs.Trigger>
			<Tabs.Trigger value="parser">URL Parser</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="codec">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-4">
					<div>
						<Card.Title class="text-base">
							{mode === "encode" ? "Encode" : "Decode"}
							{component ? "Component" : "URI"}
						</Card.Title>
						<Card.Description>
							{component
								? "Treats input as a component (escapes / & = ? etc.)."
								: "Preserves reserved URI characters."}
						</Card.Description>
					</div>
					<Button variant="outline" size="sm" onclick={swap}>
						<ArrowDownUp />
						Swap
					</Button>
				</Card.Header>
				<Card.Content class="space-y-4">
					<label class="flex cursor-pointer items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={component} class="h-4 w-4 rounded border" />
						Use <code>encodeURIComponent</code> / <code>decodeURIComponent</code>
					</label>

					<div class="space-y-1.5">
						<Label for="url-input">{mode === "encode" ? "Plain" : "Encoded"}</Label>
						<Textarea id="url-input" bind:value={input} class="min-h-32 font-mono text-sm" />
					</div>

					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label for="url-output">{mode === "encode" ? "Encoded" : "Plain"}</Label>
							<div class="flex gap-1">
								<Button variant="ghost" size="sm" onclick={copyOut} disabled={!output}>
									{#if copied}
										<Check />
										Copied
									{:else}
										<Copy />
										Copy
									{/if}
								</Button>
								<Button variant="ghost" size="sm" onclick={clear} disabled={!input && !output}>
									<Trash2 />
									Clear
								</Button>
							</div>
						</div>
						<Textarea id="url-output" value={output} readonly class="min-h-32 font-mono text-sm" />
					</div>

					{#if error}
						<div
							class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
						>
							{error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="parser">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Parse URL</Card.Title>
					<Card.Description>Inspect protocol, host, path, and query parameters.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label for="url-parser-input">URL</Label>
						<Input
							id="url-parser-input"
							bind:value={urlInput}
							placeholder="https://example.com/path?foo=bar#section"
							class="font-mono"
						/>
					</div>

					{#if parsedUrl?.ok}
						<dl class="divide-y rounded-md border">
							{#each parsedUrl.parts as part (part.id)}
								<div class="grid grid-cols-3 gap-4 px-3 py-2 text-sm">
									<dt class="text-muted-foreground font-mono">{part.key}</dt>
									<dd class="col-span-2 font-mono break-all">{part.value}</dd>
								</div>
							{/each}
						</dl>
					{:else if parsedUrl && !parsedUrl.ok}
						<div
							class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
						>
							{parsedUrl.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
