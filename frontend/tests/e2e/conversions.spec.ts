import { test, expect } from "@playwright/test";
import { waitForFFmpegReady, uploadFixture, clickAction, expectSuccess, type RouteCase } from "./helpers";

const GIF_CASES: RouteCase[] = [
	{ route: "/video-to-gif/", fixture: "sample.mp4" },
	{ route: "/mp4-to-gif/", fixture: "sample.mp4" },
	{ route: "/gif-resize/", fixture: "sample.gif" },
	{ route: "/gif-crop/", fixture: "sample.gif" },
	{ route: "/gif-rotate/", fixture: "sample.gif" },
	{ route: "/gif-reverse/", fixture: "sample.gif" },
	{ route: "/gif-speed/", fixture: "sample.gif" },
	{ route: "/gif-cut/", fixture: "sample.gif" },
	{ route: "/gif-optimize/", fixture: "sample.gif" },
	{ route: "/gif-effects/", fixture: "sample.gif" },
	{ route: "/gif-censor/", fixture: "sample.gif" },
	{ route: "/gif-border/", fixture: "sample.gif" },
	{ route: "/gif-to-mp4/", fixture: "sample.gif" },
	{ route: "/gif-to-webp/", fixture: "sample.gif" },
	{ route: "/gif-to-apng/", fixture: "sample.gif" }
];

const VIDEO_CASES: RouteCase[] = [
	{ route: "/video-cut/", fixture: "sample.mp4" },
	{ route: "/video-resize/", fixture: "sample.mp4" },
	{ route: "/video-rotate/", fixture: "sample.mp4" },
	{ route: "/video-reverse/", fixture: "sample.mp4" },
	{ route: "/video-speed/", fixture: "sample.mp4" },
	{ route: "/video-mute/", fixture: "sample.mp4" },
	{ route: "/video-crop/", fixture: "sample.mp4" },
	{ route: "/video-converter/", fixture: "sample.mp4" },
	{ route: "/video-compress/", fixture: "sample.mp4" },
	{ route: "/video-stabilize/", fixture: "sample.mp4" }
];

test.describe.configure({ mode: "serial" });

test.describe("GIF conversions", () => {
	for (const c of GIF_CASES) {
		test(c.route, async ({ page }) => {
			await page.goto(c.route, { waitUntil: "networkidle" });
			// MP4-to-GIF redirects to /video-to-gif; treat as redirect target
			if (page.url().includes("/video-to-gif/")) {
				/* fall through */
			}
			await waitForFFmpegReady(page);
			await uploadFixture(page, c.fixture);
			await clickAction(page, c.action);
			await expectSuccess(page);
		});
	}
});

test.describe("Video conversions", () => {
	for (const c of VIDEO_CASES) {
		test(c.route, async ({ page }) => {
			await page.goto(c.route);
			await waitForFFmpegReady(page);
			await uploadFixture(page, c.fixture);
			await clickAction(page, c.action);
			await expectSuccess(page);
		});
	}
});
