<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { WORDS, diceRollIndex } from "$lib/diceware-words";

	let count = $state(6);
	let separator = $state("-");
	let capitalize = $state(false);
	let appendNumber = $state(false);
	let phrase = $state("");
	let words = $state<string[]>([]);

	const sepLabels: Record<string, string> = {
		"-": "Hyphen (-)",
		" ": "Space",
		"_": "Underscore",
		".": "Dot"
	};

	function generate() {
		const safeCount = Math.max(2, Math.min(20, Math.floor(count) || 4));
		const list: string[] = [];
		for (let i = 0; i < safeCount; i++) {
			let w = WORDS[diceRollIndex()];
			if (capitalize) w = w[0].toUpperCase() + w.slice(1);
			list.push(w);
		}
		words = list;
		let p = list.join(separator);
		if (appendNumber) {
			const buf = new Uint16Array(1);
			const limit = Math.floor(0x10000 / 100) * 100;
			let v: number;
			do {
				crypto.getRandomValues(buf);
				v = buf[0];
			} while (v >= limit);
			p += separator + (v % 100);
		}
		phrase = p;
	}

	$effect(() => {
		void count;
		void separator;
		void capitalize;
		void appendNumber;
		generate();
	});

	let entropy = $derived.by(() => {
		const bitsPerWord = Math.log2(WORDS.length);
		let bits = words.length * bitsPerWord;
		if (appendNumber) bits += Math.log2(100);
		return bits;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(phrase);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Diceware Passphrase</h1>
		<p class="text-muted-foreground mt-1">
			Generate memorable passphrases from a curated word list using crypto-grade entropy.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
		<Card.Content class="space-y-4">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="cn">Word count</Label>
					<Input id="cn" type="number" min="2" max="20" bind:value={count} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="sp">Separator</Label>
					<Select.Root type="single" bind:value={separator}>
						<Select.Trigger id="sp" class="w-full">{sepLabels[separator] ?? separator}</Select.Trigger>
						<Select.Content>
							<Select.Item value="-">Hyphen (-)</Select.Item>
							<Select.Item value=" ">Space</Select.Item>
							<Select.Item value="_">Underscore</Select.Item>
							<Select.Item value=".">Dot</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2 text-sm">
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={capitalize} class="h-4 w-4 rounded border" />
					Capitalize each word
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={appendNumber} class="h-4 w-4 rounded border" />
					Append a 2-digit number
				</label>
			</div>

			<Button onclick={generate}>
				<RefreshCw />
				Regenerate
			</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Passphrase</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!phrase}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<p class="bg-muted rounded-md p-3 font-mono text-lg break-all">{phrase}</p>
			<p class="text-muted-foreground mt-2 text-xs">
				Estimated entropy: {entropy.toFixed(0)} bits ({words.length} words from {WORDS.length}-word list).
				A full Diceware list (7776 words) gives ~12.9 bits per word; this curated list gives ~{Math.log2(WORDS.length).toFixed(1)}.
			</p>
		</Card.Content>
	</Card.Root>
</main>
