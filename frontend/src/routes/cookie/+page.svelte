<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let cookieHeader = $state(
		"sessionId=abc123; theme=dark; preferences=%7B%22lang%22%3A%22en%22%7D"
	);

	let parsed = $derived.by(() => {
		const result: Array<{ name: string; value: string; decoded: string }> = [];
		const parts = cookieHeader.split(/;\s*/);
		for (const part of parts) {
			if (!part) continue;
			const eq = part.indexOf("=");
			if (eq < 0) continue;
			const name = part.slice(0, eq).trim();
			const value = part.slice(eq + 1).trim();
			let decoded = value;
			try {
				decoded = decodeURIComponent(value);
			} catch {}
			result.push({ name, value, decoded });
		}
		return result;
	});

	let name = $state("session");
	let value = $state("abc123");
	let domain = $state("");
	let path = $state("/");
	let expiresMode = $state<"session" | "maxAge" | "expires">("session");
	let maxAge = $state(3600);
	let expires = $state("");
	let httpOnly = $state(true);
	let secure = $state(true);
	let sameSite = $state<"Strict" | "Lax" | "None">("Lax");
	let urlEncode = $state(false);

	let setCookie = $derived.by(() => {
		const v = urlEncode ? encodeURIComponent(value) : value;
		const parts = [`${name}=${v}`];
		if (domain) parts.push(`Domain=${domain}`);
		if (path) parts.push(`Path=${path}`);
		if (expiresMode === "maxAge") parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge) || 0)}`);
		if (expiresMode === "expires" && expires) {
			const d = new Date(expires);
			if (!Number.isNaN(d.getTime())) parts.push(`Expires=${d.toUTCString()}`);
		}
		if (httpOnly) parts.push("HttpOnly");
		if (secure) parts.push("Secure");
		parts.push(`SameSite=${sameSite}`);
		return parts.join("; ");
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, val: string) {
		await navigator.clipboard.writeText(val);
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
		<h1 class="text-3xl font-bold tracking-tight">Cookie Parser & Builder</h1>
		<p class="text-muted-foreground mt-1">
			Parse a Cookie / Set-Cookie header or build a Set-Cookie value with attributes.
		</p>
	</header>

	<Tabs.Root value="parser">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="parser">Parser</Tabs.Trigger>
			<Tabs.Trigger value="builder">Builder</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="parser">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Cookie header</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Textarea bind:value={cookieHeader} class="min-h-24 font-mono text-sm" />
					{#if parsed.length}
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b text-left">
									<th class="px-2 py-2">Name</th>
									<th class="px-2 py-2">Raw</th>
									<th class="px-2 py-2">URL-decoded</th>
								</tr>
							</thead>
							<tbody>
								{#each parsed as c (c.name)}
									<tr class="border-b font-mono last:border-0">
										<td class="px-2 py-1 font-semibold">{c.name}</td>
										<td class="px-2 py-1 break-all">{c.value}</td>
										<td class="px-2 py-1 break-all">{c.decoded}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p class="text-muted-foreground text-sm">No cookies parsed.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="builder">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Build Set-Cookie</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="ck-name">Name</Label>
							<Input id="ck-name" bind:value={name} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="ck-value">Value</Label>
							<Input id="ck-value" bind:value={value} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="ck-domain">Domain</Label>
							<Input id="ck-domain" bind:value={domain} placeholder="example.com" class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="ck-path">Path</Label>
							<Input id="ck-path" bind:value={path} class="font-mono" />
						</div>
					</div>

					<div class="space-y-1.5">
						<Label>Expiration</Label>
						<div class="flex gap-2">
							<Button variant={expiresMode === "session" ? "default" : "outline"} size="sm" onclick={() => (expiresMode = "session")}>Session</Button>
							<Button variant={expiresMode === "maxAge" ? "default" : "outline"} size="sm" onclick={() => (expiresMode = "maxAge")}>Max-Age</Button>
							<Button variant={expiresMode === "expires" ? "default" : "outline"} size="sm" onclick={() => (expiresMode = "expires")}>Expires</Button>
						</div>
						{#if expiresMode === "maxAge"}
							<Input type="number" min="0" bind:value={maxAge} class="mt-2 font-mono" />
						{:else if expiresMode === "expires"}
							<Input type="datetime-local" bind:value={expires} class="mt-2 font-mono" />
						{/if}
					</div>

					<div class="grid gap-3 sm:grid-cols-3">
						<div class="space-y-1.5">
							<Label for="ck-ss">SameSite</Label>
							<Select.Root type="single" bind:value={sameSite as never}>
								<Select.Trigger id="ck-ss" class="w-full">{sameSite}</Select.Trigger>
								<Select.Content>
									<Select.Item value="Strict">Strict</Select.Item>
									<Select.Item value="Lax">Lax</Select.Item>
									<Select.Item value="None">None</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<label class="flex cursor-pointer items-center gap-2 pt-6 text-sm">
							<input type="checkbox" bind:checked={httpOnly} class="h-4 w-4 rounded border" />
							HttpOnly
						</label>
						<label class="flex cursor-pointer items-center gap-2 pt-6 text-sm">
							<input type="checkbox" bind:checked={secure} class="h-4 w-4 rounded border" />
							Secure
						</label>
					</div>

					<label class="flex cursor-pointer items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={urlEncode} class="h-4 w-4 rounded border" />
						URL-encode value
					</label>

					<div class="bg-muted rounded-md p-3">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-xs">Set-Cookie</span>
							<Button variant="ghost" size="sm" onclick={() => copy("s", setCookie)}>
								{#if copied === "s"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						</div>
						<p class="mt-1 font-mono text-sm break-all">{setCookie}</p>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
