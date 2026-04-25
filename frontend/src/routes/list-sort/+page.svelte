<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state("banana\napple\nCherry\n10\n2\n100\napple\nBanana\n");
	let mode = $state<"alpha" | "alpha-i" | "natural" | "length" | "numeric" | "reverse" | "shuffle" | "unique" | "trim">("natural");
	let direction = $state<"asc" | "desc">("asc");
	let dedup = $state(false);

	function naturalCompare(a: string, b: string): number {
		const ax: Array<[number, string]> = [];
		const bx: Array<[number, string]> = [];
		a.replace(/(\d+)|(\D+)/g, (_, n, s) => {
			ax.push([n ? Number(n) : Infinity, s ?? ""]);
			return "";
		});
		b.replace(/(\d+)|(\D+)/g, (_, n, s) => {
			bx.push([n ? Number(n) : Infinity, s ?? ""]);
			return "";
		});
		while (ax.length && bx.length) {
			const an = ax.shift()!;
			const bn = bx.shift()!;
			const nn = an[0] - bn[0];
			if (nn) return nn;
			if (an[1] !== bn[1]) return an[1] < bn[1] ? -1 : 1;
		}
		return ax.length - bx.length;
	}

	function shuffle<T>(arr: T[]): T[] {
		const out = [...arr];
		for (let i = out.length - 1; i > 0; i--) {
			const buf = new Uint32Array(1);
			crypto.getRandomValues(buf);
			const j = buf[0] % (i + 1);
			[out[i], out[j]] = [out[j], out[i]];
		}
		return out;
	}

	let result = $derived.by(() => {
		let lines = input.split(/\r?\n/);
		if (mode === "trim") return lines.map((l) => l.trim()).join("\n");
		lines = lines.filter((l) => l.trim().length > 0);
		if (dedup) lines = Array.from(new Set(lines));
		switch (mode) {
			case "alpha":
				lines.sort();
				break;
			case "alpha-i":
				lines.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
				break;
			case "natural":
				lines.sort(naturalCompare);
				break;
			case "length":
				lines.sort((a, b) => a.length - b.length);
				break;
			case "numeric":
				lines.sort((a, b) => {
					const x = Number(a);
					const y = Number(b);
					if (Number.isFinite(x) && Number.isFinite(y)) return x - y;
					if (Number.isFinite(x)) return -1;
					if (Number.isFinite(y)) return 1;
					return a.localeCompare(b);
				});
				break;
			case "reverse":
				lines.reverse();
				break;
			case "shuffle":
				lines = shuffle(lines);
				break;
			case "unique":
				lines = Array.from(new Set(lines));
				break;
		}
		if (direction === "desc" && mode !== "shuffle" && mode !== "reverse" && mode !== "trim" && mode !== "unique") {
			lines.reverse();
		}
		return lines.join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(result);
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
		<h1 class="text-3xl font-bold tracking-tight">List Sort & Shuffle</h1>
		<p class="text-muted-foreground mt-1">
			Sort, shuffle, dedupe, or trim a line-based list.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="md">Operation</Label>
				<Select.Root type="single" bind:value={mode as never}>
					<Select.Trigger id="md" class="w-56">{mode}</Select.Trigger>
					<Select.Content>
						<Select.Item value="natural">Natural sort</Select.Item>
						<Select.Item value="alpha">Alphabetical (case-sensitive)</Select.Item>
						<Select.Item value="alpha-i">Alphabetical (case-insensitive)</Select.Item>
						<Select.Item value="numeric">Numeric</Select.Item>
						<Select.Item value="length">By length</Select.Item>
						<Select.Item value="reverse">Reverse only</Select.Item>
						<Select.Item value="shuffle">Shuffle (CSPRNG)</Select.Item>
						<Select.Item value="unique">Unique only</Select.Item>
						<Select.Item value="trim">Trim spaces</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="dr">Direction</Label>
				<Select.Root type="single" bind:value={direction as never}>
					<Select.Trigger id="dr" class="w-32">{direction}</Select.Trigger>
					<Select.Content>
						<Select.Item value="asc">Ascending</Select.Item>
						<Select.Item value="desc">Descending</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={dedup} class="h-4 w-4 rounded border" />
				Deduplicate
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Output</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!result}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={result} readonly class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>
</main>
