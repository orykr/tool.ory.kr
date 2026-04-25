<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let email = $state("alice@example.com");

	function htmlEntities(s: string): string {
		return Array.from(s)
			.map((ch) => `&#${ch.codePointAt(0)};`)
			.join("");
	}

	function rot13(s: string): string {
		return s.replace(/[a-zA-Z]/g, (c) => {
			const code = c.charCodeAt(0);
			const base = code >= 97 ? 97 : 65;
			return String.fromCharCode(((code - base + 13) % 26) + base);
		});
	}

	function reverse(s: string): string {
		return Array.from(s).reverse().join("");
	}

	function jsObfuscate(s: string): string {
		let out = "";
		for (let i = 0; i < s.length; i++) {
			out += "\\u" + s.charCodeAt(i).toString(16).padStart(4, "0");
		}
		return out;
	}

	let outputs = $derived({
		entities: htmlEntities(email),
		entitiesAt: email.replace(/@/g, "&#64;").replace(/\./g, "&#46;"),
		spaced: email.replace(/@/g, " [at] ").replace(/\./g, " [dot] "),
		spacedAt: email.replace(/@/g, "(at)").replace(/\./g, "(dot)"),
		rot13: rot13(email),
		reversed: reverse(email),
		js: jsObfuscate(email),
		mailtoEntities: `<a href="mailto:${htmlEntities(email)}">${htmlEntities(email)}</a>`
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
		<h1 class="text-3xl font-bold tracking-tight">Email Obfuscator</h1>
		<p class="text-muted-foreground mt-1">
			Hide an email address from naïve scrapers using HTML entities, ROT13, or display tricks.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Email</Card.Title></Card.Header>
		<Card.Content>
			<Input bind:value={email} class="font-mono" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Obfuscated forms</Card.Title></Card.Header>
		<Card.Content>
			<dl class="space-y-2">
				{#each [
					{ k: "HTML entities (full)", v: outputs.entities, key: "e" },
					{ k: "HTML entities (@/. only)", v: outputs.entitiesAt, key: "ea" },
					{ k: "Spaced [at] / [dot]", v: outputs.spaced, key: "s" },
					{ k: "Inline (at) / (dot)", v: outputs.spacedAt, key: "sa" },
					{ k: "ROT13", v: outputs.rot13, key: "r" },
					{ k: "Reversed", v: outputs.reversed, key: "rv" },
					{ k: "JS unicode escapes", v: outputs.js, key: "j" },
					{ k: "<a href=\"mailto:…\"> with entities", v: outputs.mailtoEntities, key: "m" }
				] as item (item.key)}
					<div class="bg-muted flex items-center justify-between gap-3 rounded-md p-3">
						<div class="min-w-0 flex-1">
							<p class="text-muted-foreground text-xs">{item.k}</p>
							<p class="font-mono text-xs break-all">{item.v}</p>
						</div>
						<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
							{#if copied === item.key}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				{/each}
			</dl>
			<p class="text-muted-foreground mt-3 text-xs">
				Obfuscation deters basic scrapers but is not a real anti-spam measure. Sophisticated
				crawlers handle entities and JS escapes.
			</p>
		</Card.Content>
	</Card.Root>
</main>
