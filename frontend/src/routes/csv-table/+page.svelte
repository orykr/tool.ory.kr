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

	let csv = $state(`id,name,age,role
1,Alice Johnson,30,Engineer
2,Bob,25,"Product Manager"
3,Charlie Smith,40,Lead`);

	let style = $state<"box" | "double" | "ascii" | "compact" | "rst">("box");
	let alignment = $state<"left" | "center" | "right">("left");

	const STYLES: Record<string, {
		corners: [string, string, string, string];
		edges: [string, string];
		junctions: [string, string, string, string];
		separator: string;
	}> = {
		box: {
			corners: ["┌", "┐", "└", "┘"],
			edges: ["─", "│"],
			junctions: ["┬", "┤", "┴", "├"],
			separator: "┼"
		},
		double: {
			corners: ["╔", "╗", "╚", "╝"],
			edges: ["═", "║"],
			junctions: ["╦", "╣", "╩", "╠"],
			separator: "╬"
		},
		ascii: {
			corners: ["+", "+", "+", "+"],
			edges: ["-", "|"],
			junctions: ["+", "+", "+", "+"],
			separator: "+"
		},
		compact: {
			corners: [" ", " ", " ", " "],
			edges: [" ", " "],
			junctions: [" ", " ", " ", " "],
			separator: " "
		},
		rst: {
			corners: ["+", "+", "+", "+"],
			edges: ["-", "|"],
			junctions: ["+", "+", "+", "+"],
			separator: "+"
		}
	};

	function pad(text: string, width: number): string {
		const diff = width - text.length;
		if (diff <= 0) return text;
		if (alignment === "right") return " ".repeat(diff) + text;
		if (alignment === "center") {
			const left = Math.floor(diff / 2);
			return " ".repeat(left) + text + " ".repeat(diff - left);
		}
		return text + " ".repeat(diff);
	}

	let output = $derived.by(() => {
		try {
			const { headers, rows } = parseCsv(csv);
			if (headers.length === 0) return "";
			const widths = headers.map((h, i) =>
				Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length))
			);
			const s = STYLES[style];
			const horiz = s.edges[0];
			const vert = s.edges[1];
			const top = s.corners[0] + widths.map((w) => horiz.repeat(w + 2)).join(s.junctions[0]) + s.corners[1];
			const bottom = s.corners[2] + widths.map((w) => horiz.repeat(w + 2)).join(s.junctions[2]) + s.corners[3];
			const sep = s.junctions[3] + widths.map((w) => horiz.repeat(w + 2)).join(s.separator) + s.junctions[1];

			const renderRow = (row: string[]) =>
				vert + row.map((c, i) => " " + pad(c, widths[i]) + " ").join(vert) + vert;

			const lines: string[] = [];
			if (style === "rst") {
				const equals = "+" + widths.map((w) => "=".repeat(w + 2)).join("+") + "+";
				lines.push(top, renderRow(headers), equals);
				for (const row of rows) {
					lines.push(renderRow(headers.map((_, i) => row[i] ?? "")));
					lines.push(top);
				}
			} else {
				lines.push(top);
				lines.push(renderRow(headers));
				lines.push(sep);
				for (const row of rows) {
					lines.push(renderRow(headers.map((_, i) => row[i] ?? "")));
				}
				lines.push(bottom);
			}
			return lines.join("\n");
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
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
		<h1 class="text-3xl font-bold tracking-tight">CSV → ASCII Table</h1>
		<p class="text-muted-foreground mt-1">
			Render a CSV as an aligned text table for READMEs, comments, or terminal output.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="st">Style</Label>
				<Select.Root type="single" bind:value={style as never}>
					<Select.Trigger id="st" class="w-full">{style}</Select.Trigger>
					<Select.Content>
						<Select.Item value="box">Box drawing (light)</Select.Item>
						<Select.Item value="double">Box drawing (double)</Select.Item>
						<Select.Item value="ascii">ASCII (+/-/|)</Select.Item>
						<Select.Item value="rst">reStructuredText grid</Select.Item>
						<Select.Item value="compact">Compact (spaces)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="al">Alignment</Label>
				<Select.Root type="single" bind:value={alignment as never}>
					<Select.Trigger id="al" class="w-full">{alignment}</Select.Trigger>
					<Select.Content>
						<Select.Item value="left">Left</Select.Item>
						<Select.Item value="center">Center</Select.Item>
						<Select.Item value="right">Right</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
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
				<Card.Title class="text-base">Table</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre">{output}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
