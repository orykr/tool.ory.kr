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

	const SAMPLE = [
		"# Project Title",
		"",
		"## Overview",
		"### Goals",
		"### Non-goals",
		"",
		"## Architecture",
		"### Frontend",
		"### Backend",
		"#### Database",
		"#### Cache",
		"",
		"## Roadmap",
		"## FAQ"
	].join("\n");

	let input = $state(SAMPLE);
	let minLevel = $state(2);
	let maxLevel = $state(6);
	let style = $state<"github" | "numbered">("github");

	function slugifyHeading(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s-]/gu, "")
			.trim()
			.replace(/\s+/g, "-");
	}

	let toc = $derived.by(() => {
		const lines = input.split(/\r?\n/);
		const items: Array<{ level: number; text: string; slug: string }> = [];
		const slugCounts = new Map<string, number>();
		let inFence = false;
		for (const raw of lines) {
			if (/^```|^~~~/.test(raw.trim())) {
				inFence = !inFence;
				continue;
			}
			if (inFence) continue;
			const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(raw);
			if (!m) continue;
			const level = m[1].length;
			if (level < minLevel || level > maxLevel) continue;
			const text = m[2].trim();
			let base = slugifyHeading(text);
			if (!base) base = "section";
			const count = slugCounts.get(base) ?? 0;
			slugCounts.set(base, count + 1);
			const slug = count === 0 ? base : `${base}-${count}`;
			items.push({ level, text, slug });
		}
		return items;
	});

	let output = $derived.by(() => {
		if (toc.length === 0) return "";
		if (style === "github") {
			const baseLevel = Math.min(...toc.map((i) => i.level));
			return toc
				.map((i) => {
					const indent = "  ".repeat(i.level - baseLevel);
					return `${indent}- [${i.text}](#${i.slug})`;
				})
				.join("\n");
		}
		const counters: number[] = [];
		const baseLevel = Math.min(...toc.map((i) => i.level));
		return toc
			.map((i) => {
				const depth = i.level - baseLevel;
				while (counters.length <= depth) counters.push(0);
				counters[depth]++;
				counters.length = depth + 1;
				const num = counters.join(".");
				const indent = "  ".repeat(depth);
				return `${indent}${num}. ${i.text}`;
			})
			.join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown TOC Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate a table of contents from Markdown headings. Skips fenced code blocks.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="min">Min level</Label>
				<Input id="min" type="number" min="1" max="6" bind:value={minLevel} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="max">Max level</Label>
				<Input id="max" type="number" min="1" max="6" bind:value={maxLevel} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="st">Style</Label>
				<Select.Root type="single" bind:value={style as never}>
					<Select.Trigger id="st" class="w-full">{style}</Select.Trigger>
					<Select.Content>
						<Select.Item value="github">GitHub-flavored bullets</Select.Item>
						<Select.Item value="numbered">Numbered (1.1, 1.2)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Markdown</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">TOC</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>
</main>
