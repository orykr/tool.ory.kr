<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import cronstrue from "cronstrue";
	import { CronExpressionParser } from "cron-parser";

	let expression = $state("*/15 9-17 * * 1-5");
	let humanReadable = $state("");
	let nextRuns = $state<string[]>([]);
	let error = $state<string | null>(null);

	const presets = [
		{ label: "Every minute", value: "* * * * *" },
		{ label: "Every 5 minutes", value: "*/5 * * * *" },
		{ label: "Every hour", value: "0 * * * *" },
		{ label: "Every day at midnight", value: "0 0 * * *" },
		{ label: "Every Monday 9am", value: "0 9 * * 1" },
		{ label: "Weekdays every 15m", value: "*/15 9-17 * * 1-5" },
		{ label: "First of month 6am", value: "0 6 1 * *" }
	];

	$effect(() => {
		const expr = expression.trim();
		if (!expr) {
			humanReadable = "";
			nextRuns = [];
			error = null;
			return;
		}
		try {
			humanReadable = cronstrue.toString(expr, { use24HourTimeFormat: true });
		} catch (e) {
			humanReadable = "";
			error = (e as Error).message;
			nextRuns = [];
			return;
		}
		try {
			const interval = CronExpressionParser.parse(expr, { currentDate: new Date() });
			const list: string[] = [];
			for (let i = 0; i < 8; i++) list.push(interval.next().toDate().toISOString());
			nextRuns = list;
			error = null;
		} catch (e) {
			error = (e as Error).message;
			nextRuns = [];
		}
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Cron Expression Parser</h1>
		<p class="text-muted-foreground mt-1">
			Translate cron expressions to plain English and preview the next runs.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Expression</Card.Title>
			<Card.Description>
				Standard 5-field POSIX cron (minute hour day month weekday).
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Input bind:value={expression} class="font-mono" placeholder="* * * * *" spellcheck={false} />

			<div class="flex flex-wrap gap-2">
				{#each presets as p (p.value)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-1 text-xs"
						onclick={() => (expression = p.value)}
					>
						{p.label}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{#if humanReadable}
		<Card.Root class="mb-4">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Human-readable</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => copy("h", humanReadable)}>
					{#if copied === "h"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<p class="bg-muted rounded-md p-3 text-sm">{humanReadable}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if error}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{error}
		</div>
	{/if}

	{#if nextRuns.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Next 8 runs (UTC)</Card.Title>
			</Card.Header>
			<Card.Content>
				<ol class="space-y-1 text-sm">
					{#each nextRuns as r, i (i)}
						<li class="bg-muted flex justify-between rounded px-3 py-1.5 font-mono">
							<span class="text-muted-foreground">{i + 1}.</span>
							<span>{r}</span>
						</li>
					{/each}
				</ol>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
