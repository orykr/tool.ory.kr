<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let value = $state(1234567.89);
	let locale = $state("en-US");
	let style = $state<"decimal" | "currency" | "percent" | "unit">("decimal");
	let currency = $state("USD");
	let unit = $state("kilometer-per-hour");
	let minFrac = $state(0);
	let maxFrac = $state(2);
	let useGrouping = $state(true);

	const locales = [
		"en-US", "en-GB", "ko-KR", "ja-JP", "zh-CN", "de-DE", "fr-FR", "es-ES",
		"pt-BR", "it-IT", "ru-RU", "ar-SA", "hi-IN", "th-TH", "tr-TR", "vi-VN"
	];

	const currencies = ["USD", "EUR", "GBP", "JPY", "KRW", "CNY", "INR", "BRL", "CAD", "AUD"];

	const units = [
		"meter", "kilometer", "centimeter", "mile", "foot", "inch", "kilogram",
		"gram", "pound", "ounce", "celsius", "fahrenheit", "second", "hour",
		"liter", "byte", "kilobyte", "megabyte", "gigabyte", "kilometer-per-hour",
		"mile-per-hour", "percent"
	];

	let formatted = $derived.by(() => {
		try {
			const opts: Intl.NumberFormatOptions = {
				minimumFractionDigits: Math.max(0, Math.min(20, Math.floor(minFrac) || 0)),
				maximumFractionDigits: Math.max(0, Math.min(20, Math.floor(maxFrac) || 0)),
				useGrouping
			};
			if (style === "currency") {
				opts.style = "currency";
				opts.currency = currency;
			} else if (style === "percent") {
				opts.style = "percent";
			} else if (style === "unit") {
				opts.style = "unit";
				opts.unit = unit;
			}
			return new Intl.NumberFormat(locale, opts).format(Number(value));
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
	});

	let presets = $derived.by(() => {
		try {
			const n = Number(value);
			return {
				comma: n.toLocaleString("en-US"),
				space: n.toLocaleString("fr-FR"),
				dot: n.toLocaleString("de-DE"),
				engineering: n.toExponential(),
				compact: new Intl.NumberFormat("en-US", { notation: "compact" }).format(n)
			};
		} catch {
			return null;
		}
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Number Formatter</h1>
		<p class="text-muted-foreground mt-1">
			Format numbers with locale, currency, percent, or unit (uses <code>Intl.NumberFormat</code>).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Inputs</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="v">Value</Label>
					<Input id="v" type="number" step="any" bind:value={value} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="lc">Locale</Label>
					<Select.Root type="single" bind:value={locale}>
						<Select.Trigger id="lc" class="w-full">{locale}</Select.Trigger>
						<Select.Content>
							{#each locales as l (l)}
								<Select.Item value={l}>{l}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="st">Style</Label>
					<Select.Root type="single" bind:value={style as never}>
						<Select.Trigger id="st" class="w-full">{style}</Select.Trigger>
						<Select.Content>
							<Select.Item value="decimal">decimal</Select.Item>
							<Select.Item value="currency">currency</Select.Item>
							<Select.Item value="percent">percent</Select.Item>
							<Select.Item value="unit">unit</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				{#if style === "currency"}
					<div class="space-y-1.5">
						<Label for="cu">Currency</Label>
						<Select.Root type="single" bind:value={currency}>
							<Select.Trigger id="cu" class="w-full">{currency}</Select.Trigger>
							<Select.Content>
								{#each currencies as c (c)}
									<Select.Item value={c}>{c}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{:else if style === "unit"}
					<div class="space-y-1.5">
						<Label for="un">Unit</Label>
						<Select.Root type="single" bind:value={unit}>
							<Select.Trigger id="un" class="w-full">{unit}</Select.Trigger>
							<Select.Content class="max-h-72">
								{#each units as u (u)}
									<Select.Item value={u}>{u}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/if}
				<div class="space-y-1.5">
					<Label for="mn">Min fraction digits</Label>
					<Input id="mn" type="number" min="0" max="20" bind:value={minFrac} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="mx">Max fraction digits</Label>
					<Input id="mx" type="number" min="0" max="20" bind:value={maxFrac} class="font-mono" />
				</div>
			</div>
			<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={useGrouping} class="h-4 w-4 rounded border" />
				Use grouping separator
			</label>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="bg-muted flex items-center justify-between rounded-md p-4">
				<p class="font-mono text-2xl">{formatted}</p>
				<Button variant="ghost" size="sm" onclick={() => copy("f", formatted)}>
					{#if copied === "f"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	{#if presets}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Common formats</Card.Title></Card.Header>
			<Card.Content>
				<dl class="space-y-2 text-sm">
					{#each [
						{ k: "Comma (en-US)", v: presets.comma, key: "c" },
						{ k: "Space (fr-FR)", v: presets.space, key: "s" },
						{ k: "Dot (de-DE)", v: presets.dot, key: "d" },
						{ k: "Engineering", v: presets.engineering, key: "e" },
						{ k: "Compact", v: presets.compact, key: "p" }
					] as item (item.key)}
						<div class="bg-muted flex items-center justify-between rounded-md p-2">
							<div>
								<dt class="text-muted-foreground text-xs">{item.k}</dt>
								<dd class="font-mono">{item.v}</dd>
							</div>
							<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
								{#if copied === item.key}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{/each}
				</dl>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
