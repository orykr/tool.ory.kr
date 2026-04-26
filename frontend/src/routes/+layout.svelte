<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { ModeWatcher } from "mode-watcher";
	import { page } from "$app/state";
	import ThemeToggle from "$lib/components/theme-toggle.svelte";
	import ToolSwitcher from "$lib/components/tool-switcher.svelte";
	import { findCategoryForHref, findTool } from "$lib/tools";

	let { children } = $props();

	let pathname = $derived(page.url?.pathname ?? "/");
	let normalized = $derived(pathname.replace(/\/$/, "") || "/");
	let activeTool = $derived(normalized === "/" ? null : findTool(normalized));
	let activeCategory = $derived(activeTool ? findCategoryForHref(activeTool.href) : null);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<div class="bg-background text-foreground min-h-screen">
	<header class="bg-background/80 sticky top-0 z-40 border-b backdrop-blur supports-backdrop-filter:bg-background/60">
		<div class="container mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
			<a
				href="/"
				class="flex items-center gap-2 text-sm font-bold tracking-tight whitespace-nowrap"
			>
				<span class="text-base">ORY</span>
				<span class="text-muted-foreground hidden sm:inline">TOOLS</span>
			</a>

			{#if activeTool}
				<nav class="text-muted-foreground hidden items-center gap-1.5 truncate text-sm md:flex">
					<span aria-hidden="true">/</span>
					{#if activeCategory}
						<span>{activeCategory.label}</span>
						<span aria-hidden="true">/</span>
					{/if}
					<span class="text-foreground truncate font-medium">{activeTool.title}</span>
				</nav>
			{/if}

			<div class="ml-auto flex items-center gap-2">
				<ToolSwitcher currentHref={normalized} />
				<ThemeToggle />
			</div>
		</div>
	</header>

	{@render children()}
</div>
