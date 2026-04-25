<script lang="ts">
	// @ts-ignore
	import GIF from "gif.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Download from "@lucide/svelte/icons/download";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import X from "@lucide/svelte/icons/x";

	let files: File[] = [];
	let frames = $state<{ src: string; file: File }[]>([]);
	let delay = $state(500);
	let width = $state<number | null>(null);
	let height = $state<number | null>(null);
	let quality = $state(10);
	let isGenerating = $state(false);
	let generatedGifUrl = $state<string | null>(null);
	let progress = $state(0);

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) addFiles(Array.from(target.files));
	}

	function addFiles(newFiles: File[]) {
		const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
		files = [...files, ...imageFiles];
		imageFiles.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				frames = [...frames, { src: e.target?.result as string, file }];
			};
			reader.readAsDataURL(file);
		});
	}

	function removeFrame(index: number) {
		frames = frames.filter((_, i) => i !== index);
		files = files.filter((_, i) => i !== index);
	}

	function moveFrame(fromIndex: number, toIndex: number) {
		if (toIndex < 0 || toIndex >= frames.length) return;
		const newFrames = [...frames];
		const [movedFrame] = newFrames.splice(fromIndex, 1);
		newFrames.splice(toIndex, 0, movedFrame);
		frames = newFrames;

		const newFiles = [...files];
		const [movedFile] = newFiles.splice(fromIndex, 1);
		newFiles.splice(toIndex, 0, movedFile);
		files = newFiles;
	}

	async function generateGif() {
		if (frames.length === 0) return;
		isGenerating = true;
		progress = 0;
		generatedGifUrl = null;

		const gif = new GIF({
			workers: 2,
			quality,
			workerScript: "/gif.worker.js",
			width: width || undefined,
			height: height || undefined
		});

		const imageElements = await Promise.all(
			frames.map(
				(frame) =>
					new Promise<HTMLImageElement>((resolve) => {
						const img = new Image();
						img.src = frame.src;
						img.onload = () => resolve(img);
					})
			)
		);

		imageElements.forEach((img) => gif.addFrame(img, { delay }));
		gif.on("progress", (p: number) => (progress = Math.round(p * 100)));
		gif.on("finished", (blob: Blob) => {
			generatedGifUrl = URL.createObjectURL(blob);
			isGenerating = false;
		});
		gif.render();
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
		if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files));
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
		<h1 class="text-3xl font-bold tracking-tight">GIF Maker</h1>
		<p class="text-muted-foreground mt-1">
			Create animated GIFs from multiple images.
		</p>
	</header>

	<button
		type="button"
		class="hover:border-primary hover:bg-primary/5 hover:text-primary mb-6 flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
			? 'border-primary bg-primary/5 text-primary'
			: 'text-muted-foreground border-border'}"
		onclick={() => fileInput.click()}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<Upload class="h-10 w-10" />
		<p class="text-base font-medium">Click or Drag & Drop images here (Select multiple)</p>
		<input
			type="file"
			accept="image/*"
			multiple
			bind:this={fileInput}
			onchange={handleFileSelect}
			class="hidden"
		/>
	</button>

	{#if frames.length > 0}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-base">Frames ({frames.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-3">
					{#each frames as frame, i (frame.src + i)}
						<div
							class="bg-card flex w-36 flex-col items-center gap-2 rounded-md border p-2"
						>
							<img
								src={frame.src}
								alt="Frame {i + 1}"
								class="h-24 w-full rounded object-contain"
							/>
							<div class="flex w-full items-center gap-1">
								<Button
									variant="outline"
									size="icon-sm"
									onclick={() => moveFrame(i, i - 1)}
									disabled={i === 0}
								>
									<ChevronLeft />
								</Button>
								<span class="text-muted-foreground flex-1 text-center text-xs">
									{i + 1}
								</span>
								<Button
									variant="outline"
									size="icon-sm"
									onclick={() => moveFrame(i, i + 1)}
									disabled={i === frames.length - 1}
								>
									<ChevronRight />
								</Button>
								<Button
									variant="destructive"
									size="icon-sm"
									onclick={() => removeFrame(i)}
								>
									<X />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-base">Settings</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="delay">Delay (ms)</Label>
						<Input id="delay" type="number" bind:value={delay} min="10" step="10" />
					</div>
					<div class="space-y-1.5">
						<Label for="gif-width">Width (px)</Label>
						<Input id="gif-width" type="number" bind:value={width} placeholder="Auto" />
					</div>
					<div class="space-y-1.5">
						<Label for="gif-height">Height (px)</Label>
						<Input id="gif-height" type="number" bind:value={height} placeholder="Auto" />
					</div>
				</div>

				<Button class="w-full" onclick={generateGif} disabled={isGenerating}>
					{isGenerating ? `Generating... ${progress}%` : "Generate GIF"}
				</Button>

				{#if isGenerating}
					<Progress value={progress} max={100} />
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	{#if generatedGifUrl}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Result</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={generatedGifUrl} alt="Generated GIF" class="max-w-full rounded-md shadow-md" />
				<Button href={generatedGifUrl} download="animated.gif" class="w-full sm:w-auto">
					<Download />
					Download GIF
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
