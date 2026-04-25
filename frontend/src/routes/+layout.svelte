<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { ModeWatcher } from "mode-watcher";
	import ThemeToggle from "$lib/components/theme-toggle.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<div class="bg-background text-foreground min-h-screen">
	<div class="fixed top-4 right-4 z-50">
		<ThemeToggle />
	</div>
	{@render children()}
</div>
