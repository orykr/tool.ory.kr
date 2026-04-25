<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
	import { diffJson, type DiffEntry } from "$lib/json-diff";

	let leftInput = $state(
		'{"name":"Ada","tags":["math","cs"],"meta":{"created":"2024-01-01","active":true}}'
	);
	let rightInput = $state(
		'{"name":"Ada","tags":["math","cs","ai"],"meta":{"created":"2024-01-01","active":false},"score":99}'
	);

	let result = $derived.by(() => {
		try {
			const a = JSON.parse(leftInput);
			const b = JSON.parse(rightInput);
			return { ok: true as const, entries: diffJson(a, b) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	function swap() {
		[leftInput, rightInput] = [rightInput, leftInput];
	}

	function format(value: unknown): string {
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	function badgeClass(kind: DiffEntry["kind"]): string {
		if (kind === "added") return "bg-emerald-500 text-white";
		if (kind === "removed") return "bg-rose-500 text-white";
		return "bg-amber-500 text-white";
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
		<h1 class="text-3xl font-bold tracking-tight">JSON Diff</h1>
		<p class="text-muted-foreground mt-1">
			Compare two JSON documents structurally and see added, removed, and changed paths.
		</p>
	</header>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Left (original)</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={leftInput} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Right (changed)</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={rightInput} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	<div class="mb-4">
		<Button variant="outline" size="sm" onclick={swap}>
			<ArrowLeftRight />
			Swap
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">
				{#if result.ok}Differences ({result.entries.length}){:else}Error{/if}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if !result.ok}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{result.error}
				</div>
			{:else if result.entries.length === 0}
				<p class="text-muted-foreground text-sm">No differences. The documents are equal.</p>
			{:else}
				<ul class="space-y-2">
					{#each result.entries as e, i (i)}
						<li class="rounded-md border">
							<div class="bg-muted flex items-center gap-2 rounded-t-md px-3 py-2">
								<span class="rounded px-2 py-0.5 text-xs font-semibold {badgeClass(e.kind)}">
									{e.kind}
								</span>
								<code class="font-mono text-sm">{e.path}</code>
							</div>
							<div class="grid grid-cols-1 gap-2 p-3 text-sm md:grid-cols-2">
								{#if e.kind === "removed"}
									<pre class="bg-rose-50 dark:bg-rose-950/40 overflow-x-auto rounded p-2 font-mono text-xs md:col-span-2">{format(e.value)}</pre>
								{:else if e.kind === "added"}
									<pre class="bg-emerald-50 dark:bg-emerald-950/40 overflow-x-auto rounded p-2 font-mono text-xs md:col-span-2">{format(e.value)}</pre>
								{:else}
									<pre class="bg-rose-50 dark:bg-rose-950/40 overflow-x-auto rounded p-2 font-mono text-xs">{format(e.from)}</pre>
									<pre class="bg-emerald-50 dark:bg-emerald-950/40 overflow-x-auto rounded p-2 font-mono text-xs">{format(e.to)}</pre>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
