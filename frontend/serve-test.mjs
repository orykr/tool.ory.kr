import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = "build";
const PORT = 4173;
const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".ico": "image/x-icon",
	".woff2": "font/woff2"
};

const server = createServer(async (req, res) => {
	let p = decodeURIComponent(req.url.split("?")[0]);
	if (p.endsWith("/")) p += "index.html";
	let path = join(ROOT, p);
	try {
		if (!existsSync(path)) {
			if (existsSync(path + ".html")) path = path + ".html";
			else if (existsSync(join(path, "index.html"))) path = join(path, "index.html");
			else { res.statusCode = 404; res.end("Not found"); return; }
		}
		const data = await readFile(path);
		res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
		res.setHeader("Content-Type", MIME[extname(path)] || "application/octet-stream");
		res.end(data);
	} catch (e) {
		res.statusCode = 500;
		res.end(String(e));
	}
});

server.listen(PORT, "127.0.0.1", () => console.log(`http://127.0.0.1:${PORT}/`));
