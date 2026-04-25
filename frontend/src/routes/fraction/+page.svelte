<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let decimal = $state("3.14159265358979");
	let maxDenominator = $state(1000);

	function gcd(a: bigint, b: bigint): bigint {
		a = a < 0n ? -a : a;
		b = b < 0n ? -b : b;
		while (b) {
			[a, b] = [b, a % b];
		}
		return a;
	}

	function exactFraction(n: number): { num: bigint; den: bigint } | null {
		if (!Number.isFinite(n)) return null;
		if (Number.isInteger(n)) return { num: BigInt(n), den: 1n };
		const str = n.toString();
		if (/e/i.test(str)) {
			const [mantissa, expStr] = str.toLowerCase().split("e");
			const exp = Number(expStr);
			const value = exactFractionFromString(mantissa);
			if (!value) return null;
			if (exp >= 0) {
				return reduce(value.num * 10n ** BigInt(exp), value.den);
			}
			return reduce(value.num, value.den * 10n ** BigInt(-exp));
		}
		return exactFractionFromString(str);
	}

	function exactFractionFromString(str: string): { num: bigint; den: bigint } | null {
		const dot = str.indexOf(".");
		if (dot === -1) {
			try {
				return reduce(BigInt(str), 1n);
			} catch {
				return null;
			}
		}
		const sign = str.startsWith("-") ? -1n : 1n;
		const body = str.replace(/^-/, "");
		const [intPart, decPart] = body.split(".");
		const numStr = (intPart || "0") + decPart;
		const den = 10n ** BigInt(decPart.length);
		try {
			return reduce(sign * BigInt(numStr), den);
		} catch {
			return null;
		}
	}

	function reduce(num: bigint, den: bigint): { num: bigint; den: bigint } {
		if (den < 0n) {
			num = -num;
			den = -den;
		}
		const g = gcd(num, den);
		return { num: num / g, den: den / g };
	}

	function approximate(n: number, maxDen: number): { num: bigint; den: bigint } {
		// Stern-Brocot / continued fraction approximation
		const sign = n < 0 ? -1n : 1n;
		const x = Math.abs(n);
		let h0 = 0n,
			h1 = 1n,
			k0 = 1n,
			k1 = 0n;
		let a = Math.floor(x);
		let frac = x - a;
		const limit = BigInt(maxDen);
		while (true) {
			const aBig = BigInt(a);
			const h2 = aBig * h1 + h0;
			const k2 = aBig * k1 + k0;
			if (k2 > limit) break;
			h0 = h1;
			h1 = h2;
			k0 = k1;
			k1 = k2;
			if (frac === 0) break;
			frac = 1 / frac;
			const newA = Math.floor(frac);
			frac -= newA;
			a = newA;
			if (!Number.isFinite(frac)) break;
		}
		return reduce(sign * h1, k1 || 1n);
	}

	let parsed = $derived.by(() => {
		const t = decimal.trim();
		if (!t) return null;
		const n = Number(t);
		if (!Number.isFinite(n)) return { ok: false as const, error: "Invalid number." };
		const exact = exactFraction(n);
		const approx = approximate(n, Math.max(2, Math.min(1_000_000, Math.floor(maxDenominator) || 1000)));
		return { ok: true as const, value: n, exact, approx };
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function fmt(f: { num: bigint; den: bigint }): string {
		if (f.den === 1n) return f.num.toString();
		return `${f.num}/${f.den}`;
	}

	function approxError(actual: number, frac: { num: bigint; den: bigint }): string {
		const fv = Number(frac.num) / Number(frac.den);
		return Math.abs(actual - fv).toExponential(3);
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
		<h1 class="text-3xl font-bold tracking-tight">Decimal → Fraction</h1>
		<p class="text-muted-foreground mt-1">
			Convert a decimal number to its exact fraction (when terminating) and a best rational
			approximation up to a denominator limit.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Inputs</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="dec">Decimal</Label>
				<Input id="dec" bind:value={decimal} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="md">Max denominator</Label>
				<Input id="md" type="number" min="2" max="1000000" bind:value={maxDenominator} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	{#if parsed?.ok}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Results</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if parsed.exact}
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<div>
							<p class="text-muted-foreground text-xs">Exact (decimal representation is terminating)</p>
							<p class="font-mono text-lg">{fmt(parsed.exact)}</p>
						</div>
						<Button variant="ghost" size="sm" onclick={() => copy("e", fmt(parsed.exact!))}>
							{#if copied === "e"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
				{/if}
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<div>
						<p class="text-muted-foreground text-xs">
							Best approximation (denominator ≤ {maxDenominator})
						</p>
						<p class="font-mono text-lg">{fmt(parsed.approx)}</p>
						<p class="text-muted-foreground text-xs">
							≈ {(Number(parsed.approx.num) / Number(parsed.approx.den)).toString()} · error {approxError(parsed.value, parsed.approx)}
						</p>
					</div>
					<Button variant="ghost" size="sm" onclick={() => copy("a", fmt(parsed.approx))}>
						{#if copied === "a"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if parsed && !parsed.ok}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{/if}
</main>
