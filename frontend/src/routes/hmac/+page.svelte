<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { hmac, HMAC_ALGORITHMS, type HmacAlgorithm, type OutputFormat } from "$lib/hmac";

	let key = $state("super-secret-key");
	let message = $state("Hello, world!");
	let algorithm = $state<HmacAlgorithm>("SHA-256");
	let output = $state<OutputFormat>("hex");
	let result = $state("");
	let error = $state<string | null>(null);
	let copied = $state(false);
	let token = 0;

	$effect(() => {
		const k = key;
		const m = message;
		const a = algorithm;
		const o = output;
		const myToken = ++token;
		if (!k && !m) {
			result = "";
			error = null;
			return;
		}
		(async () => {
			try {
				const r = await hmac(k, m, a, o);
				if (myToken !== token) return;
				result = r;
				error = null;
			} catch (e) {
				if (myToken !== token) return;
				result = "";
				error = (e as Error).message;
			}
		})();
	});

	async function copyOut() {
		await navigator.clipboard.writeText(result);
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
		<h1 class="text-3xl font-bold tracking-tight">HMAC Generator</h1>
		<p class="text-muted-foreground mt-1">
			Compute keyed-hash message authentication codes (HMAC) using the Web Crypto API.
		</p>
	</header>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Inputs</Card.Title></Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-1.5">
				<Label for="hmac-key">Secret key</Label>
				<Input id="hmac-key" bind:value={key} class="font-mono" />
			</div>

			<div class="space-y-1.5">
				<Label for="hmac-msg">Message</Label>
				<Textarea id="hmac-msg" bind:value={message} class="min-h-32 font-mono text-sm" />
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="hmac-algo">Algorithm</Label>
					<Select.Root type="single" bind:value={algorithm as never}>
						<Select.Trigger id="hmac-algo" class="w-full">{algorithm}</Select.Trigger>
						<Select.Content>
							{#each HMAC_ALGORITHMS as a (a)}
								<Select.Item value={a}>{a}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="hmac-out">Output format</Label>
					<Select.Root type="single" bind:value={output as never}>
						<Select.Trigger id="hmac-out" class="w-full">{output}</Select.Trigger>
						<Select.Content>
							<Select.Item value="hex">Hex</Select.Item>
							<Select.Item value="base64">Base64</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label>Signature</Label>
					<Button variant="ghost" size="sm" onclick={copyOut} disabled={!result}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<p class="bg-muted rounded-md p-3 font-mono text-xs break-all">{result || "—"}</p>
			</div>

			{#if error}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
