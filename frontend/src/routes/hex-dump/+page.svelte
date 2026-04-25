<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let textInput = $state("Hello, world!\nLine two: é 中 \u{1f4a9}");
	let bytes = $state<Uint8Array>(new TextEncoder().encode("Hello, world!\nLine two: é 中 \u{1f4a9}"));
	let bytesPerRow = $state(16);
	let mode = $state<"text" | "file">("text");

	$effect(() => {
		if (mode === "text") {
			bytes = new TextEncoder().encode(textInput);
		}
	});

	async function onPick(ev: Event) {
		const target = ev.currentTarget as HTMLInputElement;
		const f = target.files?.[0];
		if (!f) return;
		const buf = await f.arrayBuffer();
		bytes = new Uint8Array(buf);
		mode = "file";
	}

	function toHex(n: number, width: number): string {
		return n.toString(16).padStart(width, "0").toUpperCase();
	}

	function printable(b: number): string {
		if (b >= 0x20 && b <= 0x7e) return String.fromCharCode(b);
		return ".";
	}

	let dump = $derived.by(() => {
		const cols = Math.max(1, Math.min(64, Math.floor(bytesPerRow) || 16));
		const lines: string[] = [];
		for (let off = 0; off < bytes.length; off += cols) {
			const slice = bytes.slice(off, off + cols);
			const hex: string[] = [];
			for (let i = 0; i < cols; i++) {
				hex.push(i < slice.length ? toHex(slice[i], 2) : "  ");
			}
			const ascii = Array.from(slice).map(printable).join("");
			const half = Math.ceil(cols / 2);
			const left = hex.slice(0, half).join(" ");
			const right = hex.slice(half).join(" ");
			lines.push(`${toHex(off, 8)}  ${left}  ${right}  |${ascii}|`);
		}
		return lines.join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(dump);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function formatSize(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / (1024 * 1024)).toFixed(2)} MB`;
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Hex Dump</h1>
		<p class="text-muted-foreground mt-1">
			View text or files as a side-by-side hex / ASCII dump (xxd-style).
		</p>
	</header>

	<Tabs.Root value={mode} onValueChange={(v) => (mode = v as "text" | "file")}>
		<Tabs.List>
			<Tabs.Trigger value="text">Text</Tabs.Trigger>
			<Tabs.Trigger value="file">File</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text">
			<Card.Root class="mb-4">
				<Card.Content class="pt-6">
					<Textarea bind:value={textInput} class="min-h-32 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="file">
			<Card.Root class="mb-4">
				<Card.Content class="space-y-1.5 pt-6">
					<Label for="f">File</Label>
					<Input id="f" type="file" onchange={onPick} />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="cols">Bytes per row</Label>
				<Input id="cols" type="number" min="1" max="64" bind:value={bytesPerRow} />
			</div>
			<div class="text-muted-foreground self-end text-sm">
				{bytes.length.toLocaleString()} bytes ({formatSize(bytes.length)})
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Hex dump</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!bytes.length}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-auto rounded p-3 font-mono text-xs leading-relaxed">{dump || "(empty)"}</pre>
		</Card.Content>
	</Card.Root>
</main>
