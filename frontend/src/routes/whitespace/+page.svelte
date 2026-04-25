<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(
		"Hello\tworld!\n  Indented with spaces\n\tIndented with tab\n Non-breaking space\nTrailing space   \nMixed\t  trailing\t \r\n"
	);

	type Segment = { kind: "text" | "tab" | "space" | "newline" | "crlf" | "cr" | "nbsp" | "zwsp" | "other"; value: string };

	let segments = $derived.by(() => {
		const out: Segment[] = [];
		let buffer = "";
		const flush = () => {
			if (buffer) {
				out.push({ kind: "text", value: buffer });
				buffer = "";
			}
		};
		const chars = Array.from(input);
		for (let i = 0; i < chars.length; i++) {
			const ch = chars[i];
			if (ch === " ") {
				flush();
				out.push({ kind: "space", value: " " });
			} else if (ch === "\t") {
				flush();
				out.push({ kind: "tab", value: "\t" });
			} else if (ch === "\r") {
				flush();
				if (chars[i + 1] === "\n") {
					out.push({ kind: "crlf", value: "\r\n" });
					i++;
				} else {
					out.push({ kind: "cr", value: "\r" });
				}
			} else if (ch === "\n") {
				flush();
				out.push({ kind: "newline", value: "\n" });
			} else if (ch === " ") {
				flush();
				out.push({ kind: "nbsp", value: " " });
			} else if (ch === "​" || ch === "‌" || ch === "‍" || ch === "﻿") {
				flush();
				out.push({ kind: "zwsp", value: ch });
			} else if (/\s/.test(ch) && ch !== "\n" && ch !== "\r") {
				flush();
				out.push({ kind: "other", value: ch });
			} else {
				buffer += ch;
			}
		}
		flush();
		return out;
	});

	let stats = $derived.by(() => {
		const counts = { tab: 0, space: 0, newline: 0, crlf: 0, cr: 0, nbsp: 0, zwsp: 0, other: 0 };
		for (const s of segments) {
			if (s.kind in counts) (counts as any)[s.kind]++;
		}
		return counts;
	});

	function clean(opts: { trimTrailing: boolean; collapseSpaces: boolean; tabsToSpaces: number; crlfToLf: boolean }): string {
		let s = input;
		if (opts.crlfToLf) s = s.replace(/\r\n/g, "\n");
		if (opts.tabsToSpaces > 0) s = s.replace(/\t/g, " ".repeat(opts.tabsToSpaces));
		if (opts.trimTrailing) s = s.split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n");
		if (opts.collapseSpaces) s = s.replace(/[ \t]+/g, " ");
		return s;
	}

	let trimTrailing = $state(true);
	let collapseSpaces = $state(false);
	let tabsToSpaces = $state(0);
	let crlfToLf = $state(true);

	let cleaned = $derived(clean({ trimTrailing, collapseSpaces, tabsToSpaces, crlfToLf }));

	let copied = $state(false);
	async function copyClean() {
		await navigator.clipboard.writeText(cleaned);
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
		<h1 class="text-3xl font-bold tracking-tight">Whitespace Visualizer</h1>
		<p class="text-muted-foreground mt-1">
			Reveal hidden whitespace, line endings, and zero-width characters.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Visualized</Card.Title></Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap">{#each segments as s, i (i)}{#if s.kind === "text"}{s.value}{:else if s.kind === "space"}<span class="bg-sky-200 dark:bg-sky-800/60" title="space">·</span>{:else if s.kind === "tab"}<span class="bg-amber-200 dark:bg-amber-800/60" title="tab">→</span>{:else if s.kind === "newline"}<span class="text-emerald-600 dark:text-emerald-400" title="LF">↵
</span>{:else if s.kind === "crlf"}<span class="text-violet-600 dark:text-violet-400" title="CRLF">⏎
</span>{:else if s.kind === "cr"}<span class="text-rose-600 dark:text-rose-400" title="CR">⮐</span>{:else if s.kind === "nbsp"}<span class="bg-rose-200 dark:bg-rose-800/60" title="NBSP">␣</span>{:else if s.kind === "zwsp"}<span class="bg-purple-300 dark:bg-purple-700/60" title="zero-width">∅</span>{:else}<span class="bg-yellow-200 dark:bg-yellow-800/60" title="other whitespace">⌷</span>{/if}{/each}</pre>
			<dl class="text-muted-foreground mt-3 grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
				<div><dt>Spaces:</dt><dd class="font-mono">{stats.space}</dd></div>
				<div><dt>Tabs:</dt><dd class="font-mono">{stats.tab}</dd></div>
				<div><dt>LF (\n):</dt><dd class="font-mono">{stats.newline}</dd></div>
				<div><dt>CRLF (\r\n):</dt><dd class="font-mono">{stats.crlf}</dd></div>
				<div><dt>CR (\r):</dt><dd class="font-mono">{stats.cr}</dd></div>
				<div><dt>NBSP ( ):</dt><dd class="font-mono">{stats.nbsp}</dd></div>
				<div><dt>Zero-width:</dt><dd class="font-mono">{stats.zwsp}</dd></div>
				<div><dt>Other WS:</dt><dd class="font-mono">{stats.other}</dd></div>
			</dl>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Cleaned output</Card.Title>
			<Button variant="ghost" size="sm" onclick={copyClean}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid grid-cols-2 gap-2 text-sm">
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={trimTrailing} class="h-4 w-4 rounded border" />
					Trim trailing whitespace per line
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={collapseSpaces} class="h-4 w-4 rounded border" />
					Collapse runs of spaces/tabs to one space
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={crlfToLf} class="h-4 w-4 rounded border" />
					Convert CRLF to LF
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					Convert tabs to
					<input
						type="number"
						min="0"
						max="16"
						bind:value={tabsToSpaces}
						class="h-7 w-16 rounded border px-2 text-sm"
					/>
					spaces (0 = keep)
				</label>
			</div>
			<Textarea value={cleaned} readonly class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>
</main>
