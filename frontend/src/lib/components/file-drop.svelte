<script lang="ts">
	import Upload from "@lucide/svelte/icons/upload";

	let {
		accept = "*/*",
		multiple = false,
		label = "Click or drag & drop a file here",
		hint = "",
		onfiles
	}: {
		accept?: string;
		multiple?: boolean;
		label?: string;
		hint?: string;
		onfiles: (files: File[]) => void;
	} = $props();

	let isDragging = $state(false);
	let inputEl: HTMLInputElement;

	function handleSelect(ev: Event) {
		const t = ev.target as HTMLInputElement;
		if (t.files && t.files.length) onfiles(Array.from(t.files));
		t.value = "";
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files && files.length) onfiles(Array.from(files));
	}
</script>

<button
	type="button"
	class="hover:border-primary hover:bg-primary/5 hover:text-primary flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
		? 'border-primary bg-primary/5 text-primary'
		: 'text-muted-foreground border-border'}"
	onclick={() => inputEl.click()}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	<Upload class="h-10 w-10" />
	<p class="text-base font-medium">{label}</p>
	{#if hint}
		<p class="text-muted-foreground text-xs">{hint}</p>
	{/if}
	<input
		type="file"
		{accept}
		{multiple}
		bind:this={inputEl}
		onchange={handleSelect}
		class="hidden"
	/>
</button>
