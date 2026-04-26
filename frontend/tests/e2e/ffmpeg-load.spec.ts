import { test, expect } from "@playwright/test";
import { waitForFFmpegReady } from "./helpers";

const FFMPEG_ROUTES = [
	"/video-to-gif/",
	"/gif-resize/",
	"/gif-crop/",
	"/gif-optimize/",
	"/video-cut/",
	"/audio-cut/"
];

test.describe("FFmpeg loader", () => {
	for (const route of FFMPEG_ROUTES) {
		test(`loads on ${route}`, async ({ page }) => {
			const errors: string[] = [];
			page.on("pageerror", (e) => errors.push(e.message));
			page.on("console", (m) => {
				if (m.type() === "error") errors.push(m.text());
			});

			await page.goto(route);
			await waitForFFmpegReady(page);

			const fail = errors.find((e) => /failed to (load|import) ffmpeg/i.test(e));
			expect(fail, `unexpected error: ${fail}`).toBeUndefined();
		});
	}

	test("status text on /video-to-gif is exactly 'Ready'", async ({ page }) => {
		await page.goto("/video-to-gif/");
		await expect(page.getByText("FFmpeg loaded. Ready to convert.")).toBeVisible({ timeout: 90_000 });
	});
});
