<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	function localDateTime(d: Date): string {
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	let baseInput = $state(localDateTime(new Date()));
	let years = $state(0);
	let months = $state(0);
	let weeks = $state(0);
	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);
	let op = $state<"add" | "sub">("add");

	let parsed = $derived.by(() => {
		const d = new Date(baseInput);
		if (Number.isNaN(d.getTime())) return null;
		return d;
	});

	function lastDayOf(year: number, month: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	let result = $derived.by(() => {
		if (!parsed) return null;
		const sign = op === "add" ? 1 : -1;
		const d = new Date(parsed.getTime());

		const totalMonths = sign * (years * 12 + months);
		if (totalMonths !== 0) {
			const day = d.getDate();
			d.setDate(1);
			d.setMonth(d.getMonth() + totalMonths);
			d.setDate(Math.min(day, lastDayOf(d.getFullYear(), d.getMonth())));
		}

		d.setDate(d.getDate() + sign * (weeks * 7 + days));
		d.setHours(d.getHours() + sign * hours);
		d.setMinutes(d.getMinutes() + sign * minutes);
		d.setSeconds(d.getSeconds() + sign * seconds);
		return d;
	});

	function reset() {
		years = 0;
		months = 0;
		weeks = 0;
		days = 0;
		hours = 0;
		minutes = 0;
		seconds = 0;
	}

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function fmt(d: Date): { iso: string; utc: string; local: string; unix: number; weekday: string } {
		return {
			iso: d.toISOString(),
			utc: d.toUTCString(),
			local: d.toString(),
			unix: Math.floor(d.getTime() / 1000),
			weekday: d.toLocaleDateString(undefined, { weekday: "long" })
		};
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
		<h1 class="text-3xl font-bold tracking-tight">Date Math</h1>
		<p class="text-muted-foreground mt-1">
			Add or subtract years, months, days, and time from a base date.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Base date</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<Input type="datetime-local" bind:value={baseInput} class="font-mono" step="1" />
			{#if !parsed}
				<p class="text-destructive text-xs">Invalid date.</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Offset</Card.Title>
			<div class="flex gap-2">
				<Button variant={op === "add" ? "default" : "outline"} size="sm" onclick={() => (op = "add")}>+ Add</Button>
				<Button variant={op === "sub" ? "default" : "outline"} size="sm" onclick={() => (op = "sub")}>− Subtract</Button>
				<Button variant="ghost" size="sm" onclick={reset}>Reset</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{#each [
					{ k: "years", label: "Years" },
					{ k: "months", label: "Months" },
					{ k: "weeks", label: "Weeks" },
					{ k: "days", label: "Days" },
					{ k: "hours", label: "Hours" },
					{ k: "minutes", label: "Minutes" },
					{ k: "seconds", label: "Seconds" }
				] as field (field.k)}
					<div class="space-y-1.5">
						<Label class="text-xs">{field.label}</Label>
						{#if field.k === "years"}
							<Input type="number" bind:value={years} class="h-8 font-mono" />
						{:else if field.k === "months"}
							<Input type="number" bind:value={months} class="h-8 font-mono" />
						{:else if field.k === "weeks"}
							<Input type="number" bind:value={weeks} class="h-8 font-mono" />
						{:else if field.k === "days"}
							<Input type="number" bind:value={days} class="h-8 font-mono" />
						{:else if field.k === "hours"}
							<Input type="number" bind:value={hours} class="h-8 font-mono" />
						{:else if field.k === "minutes"}
							<Input type="number" bind:value={minutes} class="h-8 font-mono" />
						{:else}
							<Input type="number" bind:value={seconds} class="h-8 font-mono" />
						{/if}
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{#if result}
		{@const info = fmt(result)}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content>
				<dl class="space-y-2">
					{#each [
						{ k: "ISO 8601", v: info.iso, key: "i" },
						{ k: "UTC", v: info.utc, key: "u" },
						{ k: "Local", v: info.local, key: "l" },
						{ k: "Unix epoch (s)", v: String(info.unix), key: "x" },
						{ k: "Weekday", v: info.weekday, key: "w" }
					] as item (item.key)}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<div>
								<p class="text-muted-foreground text-xs">{item.k}</p>
								<p class="font-mono text-sm">{item.v}</p>
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
