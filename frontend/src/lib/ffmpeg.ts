import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const progressListeners = new Set<(p: number) => void>();
const logListeners = new Set<(line: string) => void>();

export type FFmpegProgress = (percent: number) => void;
export type FFmpegLog = (line: string) => void;

export async function getFFmpeg(): Promise<FFmpeg> {
	if (instance) return instance;
	if (loadPromise) return loadPromise;
	loadPromise = (async () => {
		const ff = new FFmpeg();
		ff.on("progress", ({ progress }) => {
			const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
			for (const cb of progressListeners) cb(pct);
		});
		ff.on("log", ({ message }) => {
			for (const cb of logListeners) cb(message);
		});
		await ff.load({
			coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm")
		});
		instance = ff;
		return ff;
	})();
	return loadPromise;
}

export function onFFmpegProgress(cb: FFmpegProgress): () => void {
	progressListeners.add(cb);
	return () => progressListeners.delete(cb);
}

export function onFFmpegLog(cb: FFmpegLog): () => void {
	logListeners.add(cb);
	return () => logListeners.delete(cb);
}

export { fetchFile, toBlobURL };

export function inferExt(name: string, fallback = "bin"): string {
	const m = /\.([a-zA-Z0-9]+)$/.exec(name);
	return m ? m[1].toLowerCase() : fallback;
}

export function basename(name: string): string {
	const dot = name.lastIndexOf(".");
	return dot > 0 ? name.slice(0, dot) : name;
}

export function readOutput(data: Uint8Array | string, mime: string): Blob {
	if (typeof data === "string") {
		return new Blob([data], { type: mime });
	}
	const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
	return new Blob([buf], { type: mime });
}
