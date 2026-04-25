<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { COUNTRIES, CURRENCIES, LANGUAGES } from "$lib/iso-codes";

	let qCountry = $state("");
	let qCurrency = $state("");
	let qLanguage = $state("");

	let countries = $derived.by(() => {
		const q = qCountry.trim().toLowerCase();
		if (!q) return COUNTRIES;
		return COUNTRIES.filter(
			(c) =>
				c.alpha2.toLowerCase().includes(q) ||
				c.alpha3.toLowerCase().includes(q) ||
				c.numeric.includes(q) ||
				c.name.toLowerCase().includes(q)
		);
	});
	let currencies = $derived.by(() => {
		const q = qCurrency.trim().toLowerCase();
		if (!q) return CURRENCIES;
		return CURRENCIES.filter(
			(c) =>
				c.code.toLowerCase().includes(q) ||
				c.number.includes(q) ||
				c.name.toLowerCase().includes(q)
		);
	});
	let languages = $derived.by(() => {
		const q = qLanguage.trim().toLowerCase();
		if (!q) return LANGUAGES;
		return LANGUAGES.filter(
			(l) =>
				l.code.toLowerCase().includes(q) ||
				l.name.toLowerCase().includes(q) ||
				l.native.toLowerCase().includes(q)
		);
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">ISO Code Lookup</h1>
		<p class="text-muted-foreground mt-1">
			ISO 3166 countries, ISO 4217 currencies, and ISO 639 language codes.
		</p>
	</header>

	<Tabs.Root value="countries">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="countries">Countries</Tabs.Trigger>
			<Tabs.Trigger value="currencies">Currencies</Tabs.Trigger>
			<Tabs.Trigger value="languages">Languages</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="countries">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="flex items-center gap-2">
						<Search class="text-muted-foreground h-4 w-4" />
						<Input bind:value={qCountry} placeholder="Search by name or code..." />
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="px-2 py-2">Alpha-2</th>
									<th class="px-2 py-2">Alpha-3</th>
									<th class="px-2 py-2">Numeric</th>
									<th class="px-2 py-2">Name</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each countries as c (c.alpha2)}
									<tr class="border-b font-mono last:border-0">
										<td class="px-2 py-1">{c.alpha2}</td>
										<td class="px-2 py-1">{c.alpha3}</td>
										<td class="px-2 py-1">{c.numeric}</td>
										<td class="px-2 py-1 font-sans">{c.name}</td>
										<td class="px-2 py-1 text-right">
											<Button variant="ghost" size="sm" onclick={() => copy(c.alpha2)}>
												{#if copied === c.alpha2}<Check />{:else}<Copy />{/if}
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="currencies">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="flex items-center gap-2">
						<Search class="text-muted-foreground h-4 w-4" />
						<Input bind:value={qCurrency} placeholder="Search by code or name..." />
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="px-2 py-2">Code</th>
									<th class="px-2 py-2">Number</th>
									<th class="px-2 py-2">Name</th>
									<th class="px-2 py-2">Minor unit</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each currencies as c (c.code)}
									<tr class="border-b font-mono last:border-0">
										<td class="px-2 py-1">{c.code}</td>
										<td class="px-2 py-1">{c.number}</td>
										<td class="px-2 py-1 font-sans">{c.name}</td>
										<td class="px-2 py-1">{c.exponent}</td>
										<td class="px-2 py-1 text-right">
											<Button variant="ghost" size="sm" onclick={() => copy(c.code)}>
												{#if copied === c.code}<Check />{:else}<Copy />{/if}
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="languages">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="flex items-center gap-2">
						<Search class="text-muted-foreground h-4 w-4" />
						<Input bind:value={qLanguage} placeholder="Search by code or name..." />
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="px-2 py-2">Code</th>
									<th class="px-2 py-2">English</th>
									<th class="px-2 py-2">Native</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each languages as l (l.code)}
									<tr class="border-b last:border-0">
										<td class="px-2 py-1 font-mono">{l.code}</td>
										<td class="px-2 py-1">{l.name}</td>
										<td class="px-2 py-1">{l.native}</td>
										<td class="px-2 py-1 text-right">
											<Button variant="ghost" size="sm" onclick={() => copy(l.code)}>
												{#if copied === l.code}<Check />{:else}<Copy />{/if}
											</Button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
