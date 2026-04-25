<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	const SAMPLE = `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=600, immutable
Expires: Wed, 21 Oct 2026 07:28:00 GMT
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Tue, 15 Nov 2024 12:45:26 GMT
Vary: Accept-Encoding, User-Agent
Age: 120`;

	let input = $state(SAMPLE);

	function findHeader(text: string, name: string): string | null {
		const re = new RegExp(`^\\s*${name.replace(/[-]/g, "[-]")}\\s*:\\s*(.+)$`, "im");
		const m = text.match(re);
		return m ? m[1].trim() : null;
	}

	let analysis = $derived.by(() => {
		const cc = findHeader(input, "Cache-Control");
		const expires = findHeader(input, "Expires");
		const etag = findHeader(input, "ETag");
		const lastMod = findHeader(input, "Last-Modified");
		const vary = findHeader(input, "Vary");
		const age = findHeader(input, "Age");

		const directives = new Map<string, string | true>();
		if (cc) {
			for (const part of cc.split(",")) {
				const [k, v] = part.split("=").map((s) => s.trim());
				directives.set(k.toLowerCase(), v === undefined ? true : v);
			}
		}

		const numFor = (k: string): number | null => {
			const v = directives.get(k);
			if (v === undefined || v === true) return null;
			const n = Number(v);
			return Number.isFinite(n) ? n : null;
		};

		const maxAge = numFor("max-age");
		const sMaxAge = numFor("s-maxage");
		const swr = numFor("stale-while-revalidate");
		const sie = numFor("stale-if-error");

		const flags = {
			public: directives.has("public"),
			private: directives.has("private"),
			noCache: directives.has("no-cache"),
			noStore: directives.has("no-store"),
			mustRevalidate: directives.has("must-revalidate"),
			immutable: directives.has("immutable"),
			noTransform: directives.has("no-transform"),
			proxyRevalidate: directives.has("proxy-revalidate")
		};

		const conditional = !!etag || !!lastMod;
		const fresh = (maxAge ?? -1) > 0 || !!expires;
		const cacheable = !flags.noStore && (fresh || conditional);

		const recommendations: string[] = [];
		if (flags.noStore) recommendations.push("no-store prevents any caching.");
		if (flags.noCache) recommendations.push("no-cache requires revalidation on every request.");
		if (flags.public && flags.private) recommendations.push("public and private together is contradictory.");
		if (!cc && !expires) recommendations.push("No caching directives — defaults to heuristic caching.");
		if (maxAge !== null && expires) recommendations.push("Both max-age and Expires set; max-age wins for HTTP/1.1.");
		if (flags.immutable && (maxAge ?? 0) < 60) recommendations.push("immutable usually pairs with very long max-age.");

		return {
			cc,
			expires,
			etag,
			lastMod,
			vary,
			age,
			maxAge,
			sMaxAge,
			swr,
			sie,
			flags,
			conditional,
			fresh,
			cacheable,
			recommendations
		};
	});

	function fmtSeconds(s: number | null): string {
		if (s === null) return "—";
		if (s < 60) return `${s}s`;
		if (s < 3600) return `${(s / 60).toFixed(1)}m`;
		if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
		return `${(s / 86400).toFixed(1)}d`;
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
		<h1 class="text-3xl font-bold tracking-tight">HTTP Cache Header Analyzer</h1>
		<p class="text-muted-foreground mt-1">
			Parse Cache-Control / Expires / ETag and explain caching behavior.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Headers</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Summary</Card.Title></Card.Header>
		<Card.Content>
			<dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">Cacheable</dt>
					<dd class="font-mono">{analysis.cacheable ? "yes" : "no"}</dd>
				</div>
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">max-age</dt>
					<dd class="font-mono">{fmtSeconds(analysis.maxAge)}</dd>
				</div>
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">s-maxage</dt>
					<dd class="font-mono">{fmtSeconds(analysis.sMaxAge)}</dd>
				</div>
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">stale-while-revalidate</dt>
					<dd class="font-mono">{fmtSeconds(analysis.swr)}</dd>
				</div>
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">stale-if-error</dt>
					<dd class="font-mono">{fmtSeconds(analysis.sie)}</dd>
				</div>
				<div class="bg-muted rounded p-2">
					<dt class="text-muted-foreground text-xs">Validators</dt>
					<dd class="font-mono">{analysis.conditional ? "ETag/Last-Modified" : "(none)"}</dd>
				</div>
			</dl>

			<div class="mt-3 flex flex-wrap gap-1 text-xs">
				{#each Object.entries(analysis.flags) as [k, v] (k)}
					<span class="rounded border px-2 py-0.5 {v ? 'bg-emerald-500/20' : 'bg-muted text-muted-foreground'}">
						{k}: {v ? "yes" : "no"}
					</span>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{#if analysis.recommendations.length}
		<Card.Root class="mb-4">
			<Card.Header><Card.Title class="text-base">Notes</Card.Title></Card.Header>
			<Card.Content>
				<ul class="list-disc space-y-1 pl-5 text-sm">
					{#each analysis.recommendations as r, i (i)}
						<li>{r}</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Parsed headers</Card.Title></Card.Header>
		<Card.Content>
			<dl class="space-y-2 text-sm">
				{#each [
					{ k: "Cache-Control", v: analysis.cc },
					{ k: "Expires", v: analysis.expires },
					{ k: "ETag", v: analysis.etag },
					{ k: "Last-Modified", v: analysis.lastMod },
					{ k: "Vary", v: analysis.vary },
					{ k: "Age", v: analysis.age }
				] as item, i (i)}
					<div class="bg-muted rounded p-2">
						<dt class="text-muted-foreground text-xs">{item.k}</dt>
						<dd class="font-mono break-all">{item.v ?? "—"}</dd>
					</div>
				{/each}
			</dl>
		</Card.Content>
	</Card.Root>
</main>
