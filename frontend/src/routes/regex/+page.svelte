<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let pattern = $state("\\b\\w+\\b");
	let flags = $state("g");
	let text = $state("Hello, world! This is a regex tester.");
	let replacement = $state("");
	let useReplace = $state(false);

	const flagSet = ["g", "i", "m", "s", "u", "y"] as const;

	function toggleFlag(flag: string) {
		if (flags.includes(flag)) flags = flags.replace(flag, "");
		else flags = flags + flag;
	}

	let result = $derived.by(() => {
		if (!pattern) return { ok: true as const, matches: [] as Match[], replaced: text };
		try {
			const re = new RegExp(pattern, flags);
			const matches: Match[] = [];
			if (flags.includes("g")) {
				let m: RegExpExecArray | null;
				const reLocal = new RegExp(pattern, flags);
				while ((m = reLocal.exec(text)) !== null) {
					matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
					if (m[0] === "" && reLocal.lastIndex === m.index) reLocal.lastIndex++;
				}
			} else {
				const m = re.exec(text);
				if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
			}
			let replaced = text;
			if (useReplace) {
				try {
					replaced = text.replace(re, replacement);
				} catch (e) {
					replaced = text;
				}
			}
			return { ok: true as const, matches, replaced };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	type Match = { match: string; index: number; groups: string[] };

	let highlighted = $derived.by(() => {
		if (!result.ok || result.matches.length === 0) return null;
		const segments: Array<{ text: string; highlight: boolean }> = [];
		let cursor = 0;
		for (const m of result.matches) {
			if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), highlight: false });
			if (m.match.length > 0) {
				segments.push({ text: m.match, highlight: true });
				cursor = m.index + m.match.length;
			} else {
				segments.push({ text: "∅", highlight: true });
				cursor = m.index;
			}
		}
		if (cursor < text.length) segments.push({ text: text.slice(cursor), highlight: false });
		return segments;
	});

	let copied = $state<string | null>(null);
	async function copy(label: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = label;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Regex Tester</h1>
		<p class="text-muted-foreground mt-1">
			Test JavaScript-flavored regular expressions with live highlighting and replace.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Pattern</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground font-mono">/</span>
				<Input bind:value={pattern} class="font-mono" placeholder="\\b\\w+\\b" />
				<span class="text-muted-foreground font-mono">/{flags}</span>
			</div>

			<div class="flex flex-wrap gap-2">
				{#each flagSet as flag (flag)}
					<button
						type="button"
						class="rounded border px-2 py-1 font-mono text-xs {flags.includes(flag)
							? 'bg-primary text-primary-foreground border-primary'
							: 'bg-background hover:bg-muted'}"
						onclick={() => toggleFlag(flag)}
					>
						{flag}
					</button>
				{/each}
			</div>

			{#if !result.ok}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{result.error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Test Text</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea bind:value={text} class="min-h-40 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	{#if result.ok}
		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title class="text-base">
					Matches ({result.matches.length})
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#if highlighted}
					<div
						class="bg-muted rounded-md p-3 font-mono text-sm whitespace-pre-wrap break-all"
					>
						{#each highlighted as seg, i (i)}
							{#if seg.highlight}
								<mark class="bg-yellow-300 dark:bg-yellow-700 dark:text-white">{seg.text}</mark>
							{:else}
								{seg.text}
							{/if}
						{/each}
					</div>
				{/if}

				{#if result.matches.length}
					<ul class="divide-y">
						{#each result.matches as m, i (i)}
							<li class="grid grid-cols-12 gap-3 py-2 text-sm">
								<span class="text-muted-foreground col-span-1 font-mono">#{i + 1}</span>
								<span class="text-muted-foreground col-span-2 font-mono">@{m.index}</span>
								<span class="col-span-9 font-mono break-all">"{m.match}"</span>
								{#if m.groups.length > 0}
									<div class="col-span-12 ml-3 space-y-0.5 border-l pl-3 text-xs">
										{#each m.groups as g, gi (gi)}
											<div class="font-mono">
												<span class="text-muted-foreground">$&#123;{gi + 1}&#125;</span> = "{g ?? ""}"
											</div>
										{/each}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Replace</Card.Title>
				<Card.Description>Use $1, $2, etc. for group backreferences.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={useReplace} class="h-4 w-4 rounded border" />
					Enable replace
				</label>

				<div class="space-y-1.5">
					<Label for="re-replace">Replacement</Label>
					<Input id="re-replace" bind:value={replacement} class="font-mono" />
				</div>

				{#if useReplace}
					<div class="flex items-center justify-between">
						<Label>Result</Label>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => copy("replaced", result.replaced)}
						>
							{#if copied === "replaced"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
					<pre class="bg-muted rounded-md p-3 font-mono text-sm whitespace-pre-wrap break-all">{result.replaced}</pre>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</main>
