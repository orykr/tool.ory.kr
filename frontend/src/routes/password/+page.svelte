<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import {
		generatePassword,
		passwordStrength,
		alphabetSizeFor,
		type PasswordOptions
	} from "$lib/password";

	let length = $state([16]);
	let lowercase = $state(true);
	let uppercase = $state(true);
	let numbers = $state(true);
	let symbols = $state(true);
	let avoidAmbiguous = $state(false);
	let count = $state(1);

	let passwords = $state<string[]>([]);
	let error = $state<string | null>(null);
	let copiedIndex = $state<number | null>(null);

	let opts = $derived<PasswordOptions>({
		length: length[0],
		lowercase,
		uppercase,
		numbers,
		symbols,
		avoidAmbiguous
	});

	function generate() {
		try {
			const safeCount = Math.max(1, Math.min(50, Math.floor(count) || 1));
			const list: string[] = [];
			for (let i = 0; i < safeCount; i++) list.push(generatePassword(opts));
			passwords = list;
			error = null;
		} catch (e) {
			passwords = [];
			error = (e as Error).message;
		}
	}

	$effect(() => {
		void length;
		void lowercase;
		void uppercase;
		void numbers;
		void symbols;
		void avoidAmbiguous;
		generate();
	});

	let strength = $derived(
		passwords[0] ? passwordStrength(passwords[0], alphabetSizeFor(opts)) : null
	);

	const strengthColors = [
		"bg-destructive",
		"bg-orange-500",
		"bg-yellow-500",
		"bg-lime-500",
		"bg-emerald-500"
	];

	async function copy(index: number) {
		await navigator.clipboard.writeText(passwords[index]);
		copiedIndex = index;
		setTimeout(() => (copiedIndex = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Password Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate cryptographically random passwords. All randomness uses your browser's CSPRNG.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Options</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-5">
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>Length</Label>
					<span class="text-muted-foreground font-mono text-sm">{length[0]}</span>
				</div>
				<Slider type="single" bind:value={length} min={4} max={64} step={1} />
			</div>

			<div class="grid grid-cols-2 gap-2 text-sm">
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={lowercase} class="h-4 w-4 rounded border" />
					Lowercase (a-z)
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={uppercase} class="h-4 w-4 rounded border" />
					Uppercase (A-Z)
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={numbers} class="h-4 w-4 rounded border" />
					Numbers (0-9)
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input type="checkbox" bind:checked={symbols} class="h-4 w-4 rounded border" />
					Symbols (!@#…)
				</label>
				<label class="col-span-2 flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						bind:checked={avoidAmbiguous}
						class="h-4 w-4 rounded border"
					/>
					Avoid ambiguous characters (l, I, 1, O, 0, o)
				</label>
			</div>

			<div class="flex items-end gap-3">
				<div class="flex-1 space-y-1.5">
					<Label for="pw-count">Count</Label>
					<Input id="pw-count" type="number" min="1" max="50" bind:value={count} />
				</div>
				<Button onclick={generate}>
					<RefreshCw />
					Generate
				</Button>
			</div>

			{#if error}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if passwords.length}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Result</Card.Title>
				{#if strength}
					<div class="mt-2 flex items-center gap-3 text-sm">
						<div class="bg-muted relative h-2 w-32 overflow-hidden rounded">
							<div
								class="absolute inset-y-0 left-0 {strengthColors[strength.score]}"
								style="width: {((strength.score + 1) / 5) * 100}%"
							></div>
						</div>
						<span class="text-muted-foreground">
							{strength.label} · {strength.entropy.toFixed(0)} bits
						</span>
					</div>
				{/if}
			</Card.Header>
			<Card.Content>
				<ul class="divide-y">
					{#each passwords as pw, i (i + pw)}
						<li class="flex items-center justify-between gap-2 py-1.5">
							<code class="text-sm break-all">{pw}</code>
							<Button variant="ghost" size="sm" onclick={() => copy(i)}>
								{#if copiedIndex === i}
									<Check />
								{:else}
									<Copy />
								{/if}
							</Button>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
