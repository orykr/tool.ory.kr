<script lang="ts">
	let {
		natW = $bindable(0),
		natH = $bindable(0),
		x = $bindable(0),
		y = $bindable(0),
		w = $bindable(100),
		h = $bindable(100),
		color = "primary",
		children
	}: {
		natW: number;
		natH: number;
		x: number;
		y: number;
		w: number;
		h: number;
		color?: "primary" | "destructive";
		children: import("svelte").Snippet;
	} = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let drag = $state<null | {
		mode: "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | "new";
		startX: number;
		startY: number;
		origX: number;
		origY: number;
		origW: number;
		origH: number;
	}>(null);

	function clientToImage(clientX: number, clientY: number): { ix: number; iy: number } | null {
		if (!containerEl || natW === 0 || natH === 0) return null;
		const rect = containerEl.getBoundingClientRect();
		const sx = natW / rect.width;
		const sy = natH / rect.height;
		return {
			ix: Math.round((clientX - rect.left) * sx),
			iy: Math.round((clientY - rect.top) * sy)
		};
	}

	function startDrag(mode: typeof drag.mode, ev: PointerEvent) {
		if (!containerEl) return;
		ev.preventDefault();
		ev.stopPropagation();
		(ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);
		const p = clientToImage(ev.clientX, ev.clientY);
		if (!p) return;
		drag = {
			mode,
			startX: p.ix,
			startY: p.iy,
			origX: x,
			origY: y,
			origW: w,
			origH: h
		};
		if (mode === "new") {
			x = p.ix; y = p.iy; w = 1; h = 1;
		}
	}

	function onMove(ev: PointerEvent) {
		if (!drag) return;
		const p = clientToImage(ev.clientX, ev.clientY);
		if (!p) return;
		const dx = p.ix - drag.startX;
		const dy = p.iy - drag.startY;
		if (drag.mode === "move") {
			x = Math.max(0, Math.min(natW - drag.origW, drag.origX + dx));
			y = Math.max(0, Math.min(natH - drag.origH, drag.origY + dy));
		} else if (drag.mode === "new") {
			const ix = Math.max(0, Math.min(natW, p.ix));
			const iy = Math.max(0, Math.min(natH, p.iy));
			x = Math.min(drag.startX, ix);
			y = Math.min(drag.startY, iy);
			w = Math.max(1, Math.abs(ix - drag.startX));
			h = Math.max(1, Math.abs(iy - drag.startY));
		} else {
			let nx = drag.origX, ny = drag.origY, nw = drag.origW, nh = drag.origH;
			if (drag.mode.includes("e")) nw = Math.max(1, drag.origW + dx);
			if (drag.mode.includes("s")) nh = Math.max(1, drag.origH + dy);
			if (drag.mode.includes("w")) { nx = drag.origX + dx; nw = drag.origW - dx; if (nw < 1) { nx = drag.origX + drag.origW - 1; nw = 1; } }
			if (drag.mode.includes("n")) { ny = drag.origY + dy; nh = drag.origH - dy; if (nh < 1) { ny = drag.origY + drag.origH - 1; nh = 1; } }
			x = Math.max(0, Math.min(natW - 1, nx));
			y = Math.max(0, Math.min(natH - 1, ny));
			w = Math.max(1, Math.min(natW - x, nw));
			h = Math.max(1, Math.min(natH - y, nh));
		}
	}

	function endDrag(ev: PointerEvent) {
		drag = null;
	}

	const colorClass = color === "destructive" ? "border-destructive bg-destructive/30" : "border-primary bg-primary/10";
	const handleColor = color === "destructive" ? "bg-destructive" : "bg-primary";
</script>

<div
	bind:this={containerEl}
	class="bg-muted relative w-full overflow-hidden rounded-md select-none"
	style="touch-action: none;"
	onpointerdown={(e) => startDrag("new", e)}
	onpointermove={onMove}
	onpointerup={endDrag}
	onpointercancel={endDrag}
>
	{@render children()}

	{#if natW > 0 && natH > 0}
		<div
			class="pointer-events-auto absolute cursor-move border-2 {colorClass}"
			style="left:{(x / natW) * 100}%;top:{(y / natH) * 100}%;width:{(w / natW) * 100}%;height:{(h / natH) * 100}%"
			onpointerdown={(e) => startDrag("move", e)}
			role="presentation"
		>
			{#each [
				{ pos: "nw", style: "top:-6px;left:-6px;cursor:nwse-resize" },
				{ pos: "n", style: "top:-6px;left:50%;transform:translateX(-50%);cursor:ns-resize" },
				{ pos: "ne", style: "top:-6px;right:-6px;cursor:nesw-resize" },
				{ pos: "e", style: "top:50%;right:-6px;transform:translateY(-50%);cursor:ew-resize" },
				{ pos: "se", style: "bottom:-6px;right:-6px;cursor:nwse-resize" },
				{ pos: "s", style: "bottom:-6px;left:50%;transform:translateX(-50%);cursor:ns-resize" },
				{ pos: "sw", style: "bottom:-6px;left:-6px;cursor:nesw-resize" },
				{ pos: "w", style: "top:50%;left:-6px;transform:translateY(-50%);cursor:ew-resize" }
			] as h (h.pos)}
				<div
					class="absolute h-3 w-3 rounded-full border border-white shadow {handleColor}"
					style={h.style}
					onpointerdown={(e) => startDrag(h.pos, e)}
					role="presentation"
				></div>
			{/each}
		</div>
	{/if}
</div>
