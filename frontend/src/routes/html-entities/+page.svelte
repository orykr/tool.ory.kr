<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { encodeEntities, decodeEntities } from "$lib/html-entities";

	let mode = $state<"encode" | "decode">("encode");
	let encodeMode = $state<"minimal" | "named" | "numeric">("minimal");
	let input = $state('Hello <world> & "friends"');
	let output = $state("");
	let copied = $state(false);

	const encodeLabels: Record<"minimal" | "named" | "numeric", string> = {
		minimal: 'Minimal (& < > " \')',
		named: "Named entities",
		numeric: "Numeric (&#NN;)"
	};

	$effect(() => {
		void input;
		void mode;
		void encodeMode;
		try {
			if (mode === "encode") output = encodeEntities(input, encodeMode);
			else output = decodeEntities(input);
		} catch (e) {
			output = "";
		}
	});

	function swap() {
		mode = mode === "encode" ? "decode" : "encode";
		if (output) input = output;
	}

	async function copyOut() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">HTML Entities</h1>
		<p class="text-muted-foreground mt-1">
			Encode and decode HTML / XML entities (named and numeric).
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between gap-4">
			<div>
				<Card.Title class="text-base">{mode === "encode" ? "Encode" : "Decode"}</Card.Title>
			</div>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if mode === "encode"}
				<div class="space-y-1.5">
					<Label for="encode-mode">Mode</Label>
					<Select.Root type="single" bind:value={encodeMode as never}>
						<Select.Trigger id="encode-mode" class="w-full">{encodeLabels[encodeMode]}</Select.Trigger>
						<Select.Content>
							<Select.Item value="minimal">{'Minimal (& < > " \')'}</Select.Item>
							<Select.Item value="named">Named entities</Select.Item>
							<Select.Item value="numeric">{"Numeric (&#NN;)"}</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			{/if}

			<div class="space-y-1.5">
				<Label for="he-input">Input</Label>
				<Textarea id="he-input" bind:value={input} class="min-h-32 font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label for="he-output">Output</Label>
					<Button variant="ghost" size="sm" onclick={copyOut} disabled={!output}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<Textarea id="he-output" value={output} readonly class="min-h-32 font-mono text-sm" />
			</div>
		</Card.Content>
	</Card.Root>
</main>
