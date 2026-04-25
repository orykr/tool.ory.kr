<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Minus from "@lucide/svelte/icons/minus";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Align = "left" | "center" | "right";

	let headers = $state(["Column 1", "Column 2", "Column 3"]);
	let aligns = $state<Align[]>(["left", "left", "left"]);
	let rows = $state<string[][]>([
		["a", "b", "c"],
		["d", "e", "f"]
	]);

	const alignLabels: Record<Align, string> = { left: "Left", center: "Center", right: "Right" };

	function addColumn() {
		headers = [...headers, `Column ${headers.length + 1}`];
		aligns = [...aligns, "left"];
		rows = rows.map((r) => [...r, ""]);
	}

	function removeColumn() {
		if (headers.length <= 1) return;
		headers = headers.slice(0, -1);
		aligns = aligns.slice(0, -1);
		rows = rows.map((r) => r.slice(0, -1));
	}

	function addRow() {
		rows = [...rows, headers.map(() => "")];
	}

	function removeRow() {
		if (rows.length <= 1) return;
		rows = rows.slice(0, -1);
	}

	function escapePipes(s: string): string {
		return (s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
	}

	let table = $derived.by(() => {
		const escHeaders = headers.map(escapePipes);
		const escRows = rows.map((r) => r.map(escapePipes));

		const widths = escHeaders.map((h, i) => {
			let w = h.length;
			for (const r of escRows) w = Math.max(w, (r[i] ?? "").length);
			return Math.max(3, w);
		});

		const headerRow =
			"| " + escHeaders.map((h, i) => h.padEnd(widths[i], " ")).join(" | ") + " |";
		const sepRow =
			"| " +
			aligns
				.map((a, i) => {
					const dash = "-".repeat(widths[i]);
					if (a === "left") return `:${dash.slice(1)}`;
					if (a === "right") return `${dash.slice(1)}:`;
					return `:${dash.slice(2)}:`;
				})
				.join(" | ") +
			" |";
		const bodyRows = escRows.map(
			(r) =>
				"| " +
				r.map((cell, i) => (cell ?? "").padEnd(widths[i], " ")).join(" | ") +
				" |"
		);
		return [headerRow, sepRow, ...bodyRows].join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(table);
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Table Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build a Markdown table interactively and copy as plain text.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Editor</Card.Title>
			<div class="flex gap-1">
				<Button variant="outline" size="sm" onclick={addColumn}>
					<Plus />
					Col
				</Button>
				<Button variant="outline" size="sm" onclick={removeColumn} disabled={headers.length <= 1}>
					<Minus />
					Col
				</Button>
				<Button variant="outline" size="sm" onclick={addRow}>
					<Plus />
					Row
				</Button>
				<Button variant="outline" size="sm" onclick={removeRow} disabled={rows.length <= 1}>
					<Minus />
					Row
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr>
							{#each headers as _, ci (ci)}
								<th class="p-1">
									<Input bind:value={headers[ci]} class="h-8 font-semibold" />
									<Select.Root type="single" bind:value={aligns[ci] as never}>
										<Select.Trigger class="mt-1 h-7 w-full text-xs">
											{alignLabels[aligns[ci]]}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="left">Left</Select.Item>
											<Select.Item value="center">Center</Select.Item>
											<Select.Item value="right">Right</Select.Item>
										</Select.Content>
									</Select.Root>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each rows as row, ri (ri)}
							<tr>
								{#each row as _, ci (ci)}
									<td class="p-1">
										<Input bind:value={rows[ri][ci]} class="h-8 font-mono text-sm" />
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Markdown</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!table}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<Textarea value={table} readonly class="min-h-40 font-mono text-sm" />
		</Card.Content>
	</Card.Root>
</main>
