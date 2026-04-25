<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Search from "@lucide/svelte/icons/search";

	const AGENTS: Array<{ name: string; ua: string; category: string }> = [
		{
			name: "Chrome 130 (Windows 10)",
			ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
			category: "Desktop"
		},
		{
			name: "Chrome 130 (macOS)",
			ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
			category: "Desktop"
		},
		{
			name: "Chrome 130 (Linux)",
			ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
			category: "Desktop"
		},
		{
			name: "Firefox 132 (Windows)",
			ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
			category: "Desktop"
		},
		{
			name: "Firefox 132 (macOS)",
			ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0",
			category: "Desktop"
		},
		{
			name: "Safari 17 (macOS)",
			ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
			category: "Desktop"
		},
		{
			name: "Edge 130 (Windows)",
			ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.46",
			category: "Desktop"
		},
		{
			name: "Safari iOS (iPhone)",
			ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
			category: "Mobile"
		},
		{
			name: "Safari iOS (iPad)",
			ua: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
			category: "Mobile"
		},
		{
			name: "Chrome Android (Pixel)",
			ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
			category: "Mobile"
		},
		{
			name: "Samsung Internet 25 (Android)",
			ua: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
			category: "Mobile"
		},
		{
			name: "Googlebot",
			ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130.0.0.0 Safari/537.36",
			category: "Bot"
		},
		{
			name: "Bingbot",
			ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36",
			category: "Bot"
		},
		{
			name: "DuckDuckBot",
			ua: "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
			category: "Bot"
		},
		{
			name: "Slackbot link expander",
			ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
			category: "Bot"
		},
		{
			name: "curl 8.10",
			ua: "curl/8.10.1",
			category: "CLI"
		},
		{
			name: "wget",
			ua: "Wget/1.24.5",
			category: "CLI"
		},
		{
			name: "PostmanRuntime",
			ua: "PostmanRuntime/7.42.0",
			category: "Tool"
		},
		{
			name: "node-fetch",
			ua: "node-fetch/3.3.2",
			category: "Tool"
		},
		{
			name: "Python requests",
			ua: "python-requests/2.32.3",
			category: "Tool"
		}
	];

	let query = $state("");

	let groups = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const filtered = q
			? AGENTS.filter(
					(a) =>
						a.name.toLowerCase().includes(q) ||
						a.ua.toLowerCase().includes(q) ||
						a.category.toLowerCase().includes(q)
				)
			: AGENTS;
		const map = new Map<string, typeof AGENTS>();
		for (const a of filtered) {
			if (!map.has(a.category)) map.set(a.category, []);
			map.get(a.category)!.push(a);
		}
		return Array.from(map.entries());
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1500);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">User Agent Strings</h1>
		<p class="text-muted-foreground mt-1">
			Reference of common browser, mobile, bot, and CLI User-Agent strings.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by name, UA, or category..." />
			</div>
		</Card.Content>
	</Card.Root>

	{#each groups as [cat, items] (cat)}
		<Card.Root class="mb-3">
			<Card.Header class="pb-2"><Card.Title class="text-sm">{cat}</Card.Title></Card.Header>
			<Card.Content>
				<ul class="space-y-2">
					{#each items as a (a.name)}
						<li class="bg-muted rounded-md p-3">
							<div class="flex items-center justify-between gap-2">
								<p class="text-sm font-semibold">{a.name}</p>
								<Button variant="ghost" size="sm" onclick={() => copy(a.ua)}>
									{#if copied === a.ua}<Check />Copied{:else}<Copy />Copy{/if}
								</Button>
							</div>
							<p class="font-mono mt-1 text-xs break-all">{a.ua}</p>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}
</main>
