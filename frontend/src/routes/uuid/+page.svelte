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
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { generateUuidV4, generateUuidV7, generateNanoId } from "$lib/uuid";

	type Variant = "v4" | "v7" | "nanoid";
	const labels: Record<Variant, string> = {
		v4: "UUID v4 (random)",
		v7: "UUID v7 (time-ordered)",
		nanoid: "NanoID (URL-safe)"
	};

	let variant = $state<Variant>("v4");
	let count = $state(5);
	let nanoidSize = $state(21);
	let ids = $state<string[]>([]);
	let copiedIndex = $state<number | null>(null);
	let copiedAll = $state(false);

	function generate() {
		const safeCount = Math.max(1, Math.min(1000, Math.floor(count) || 1));
		const list: string[] = [];
		for (let i = 0; i < safeCount; i++) {
			if (variant === "v4") list.push(generateUuidV4());
			else if (variant === "v7") list.push(generateUuidV7());
			else list.push(generateNanoId(Math.max(2, Math.min(64, Math.floor(nanoidSize) || 21))));
		}
		ids = list;
	}

	$effect(() => {
		void variant;
		generate();
	});

	async function copyOne(index: number) {
		await navigator.clipboard.writeText(ids[index]);
		copiedIndex = index;
		setTimeout(() => (copiedIndex = null), 1200);
	}

	async function copyAll() {
		if (!ids.length) return;
		await navigator.clipboard.writeText(ids.join("\n"));
		copiedAll = true;
		setTimeout(() => (copiedAll = false), 1500);
	}
</script>

<main class="container mx-auto max-w-3xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">UUID Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate UUID v4, time-ordered UUID v7, or NanoID using your browser's CSPRNG.
		</p>
	</header>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Options</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="variant">Variant</Label>
					<Select.Root type="single" bind:value={variant as never}>
						<Select.Trigger id="variant" class="w-full">{labels[variant]}</Select.Trigger>
						<Select.Content>
							<Select.Item value="v4">UUID v4 (random)</Select.Item>
							<Select.Item value="v7">UUID v7 (time-ordered)</Select.Item>
							<Select.Item value="nanoid">NanoID</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<Label for="count">Count</Label>
					<Input id="count" type="number" min="1" max="1000" bind:value={count} />
				</div>

				{#if variant === "nanoid"}
					<div class="space-y-1.5">
						<Label for="nanoid-size">NanoID size</Label>
						<Input id="nanoid-size" type="number" min="2" max="64" bind:value={nanoidSize} />
					</div>
				{/if}
			</div>

			<div class="flex flex-wrap gap-2">
				<Button onclick={generate}>
					<RefreshCw />
					Generate
				</Button>
				<Button variant="ghost" onclick={copyAll} disabled={!ids.length}>
					{#if copiedAll}
						<Check />
						Copied All
					{:else}
						<Copy />
						Copy All
					{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	{#if ids.length}
		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title class="text-base">Result ({ids.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				<ul class="divide-y">
					{#each ids as id, i (i + id)}
						<li class="flex items-center justify-between gap-2 py-1.5">
							<code class="text-sm break-all">{id}</code>
							<Button variant="ghost" size="sm" onclick={() => copyOne(i)}>
								{#if copiedIndex === i}
									<Check />
								{:else}
									<Copy />
								{/if}
							</Button>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
