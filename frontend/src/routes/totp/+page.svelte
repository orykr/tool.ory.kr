<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { onMount, onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { generateTotp, buildOtpauthUri, generateRandomSecret, type Algorithm } from "$lib/totp";

	let secret = $state("JBSWY3DPEHPK3PXP");
	let label = $state("alice@example.com");
	let issuer = $state("Example");
	let algorithm = $state<Algorithm>("SHA-1");
	let digits = $state(6);
	let period = $state(30);

	let now = $state(Date.now());
	let interval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		interval = setInterval(() => (now = Date.now()), 250);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let code = $state("------");
	let nextCode = $state("------");
	let error = $state<string | null>(null);
	let token = 0;

	$effect(() => {
		const s = secret.trim();
		const a = algorithm;
		const d = digits;
		const p = period;
		const t = now;
		if (!s) {
			code = "------";
			error = null;
			return;
		}
		const myToken = ++token;
		(async () => {
			try {
				const c = await generateTotp(s, t, p, d, a);
				const n = await generateTotp(s, t + p * 1000, p, d, a);
				if (myToken !== token) return;
				code = c;
				nextCode = n;
				error = null;
			} catch (e) {
				if (myToken !== token) return;
				error = (e as Error).message;
			}
		})();
	});

	let secondsLeft = $derived(period - Math.floor((now / 1000) % period));
	let progress = $derived(((period - secondsLeft) / period) * 100);

	let uri = $derived(
		buildOtpauthUri({
			type: "totp",
			label,
			issuer,
			secret,
			algorithm,
			digits,
			period
		})
	);

	function generateSecret() {
		secret = generateRandomSecret(20);
	}

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
		<h1 class="text-3xl font-bold tracking-tight">TOTP Generator</h1>
		<p class="text-muted-foreground mt-1">
			RFC 6238 time-based one-time passwords. The secret never leaves your browser.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Secret (Base32)</Card.Title>
			<Button variant="outline" size="sm" onclick={generateSecret}>
				<RefreshCw />
				Generate
			</Button>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Input bind:value={secret} class="font-mono" />
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="alg">Algorithm</Label>
					<Select.Root type="single" bind:value={algorithm as never}>
						<Select.Trigger id="alg" class="w-full">{algorithm}</Select.Trigger>
						<Select.Content>
							<Select.Item value="SHA-1">SHA-1</Select.Item>
							<Select.Item value="SHA-256">SHA-256</Select.Item>
							<Select.Item value="SHA-512">SHA-512</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="dig">Digits</Label>
					<Input id="dig" type="number" min="6" max="10" bind:value={digits} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="per">Period (s)</Label>
					<Input id="per" type="number" min="10" max="300" bind:value={period} class="font-mono" />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			{#if error}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{error}
				</div>
			{:else}
				<div class="flex items-center justify-between">
					<div>
						<p class="text-muted-foreground text-xs">Current code</p>
						<p class="font-mono text-5xl font-bold tabular-nums">{code}</p>
					</div>
					<div class="text-right">
						<p class="text-muted-foreground text-xs">Next</p>
						<p class="font-mono text-2xl tabular-nums opacity-50">{nextCode}</p>
						<p class="text-muted-foreground mt-1 text-xs">in {secondsLeft}s</p>
					</div>
				</div>
				<Progress value={progress} max={100} />
				<div class="flex justify-end">
					<Button variant="ghost" size="sm" onclick={() => copy("c", code)}>
						{#if copied === "c"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Provisioning URI</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="lbl">Account label</Label>
					<Input id="lbl" bind:value={label} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="iss">Issuer</Label>
					<Input id="iss" bind:value={issuer} class="font-mono" />
				</div>
			</div>
			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<p class="font-mono text-xs break-all">{uri}</p>
				<Button variant="ghost" size="sm" onclick={() => copy("u", uri)}>
					{#if copied === "u"}<Check />{:else}<Copy />{/if}
				</Button>
			</div>
			<p class="text-muted-foreground text-xs">
				Use this URI with the QR generator (<a href="/qr" class="underline">/qr</a>) to enroll an authenticator app.
			</p>
		</Card.Content>
	</Card.Root>
</main>
