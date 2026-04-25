<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Check from "@lucide/svelte/icons/check";

	const SECTIONS: Array<{ name: string; chars: Array<{ ch: string; name: string; cp: number }> }> = [
		{
			name: "Light",
			chars: [
				{ ch: "─", name: "horizontal", cp: 0x2500 },
				{ ch: "│", name: "vertical", cp: 0x2502 },
				{ ch: "┌", name: "down + right", cp: 0x250c },
				{ ch: "┐", name: "down + left", cp: 0x2510 },
				{ ch: "└", name: "up + right", cp: 0x2514 },
				{ ch: "┘", name: "up + left", cp: 0x2518 },
				{ ch: "├", name: "vertical + right", cp: 0x251c },
				{ ch: "┤", name: "vertical + left", cp: 0x2524 },
				{ ch: "┬", name: "down + horizontal", cp: 0x252c },
				{ ch: "┴", name: "up + horizontal", cp: 0x2534 },
				{ ch: "┼", name: "vertical + horizontal", cp: 0x253c }
			]
		},
		{
			name: "Heavy",
			chars: [
				{ ch: "━", name: "horizontal", cp: 0x2501 },
				{ ch: "┃", name: "vertical", cp: 0x2503 },
				{ ch: "┏", name: "down + right", cp: 0x250f },
				{ ch: "┓", name: "down + left", cp: 0x2513 },
				{ ch: "┗", name: "up + right", cp: 0x2517 },
				{ ch: "┛", name: "up + left", cp: 0x251b },
				{ ch: "┣", name: "vertical + right", cp: 0x2523 },
				{ ch: "┫", name: "vertical + left", cp: 0x252b },
				{ ch: "┳", name: "down + horizontal", cp: 0x2533 },
				{ ch: "┻", name: "up + horizontal", cp: 0x253b },
				{ ch: "╋", name: "vertical + horizontal", cp: 0x254b }
			]
		},
		{
			name: "Double",
			chars: [
				{ ch: "═", name: "horizontal", cp: 0x2550 },
				{ ch: "║", name: "vertical", cp: 0x2551 },
				{ ch: "╔", name: "down + right", cp: 0x2554 },
				{ ch: "╗", name: "down + left", cp: 0x2557 },
				{ ch: "╚", name: "up + right", cp: 0x255a },
				{ ch: "╝", name: "up + left", cp: 0x255d },
				{ ch: "╠", name: "vertical + right", cp: 0x2560 },
				{ ch: "╣", name: "vertical + left", cp: 0x2563 },
				{ ch: "╦", name: "down + horizontal", cp: 0x2566 },
				{ ch: "╩", name: "up + horizontal", cp: 0x2569 },
				{ ch: "╬", name: "vertical + horizontal", cp: 0x256c }
			]
		},
		{
			name: "Rounded",
			chars: [
				{ ch: "╭", name: "rounded down + right", cp: 0x256d },
				{ ch: "╮", name: "rounded down + left", cp: 0x256e },
				{ ch: "╯", name: "rounded up + left", cp: 0x256f },
				{ ch: "╰", name: "rounded up + right", cp: 0x2570 }
			]
		},
		{
			name: "Block",
			chars: [
				{ ch: "█", name: "full block", cp: 0x2588 },
				{ ch: "▓", name: "dark shade", cp: 0x2593 },
				{ ch: "▒", name: "medium shade", cp: 0x2592 },
				{ ch: "░", name: "light shade", cp: 0x2591 },
				{ ch: "▀", name: "upper half block", cp: 0x2580 },
				{ ch: "▄", name: "lower half block", cp: 0x2584 },
				{ ch: "▌", name: "left half block", cp: 0x258c },
				{ ch: "▐", name: "right half block", cp: 0x2590 }
			]
		},
		{
			name: "Geometric",
			chars: [
				{ ch: "■", name: "black square", cp: 0x25a0 },
				{ ch: "□", name: "white square", cp: 0x25a1 },
				{ ch: "●", name: "black circle", cp: 0x25cf },
				{ ch: "○", name: "white circle", cp: 0x25cb },
				{ ch: "▲", name: "up-pointing triangle", cp: 0x25b2 },
				{ ch: "▼", name: "down-pointing triangle", cp: 0x25bc },
				{ ch: "◆", name: "diamond", cp: 0x25c6 },
				{ ch: "◯", name: "large circle", cp: 0x25ef }
			]
		}
	];

	let query = $state("");

	let groups = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return SECTIONS;
		return SECTIONS.map((s) => ({
			...s,
			chars: s.chars.filter(
				(c) =>
					c.name.toLowerCase().includes(q) ||
					c.ch === query.trim() ||
					c.cp.toString(16).includes(q)
			)
		})).filter((s) => s.chars.length > 0);
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1000);
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
		<h1 class="text-3xl font-bold tracking-tight">Box Drawing & Block Characters</h1>
		<p class="text-muted-foreground mt-1">
			Click to copy Unicode box-drawing, block, and geometric shape characters.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by name or paste a character..." />
			</div>
		</Card.Content>
	</Card.Root>

	{#each groups as section (section.name)}
		<Card.Root class="mb-3">
			<Card.Header class="pb-2"><Card.Title class="text-sm">{section.name}</Card.Title></Card.Header>
			<Card.Content>
				<div class="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6">
					{#each section.chars as c (c.cp)}
						<button
							type="button"
							class="hover:bg-muted relative flex flex-col items-center rounded border p-2 text-center"
							onclick={() => copy(c.ch)}
							title={c.name}
						>
							<span class="font-mono text-2xl">{c.ch}</span>
							<span class="text-muted-foreground mt-1 text-[10px]">U+{c.cp.toString(16).toUpperCase()}</span>
							{#if copied === c.ch}
								<span class="bg-emerald-500/30 absolute inset-0 flex items-center justify-center rounded">
									<Check class="h-4 w-4" />
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</main>
