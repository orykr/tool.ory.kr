<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import semver from "semver";

	let aVer = $state("1.2.3");
	let bVer = $state("1.3.0");

	let compareResult = $derived.by(() => {
		const av = semver.valid(aVer);
		const bv = semver.valid(bVer);
		if (!av) return { ok: false as const, error: `Left version invalid: ${aVer}` };
		if (!bv) return { ok: false as const, error: `Right version invalid: ${bVer}` };
		const cmp = semver.compare(av, bv);
		const verb = cmp === 0 ? "equal to" : cmp < 0 ? "lower than" : "greater than";
		const diff = semver.diff(av, bv);
		return {
			ok: true as const,
			cmp,
			verb,
			diff: diff ?? "(none)",
			ltr: cmp < 0
		};
	});

	let version = $state("1.2.3");
	let level = $state<"major" | "minor" | "patch" | "prerelease" | "premajor" | "preminor" | "prepatch">("patch");
	let preid = $state("");

	let bumped = $derived.by(() => {
		try {
			const r = semver.inc(version, level, preid || undefined);
			return r ?? "(invalid)";
		} catch {
			return "(invalid)";
		}
	});

	let rangeVersion = $state("1.5.2");
	let rangeExpr = $state("^1.0.0 || ~2.0");
	let rangeResult = $derived.by(() => {
		try {
			const valid = semver.validRange(rangeExpr);
			if (!valid) return { ok: false as const, error: "Invalid range." };
			const matches = semver.satisfies(rangeVersion, rangeExpr);
			return { ok: true as const, matches, normalized: valid };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let listInput = $state(
		"1.2.3\n2.0.0\n1.0.0\n1.10.0\n2.1.0-beta.1\n1.5.0"
	);
	let sorted = $derived.by(() => {
		const versions = listInput
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter(Boolean);
		const valid = versions.filter((v) => semver.valid(v));
		const invalid = versions.filter((v) => !semver.valid(v));
		return {
			ascending: [...valid].sort(semver.compare),
			descending: [...valid].sort(semver.rcompare),
			invalid
		};
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
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
		<h1 class="text-3xl font-bold tracking-tight">Semver Tools</h1>
		<p class="text-muted-foreground mt-1">
			Compare, validate, increment, sort, and check Semantic Versioning ranges.
		</p>
	</header>

	<Tabs.Root value="compare">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="compare">Compare</Tabs.Trigger>
			<Tabs.Trigger value="bump">Bump</Tabs.Trigger>
			<Tabs.Trigger value="range">Range</Tabs.Trigger>
			<Tabs.Trigger value="sort">Sort</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="compare">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="a">Version A</Label>
							<Input id="a" bind:value={aVer} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="b">Version B</Label>
							<Input id="b" bind:value={bVer} class="font-mono" />
						</div>
					</div>
					{#if compareResult.ok}
						<div class="bg-muted rounded-md p-3">
							<p class="font-mono text-sm">
								<strong>{aVer}</strong> is <em>{compareResult.verb}</em> <strong>{bVer}</strong>
							</p>
							<p class="text-muted-foreground mt-1 text-xs">
								Difference type: {compareResult.diff} · cmp result: {compareResult.cmp}
							</p>
						</div>
					{:else}
						<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
							{compareResult.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="bump">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-3">
						<div class="space-y-1.5">
							<Label for="bv">Version</Label>
							<Input id="bv" bind:value={version} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="bl">Level</Label>
							<Select.Root type="single" bind:value={level as never}>
								<Select.Trigger id="bl" class="w-full">{level}</Select.Trigger>
								<Select.Content>
									{#each ["major","minor","patch","premajor","preminor","prepatch","prerelease"] as l (l)}
										<Select.Item value={l}>{l}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-1.5">
							<Label for="pid">Pre-release id (optional)</Label>
							<Input id="pid" bind:value={preid} class="font-mono" placeholder="alpha" />
						</div>
					</div>
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<p class="font-mono">
							{version} → <strong>{bumped}</strong>
						</p>
						<Button variant="ghost" size="sm" onclick={() => copy("b", bumped)}>
							{#if copied === "b"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="range">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="rv">Version</Label>
							<Input id="rv" bind:value={rangeVersion} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="rr">Range</Label>
							<Input id="rr" bind:value={rangeExpr} class="font-mono" />
						</div>
					</div>
					{#if rangeResult.ok}
						<div class="bg-muted rounded-md p-3">
							<div class="flex items-center gap-2">
								{#if rangeResult.matches}
									<CheckCircle class="h-5 w-5 text-emerald-500" />
									<span class="font-semibold">
										{rangeVersion} satisfies {rangeExpr}
									</span>
								{:else}
									<XCircle class="text-destructive h-5 w-5" />
									<span class="font-semibold">
										{rangeVersion} does not satisfy {rangeExpr}
									</span>
								{/if}
							</div>
							<p class="text-muted-foreground mt-1 font-mono text-xs">
								Normalized: {rangeResult.normalized}
							</p>
						</div>
					{:else}
						<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
							{rangeResult.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="sort">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="space-y-1.5">
						<Label for="lv">Versions (one per line)</Label>
						<Textarea id="lv" bind:value={listInput} class="min-h-32 font-mono text-sm" />
					</div>
					<div class="grid gap-3 md:grid-cols-2">
						<div>
							<p class="text-muted-foreground mb-1 text-xs">Ascending</p>
							<pre class="bg-muted rounded-md p-2 font-mono text-xs">{sorted.ascending.join("\n")}</pre>
						</div>
						<div>
							<p class="text-muted-foreground mb-1 text-xs">Descending</p>
							<pre class="bg-muted rounded-md p-2 font-mono text-xs">{sorted.descending.join("\n")}</pre>
						</div>
					</div>
					{#if sorted.invalid.length}
						<p class="text-destructive text-xs">
							Skipped invalid: {sorted.invalid.join(", ")}
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
