<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";

	const JS_RESERVED = new Set([
		"break", "case", "catch", "class", "const", "continue", "debugger", "default",
		"delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
		"function", "if", "import", "in", "instanceof", "new", "null", "return", "super",
		"switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
		"yield", "let", "static", "implements", "interface", "package", "private",
		"protected", "public", "await", "async"
	]);
	const PY_RESERVED = new Set([
		"False", "None", "True", "and", "as", "assert", "async", "await", "break", "class",
		"continue", "def", "del", "elif", "else", "except", "finally", "for", "from",
		"global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass",
		"raise", "return", "try", "while", "with", "yield", "match", "case"
	]);
	const JAVA_RESERVED = new Set([
		"abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class",
		"const", "continue", "default", "do", "double", "else", "enum", "extends", "final",
		"finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int",
		"interface", "long", "native", "new", "package", "private", "protected", "public",
		"return", "short", "static", "strictfp", "super", "switch", "synchronized", "this",
		"throw", "throws", "transient", "try", "void", "volatile", "while", "true", "false",
		"null"
	]);
	const SQL_RESERVED = new Set([
		"select", "from", "where", "and", "or", "not", "null", "as", "in", "is", "like",
		"between", "join", "left", "right", "inner", "outer", "on", "group", "by", "having",
		"order", "limit", "offset", "insert", "into", "values", "update", "set", "delete",
		"create", "drop", "alter", "table", "index", "view", "primary", "key", "foreign",
		"references", "default", "case", "when", "then", "else", "end"
	]);

	let name = $state("myVariable");

	function check(id: string) {
		const trimmed = id.trim();
		const empty = trimmed.length === 0;
		const startsWithDigit = /^\d/.test(trimmed);
		const hasInvalid = /[^A-Za-z0-9_$]/.test(trimmed);
		const hasInvalidPy = /[^A-Za-z0-9_]/.test(trimmed);
		return {
			empty,
			startsWithDigit,
			js: {
				valid: !empty && !startsWithDigit && !hasInvalid,
				reserved: JS_RESERVED.has(trimmed)
			},
			py: {
				valid: !empty && !startsWithDigit && !hasInvalidPy,
				reserved: PY_RESERVED.has(trimmed)
			},
			java: {
				valid: !empty && !startsWithDigit && !hasInvalid,
				reserved: JAVA_RESERVED.has(trimmed)
			},
			sql: {
				valid: !empty && !startsWithDigit && !/[^A-Za-z0-9_]/.test(trimmed),
				reserved: SQL_RESERVED.has(trimmed.toLowerCase())
			}
		};
	}

	let r = $derived(check(name));

	function row(label: string, valid: boolean, reserved: boolean) {
		return { label, valid, reserved };
	}

	let rows = $derived([
		row("JavaScript / TypeScript", r.js.valid, r.js.reserved),
		row("Python", r.py.valid, r.py.reserved),
		row("Java", r.java.valid, r.java.reserved),
		row("SQL (case-insensitive)", r.sql.valid, r.sql.reserved)
	]);
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
		<h1 class="text-3xl font-bold tracking-tight">Identifier Validator</h1>
		<p class="text-muted-foreground mt-1">
			Check whether a name is a valid identifier and not a reserved word in major languages.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="space-y-1.5">
				<Label for="n">Identifier</Label>
				<Input id="n" bind:value={name} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Per-language status</Card.Title></Card.Header>
		<Card.Content>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2"></th>
						<th class="px-2 py-2">Language</th>
						<th class="px-2 py-2">Syntactically valid</th>
						<th class="px-2 py-2">Reserved word?</th>
						<th class="px-2 py-2">Usable</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row, i (row.label)}
						{@const usable = row.valid && !row.reserved}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1">
								{#if usable}
									<CheckCircle class="h-5 w-5 text-emerald-500" />
								{:else}
									<XCircle class="text-destructive h-5 w-5" />
								{/if}
							</td>
							<td class="px-2 py-1 font-semibold">{row.label}</td>
							<td class="px-2 py-1">{row.valid ? "yes" : "no"}</td>
							<td class="px-2 py-1">{row.reserved ? "yes" : "no"}</td>
							<td class="px-2 py-1">{usable ? "yes" : "no"}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if r.empty}
				<p class="text-muted-foreground mt-2 text-xs">Empty identifier.</p>
			{:else if r.startsWithDigit}
				<p class="text-destructive mt-2 text-xs">Identifiers must not start with a digit.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
