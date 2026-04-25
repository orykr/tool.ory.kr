<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { caesarShift, rot13, atbash, vigenere } from "$lib/cipher";

	let input = $state("Hello, World!");
	let shift = $state([3]);
	let vigenereKey = $state("KEY");
	let vigenereMode = $state<"encrypt" | "decrypt">("encrypt");

	let caesar = $derived(caesarShift(input, shift[0]));
	let rotted = $derived(rot13(input));
	let atbashed = $derived(atbash(input));
	let vig = $derived(vigenere(input, vigenereKey, vigenereMode === "encrypt"));

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
		<h1 class="text-3xl font-bold tracking-tight">Classical Ciphers</h1>
		<p class="text-muted-foreground mt-1">
			Caesar shift, ROT13, Atbash, and Vigenère — for puzzles, not security.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Plaintext / Ciphertext</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-24 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Tabs.Root value="caesar">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="caesar">Caesar</Tabs.Trigger>
			<Tabs.Trigger value="rot13">ROT13</Tabs.Trigger>
			<Tabs.Trigger value="atbash">Atbash</Tabs.Trigger>
			<Tabs.Trigger value="vigenere">Vigenère</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="caesar">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Caesar Shift</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>Shift</Label>
							<span class="text-muted-foreground font-mono text-sm">{shift[0]}</span>
						</div>
						<Slider type="single" bind:value={shift} min={-25} max={25} step={1} />
					</div>
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label>Output</Label>
							<Button variant="ghost" size="sm" onclick={() => copy("c", caesar)}>
								{#if copied === "c"}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
						<Textarea value={caesar} readonly class="min-h-24 font-mono text-sm" />
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="rot13">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">ROT13</Card.Title>
					<Card.Description>Self-inverse: applying ROT13 twice returns the original.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Label>Output</Label>
						<Button variant="ghost" size="sm" onclick={() => copy("r", rotted)}>
							{#if copied === "r"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<Textarea value={rotted} readonly class="min-h-24 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="atbash">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Atbash</Card.Title>
					<Card.Description>A↔Z, B↔Y, …</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Label>Output</Label>
						<Button variant="ghost" size="sm" onclick={() => copy("a", atbashed)}>
							{#if copied === "a"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<Textarea value={atbashed} readonly class="min-h-24 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="vigenere">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Vigenère</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="vk">Key (letters only)</Label>
							<Input id="vk" bind:value={vigenereKey} class="font-mono uppercase" />
						</div>
						<div class="space-y-1.5">
							<Label>Mode</Label>
							<div class="flex gap-2">
								<Button
									variant={vigenereMode === "encrypt" ? "default" : "outline"}
									size="sm"
									class="flex-1"
									onclick={() => (vigenereMode = "encrypt")}
								>
									Encrypt
								</Button>
								<Button
									variant={vigenereMode === "decrypt" ? "default" : "outline"}
									size="sm"
									class="flex-1"
									onclick={() => (vigenereMode = "decrypt")}
								>
									Decrypt
								</Button>
							</div>
						</div>
					</div>
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label>Output</Label>
							<Button variant="ghost" size="sm" onclick={() => copy("v", vig)}>
								{#if copied === "v"}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
						<Textarea value={vig} readonly class="min-h-24 font-mono text-sm" />
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
