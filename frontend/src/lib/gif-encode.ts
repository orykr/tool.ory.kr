// @ts-ignore - gif.js has no types
import GIF from "gif.js";

export type EncodeFrame = {
	image: HTMLImageElement | HTMLCanvasElement | ImageData;
	delay: number;
};

export type EncodeOptions = {
	width?: number;
	height?: number;
	quality?: number;
	repeat?: number;
	background?: string;
	onProgress?: (percent: number) => void;
};

export function encodeGif(frames: EncodeFrame[], opts: EncodeOptions = {}): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const gif = new GIF({
			workers: 2,
			quality: opts.quality ?? 10,
			workerScript: "/gif.worker.js",
			width: opts.width,
			height: opts.height,
			repeat: opts.repeat ?? 0,
			background: opts.background ?? "#000000"
		});
		for (const f of frames) {
			gif.addFrame(f.image, { delay: f.delay, copy: true });
		}
		gif.on("progress", (p: number) => {
			opts.onProgress?.(Math.round(p * 100));
		});
		gif.on("finished", (blob: Blob) => resolve(blob));
		gif.on("abort", () => reject(new Error("GIF encoding aborted")));
		try {
			gif.render();
		} catch (err) {
			reject(err);
		}
	});
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Image failed to load"));
		img.src = src;
	});
}
