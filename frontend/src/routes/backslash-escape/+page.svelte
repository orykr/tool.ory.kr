<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let mode = $state<"escape" | "unescape">("escape");

	let escapeInput = $state(`Tab\there
Newline.
"Quoted"
\\backslash
é 中 \u{1f4a9}`);
	let unescapeInput = $state(`Tab\\there\\nNewline.\\n\\"Quoted\\"\\n\\\\backslash\\n\\u00e9 \\u4e2d \\uD83D\\uDCA9`);

	function escapeText(text: string): string {
		let out = "";
		for (const ch of text) {
			const cp = ch.codePointAt(0);
			if (cp === undefined) continue;
			if (ch === "\\") out += "\\\\";
			else if (ch === '"') out += '\\"';
			else if (ch === "\n") out += "\\n";
			else if (ch === "\r") out += "\\r";
			else if (ch === "\t") out += "\\t";
			else if (ch === "\b") out += "\\b";
			else if (ch === "\f") out += "\\f";
			else if (ch === "\v") out += "\\v";
			else if (ch === "\0") out += "\\0";
			else if (cp < 0x20 || cp === 0x7f) out += "\\x" + cp.toString(16).padStart(2, "0");
			else if (cp <= 0x7e) out += ch;
			else if (cp <= 0xffff) out += "\\u" + cp.toString(16).padStart(4, "0");
			else out += "\\u{" + cp.toString(16) + "}";
		}
		return out;
	}

	function unescapeText(text: string): { ok: true; value: string } | { ok: false; error: string } {
		let out = "";
		try {
			for (let i = 0; i < text.length; i++) {
				const ch = text[i];
				if (ch !== "\\") {
					out += ch;
					continue;
				}
				const next = text[i + 1];
				if (next === undefined) throw new Error(`Trailing backslash at ${i}`);
				switch (next) {
					case "\\": out += "\\"; i++; break;
					case '"': out += '"'; i++; break;
					case "'": out += "'"; i++; break;
					case "n": out += "\n"; i++; break;
					case "r": out += "\r"; i++; break;
					case "t": out += "\t"; i++; break;
					case "b": out += "\b"; i++; break;
					case "f": out += "\f"; i++; break;
					case "v": out += "\v"; i++; break;
					case "0":
						if (/[0-9]/.test(text[i + 2] ?? "")) throw new Error(`Octal escape at ${i} not supported`);
						out += "\0"; i++; break;
					case "x": {
						const hex = text.slice(i + 2, i + 4);
						if (!/^[0-9a-fA-F]{2}$/.test(hex)) throw new Error(`Invalid \\x escape at ${i}`);
						out += String.fromCharCode(parseInt(hex, 16));
						i += 3;
						break;
					}
					case "u": {
						if (text[i + 2] === "{") {
							const close = text.indexOf("}", i + 3);
							if (close < 0) throw new Error(`Unterminated \\u{} at ${i}`);
							const hex = text.slice(i + 3, close);
							if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error(`Invalid \\u{} at ${i}`);
							const cp = parseInt(hex, 16);
							if (cp > 0x10ffff) throw new Error(`Code point out of range at ${i}`);
							out += String.fromCodePoint(cp);
							i = close;
							break;
						}
						const hex = text.slice(i + 2, i + 6);
						if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw new Error(`Invalid \\u escape at ${i}`);
						const code = parseInt(hex, 16);
						if (code >= 0xd800 && code <= 0xdbff) {
							if (text.slice(i + 6, i + 8) === "\\u") {
								const hex2 = text.slice(i + 8, i + 12);
								if (/^[0-9a-fA-F]{4}$/.test(hex2)) {
									const code2 = parseInt(hex2, 16);
									if (code2 >= 0xdc00 && code2 <= 0xdfff) {
										out += String.fromCharCode(code, code2);
										i += 11;
										break;
									}
								}
							}
						}
						out += String.fromCharCode(code);
						i += 5;
						break;
					}
					default:
						out += "\\" + next;
						i++;
				}
			}
			return { ok: true, value: out };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	}

	let escaped = $derived(escapeText(escapeInput));
	let unescaped = $derived(unescapeText(unescapeInput));

	let copied = $state(false);
	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Backslash Escape / Unescape</h1>
		<p class="text-muted-foreground mt-1">
			Escape or unescape strings using common backslash sequences (<code>\n</code>, <code>\t</code>, <code>\xNN</code>, <code>\uNNNN</code>, <code>{"\\u{...}"}</code>).
		</p>
	</header>

	<Tabs.Root value={mode} onValueChange={(v) => (mode = v as "escape" | "unescape")}>
		<Tabs.List>
			<Tabs.Trigger value="escape">Escape</Tabs.Trigger>
			<Tabs.Trigger value="unescape">Unescape</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="escape">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Raw text</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={escapeInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">Escaped</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy(escaped)}>
							{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={escaped} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="unescape">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Escaped text</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={unescapeInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">Decoded</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => unescaped.ok && copy(unescaped.value)} disabled={!unescaped.ok}>
							{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						{#if unescaped.ok}
							<Textarea value={unescaped.value} readonly class="min-h-72 font-mono text-sm" />
						{:else}
							<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
								{unescaped.error}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</main>
