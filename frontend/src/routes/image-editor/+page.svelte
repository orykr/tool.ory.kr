<script lang="ts">
	import { onDestroy } from "svelte";
	import Cropper from "cropperjs";
	import "cropperjs/dist/cropper.css";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
	import RotateCw from "@lucide/svelte/icons/rotate-cw";
	import FlipHorizontal from "@lucide/svelte/icons/flip-horizontal";
	import FlipVertical from "@lucide/svelte/icons/flip-vertical";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Download from "@lucide/svelte/icons/download";
	import Upload from "@lucide/svelte/icons/upload";

	let fileInput: HTMLInputElement;
	let imageElement: HTMLImageElement;
	let cropper: Cropper | null = null;
	let imageSrc = $state<string | null>(null);
	let fileName = "image";

	let outputFormat = $state("image/jpeg");
	let outputQuality = $state([0.9]);
	let targetWidth = $state<number | null>(null);
	let targetHeight = $state<number | null>(null);
	let isDragging = $state(false);

	let scaleX = 1;
	let scaleY = 1;

	const formatLabels: Record<string, string> = {
		"image/jpeg": "JPEG",
		"image/png": "PNG",
		"image/webp": "WebP"
	};

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		processFile(target.files?.[0]);
	}

	function processFile(file: File | undefined) {
		if (file && file.type.startsWith("image/")) {
			fileName = file.name.split(".")[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				imageSrc = e.target?.result as string;
				setTimeout(initCropper, 0);
			};
			reader.readAsDataURL(file);
		}
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
		processFile(e.dataTransfer?.files[0]);
	}

	function initCropper() {
		cropper?.destroy();
		if (imageElement) {
			cropper = new Cropper(imageElement, {
				viewMode: 1,
				responsive: true,
				autoCropArea: 0.8
			});
		}
	}

	function rotate(degree: number) {
		cropper?.rotate(degree);
	}

	function flipX() {
		scaleX = -scaleX;
		cropper?.scaleX(scaleX);
	}

	function flipY() {
		scaleY = -scaleY;
		cropper?.scaleY(scaleY);
	}

	function reset() {
		cropper?.reset();
		scaleX = 1;
		scaleY = 1;
		targetWidth = null;
		targetHeight = null;
	}

	function download() {
		if (!cropper) return;
		const canvasOptions: Cropper.GetCroppedCanvasOptions = {};
		if (targetWidth && targetWidth > 0) canvasOptions.width = targetWidth;
		if (targetHeight && targetHeight > 0) canvasOptions.height = targetHeight;

		const canvas = cropper.getCroppedCanvas(canvasOptions);
		if (canvas) {
			const url = canvas.toDataURL(outputFormat, outputQuality[0]);
			const ext =
				outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
			const a = document.createElement("a");
			a.href = url;
			a.download = `${fileName}-edited.${ext}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	function newImage() {
		imageSrc = null;
		cropper?.destroy();
		cropper = null;
	}

	onDestroy(() => cropper?.destroy());
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Image Editor</h1>
		<p class="text-muted-foreground mt-1">
			Crop, rotate, resize, and optimize images directly in your browser.
		</p>
	</header>

	{#if !imageSrc}
		<button
			type="button"
			class="hover:border-primary hover:bg-primary/5 hover:text-primary flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-16 text-center transition-colors {isDragging
				? 'border-primary bg-primary/5 text-primary'
				: 'text-muted-foreground border-border'}"
			onclick={() => fileInput.click()}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<Upload class="h-10 w-10" />
			<p class="text-base font-medium">Click or Drag & Drop to upload an image</p>
			<input
				type="file"
				accept="image/*"
				bind:this={fileInput}
				onchange={handleFileSelect}
				class="hidden"
			/>
		</button>
	{:else}
		<div class="grid gap-6 md:grid-cols-3">
			<div class="bg-muted overflow-hidden rounded-lg md:col-span-2" style="max-height: 70vh;">
				<img bind:this={imageElement} src={imageSrc} alt="To edit" class="block max-w-full" />
			</div>

			<div class="space-y-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Transform</Card.Title>
					</Card.Header>
					<Card.Content class="grid grid-cols-2 gap-2">
						<Button variant="outline" onclick={() => rotate(-90)}>
							<RotateCcw />
							-90°
						</Button>
						<Button variant="outline" onclick={() => rotate(90)}>
							<RotateCw />
							+90°
						</Button>
						<Button variant="outline" onclick={flipX}>
							<FlipHorizontal />
							Flip X
						</Button>
						<Button variant="outline" onclick={flipY}>
							<FlipVertical />
							Flip Y
						</Button>
						<Button variant="ghost" class="col-span-2" onclick={reset}>
							<RefreshCw />
							Reset
						</Button>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Resize (Optional)</Card.Title>
					</Card.Header>
					<Card.Content class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5">
							<Label for="width">Width</Label>
							<Input id="width" type="number" bind:value={targetWidth} placeholder="Auto" />
						</div>
						<div class="space-y-1.5">
							<Label for="height">Height</Label>
							<Input id="height" type="number" bind:value={targetHeight} placeholder="Auto" />
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Output Settings</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="space-y-1.5">
							<Label for="format">Format</Label>
							<Select.Root type="single" bind:value={outputFormat}>
								<Select.Trigger class="w-full">
									{formatLabels[outputFormat]}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="image/jpeg">JPEG</Select.Item>
									<Select.Item value="image/png">PNG</Select.Item>
									<Select.Item value="image/webp">WebP</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>

						{#if outputFormat !== "image/png"}
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<Label>Quality</Label>
									<span class="text-muted-foreground text-sm">
										{Math.round(outputQuality[0] * 100)}%
									</span>
								</div>
								<Slider
									type="single"
									bind:value={outputQuality}
									min={0.1}
									max={1}
									step={0.1}
								/>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<Separator />

				<div class="space-y-2">
					<Button class="w-full" onclick={download}>
						<Download />
						Download Image
					</Button>
					<Button variant="outline" class="w-full" onclick={newImage}>New Image</Button>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	:global(.cropper-view-box) {
		outline: 1px solid var(--primary);
	}
	:global(.cropper-line),
	:global(.cropper-point) {
		background-color: var(--primary);
	}
</style>
