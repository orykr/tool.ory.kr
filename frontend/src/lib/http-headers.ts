export interface HeaderEntry {
	name: string;
	category: "Request" | "Response" | "Both" | "Security";
	description: string;
	example?: string;
}

export const HTTP_HEADERS: HeaderEntry[] = [
	{ name: "Accept", category: "Request", description: "Media types the client accepts.", example: "application/json" },
	{ name: "Accept-Encoding", category: "Request", description: "Acceptable content encodings.", example: "gzip, br" },
	{ name: "Accept-Language", category: "Request", description: "Preferred response languages.", example: "en-US,en;q=0.9" },
	{ name: "Authorization", category: "Request", description: "Credentials for authentication.", example: "Bearer eyJhbGciOiJIUzI1NiIsInR..." },
	{ name: "Cookie", category: "Request", description: "Cookies stored for the host.", example: "session=abc; theme=dark" },
	{ name: "Host", category: "Request", description: "Target host (HTTP/1.1 required).", example: "api.example.com" },
	{ name: "If-Modified-Since", category: "Request", description: "Conditional GET — only return if modified after.", example: "Tue, 01 Jan 2024 00:00:00 GMT" },
	{ name: "If-None-Match", category: "Request", description: "Conditional GET on ETag.", example: '"33a64df5"' },
	{ name: "Origin", category: "Request", description: "Origin of the request (CORS).", example: "https://example.com" },
	{ name: "Range", category: "Request", description: "Request a byte range.", example: "bytes=0-1023" },
	{ name: "Referer", category: "Request", description: "URL the request was made from.", example: "https://example.com/page" },
	{ name: "User-Agent", category: "Request", description: "Identifies the client software.", example: "Mozilla/5.0 ..." },
	{ name: "X-Forwarded-For", category: "Request", description: "Client IP through a proxy chain.", example: "203.0.113.1, 198.51.100.2" },
	{ name: "X-Requested-With", category: "Request", description: "Distinguishes XHR / fetch.", example: "XMLHttpRequest" },

	{ name: "Cache-Control", category: "Both", description: "Caching directives.", example: "public, max-age=3600, immutable" },
	{ name: "Content-Encoding", category: "Both", description: "Compression applied to body.", example: "gzip" },
	{ name: "Content-Length", category: "Both", description: "Body size in bytes.", example: "256" },
	{ name: "Content-Type", category: "Both", description: "Media type of the body.", example: "application/json; charset=utf-8" },

	{ name: "Access-Control-Allow-Origin", category: "Response", description: "Allowed origin for CORS.", example: "*" },
	{ name: "Access-Control-Allow-Methods", category: "Response", description: "Allowed HTTP methods.", example: "GET, POST, PUT" },
	{ name: "Access-Control-Allow-Headers", category: "Response", description: "Allowed request headers.", example: "Content-Type, Authorization" },
	{ name: "Access-Control-Allow-Credentials", category: "Response", description: "Allow credentials over CORS.", example: "true" },
	{ name: "Access-Control-Max-Age", category: "Response", description: "Preflight cache duration in seconds.", example: "86400" },
	{ name: "ETag", category: "Response", description: "Identifier for a specific resource version.", example: '"686897696a7c876b7e"' },
	{ name: "Expires", category: "Response", description: "Date/time after which response is stale.", example: "Wed, 01 Jan 2025 00:00:00 GMT" },
	{ name: "Last-Modified", category: "Response", description: "Last modification date of the resource.", example: "Tue, 15 Nov 2024 12:45:26 GMT" },
	{ name: "Location", category: "Response", description: "Redirect target or new resource URL.", example: "/login" },
	{ name: "Retry-After", category: "Response", description: "Seconds (or date) to wait before retrying.", example: "120" },
	{ name: "Server", category: "Response", description: "Origin server software.", example: "nginx/1.25.1" },
	{ name: "Set-Cookie", category: "Response", description: "Sets cookies on the client.", example: "session=abc; HttpOnly; Secure; SameSite=Strict" },
	{ name: "Vary", category: "Response", description: "Headers that affect cache key.", example: "Accept-Encoding, User-Agent" },
	{ name: "WWW-Authenticate", category: "Response", description: "Required auth scheme.", example: 'Basic realm="example"' },

	{ name: "Content-Security-Policy", category: "Security", description: "CSP directives.", example: "default-src 'self'" },
	{ name: "Strict-Transport-Security", category: "Security", description: "Enforce HTTPS (HSTS).", example: "max-age=63072000; includeSubDomains; preload" },
	{ name: "X-Content-Type-Options", category: "Security", description: "Disable MIME sniffing.", example: "nosniff" },
	{ name: "X-Frame-Options", category: "Security", description: "Iframe embedding policy.", example: "DENY" },
	{ name: "Referrer-Policy", category: "Security", description: "Referer header policy.", example: "strict-origin-when-cross-origin" },
	{ name: "Permissions-Policy", category: "Security", description: "Browser feature permissions.", example: "geolocation=(), camera=()" },
	{ name: "Cross-Origin-Opener-Policy", category: "Security", description: "Cross-origin opener policy.", example: "same-origin" },
	{ name: "Cross-Origin-Embedder-Policy", category: "Security", description: "Cross-origin embedder policy.", example: "require-corp" },
	{ name: "Cross-Origin-Resource-Policy", category: "Security", description: "Cross-origin resource policy.", example: "same-origin" }
];
