<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Download from "@lucide/svelte/icons/download";
	import { generateRows, FIELD_OPTIONS, type Field } from "$lib/mock-data";
	import { jsonToCsv } from "$lib/csv";

	let fields = $state<Array<{ id: number; name: string; type: Field }>>([
		{ id: 1, name: "id", type: "id" },
		{ id: 2, name: "name", type: "fullName" },
		{ id: 3, name: "email", type: "email" }
	]);
	let nextId = 4;
	let count = $state(10);
	let format = $state<"json" | "csv">("json");
	let output = $state("");

	function addField() {
		fields = [...fields, { id: nextId++, name: `field_${fields.length + 1}`, type: "firstName" }];
	}

	function removeField(id: number) {
		fields = fields.filter((f) => f.id !== id);
	}

	function generate() {
		if (fields.length === 0) {
			output = "";
			return;
		}
		const rows = generateRows(
			fields.map((f) => ({ name: f.name || "field", type: f.type })),
			Math.max(1, Math.min(1000, Math.floor(count) || 1))
		);
		output = format === "json" ? JSON.stringify(rows, null, 2) : jsonToCsv(rows);
	}

	$effect(() => {
		void format;
		generate();
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function download() {
		const ext = format === "json" ? "json" : "csv";
		const mime = format === "json" ? "application/json" : "text/csv";
		const blob = new Blob([output], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mock-data.${ext}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function fieldLabel(t: Field) {
		return FIELD_OPTIONS.find((o) => o.value === t)?.label ?? t;
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
		<h1 class="text-3xl font-bold tracking-tight">Mock Data Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate fake JSON or CSV records with custom field schemas.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Schema</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each fields as field, i (field.id)}
				<div class="flex items-end gap-2">
					<div class="flex-1 space-y-1.5">
						<Label for={`fname-${field.id}`}>Name</Label>
						<Input id={`fname-${field.id}`} bind:value={field.name} placeholder="field" />
					</div>
					<div class="flex-1 space-y-1.5">
						<Label for={`ftype-${field.id}`}>Type</Label>
						<Select.Root type="single" bind:value={field.type as never}>
							<Select.Trigger id={`ftype-${field.id}`} class="w-full">
								{fieldLabel(field.type)}
							</Select.Trigger>
							<Select.Content>
								{#each FIELD_OPTIONS as opt (opt.value)}
									<Select.Item value={opt.value}>{opt.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<Button variant="ghost" size="icon" onclick={() => removeField(field.id)}>
						<Trash2 />
					</Button>
				</div>
			{/each}

			<Button variant="outline" size="sm" onclick={addField}>
				<Plus />
				Add field
			</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="rows">Rows</Label>
				<Input id="rows" type="number" min="1" max="1000" bind:value={count} class="w-32" />
			</div>
			<div class="space-y-1.5">
				<Label for="fmt">Format</Label>
				<Select.Root type="single" bind:value={format as never}>
					<Select.Trigger id="fmt" class="w-32">{format.toUpperCase()}</Select.Trigger>
					<Select.Content>
						<Select.Item value="json">JSON</Select.Item>
						<Select.Item value="csv">CSV</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="ml-auto flex gap-2">
				<Button onclick={generate}>
					<RefreshCw />
					Generate
				</Button>
				<Button variant="outline" onclick={copy} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
				<Button variant="outline" onclick={download} disabled={!output}>
					<Download />
					Download
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Output</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea value={output} readonly class="min-h-96 font-mono text-xs" />
		</Card.Content>
	</Card.Root>
</main>
