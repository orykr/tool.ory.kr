<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Check from "@lucide/svelte/icons/check";
	import { TW_COLORS } from "$lib/tw-colors";

	let query = $state("");

	let palette = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return Object.entries(TW_COLORS).filter(([name]) => !q || name.includes(q));
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1000);
	}

	function isLight(hex: string): boolean {
		const n = parseInt(hex.slice(1), 16);
		const r = (n >> 16) & 0xff;
		const g = (n >> 8) & 0xff;
		const b = n & 0xff;
		return r * 0.299 + g * 0.587 + b * 0.114 > 150;
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Tailwind Color Reference</h1>
		<p class="text-muted-foreground mt-1">
			Click any swatch to copy its hex value. Tailwind 3.x default palette.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Filter by color name..." />
			</div>
		</Card.Content>
	</Card.Root>

	<div class="space-y-3">
		{#each palette as [name, shades] (name)}
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-base">{name}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-6 gap-1 sm:grid-cols-11">
						{#each Object.entries(shades) as [shade, hex] (shade)}
							{@const className = `${name}-${shade}`}
							<button
								type="button"
								class="relative aspect-square rounded p-1 text-xs font-medium transition-transform hover:scale-105"
								style="background: {hex}; color: {isLight(hex) ? '#000' : '#fff'}"
								title={hex}
								onclick={() => copy(className)}
							>
								<span class="absolute top-1 left-1 text-[10px]">{shade}</span>
								<span class="absolute right-1 bottom-1 font-mono text-[9px] opacity-80">{hex}</span>
								{#if copied === className}
									<Check class="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
								{/if}
							</button>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
