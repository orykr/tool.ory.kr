<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import { Progress } from "$lib/components/ui/progress/index.js";

	const PLATFORMS: Array<{ name: string; limit: number; note?: string }> = [
		{ name: "Twitter/X (Free)", limit: 280 },
		{ name: "Twitter/X (Premium)", limit: 25000 },
		{ name: "Bluesky", limit: 300 },
		{ name: "Mastodon (default)", limit: 500 },
		{ name: "Threads", limit: 500 },
		{ name: "LinkedIn post", limit: 3000 },
		{ name: "LinkedIn headline", limit: 220 },
		{ name: "Facebook post", limit: 63206 },
		{ name: "Instagram caption", limit: 2200 },
		{ name: "Instagram bio", limit: 150 },
		{ name: "YouTube title", limit: 100 },
		{ name: "YouTube description", limit: 5000 },
		{ name: "Pinterest pin description", limit: 500 },
		{ name: "TikTok caption", limit: 2200 },
		{ name: "Discord message", limit: 2000 },
		{ name: "Reddit title", limit: 300 },
		{ name: "Reddit comment", limit: 10000 },
		{ name: "GitHub commit subject", limit: 72, note: "soft" },
		{ name: "Slack message", limit: 4000 },
		{ name: "SMS (single GSM-7)", limit: 160 },
		{ name: "SMS (single UCS-2)", limit: 70 }
	];

	let input = $state("Just shipped a tiny browser-only tools site with 130+ utilities. No backend, all client-side, dark-mode included. 🚀");

	let stats = $derived.by(() => {
		const codePoints = Array.from(input).length;
		const utf16 = input.length;
		const utf8Bytes = new TextEncoder().encode(input).length;
		return { codePoints, utf16, utf8Bytes };
	});

	function pct(used: number, limit: number): number {
		return Math.min(100, (used / limit) * 100);
	}

	function color(used: number, limit: number): string {
		const p = used / limit;
		if (p >= 1) return "text-destructive";
		if (p >= 0.9) return "text-amber-500";
		return "text-emerald-600 dark:text-emerald-400";
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
		<h1 class="text-3xl font-bold tracking-tight">Social Character Counter</h1>
		<p class="text-muted-foreground mt-1">
			Count code points, UTF-8 bytes, and check character limits across social platforms.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Text</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 text-sm" />
			<dl class="text-muted-foreground mt-3 grid grid-cols-3 gap-3 text-xs">
				<div><dt>Code points</dt><dd class="font-mono text-base">{stats.codePoints}</dd></div>
				<div><dt>UTF-16 units</dt><dd class="font-mono text-base">{stats.utf16}</dd></div>
				<div><dt>UTF-8 bytes</dt><dd class="font-mono text-base">{stats.utf8Bytes}</dd></div>
			</dl>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Platform limits</Card.Title></Card.Header>
		<Card.Content>
			<ul class="space-y-2">
				{#each PLATFORMS as p (p.name)}
					{@const used = stats.codePoints}
					<li class="space-y-1">
						<div class="flex items-center justify-between text-sm">
							<span>{p.name} {#if p.note}<span class="text-muted-foreground text-xs">({p.note})</span>{/if}</span>
							<span class="{color(used, p.limit)} font-mono text-xs">
								{used} / {p.limit}
							</span>
						</div>
						<Progress value={pct(used, p.limit)} max={100} />
					</li>
				{/each}
			</ul>
			<p class="text-muted-foreground mt-3 text-xs">
				Most platforms count code points (emoji = 1). Twitter weighs some characters double; results are approximate.
			</p>
		</Card.Content>
	</Card.Root>
</main>
