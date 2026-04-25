<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import YAML from "yaml";
	import TOML from "@iarna/toml";

	const SAMPLE = `---
title: "Hello, World"
date: 2026-04-26
draft: false
tags:
  - intro
  - blog
author:
  name: Ada Lovelace
  email: ada@example.com
---

# Hello

This is the body of the document.`;

	let input = $state(SAMPLE);

	let parsed = $derived.by(() => {
		const text = input;
		// YAML frontmatter
		const yamlMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
		if (yamlMatch) {
			try {
				const data = YAML.parse(yamlMatch[1]) ?? {};
				return {
					ok: true as const,
					format: "YAML",
					data,
					content: yamlMatch[2]
				};
			} catch (e) {
				return { ok: false as const, error: `YAML parse error: ${(e as Error).message}` };
			}
		}
		// TOML frontmatter (+++ delimiter)
		const tomlMatch = text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n?([\s\S]*)$/);
		if (tomlMatch) {
			try {
				const data = TOML.parse(tomlMatch[1]);
				return {
					ok: true as const,
					format: "TOML",
					data,
					content: tomlMatch[2]
				};
			} catch (e) {
				return { ok: false as const, error: `TOML parse error: ${(e as Error).message}` };
			}
		}
		// JSON frontmatter ({}) — balanced brace match (string-aware)
		if (text.startsWith("{")) {
			let depth = 0;
			let inString = false;
			let escape = false;
			let end = -1;
			for (let i = 0; i < text.length; i++) {
				const ch = text[i];
				if (escape) {
					escape = false;
					continue;
				}
				if (inString) {
					if (ch === "\\") escape = true;
					else if (ch === '"') inString = false;
					continue;
				}
				if (ch === '"') inString = true;
				else if (ch === "{") depth++;
				else if (ch === "}") {
					depth--;
					if (depth === 0) {
						end = i + 1;
						break;
					}
				}
			}
			if (end > 0) {
				try {
					const data = JSON.parse(text.slice(0, end));
					return {
						ok: true as const,
						format: "JSON",
						data,
						content: text.slice(end).replace(/^\r?\n/, "")
					};
				} catch (e) {
					return { ok: false as const, error: `JSON parse error: ${(e as Error).message}` };
				}
			}
		}
		return { ok: true as const, format: null, data: null, content: text };
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Frontmatter Parser</h1>
		<p class="text-muted-foreground mt-1">
			Extract YAML, TOML, or JSON frontmatter from Markdown documents.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Document</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-48 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	{#if parsed.ok === false}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">
						Frontmatter
						{#if parsed.format}
							<span class="text-muted-foreground ml-2 text-xs">({parsed.format})</span>
						{/if}
					</Card.Title>
					{#if parsed.data}
						<Button
							variant="ghost"
							size="sm"
							onclick={() => copy("d", JSON.stringify(parsed.data, null, 2))}
						>
							{#if copied === "d"}<Check />Copied{:else}<Copy />Copy JSON{/if}
						</Button>
					{/if}
				</Card.Header>
				<Card.Content>
					{#if parsed.data}
						<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">{JSON.stringify(parsed.data, null, 2)}</pre>
					{:else}
						<p class="text-muted-foreground text-sm">No frontmatter detected.</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Body</Card.Title>
					<Button variant="ghost" size="sm" onclick={() => copy("b", parsed.content)}>
						{#if copied === "b"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<Textarea value={parsed.content} readonly class="min-h-72 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</main>
