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

	let queryInput = $state("foo=bar&items=apple&items=banana&page=1&q=hello%20world");
	let jsonInput = $state(
		'{"foo":"bar","items":["apple","banana"],"page":1,"q":"hello world"}'
	);

	let queryToObject = $derived.by(() => {
		try {
			const cleaned = queryInput.replace(/^[?&]+/, "");
			if (!cleaned) return { ok: true as const, value: {} };
			const params = new URLSearchParams(cleaned);
			const obj: Record<string, unknown> = {};
			for (const [k, v] of params.entries()) {
				if (k in obj) {
					const existing = obj[k];
					if (Array.isArray(existing)) existing.push(v);
					else obj[k] = [existing, v];
				} else {
					obj[k] = v;
				}
			}
			return { ok: true as const, value: obj };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let objectToQuery = $derived.by(() => {
		try {
			const parsed = JSON.parse(jsonInput);
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
				return { ok: false as const, error: "Top-level value must be an object." };
			}
			const params = new URLSearchParams();
			for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
				if (Array.isArray(v)) {
					for (const item of v) params.append(k, formatValue(item));
				} else {
					params.append(k, formatValue(v));
				}
			}
			return { ok: true as const, value: params.toString() };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	function formatValue(value: unknown): string {
		if (value === null || value === undefined) return "";
		if (typeof value === "object") return JSON.stringify(value);
		return String(value);
	}

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">URL Params ↔ Object</h1>
		<p class="text-muted-foreground mt-1">
			Parse query strings to JSON, or build a query string from a JSON object.
		</p>
	</header>

	<Tabs.Root value="q2j">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="q2j">Query → Object</Tabs.Trigger>
			<Tabs.Trigger value="j2q">Object → Query</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="q2j">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Query string</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={queryInput} class="min-h-48 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON</Card.Title>
						{#if queryToObject.ok}
							<Button
								variant="ghost"
								size="sm"
								onclick={() => copy("j", JSON.stringify(queryToObject.value, null, 2))}
							>
								{#if copied === "j"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						{/if}
					</Card.Header>
					<Card.Content>
						{#if queryToObject.ok}
							<Textarea
								value={JSON.stringify(queryToObject.value, null, 2)}
								readonly
								class="min-h-48 font-mono text-sm"
							/>
						{:else}
							<div
								class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
							>
								{queryToObject.error}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="j2q">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON object</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-48 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">Query string</Card.Title>
						{#if objectToQuery.ok}
							<Button variant="ghost" size="sm" onclick={() => copy("q", objectToQuery.value)}>
								{#if copied === "q"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						{/if}
					</Card.Header>
					<Card.Content>
						{#if objectToQuery.ok}
							<Textarea value={objectToQuery.value} readonly class="min-h-48 font-mono text-sm" />
						{:else}
							<div
								class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
							>
								{objectToQuery.error}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</main>
