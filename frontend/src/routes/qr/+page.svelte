<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";
	import QRCode from "qrcode";

	let text = $state("https://tool.ory.kr");
	let size = $state([320]);
	let margin = $state([2]);
	let level = $state<"L" | "M" | "Q" | "H">("M");
	let dark = $state("#000000");
	let light = $state("#ffffff");

	let dataUrl = $state("");
	let svg = $state("");
	let error = $state<string | null>(null);

	const levelLabels: Record<typeof level, string> = {
		L: "Low (~7%)",
		M: "Medium (~15%)",
		Q: "Quartile (~25%)",
		H: "High (~30%)"
	};

	$effect(() => {
		const t = text;
		const s = size[0];
		const m = margin[0];
		const lvl = level;
		const d = dark;
		const lt = light;
		if (!t) {
			dataUrl = "";
			svg = "";
			error = null;
			return;
		}
		const opts: QRCode.QRCodeToDataURLOptions = {
			width: s,
			margin: m,
			errorCorrectionLevel: lvl,
			color: { dark: d, light: lt }
		};
		Promise.all([
			QRCode.toDataURL(t, opts),
			QRCode.toString(t, { type: "svg", margin: m, errorCorrectionLevel: lvl, color: { dark: d, light: lt } })
		])
			.then(([d2, s2]) => {
				dataUrl = d2;
				svg = s2;
				error = null;
			})
			.catch((e) => {
				dataUrl = "";
				svg = "";
				error = e.message ?? String(e);
			});
	});

	function downloadPng() {
		if (!dataUrl) return;
		const a = document.createElement("a");
		a.href = dataUrl;
		a.download = "qrcode.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	function downloadSvg() {
		if (!svg) return;
		const blob = new Blob([svg], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "qrcode.svg";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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
		<h1 class="text-3xl font-bold tracking-tight">QR Code Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate a QR code from any text and download as PNG or SVG.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-[1fr_320px]">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Content</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label for="qr-text">Text or URL</Label>
					<Textarea id="qr-text" bind:value={text} class="min-h-32 font-mono text-sm" />
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>Size</Label>
							<span class="text-muted-foreground text-xs">{size[0]} px</span>
						</div>
						<Slider type="single" bind:value={size} min={128} max={1024} step={32} />
					</div>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>Margin</Label>
							<span class="text-muted-foreground text-xs">{margin[0]}</span>
						</div>
						<Slider type="single" bind:value={margin} min={0} max={8} step={1} />
					</div>
				</div>

				<div class="grid gap-3 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="qr-level">Error correction</Label>
						<Select.Root type="single" bind:value={level as never}>
							<Select.Trigger id="qr-level" class="w-full">{levelLabels[level]}</Select.Trigger>
							<Select.Content>
								<Select.Item value="L">Low (~7%)</Select.Item>
								<Select.Item value="M">Medium (~15%)</Select.Item>
								<Select.Item value="Q">Quartile (~25%)</Select.Item>
								<Select.Item value="H">High (~30%)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-1.5">
						<Label for="qr-dark">Dark</Label>
						<input id="qr-dark" type="color" bind:value={dark} class="h-9 w-full cursor-pointer rounded-md border" />
					</div>
					<div class="space-y-1.5">
						<Label for="qr-light">Light</Label>
						<input id="qr-light" type="color" bind:value={light} class="h-9 w-full cursor-pointer rounded-md border" />
					</div>
				</div>

				{#if error}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Result</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-3">
				{#if dataUrl}
					<img src={dataUrl} alt="QR code" class="bg-background rounded-md border" style="width: 100%; max-width: 280px; height: auto;" />
					<div class="flex w-full flex-col gap-2">
						<Button onclick={downloadPng}>
							<Download />
							PNG
						</Button>
						<Button variant="outline" onclick={downloadSvg}>
							<Download />
							SVG
						</Button>
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">Enter content to generate.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
