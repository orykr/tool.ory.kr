<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";

	const SAMPLE = `alice@example.com
bob+filter@example.co.uk
.dotstart@example.com
double..dot@example.com
no-at-sign.example.com
"quoted user"@example.com
user@localhost
user@-bad-domain.com
user@bad..tld
ada@example`;

	let input = $state(SAMPLE);

	const STRICT_LOCAL = /^(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[^"\\]|\\.)*")$/;
	const DOMAIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
	const IPV4 = /^\[(\d{1,3}(?:\.\d{1,3}){3})\]$/;

	function validate(email: string): { ok: boolean; reason?: string; local?: string; domain?: string } {
		const trimmed = email.trim();
		if (!trimmed) return { ok: false, reason: "Empty" };
		if (trimmed.length > 254) return { ok: false, reason: "Total length > 254" };
		const at = trimmed.lastIndexOf("@");
		if (at < 1) return { ok: false, reason: "Missing local part / @" };
		const local = trimmed.slice(0, at);
		const domain = trimmed.slice(at + 1);
		if (local.length > 64) return { ok: false, reason: "Local part > 64 chars" };
		if (!STRICT_LOCAL.test(local)) return { ok: false, reason: "Invalid local part syntax", local, domain };
		const ipMatch = IPV4.exec(domain);
		if (ipMatch) {
			const parts = ipMatch[1].split(".").map(Number);
			if (parts.every((n) => n >= 0 && n <= 255)) return { ok: true, local, domain };
			return { ok: false, reason: "Invalid IP literal", local, domain };
		}
		if (!DOMAIN.test(domain)) return { ok: false, reason: "Invalid domain", local, domain };
		if (!domain.includes(".")) return { ok: false, reason: "Domain must have a TLD", local, domain };
		return { ok: true, local, domain };
	}

	let results = $derived.by(() => {
		return input
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean)
			.map((email) => ({ email, ...validate(email) }));
	});
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
		<h1 class="text-3xl font-bold tracking-tight">Email Validator</h1>
		<p class="text-muted-foreground mt-1">
			Syntactic email validation against a strict RFC 5321/5322-inspired pattern.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Emails (one per line)</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Results ({results.length})</Card.Title>
		</Card.Header>
		<Card.Content>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2"></th>
						<th class="px-2 py-2">Email</th>
						<th class="px-2 py-2">Local</th>
						<th class="px-2 py-2">Domain</th>
						<th class="px-2 py-2">Reason</th>
					</tr>
				</thead>
				<tbody>
					{#each results as r, i (i + r.email)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1">
								{#if r.ok}
									<CheckCircle class="h-5 w-5 text-emerald-500" />
								{:else}
									<XCircle class="text-destructive h-5 w-5" />
								{/if}
							</td>
							<td class="px-2 py-1 font-mono break-all">{r.email}</td>
							<td class="px-2 py-1 font-mono">{r.local ?? ""}</td>
							<td class="px-2 py-1 font-mono">{r.domain ?? ""}</td>
							<td class="text-muted-foreground px-2 py-1 text-xs">{r.reason ?? "OK"}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</main>
