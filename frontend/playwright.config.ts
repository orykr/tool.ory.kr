import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT) || 4173;

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 120_000,
	expect: { timeout: 60_000 },
	fullyParallel: false,
	workers: 1,
	reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: "retain-on-failure",
		video: "retain-on-failure"
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } }
	],
	webServer: {
		command: `node serve-test.mjs`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	}
});
