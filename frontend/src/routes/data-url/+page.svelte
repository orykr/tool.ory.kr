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
	import Download from "@lucide/svelte/icons/download";

	let dataUrl = $state("");
	let mime = $state("");
	let size = $state(0);
	let fileName = $state("file");
	let errorMsg = $state<string | null>(null);

	let decodeInput = $state("");
	let decoded = $state<{ mime: string; bytes: Uint8Array; preview?: string } | null>(null);
	let decodeError = $state<string | null>(null);

	async function readFile(file: File) {
		errorMsg = null;
		try {
			const buf = await file.arrayBuffer();
			const bytes = new Uint8Array(buf);
			let binary = "";
			for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
			const b64 = btoa(binary);
			const m = file.type || "application/octet-stream";
			dataUrl = `data:${m};base64,${b64}`;
			mime = m;
			size = bytes.length;
			fileName = file.name || "file";
		} catch (e) {
			errorMsg = (e as Error).message;
			dataUrl = "";
		}
	}

	function onPick(ev: Event) {
		const target = ev.currentTarget as HTMLInputElement;
		const f = target.files?.[0];
		if (f) readFile(f);
	}

	function percentDecodeBytes(payload: string): Uint8Array {
		const out: number[] = [];
		for (let i = 0; i < payload.length; i++) {
			const c = payload[i];
			if (c === "%" && i + 2 < payload.length) {
				const hex = payload.slice(i + 1, i + 3);
				if (/^[0-9a-fA-F]{2}$/.test(hex)) {
					out.push(parseInt(hex, 16));
					i += 2;
					continue;
				}
			}
			out.push(c.charCodeAt(0) & 0xff);
		}
		return new Uint8Array(out);
	}

	function decodeNow() {
		decodeError = null;
		try {
			const s = decodeInput.trim();
			const m = s.match(/^data:([^,]*),(.*)$/s);
			if (!m) throw new Error("Not a data: URL.");
			const meta = m[1];
			const payload = m[2];
			const metaParts = meta.split(";").filter(Boolean);
			let isB64 = false;
			const mtParts: string[] = [];
			for (const p of metaParts) {
				if (p.toLowerCase() === "base64") isB64 = true;
				else mtParts.push(p);
			}
			const mt = mtParts.length ? mtParts.join(";") : "text/plain";
			let bytes: Uint8Array;
			if (isB64) {
				const binary = atob(payload);
				bytes = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
			} else {
				bytes = percentDecodeBytes(payload);
			}
			let preview: string | undefined;
			if (mt.startsWith("text/") || mt === "application/json" || mt === "application/xml") {
				try {
					preview = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
				} catch {
					preview = undefined;
				}
			}
			decoded = { mime: mt, bytes, preview };
		} catch (e) {
			decodeError = (e as Error).message;
			decoded = null;
		}
	}

	function downloadDecoded() {
		if (!decoded) return;
		const blob = new Blob([decoded.bytes as unknown as BlobPart], { type: decoded.mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "decoded";
		a.click();
		URL.revokeObjectURL(url);
	}

	let copied = $state(false);
	async function copyUrl() {
		if (!dataUrl) return;
		await navigator.clipboard.writeText(dataUrl);
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
		<h1 class="text-3xl font-bold tracking-tight">Data URL</h1>
		<p class="text-muted-foreground mt-1">
			Encode any local file to a <code>data:</code> URL, or decode a <code>data:</code> URL back to bytes.
		</p>
	</header>

	<Tabs.Root value="encode">
		<Tabs.List>
			<Tabs.Trigger value="encode">Encode</Tabs.Trigger>
			<Tabs.Trigger value="decode">Decode</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encode">
			<Card.Root class="mb-4">
				<Card.Content class="space-y-3 pt-6">
					<div class="space-y-1.5">
						<Label for="f">File</Label>
						<Input id="f" type="file" onchange={onPick} />
					</div>
					{#if errorMsg}
						<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
							{errorMsg}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			{#if dataUrl}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-base">data: URL</Card.Title>
							<Card.Description>
								{fileName} · {mime} · {formatSize(size)} · base64 length {dataUrl.length}
							</Card.Description>
						</div>
						<Button variant="ghost" size="sm" onclick={copyUrl}>
							{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={dataUrl} readonly class="min-h-48 font-mono text-xs" />
						{#if mime.startsWith("image/")}
							<div class="mt-3">
								<p class="text-muted-foreground mb-1 text-xs">Preview</p>
								<img src={dataUrl} alt="preview" class="max-h-64 rounded border" />
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="decode">
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">Paste data: URL</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Textarea bind:value={decodeInput} class="min-h-32 font-mono text-xs" />
					<Button onclick={decodeNow}>Decode</Button>
					{#if decodeError}
						<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
							{decodeError}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			{#if decoded}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<div>
							<Card.Title class="text-base">Decoded</Card.Title>
							<Card.Description>
								{decoded.mime} · {formatSize(decoded.bytes.length)}
							</Card.Description>
						</div>
						<Button variant="ghost" size="sm" onclick={downloadDecoded}>
							<Download />
							Download
						</Button>
					</Card.Header>
					<Card.Content>
						{#if decoded.preview !== undefined}
							<Textarea value={decoded.preview} readonly class="min-h-48 font-mono text-xs" />
						{:else if decoded.mime.startsWith("image/")}
							<img src={decodeInput} alt="decoded" class="max-h-64 rounded border" />
						{:else}
							<p class="text-muted-foreground text-sm">Binary content. Use Download to save.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</main>
