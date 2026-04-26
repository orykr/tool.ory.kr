<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(`[1;31mError:[0m [33mfile not found[0m\n[32m+ added line[0m\n[31m- removed line[0m\n[1;4;38;5;202mbright orange + bold + underline[0m`);

	type Style = {
		bold: boolean;
		dim: boolean;
		italic: boolean;
		underline: boolean;
		fg: string | null;
		bg: string | null;
	};

	function emptyStyle(): Style {
		return { bold: false, dim: false, italic: false, underline: false, fg: null, bg: null };
	}

	const BASIC_FG = ["#000000", "#cd0000", "#00cd00", "#cdcd00", "#0000ee", "#cd00cd", "#00cdcd", "#e5e5e5"];
	const BRIGHT_FG = ["#7f7f7f", "#ff0000", "#00ff00", "#ffff00", "#5c5cff", "#ff00ff", "#00ffff", "#ffffff"];

	function color256(n: number): string {
		if (n < 16) return n < 8 ? BASIC_FG[n] : BRIGHT_FG[n - 8];
		if (n < 232) {
			const i = n - 16;
			const r = Math.floor(i / 36);
			const g = Math.floor((i % 36) / 6);
			const b = i % 6;
			const v = (x: number) => (x === 0 ? 0 : 55 + x * 40);
			return `rgb(${v(r)}, ${v(g)}, ${v(b)})`;
		}
		const v = 8 + (n - 232) * 10;
		return `rgb(${v}, ${v}, ${v})`;
	}

	type Segment = { text: string; style: Style };

	function parseAnsi(text: string): Segment[] {
		const segments: Segment[] = [];
		let style = emptyStyle();
		let buf = "";
		let i = 0;
		const flush = () => {
			if (buf) {
				segments.push({ text: buf, style: { ...style } });
				buf = "";
			}
		};
		while (i < text.length) {
			const ch = text[i];
			if (ch === "" && text[i + 1] === "[") {
				flush();
				let j = i + 2;
				let params = "";
				while (j < text.length) {
					const code = text.charCodeAt(j);
					if (code >= 0x40 && code <= 0x7e) break;
					params += text[j];
					j++;
				}
				const cmd = text[j] ?? "";
				if (cmd === "m") {
					applySgr(params, style, (s) => (style = s));
				}
				i = j + 1;
				continue;
			}
			buf += ch;
			i++;
		}
		flush();
		return segments;
	}

	function applySgr(params: string, current: Style, set: (s: Style) => void) {
		const codes = params === "" ? [0] : params.split(";").map((p) => Number(p) || 0);
		let style = { ...current };
		let idx = 0;
		while (idx < codes.length) {
			const c = codes[idx];
			if (c === 0) style = emptyStyle();
			else if (c === 1) style.bold = true;
			else if (c === 2) style.dim = true;
			else if (c === 3) style.italic = true;
			else if (c === 4) style.underline = true;
			else if (c === 22) {
				style.bold = false;
				style.dim = false;
			} else if (c === 23) style.italic = false;
			else if (c === 24) style.underline = false;
			else if (c >= 30 && c <= 37) style.fg = BASIC_FG[c - 30];
			else if (c === 38) {
				if (codes[idx + 1] === 5 && idx + 2 < codes.length) {
					style.fg = color256(codes[idx + 2]);
					idx += 2;
				} else if (codes[idx + 1] === 2 && idx + 4 < codes.length) {
					style.fg = `rgb(${codes[idx + 2]}, ${codes[idx + 3]}, ${codes[idx + 4]})`;
					idx += 4;
				}
			} else if (c === 39) style.fg = null;
			else if (c >= 40 && c <= 47) style.bg = BASIC_FG[c - 40];
			else if (c === 48) {
				if (codes[idx + 1] === 5 && idx + 2 < codes.length) {
					style.bg = color256(codes[idx + 2]);
					idx += 2;
				} else if (codes[idx + 1] === 2 && idx + 4 < codes.length) {
					style.bg = `rgb(${codes[idx + 2]}, ${codes[idx + 3]}, ${codes[idx + 4]})`;
					idx += 4;
				}
			} else if (c === 49) style.bg = null;
			else if (c >= 90 && c <= 97) style.fg = BRIGHT_FG[c - 90];
			else if (c >= 100 && c <= 107) style.bg = BRIGHT_FG[c - 100];
			idx++;
		}
		set(style);
	}

	function styleToCss(style: Style): string {
		const parts: string[] = [];
		if (style.bold) parts.push("font-weight: 700");
		if (style.dim) parts.push("opacity: 0.6");
		if (style.italic) parts.push("font-style: italic");
		if (style.underline) parts.push("text-decoration: underline");
		if (style.fg) parts.push(`color: ${style.fg}`);
		if (style.bg) parts.push(`background-color: ${style.bg}`);
		return parts.join("; ");
	}

	let segments = $derived(parseAnsi(input));
	let stripped = $derived(segments.map((s) => s.text).join(""));

	let copied = $state(false);
	async function copyStripped() {
		await navigator.clipboard.writeText(stripped);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">ANSI Escape Decoder</h1>
		<p class="text-muted-foreground mt-1">
			Render terminal output with SGR colors and styles, or strip ANSI escapes to plain text.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Input (with ANSI escapes)</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-40 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Rendered</Card.Title></Card.Header>
		<Card.Content>
			<pre class="bg-black text-white overflow-auto rounded p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">{#each segments as seg, i (i)}<span style={styleToCss(seg.style)}>{seg.text}</span>{/each}</pre>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Stripped (plain text)</Card.Title>
			<Button variant="ghost" size="sm" onclick={copyStripped}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<Textarea value={stripped} readonly class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>
</main>
