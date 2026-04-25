<script lang="ts">
	import { calculateCidrInfo } from "$lib/cidr";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import ArrowLeft from "lucide-svelte/icons/arrow-left";

	let inputCidr = $state("192.168.0.0/24");
	let result = $derived(calculateCidrInfo(inputCidr));
</script>

<main class="container mx-auto max-w-2xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-2xl">CIDR Calculator</Card.Title>
			<Card.Description>
				Enter a CIDR notation to calculate IP ranges and subnet mask.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6">
			<div class="space-y-2">
				<Label for="cidr">CIDR Input</Label>
				<Input id="cidr" type="text" bind:value={inputCidr} placeholder="e.g. 192.168.0.0/24" />
			</div>

			{#if result.error}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-center text-sm"
				>
					{result.error}
				</div>
			{:else}
				<div class="bg-muted rounded-md p-4">
					<dl class="space-y-3">
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground text-sm font-medium">Start IP</dt>
							<dd class="font-mono text-sm">{result.startIp}</dd>
						</div>
						<Separator />
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground text-sm font-medium">End IP</dt>
							<dd class="font-mono text-sm">{result.endIp}</dd>
						</div>
						<Separator />
						<div class="flex items-center justify-between">
							<dt class="text-muted-foreground text-sm font-medium">Subnet Mask</dt>
							<dd class="font-mono text-sm">{result.subnetMask}</dd>
						</div>
					</dl>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
