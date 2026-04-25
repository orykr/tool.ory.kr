<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const SPEC: Array<{ token: string; description: string; example: (d: Date) => string }> = [
		{ token: "%Y", description: "4-digit year", example: (d) => d.getFullYear().toString() },
		{ token: "%y", description: "2-digit year", example: (d) => String(d.getFullYear() % 100).padStart(2, "0") },
		{ token: "%m", description: "Month (01-12)", example: (d) => String(d.getMonth() + 1).padStart(2, "0") },
		{ token: "%-m", description: "Month (1-12)", example: (d) => String(d.getMonth() + 1) },
		{ token: "%B", description: "Month name", example: (d) => d.toLocaleDateString("en", { month: "long" }) },
		{ token: "%b", description: "Month name (short)", example: (d) => d.toLocaleDateString("en", { month: "short" }) },
		{ token: "%d", description: "Day of month (01-31)", example: (d) => String(d.getDate()).padStart(2, "0") },
		{ token: "%-d", description: "Day of month (1-31)", example: (d) => String(d.getDate()) },
		{ token: "%e", description: "Day of month, space-padded", example: (d) => String(d.getDate()).padStart(2, " ") },
		{ token: "%j", description: "Day of year (001-366)", example: (d) => {
			const start = new Date(d.getFullYear(), 0, 0);
			const diff = d.getTime() - start.getTime();
			return String(Math.floor(diff / 86400000)).padStart(3, "0");
		}},
		{ token: "%A", description: "Weekday name", example: (d) => d.toLocaleDateString("en", { weekday: "long" }) },
		{ token: "%a", description: "Weekday name (short)", example: (d) => d.toLocaleDateString("en", { weekday: "short" }) },
		{ token: "%w", description: "Weekday (0-6, Sun=0)", example: (d) => String(d.getDay()) },
		{ token: "%H", description: "Hour 24h (00-23)", example: (d) => String(d.getHours()).padStart(2, "0") },
		{ token: "%-H", description: "Hour 24h (0-23)", example: (d) => String(d.getHours()) },
		{ token: "%I", description: "Hour 12h (01-12)", example: (d) => String(((d.getHours() + 11) % 12) + 1).padStart(2, "0") },
		{ token: "%p", description: "AM/PM", example: (d) => (d.getHours() < 12 ? "AM" : "PM") },
		{ token: "%M", description: "Minute (00-59)", example: (d) => String(d.getMinutes()).padStart(2, "0") },
		{ token: "%S", description: "Second (00-59)", example: (d) => String(d.getSeconds()).padStart(2, "0") },
		{ token: "%Z", description: "Timezone name", example: (d) => d.toLocaleDateString("en", { timeZoneName: "short" }).split(", ").pop() ?? "" },
		{ token: "%z", description: "Timezone offset", example: (d) => {
			const off = -d.getTimezoneOffset();
			const sign = off >= 0 ? "+" : "-";
			const abs = Math.abs(off);
			return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}${String(abs % 60).padStart(2, "0")}`;
		}},
		{ token: "%s", description: "Unix epoch (s)", example: (d) => String(Math.floor(d.getTime() / 1000)) },
		{ token: "%%", description: "Literal %", example: () => "%" }
	];

	function applyFormat(format: string, d: Date): string {
		const tokens = SPEC.slice().sort((a, b) => b.token.length - a.token.length);
		let out = "";
		let i = 0;
		while (i < format.length) {
			let matched = false;
			if (format[i] === "%") {
				for (const t of tokens) {
					if (format.startsWith(t.token, i)) {
						out += t.example(d);
						i += t.token.length;
						matched = true;
						break;
					}
				}
				if (!matched) {
					out += format[i];
					i++;
				}
			} else {
				out += format[i];
				i++;
			}
		}
		return out;
	}

	let format = $state("%Y-%m-%d %H:%M:%S");
	let now = $state(new Date());
	let preview = $derived(applyFormat(format, now));

	const presets = [
		{ name: "ISO 8601 date", value: "%Y-%m-%d" },
		{ name: "ISO 8601 datetime", value: "%Y-%m-%dT%H:%M:%S%z" },
		{ name: "Apache log", value: "%d/%b/%Y:%H:%M:%S %z" },
		{ name: "RFC 2822", value: "%a, %d %b %Y %H:%M:%S %z" },
		{ name: "US slash", value: "%m/%d/%Y %I:%M %p" },
		{ name: "Filename", value: "%Y%m%d_%H%M%S" }
	];

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">strftime Cheatsheet</h1>
		<p class="text-muted-foreground mt-1">
			Reference for POSIX <code>strftime</code> format codes with a live preview.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Live preview</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="fmt">Format string</Label>
				<Input id="fmt" bind:value={format} class="font-mono" />
			</div>
			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<p class="font-mono">{preview}</p>
				<Button variant="ghost" size="sm" onclick={() => copy("p", preview)}>
					{#if copied === "p"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
			<div class="flex flex-wrap gap-1">
				{#each presets as p (p.name)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-0.5 text-xs"
						onclick={() => (format = p.value)}
					>
						{p.name}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Format codes</Card.Title></Card.Header>
		<Card.Content>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Code</th>
						<th class="px-2 py-2">Meaning</th>
						<th class="px-2 py-2">Example (now)</th>
					</tr>
				</thead>
				<tbody>
					{#each SPEC as s, i (s.token)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1 font-mono">{s.token}</td>
							<td class="px-2 py-1">{s.description}</td>
							<td class="text-muted-foreground px-2 py-1 font-mono text-xs">{s.example(now)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</main>
