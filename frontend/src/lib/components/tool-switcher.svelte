<script lang="ts">
	import { onDestroy } from "svelte";
	import { categories, allTools, findCategoryForHref } from "$lib/tools";
	import { Input } from "$lib/components/ui/input/index.js";
	import Search from "@lucide/svelte/icons/search";
	import X from "@lucide/svelte/icons/x";

	let { currentHref = "/" }: { currentHref?: string } = $props();

	let open = $state(false);
	let query = $state("");
	let inputEl = $state<HTMLInputElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);

	let activeCategory = $derived(findCategoryForHref(currentHref));

	type Filtered = { id: string; label: string; tools: typeof allTools };

	let filtered = $derived.by<Filtered[]>(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return categories.map((c) => ({ id: c.id, label: c.label, tools: c.tools }));
		}
		const out: Filtered[] = [];
		for (const c of categories) {
			const matches = c.tools.filter(
				(t) =>
					t.title.toLowerCase().includes(q) ||
					t.description.toLowerCase().includes(q) ||
					t.href.toLowerCase().includes(q)
			);
			if (matches.length) out.push({ id: c.id, label: c.label, tools: matches });
		}
		return out;
	});

	let totalMatches = $derived(filtered.reduce((n, c) => n + c.tools.length, 0));

	function toggle() {
		open = !open;
		if (open) {
			queueMicrotask(() => inputEl?.focus());
		}
	}

	function close() {
		open = false;
		query = "";
	}

	function onWindowKey(ev: KeyboardEvent) {
		if (ev.key === "Escape" && open) {
			ev.preventDefault();
			close();
			triggerEl?.focus();
			return;
		}
		if ((ev.ctrlKey || ev.metaKey) && ev.key === "k") {
			ev.preventDefault();
			toggle();
		}
	}

	function onWindowClick(ev: MouseEvent) {
		if (!open) return;
		const target = ev.target as Node | null;
		if (!target) return;
		if (panelEl?.contains(target) || triggerEl?.contains(target)) return;
		close();
	}

	$effect(() => {
		if (typeof window === "undefined") return;
		window.addEventListener("keydown", onWindowKey);
		window.addEventListener("mousedown", onWindowClick);
		return () => {
			window.removeEventListener("keydown", onWindowKey);
			window.removeEventListener("mousedown", onWindowClick);
		};
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("keydown", onWindowKey);
			window.removeEventListener("mousedown", onWindowClick);
		}
	});
</script>

<div class="relative">
	<button
		type="button"
		bind:this={triggerEl}
		onclick={toggle}
		class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm shadow-xs transition-colors"
		aria-haspopup="dialog"
		aria-expanded={open}
	>
		<Search class="h-4 w-4" />
		<span class="text-muted-foreground hidden sm:inline">Find a tool…</span>
		<span class="text-muted-foreground hidden md:inline-flex items-center gap-1 ml-2">
			<kbd class="bg-muted rounded border px-1 font-mono text-[10px]">Ctrl</kbd>
			<kbd class="bg-muted rounded border px-1 font-mono text-[10px]">K</kbd>
		</span>
	</button>

	{#if open}
		<div
			bind:this={panelEl}
			class="bg-popover text-popover-foreground fixed inset-x-2 top-16 z-50 max-h-[80vh] origin-top overflow-hidden rounded-lg border shadow-lg sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[28rem]"
			role="dialog"
			aria-label="Tool switcher"
		>
			<div class="border-b p-2">
				<div class="relative">
					<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
					<Input
						bind:ref={inputEl}
						bind:value={query}
						placeholder="Search 178 tools by name…"
						class="pl-8 pr-8"
					/>
					{#if query}
						<button
							type="button"
							onclick={() => (query = "")}
							class="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5"
							aria-label="Clear search"
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
				</div>
			</div>

			<div class="max-h-[60vh] overflow-auto p-1">
				{#if totalMatches === 0}
					<p class="text-muted-foreground p-4 text-center text-sm">No tools match.</p>
				{:else}
					{#each filtered as cat (cat.id)}
						<div class="mb-2">
							<p class="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide">
								{cat.label}
							</p>
							{#each cat.tools as tool (tool.href)}
								<a
									href={tool.href}
									onclick={close}
									class="hover:bg-accent hover:text-accent-foreground flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-sm {tool.href === currentHref ? 'bg-accent/40' : ''}"
								>
									<span class="font-medium">{tool.title}</span>
									<span class="text-muted-foreground line-clamp-1 text-xs">{tool.description}</span>
								</a>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<div class="text-muted-foreground border-t px-3 py-2 text-xs">
				{#if activeCategory && !query}
					Currently viewing: <span class="font-medium">{activeCategory.label}</span>
				{:else}
					{totalMatches} of {allTools.length} tools
				{/if}
			</div>
		</div>
	{/if}
</div>
