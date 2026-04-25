<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { parseCsv } from "$lib/csv";

	let csv = $state(`name,age,role
Alice,30,Engineer
Bob,25,"Product, Design"
Charlie,40,Lead`);
	let alignment = $state<"left" | "center" | "right">("left");
	let padCells = $state(true);

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: parseCsv(csv) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	function escapePipes(s: string): string {
		return (s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
	}

	let output = $derived.by(() => {
		if (!parsed.ok) return "";
		const { headers, rows } = parsed.data;
		if (headers.length === 0) return "";
		const escHeaders = headers.map(escapePipes);
		const escRows = rows.map((r) => r.map(escapePipes));

		if (!padCells) {
			const sep = alignment === "left" ? ":---" : alignment === "right" ? "---:" : ":---:";
			const lines = [
				`| ${escHeaders.join(" | ")} |`,
				`| ${escHeaders.map(() => sep).join(" | ")} |`,
				...escRows.map((r) =>
					`| ${escHeaders.map((_, i) => r[i] ?? "").join(" | ")} |`
				)
			];
			return lines.join("\n");
		}

		const widths = escHeaders.map((h, i) => {
			let w = h.length;
			for (const r of escRows) w = Math.max(w, (r[i] ?? "").length);
			return Math.max(3, w);
		});

		const padCell = (cell: string, width: number) => {
			if (alignment === "right") return cell.padStart(width, " ");
			if (alignment === "center") {
				const total = width - cell.length;
				const left = Math.floor(total / 2);
				return " ".repeat(left) + cell + " ".repeat(total - left);
			}
			return cell.padEnd(width, " ");
		};

		const sepCell = (width: number) => {
			const dash = "-".repeat(width);
			if (alignment === "left") return `:${dash.slice(1)}`;
			if (alignment === "right") return `${dash.slice(1)}:`;
			return `:${dash.slice(2)}:`;
		};

		const headerLine = "| " + escHeaders.map((h, i) => padCell(h, widths[i])).join(" | ") + " |";
		const sepLine = "| " + widths.map(sepCell).join(" | ") + " |";
		const bodyLines = escRows.map(
			(r) =>
				"| " + escHeaders.map((_, i) => padCell(r[i] ?? "", widths[i])).join(" | ") + " |"
		);
		return [headerLine, sepLine, ...bodyLines].join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">CSV → Markdown Table</h1>
		<p class="text-muted-foreground mt-1">
			Convert a CSV into a Markdown table with proper escaping and column alignment.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="al">Alignment</Label>
				<Select.Root type="single" bind:value={alignment as never}>
					<Select.Trigger id="al" class="w-32">{alignment}</Select.Trigger>
					<Select.Content>
						<Select.Item value="left">Left</Select.Item>
						<Select.Item value="center">Center</Select.Item>
						<Select.Item value="right">Right</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={padCells} class="h-4 w-4 rounded border" />
				Pad cells (visually aligned)
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">CSV</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={csv} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Markdown</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	{#if !parsed.ok}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{/if}
</main>
