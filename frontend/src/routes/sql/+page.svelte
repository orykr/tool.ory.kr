<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Wand from "@lucide/svelte/icons/wand-sparkles";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { format, type SqlLanguage } from "sql-formatter";

	const dialects: SqlLanguage[] = [
		"sql",
		"postgresql",
		"mysql",
		"mariadb",
		"sqlite",
		"bigquery",
		"snowflake",
		"redshift",
		"transactsql",
		"trino",
		"spark"
	];

	let input = $state(
		"select id, name, email from users where active = true and created_at > '2024-01-01' order by id desc limit 10"
	);
	let dialect = $state<SqlLanguage>("postgresql");
	let indent = $state("2");
	let upper = $state(true);
	let output = $state("");
	let error = $state<string | null>(null);
	let copied = $state(false);

	$effect(() => {
		void input;
		void dialect;
		void indent;
		void upper;
		try {
			if (!input.trim()) {
				output = "";
				error = null;
				return;
			}
			output = format(input, {
				language: dialect,
				tabWidth: indent === "tab" ? 1 : Number(indent),
				useTabs: indent === "tab",
				keywordCase: upper ? "upper" : "preserve"
			});
			error = null;
		} catch (e) {
			output = "";
			error = (e as Error).message;
		}
	});

	async function copyOut() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">SQL Formatter</h1>
		<p class="text-muted-foreground mt-1">
			Pretty-print SQL queries for many dialects.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="sql-dialect">Dialect</Label>
				<Select.Root type="single" bind:value={dialect as never}>
					<Select.Trigger id="sql-dialect" class="w-44">{dialect}</Select.Trigger>
					<Select.Content class="max-h-72">
						{#each dialects as d (d)}
							<Select.Item value={d}>{d}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="sql-indent">Indent</Label>
				<Select.Root type="single" bind:value={indent}>
					<Select.Trigger id="sql-indent" class="w-32">{indent === "tab" ? "Tab" : `${indent} spaces`}</Select.Trigger>
					<Select.Content>
						<Select.Item value="2">2 spaces</Select.Item>
						<Select.Item value="4">4 spaces</Select.Item>
						<Select.Item value="tab">Tab</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={upper} class="h-4 w-4 rounded border" />
				Uppercase keywords
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Output</Card.Title>
				<Button variant="ghost" size="sm" onclick={copyOut} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	{#if error}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{error}
		</div>
	{/if}
</main>
