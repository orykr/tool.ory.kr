<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";

	const tools = [
		{
			href: "/cidr",
			title: "CIDR Calculator",
			description: "Calculate IP ranges, subnet masks, and more from CIDR notation."
		},
		{
			href: "/image-editor",
			title: "Image Editor",
			description: "Crop, rotate, resize, and optimize images directly in your browser."
		},
		{
			href: "/gif-maker",
			title: "GIF Maker",
			description: "Create animated GIFs from multiple images with custom speed and size."
		},
		{
			href: "/video-to-gif",
			title: "Video to GIF",
			description: "Convert video files to optimized animated GIFs directly in your browser."
		},
		{
			href: "/base64",
			title: "Base64 Encoder / Decoder",
			description: "Encode and decode Base64 text or files entirely in your browser."
		},
		{
			href: "/json",
			title: "JSON Formatter",
			description: "Pretty-print, minify, validate, and sort keys in JSON documents."
		},
		{
			href: "/jwt",
			title: "JWT Decoder",
			description: "Inspect JWT header, payload, and claims locally without verification."
		}
	];
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
	<header class="mb-10 border-b pb-6">
		<h1 class="text-4xl font-bold tracking-tight">ORY TOOLS</h1>
		<p class="text-muted-foreground mt-2">Select a tool from the list below.</p>
	</header>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each tools as tool (tool.href)}
			<a
				href={tool.href}
				class="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			>
				<Card.Root
					class="hover:border-foreground/20 h-full transition-all hover:-translate-y-1 hover:shadow-md"
				>
					<Card.Header>
						<Card.Title class="text-primary">{tool.title}</Card.Title>
						<Card.Description>{tool.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</main>
