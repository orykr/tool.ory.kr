<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Triplet = { r: boolean; w: boolean; x: boolean };

	let user = $state<Triplet>({ r: true, w: true, x: false });
	let group = $state<Triplet>({ r: true, w: false, x: false });
	let other = $state<Triplet>({ r: true, w: false, x: false });

	let octalInput = $state("644");
	let octalError = $state<string | null>(null);

	let trips = $derived([user, group, other]);

	let octal = $derived(
		trips
			.map((t) => (t.r ? 4 : 0) + (t.w ? 2 : 0) + (t.x ? 1 : 0))
			.join("")
	);

	let symbolic = $derived(
		trips
			.map((t) => (t.r ? "r" : "-") + (t.w ? "w" : "-") + (t.x ? "x" : "-"))
			.join("")
	);

	function applyOctal() {
		const v = octalInput.trim();
		if (!/^[0-7]{3,4}$/.test(v)) {
			octalError = "Enter 3 or 4 octal digits.";
			return;
		}
		octalError = null;
		const digits = v.length === 4 ? v.slice(1) : v;
		const update = (digit: number): Triplet => ({
			r: !!(digit & 4),
			w: !!(digit & 2),
			x: !!(digit & 1)
		});
		user = update(Number(digits[0]));
		group = update(Number(digits[1]));
		other = update(Number(digits[2]));
	}

	$effect(() => {
		const v = octalInput.trim();
		if (/^[0-7]{3,4}$/.test(v)) octalError = null;
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function explain(t: Triplet, label: string): string {
		const parts: string[] = [];
		if (t.r) parts.push("read");
		if (t.w) parts.push("write");
		if (t.x) parts.push("execute");
		return `${label}: ${parts.length ? parts.join(", ") : "(none)"}`;
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
		<h1 class="text-3xl font-bold tracking-tight">chmod Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Convert between octal numeric and symbolic Unix file permissions.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">From octal</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex items-end gap-2">
				<div class="flex-1 space-y-1.5">
					<Label for="octal-in">Octal (e.g. 755)</Label>
					<Input id="octal-in" bind:value={octalInput} class="font-mono" maxlength={4} />
				</div>
				<Button onclick={applyOctal}>Apply</Button>
			</div>
			{#if octalError}
				<p class="text-destructive text-xs">{octalError}</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Permissions</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-3 gap-4">
				{#each [{ name: "User", t: user }, { name: "Group", t: group }, { name: "Other", t: other }] as field, i (field.name)}
					<div class="space-y-2">
						<p class="text-sm font-semibold">{field.name}</p>
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" bind:checked={trips[i].r} class="h-4 w-4 rounded border" />
							Read (4)
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" bind:checked={trips[i].w} class="h-4 w-4 rounded border" />
							Write (2)
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" bind:checked={trips[i].x} class="h-4 w-4 rounded border" />
							Execute (1)
						</label>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Result</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<div>
					<p class="text-muted-foreground text-xs">Octal</p>
					<p class="font-mono text-2xl">{octal}</p>
				</div>
				<Button variant="ghost" size="sm" onclick={() => copy("o", octal)}>
					{#if copied === "o"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<div>
					<p class="text-muted-foreground text-xs">Symbolic</p>
					<p class="font-mono text-2xl">-{symbolic}</p>
				</div>
				<Button variant="ghost" size="sm" onclick={() => copy("s", symbolic)}>
					{#if copied === "s"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<div>
					<p class="text-muted-foreground text-xs">chmod command</p>
					<p class="font-mono">chmod {octal} <span class="text-muted-foreground">file</span></p>
				</div>
				<Button variant="ghost" size="sm" onclick={() => copy("c", `chmod ${octal} file`)}>
					{#if copied === "c"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			<ul class="text-muted-foreground space-y-0.5 text-xs">
				<li>{explain(user, "User")}</li>
				<li>{explain(group, "Group")}</li>
				<li>{explain(other, "Other")}</li>
			</ul>
		</Card.Content>
	</Card.Root>
</main>
