import { expect, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURES = path.resolve(__dirname, "..", "fixtures");

export const fixture = (name: string) => path.join(FIXTURES, name);

const ACTION_RE =
	/(convert|apply|run|optimize|encode|trim|crop|rotate|reverse|compress|merge|stabilize|composite|build|mux|burn|extract|resize|render|generate|process|make|censor|mute|split|flip|cut)/i;

export async function waitForFFmpegReady(page: Page) {
	await expect(page.locator("body")).toContainText(/Ready|FFmpeg loaded/i, { timeout: 90_000 });
}

export async function uploadFixture(page: Page, name: string) {
	const input = page.locator('input[type="file"]').first();
	await input.setInputFiles(fixture(name));
}

export async function clickAction(page: Page, label?: RegExp) {
	const re = label || ACTION_RE;
	const button = page
		.locator("button")
		.filter({ hasText: re })
		.filter({ has: page.locator(":scope:not([disabled])") })
		.first();
	await button.scrollIntoViewIfNeeded();
	await button.click();
}

export async function expectSuccess(page: Page) {
	await expect(page.locator("body")).toContainText(/Done\.|complete!|Conversion complete/i, { timeout: 90_000 });
}

export type RouteCase = {
	route: string;
	fixture: string;
	action?: RegExp;
	skipUpload?: boolean;
};
