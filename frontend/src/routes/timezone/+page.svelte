<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Clock from "@lucide/svelte/icons/clock";
	import { onMount, onDestroy } from "svelte";

	const COMMON_ZONES = [
		"UTC",
		"America/Los_Angeles",
		"America/New_York",
		"America/Chicago",
		"Europe/London",
		"Europe/Berlin",
		"Europe/Paris",
		"Europe/Moscow",
		"Asia/Dubai",
		"Asia/Kolkata",
		"Asia/Bangkok",
		"Asia/Shanghai",
		"Asia/Singapore",
		"Asia/Seoul",
		"Asia/Tokyo",
		"Australia/Sydney",
		"Pacific/Auckland"
	];

	let allZones = $state<string[]>(COMMON_ZONES);
	onMount(() => {
		try {
			// @ts-ignore
			if (typeof Intl.supportedValuesOf === "function") {
				// @ts-ignore
				allZones = Intl.supportedValuesOf("timeZone");
			}
		} catch {
			// keep COMMON_ZONES
		}
	});

	let referenceMode = $state<"now" | "custom">("now");
	let customDate = $state(new Date().toISOString().slice(0, 16));
	let now = $state(Date.now());

	let interval: ReturnType<typeof setInterval> | undefined;
	onMount(() => {
		interval = setInterval(() => (now = Date.now()), 1000);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let referenceTime = $derived.by(() => {
		if (referenceMode === "now") return now;
		const d = new Date(customDate);
		return Number.isNaN(d.getTime()) ? now : d.getTime();
	});

	const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	let zones = $state<string[]>([localZone, "UTC", "America/New_York", "Asia/Seoul"]);

	function addZone(zone: string) {
		if (!zones.includes(zone)) zones = [...zones, zone];
	}

	function removeZone(zone: string) {
		zones = zones.filter((z) => z !== zone);
	}

	function format(ms: number, zone: string): string {
		try {
			const fmt = new Intl.DateTimeFormat("en-GB", {
				timeZone: zone,
				dateStyle: "medium",
				timeStyle: "long",
				hour12: false
			});
			return fmt.format(new Date(ms));
		} catch {
			return "(invalid timezone)";
		}
	}

	function offset(ms: number, zone: string): string {
		try {
			const fmt = new Intl.DateTimeFormat("en", {
				timeZone: zone,
				timeZoneName: "longOffset"
			});
			const parts = fmt.formatToParts(new Date(ms));
			const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
			return tz.replace("GMT", "UTC");
		} catch {
			return "";
		}
	}

	let pickerZone = $state<string>("");
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
		<h1 class="text-3xl font-bold tracking-tight">Time Zone Converter</h1>
		<p class="text-muted-foreground mt-1">
			Compare a moment in time across multiple time zones using your browser's IANA database.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Reference time</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex gap-2">
				<Button
					variant={referenceMode === "now" ? "default" : "outline"}
					size="sm"
					onclick={() => (referenceMode = "now")}
				>
					<Clock />
					Now
				</Button>
				<Button
					variant={referenceMode === "custom" ? "default" : "outline"}
					size="sm"
					onclick={() => (referenceMode = "custom")}
				>
					Custom
				</Button>
			</div>

			{#if referenceMode === "custom"}
				<Input
					type="datetime-local"
					bind:value={customDate}
					class="font-mono"
					step="1"
				/>
				<p class="text-muted-foreground text-xs">
					Interpreted in your local timezone ({localZone}).
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Add timezone</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={pickerZone}>
					<Select.Trigger class="flex-1">{pickerZone || "Select a timezone..."}</Select.Trigger>
					<Select.Content class="max-h-72">
						{#each allZones as z (z)}
							<Select.Item value={z}>{z}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Button
					onclick={() => {
						if (pickerZone) {
							addZone(pickerZone);
							pickerZone = "";
						}
					}}
					disabled={!pickerZone}
				>
					<Plus />
					Add
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="space-y-2">
		{#each zones as zone (zone)}
			<Card.Root>
				<Card.Content class="flex items-center justify-between gap-3 pt-6">
					<div class="min-w-0">
						<p class="font-mono text-sm font-semibold">{zone}</p>
						<p class="text-muted-foreground font-mono text-xs">{offset(referenceTime, zone)}</p>
					</div>
					<div class="text-right">
						<p class="font-mono text-sm">{format(referenceTime, zone)}</p>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeZone(zone)}>
						<Trash2 />
					</Button>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
