export type Tool = {
	href: string;
	title: string;
	description: string;
};

export type ToolCategory = {
	id: string;
	label: string;
	tools: Tool[];
};

export const categories: ToolCategory[] = [
	{
		id: "crypto",
		label: "Crypto & Auth",
		tools: [
			{ href: "/hash", title: "Hash Generator", description: "Compute SHA-1/256/384/512 of text or files using the Web Crypto API." },
			{ href: "/hmac", title: "HMAC Generator", description: "Compute HMAC-SHA-1/256/384/512 with hex or base64 output." },
			{ href: "/md5", title: "MD5 Hash", description: "Compute MD5 digest of text or files (non-cryptographic)." },
			{ href: "/hash-compare", title: "Hash Verifier", description: "Hash a file locally and compare to an expected checksum." },
			{ href: "/crc", title: "Checksum Tools", description: "CRC-32, Adler-32, FNV-1a, and DJB2 (non-cryptographic)." },
			{ href: "/jwt", title: "JWT Decoder", description: "Inspect JWT header, payload, and claims locally without verification." },
			{ href: "/jwt-sign", title: "JWT Signer", description: "Build and sign HS256 / 384 / 512 JWTs locally." },
			{ href: "/jwt-verify", title: "JWT Verifier", description: "Verify HMAC-signed JWTs (HS256/384/512) against a secret." },
			{ href: "/aes-gcm", title: "AES-GCM Encrypt / Decrypt", description: "AES-GCM with PBKDF2 key derivation, all in-browser." },
			{ href: "/password", title: "Password Generator", description: "Generate strong random passwords with configurable character sets." },
			{ href: "/diceware", title: "Diceware Passphrase", description: "Generate memorable passphrases with crypto-grade entropy." },
			{ href: "/totp", title: "TOTP Generator", description: "RFC 6238 time-based one-time passwords (Google Authenticator-compatible)." },
			{ href: "/pkce", title: "OAuth PKCE Generator", description: "Generate code_verifier/code_challenge, state, and nonce for OAuth/OIDC." },
			{ href: "/cipher", title: "Classical Ciphers", description: "Caesar, ROT13, Atbash, and Vigenère for puzzles and CTFs." },
			{ href: "/basic-auth", title: "HTTP Basic Auth", description: "Build and decode HTTP Basic Authorization headers." },
			{ href: "/random-hex", title: "Random Bytes Generator", description: "Generate crypto-grade random bytes in hex, base64, integer." }
		]
	},
	{
		id: "network",
		label: "Network / IP / URL",
		tools: [
			{ href: "/cidr", title: "CIDR Calculator", description: "Calculate IP ranges, subnet masks, and more from CIDR notation." },
			{ href: "/cidr-agg", title: "CIDR Aggregator", description: "Merge IPv4 CIDRs/ranges/IPs into the minimal set of CIDRs." },
			{ href: "/cidr-contains", title: "CIDR Contains", description: "Check whether IPv4 / IPv6 addresses fall inside CIDR blocks." },
			{ href: "/cidr-table", title: "CIDR Subnet Cheatsheet", description: "IPv4 prefixes with subnet masks, wildcards, and host counts." },
			{ href: "/ip", title: "IP Address Inspector", description: "Validate and decode IPv4/IPv6 with classification." },
			{ href: "/mac", title: "MAC Address Tools", description: "Validate, format, and inspect Ethernet MAC addresses." },
			{ href: "/ports", title: "TCP/UDP Port Reference", description: "Searchable list of common TCP/UDP port numbers and services." },
			{ href: "/punycode", title: "Punycode / IDN", description: "Convert internationalized domain names to and from xn-- form." },
			{ href: "/url-codec", title: "URL Encoder / Decoder", description: "Encode, decode, and parse URLs with query parameter inspection." },
			{ href: "/url-builder", title: "URL Builder", description: "Compose URLs from parts with auto-encoded query parameters." },
			{ href: "/url-params", title: "URL Params ↔ Object", description: "Convert query strings to JSON objects and back." },
			{ href: "/curl", title: "cURL Command Builder", description: "Build a portable cURL command from form inputs (no request is sent)." },
			{ href: "/geohash", title: "Geohash", description: "Encode lat/lon to geohash and decode it back to a centroid." },
			{ href: "/latlon", title: "Lat/Lon Converter", description: "Convert between decimal degrees and DMS notation." },
			{ href: "/haversine", title: "Haversine Distance", description: "Great-circle distance and bearing between two coordinates." }
		]
	},
	{
		id: "json",
		label: "JSON & Data Formats",
		tools: [
			{ href: "/json", title: "JSON Formatter", description: "Pretty-print, minify, validate, and sort keys in JSON documents." },
			{ href: "/json5", title: "JSON5 ↔ JSON", description: "Convert between JSON5 (comments, trailing commas) and strict JSON." },
			{ href: "/json-sort", title: "JSON Sorter", description: "Sort JSON arrays by property or alphabetize all object keys." },
			{ href: "/json-types", title: "JSON → TypeScript Types", description: "Infer TypeScript interfaces, types, or Zod schemas from JSON." },
			{ href: "/json-ts", title: "JSON → TypeScript", description: "Infer TypeScript interfaces from a JSON sample." },
			{ href: "/json-go", title: "JSON → Go struct", description: "Generate Go structs with JSON tags from a sample." },
			{ href: "/json-graphql", title: "JSON → GraphQL Types", description: "Infer GraphQL type definitions from a sample JSON document." },
			{ href: "/json-schema", title: "JSON Schema Generator", description: "Infer a JSON Schema (Draft 2020-12) from a sample document." },
			{ href: "/json-diff", title: "JSON Diff", description: "Structurally compare two JSON documents (added/removed/changed)." },
			{ href: "/json-xml", title: "JSON ↔ XML Converter", description: "Convert between JSON and XML with attribute support." },
			{ href: "/json-ld", title: "JSON-LD Generator", description: "Schema.org structured data (Person/Org/Product/Article/FAQ)." },
			{ href: "/json-ptr", title: "JSON Pointer (RFC 6901)", description: "Resolve and enumerate JSON Pointers with proper escapes." },
			{ href: "/jsonpath", title: "JSON Path Query", description: "Query JSON with JSONPath (keys, indexes, wildcards, slices)." },
			{ href: "/js-to-json", title: "JS Object → JSON", description: "Convert relaxed JS / JSON5 objects to strict JSON." },
			{ href: "/yaml", title: "YAML ↔ JSON Converter", description: "Convert between YAML 1.2 and JSON in your browser." },
			{ href: "/toml", title: "TOML ↔ JSON Converter", description: "Convert between TOML 1.0 and JSON." },
			{ href: "/ini", title: "INI ↔ JSON Converter", description: "Convert between INI config and JSON." },
			{ href: "/dotenv", title: "Dotenv Parser", description: "Parse .env files into JSON or shell export with quote/escape handling." },
			{ href: "/frontmatter", title: "Markdown Frontmatter", description: "Extract YAML, TOML, or JSON frontmatter from Markdown documents." },
			{ href: "/mock-data", title: "Mock Data Generator", description: "Generate fake JSON or CSV records with a custom schema." }
		]
	},
	{
		id: "csv",
		label: "CSV",
		tools: [
			{ href: "/csv", title: "CSV ↔ JSON Converter", description: "Convert between CSV and JSON with quote-aware parsing." },
			{ href: "/csv-cols", title: "CSV Column Extractor", description: "Pick columns and filter rows from CSV; output is also CSV." },
			{ href: "/csv-stats", title: "CSV Column Statistics", description: "Per-column counts, unique values, and numeric statistics." },
			{ href: "/csv-schema", title: "CSV → SQL Schema", description: "Infer CREATE TABLE from CSV across PostgreSQL/MySQL/SQLite/MSSQL." },
			{ href: "/csv-sql", title: "CSV → SQL INSERT", description: "Convert CSV rows into SQL INSERT statements with type inference." },
			{ href: "/csv-md", title: "CSV → Markdown Table", description: "Convert CSV into a Markdown table with alignment and padding." },
			{ href: "/csv-table", title: "CSV → ASCII Table", description: "Render CSV as aligned text tables (box, double, ASCII, RST)." },
			{ href: "/md-to-csv", title: "Markdown Table → CSV", description: "Convert Markdown pipe tables into properly quoted CSV." }
		]
	},
	{
		id: "text",
		label: "Text & Encoding",
		tools: [
			{ href: "/base64", title: "Base64 Encoder / Decoder", description: "Encode and decode Base64 text or files entirely in your browser." },
			{ href: "/base32-58", title: "Base32 / Base58", description: "Encode and decode text via RFC 4648 Base32 or Bitcoin Base58." },
			{ href: "/ascii85", title: "Ascii85 (Base85)", description: "Adobe Ascii85 encode/decode with wrappers and z shorthand." },
			{ href: "/html-entities", title: "HTML Entities", description: "Encode and decode named or numeric HTML entities." },
			{ href: "/unicode", title: "Unicode Inspector", description: "Inspect code points, UTF-8/16 encoding, HTML/JS escapes per character." },
			{ href: "/backslash-escape", title: "Backslash Escape / Unescape", description: "Escape or unescape \\n, \\t, \\xNN, \\uNNNN, \\u{...}." },
			{ href: "/slugify", title: "Slugify", description: "Turn any text into a URL-friendly slug with Unicode normalization." },
			{ href: "/text-case", title: "Text Case Converter", description: "camelCase / snake_case / kebab-case / Title Case with stats." },
			{ href: "/word-counter", title: "Word Counter", description: "Live text statistics, reading time, and top word frequency." },
			{ href: "/word-diff", title: "Word-level Diff", description: "Compare two text snippets word by word for prose changes." },
			{ href: "/diff", title: "Text Diff", description: "Compare two text snippets line-by-line with LCS diff." },
			{ href: "/string-sim", title: "String Similarity", description: "Levenshtein, Jaro-Winkler, Dice, and Hamming distance." },
			{ href: "/anagram", title: "Anagram Finder", description: "Find anagrams against a dictionary and enumerate letter permutations." },
			{ href: "/pluralize", title: "English Pluralizer", description: "Convert English nouns between singular and plural with irregulars." },
			{ href: "/lorem", title: "Lorem Ipsum Generator", description: "Generate placeholder paragraphs, sentences, or words." },
			{ href: "/nato", title: "NATO Phonetic Alphabet", description: "Spell text aloud using NATO/ICAO phonetic alphabet." },
			{ href: "/morse", title: "Morse Code", description: "Translate between text and international Morse code." },
			{ href: "/hangul", title: "Hangul Tools", description: "Korean Hangul ↔ Romaja, Jamo split, and Sino-Korean numerals." },
			{ href: "/whitespace", title: "Whitespace Visualizer", description: "Reveal hidden whitespace, line endings, and zero-width characters." },
			{ href: "/latex", title: "LaTeX Symbol Search", description: "Search math symbols and copy LaTeX commands." },
			{ href: "/emoji", title: "Emoji Picker", description: "Search and copy emojis by name or keyword." },
			{ href: "/identifier", title: "Identifier Validator", description: "Check identifier validity and reserved-word status (JS/Py/Java/SQL)." },
			{ href: "/box-draw", title: "Box Drawing Characters", description: "Click to copy Unicode box-drawing, block, and shape characters." },
			{ href: "/ansi-decode", title: "ANSI Escape Decoder", description: "Render terminal output with SGR colors or strip ANSI codes." },
			{ href: "/list-sort", title: "List Sort & Shuffle", description: "Sort, shuffle, dedupe, or trim a line-based list." },
			{ href: "/sample-pick", title: "Weighted Random Picker", description: "Pick random items with optional weights and replacement." },
			{ href: "/regex", title: "Regex Tester", description: "Test JavaScript regex with live match highlighting and replace." },
			{ href: "/ascii-table", title: "ASCII Table", description: "All 128 ASCII codes in dec/hex/oct/binary with control names." }
		]
	},
	{
		id: "markdown",
		label: "Markdown & HTML",
		tools: [
			{ href: "/markdown", title: "Markdown Preview", description: "Live GitHub-flavored Markdown preview with DOMPurify sanitization." },
			{ href: "/md-strip", title: "Markdown Stripper", description: "Strip Markdown formatting to get plain text." },
			{ href: "/md-escape", title: "Markdown Escape", description: "Escape Markdown special characters to display them literally." },
			{ href: "/md-toc", title: "Markdown TOC Generator", description: "Generate a table of contents from Markdown headings." },
			{ href: "/md-images", title: "Markdown Image Extractor", description: "Extract inline, reference, and HTML images from Markdown." },
			{ href: "/md-links", title: "Markdown Link Extractor", description: "Pull inline, reference, autolink, and bare URLs from Markdown." },
			{ href: "/md-table", title: "Markdown Table Generator", description: "Build Markdown tables interactively with alignment options." },
			{ href: "/html-preview", title: "HTML Preview", description: "Render HTML live with DOMPurify sanitization." },
			{ href: "/html-format", title: "HTML Formatter", description: "Pretty-print or minify HTML; preserves pre/script/style." },
			{ href: "/html-strip", title: "HTML Stripper", description: "Extract plain text from HTML; strips script/style." },
			{ href: "/html-md", title: "HTML → Markdown", description: "Convert HTML to Markdown via Turndown." },
			{ href: "/html-table-json", title: "HTML Table → JSON", description: "Extract <table> rows as JSON objects." },
			{ href: "/meta-tags", title: "Meta Tags Generator", description: "Build SEO, Open Graph, and Twitter Card meta tags." },
			{ href: "/xml", title: "XML Formatter", description: "Pretty-print or minify XML using the browser's DOMParser." },
			{ href: "/sql", title: "SQL Formatter", description: "Pretty-print SQL for many dialects (PostgreSQL, MySQL, BigQuery, ...)." }
		]
	},
	{
		id: "color",
		label: "Color & CSS",
		tools: [
			{ href: "/color", title: "Color Converter", description: "Convert HEX/RGB/HSL and check WCAG contrast ratios." },
			{ href: "/color-mix", title: "Color Mixer", description: "Blend colors with custom weights (sRGB / linear / HSL)." },
			{ href: "/hsv-conv", title: "HSV / HSL / RGB / HEX", description: "Bidirectional color converter with sliders." },
			{ href: "/palette", title: "Color Palette Generator", description: "Generate harmonic palettes (analogous, triadic, tetradic, …)." },
			{ href: "/tw-colors", title: "Tailwind Color Reference", description: "Tailwind 3.x default palette swatches with click-to-copy class names." },
			{ href: "/gradient", title: "CSS Gradient Generator", description: "Build linear, radial, or conic CSS gradients with color stops." },
			{ href: "/box-shadow", title: "CSS Box Shadow", description: "Build layered CSS box-shadow visually with live preview." },
			{ href: "/css-triangle", title: "CSS Triangle", description: "Generate CSS arrows with the transparent-border technique." },
			{ href: "/spinner", title: "CSS Spinner Generator", description: "Build pure-CSS loading spinners (circle/ring/dots/bars/pulse)." },
			{ href: "/clamp", title: "CSS clamp() Generator", description: "Build fluid CSS clamp() values that scale between viewports." },
			{ href: "/css-spec", title: "CSS Specificity", description: "Compute CSS selector specificity (a, b, c) for any selector." },
			{ href: "/css-unit", title: "CSS Unit Converter", description: "Convert px to rem/em/pt/vw/vh and physical units." },
			{ href: "/bezier", title: "Cubic-Bezier Visualizer", description: "Build CSS cubic-bezier easing curves with live animation preview." },
			{ href: "/aspect-ratio", title: "Aspect Ratio Calculator", description: "Compute aspect ratios and resize dimensions while preserving them." }
		]
	},
	{
		id: "image",
		label: "Image & Files",
		tools: [
			{ href: "/image-editor", title: "Image Editor", description: "Crop, rotate, resize, and optimize images directly in your browser." },
			{ href: "/image-format", title: "Image Format Converter", description: "Convert PNG ↔ JPEG ↔ WebP via canvas, with quality and resize." },
			{ href: "/img-colors", title: "Image Color Palette", description: "Extract dominant colors from a local image." },
			{ href: "/gif-maker", title: "GIF Maker", description: "Create animated GIFs from multiple images with custom speed and size." },
			{ href: "/video-to-gif", title: "Video to GIF", description: "Convert video files to optimized animated GIFs directly in your browser." },
			{ href: "/qr", title: "QR Code Generator", description: "Generate QR codes from text or URLs and download as PNG or SVG." },
			{ href: "/hex-dump", title: "Hex Dump", description: "View text or files as a side-by-side hex / ASCII dump." },
			{ href: "/data-url", title: "Data URL", description: "Encode files to data: URLs and decode them back to bytes." },
			{ href: "/file-magic", title: "File Type Detector", description: "Identify file format from magic bytes (no extension dependency)." },
			{ href: "/filesize", title: "File Size Converter", description: "Parse human file sizes and break bytes into KiB/KB units." },
			{ href: "/compress", title: "String Compression", description: "Compress / decompress text with gzip, deflate, or deflate-raw." }
		]
	},
	{
		id: "datetime",
		label: "Date & Time",
		tools: [
			{ href: "/timestamp", title: "Unix Timestamp Converter", description: "Convert between Unix epoch (s/ms) and human-readable dates." },
			{ href: "/date-diff", title: "Date Difference", description: "Calculate duration between two timestamps in many units." },
			{ href: "/date-math", title: "Date Math", description: "Add or subtract years, months, days, and time from a base date." },
			{ href: "/timezone", title: "Time Zone Converter", description: "Compare a moment in time across multiple IANA time zones." },
			{ href: "/iso-duration", title: "ISO 8601 Duration", description: "Parse and build ISO 8601 duration strings (P1Y2DT3H)." },
			{ href: "/strftime", title: "strftime Cheatsheet", description: "Format codes for POSIX strftime with a live preview." },
			{ href: "/ics", title: "iCalendar (.ics) Event", description: "Build VEVENT files for Google/Apple/Outlook calendars." },
			{ href: "/cron", title: "Cron Parser", description: "Translate cron expressions to English and preview upcoming runs." },
			{ href: "/bpm", title: "BPM / Tempo Tools", description: "Tap to find BPM, compute note delays, and play a metronome." },
			{ href: "/pomodoro", title: "Pomodoro Timer", description: "Focus and break intervals with audible chime." },
			{ href: "/stopwatch", title: "Stopwatch", description: "Sub-second precision stopwatch with lap tracking." },
			{ href: "/counter", title: "Tally Counter", description: "Track multiple counts with adjustable step size." }
		]
	},
	{
		id: "math",
		label: "Math & Numbers",
		tools: [
			{ href: "/number-base", title: "Number Base Converter", description: "Convert between binary, octal, decimal, and hexadecimal." },
			{ href: "/roman", title: "Roman Numerals", description: "Convert between integers and Roman numerals (1–3999)." },
			{ href: "/num-words", title: "Number → Words", description: "Convert numbers to English cardinal and ordinal words." },
			{ href: "/num-format", title: "Number Formatter", description: "Format numbers with locale, currency, percent, or unit (Intl)." },
			{ href: "/fraction", title: "Decimal → Fraction", description: "Convert decimals to exact fractions or best rational approximation." },
			{ href: "/factor", title: "Number Factorizer", description: "Prime check, factorization, divisors, and GCD/LCM with BigInt." },
			{ href: "/sequences", title: "Number Sequences", description: "Fibonacci, primes, squares, factorials, AP/GP, and more (BigInt)." },
			{ href: "/stats", title: "Statistics Calculator", description: "Mean, median, stdev, quartiles, and more for a list of numbers." },
			{ href: "/perm-comb", title: "Permutations & Combinations", description: "Factorials, P(n,r), C(n,r) with and without repetition (BigInt)." },
			{ href: "/math-eval", title: "Math Expression Evaluator", description: "Evaluate math expressions safely with built-in functions and constants." },
			{ href: "/quadratic", title: "Quadratic Solver", description: "Solve ax² + bx + c = 0 (real or complex roots, vertex)." },
			{ href: "/trig", title: "Trigonometry Calculator", description: "sin/cos/tan/inverse with degrees or radians." },
			{ href: "/right-tri", title: "Right Triangle Solver", description: "Solve a right triangle from any two known values." },
			{ href: "/geometry", title: "Geometry Calculator", description: "Areas, perimeters, and volumes for circles, triangles, spheres, ..." },
			{ href: "/vector", title: "Vector Calculator", description: "Add, subtract, dot, cross, normalize, and project 2D/3D vectors." },
			{ href: "/matrix", title: "Matrix Calculator", description: "2×2 and 3×3 matrix det, transpose, inverse, multiply." },
			{ href: "/note-freq", title: "Musical Note ↔ Frequency", description: "Convert between note names, MIDI numbers, and Hz." },
			{ href: "/resistor", title: "Resistor Color Decoder", description: "Decode 3-, 4-, 5-, and 6-band axial resistor color codes." },
			{ href: "/random", title: "Random Generator", description: "Numbers, dice, coin flips, and random picks via crypto-grade entropy." },
			{ href: "/unit", title: "Unit Converter", description: "Convert length, weight, temperature, data size, and time units." }
		]
	},
	{
		id: "dev",
		label: "Dev Utilities",
		tools: [
			{ href: "/uuid", title: "UUID Generator", description: "Generate UUID v4, time-ordered v7, or NanoID via your browser's CSPRNG." },
			{ href: "/chmod", title: "chmod Calculator", description: "Convert between octal and symbolic Unix file permissions." },
			{ href: "/semver", title: "Semver Tools", description: "Compare, bump, sort, and check Semantic Versioning ranges." },
			{ href: "/cookie", title: "Cookie Parser & Builder", description: "Parse Cookie headers or build a Set-Cookie value with attributes." },
			{ href: "/cache-header", title: "HTTP Cache Header Analyzer", description: "Parse Cache-Control / Expires / ETag and explain caching behavior." },
			{ href: "/http-status", title: "HTTP Status Codes", description: "Searchable reference for common HTTP status codes." },
			{ href: "/headers", title: "HTTP Headers Reference", description: "Searchable reference for request, response, and security headers." },
			{ href: "/mime", title: "MIME Type Lookup", description: "Searchable reference for file extensions and MIME types." },
			{ href: "/iso-codes", title: "ISO Code Lookup", description: "ISO 3166 countries, 4217 currencies, and 639 language codes." },
			{ href: "/user-agent", title: "User Agent Strings", description: "Reference of common browser, mobile, bot, and CLI UAs." },
			{ href: "/email-valid", title: "Email Validator", description: "Strict syntactic email validation per RFC 5321/5322." },
			{ href: "/email-obfuscate", title: "Email Obfuscator", description: "Hide an email from scrapers via HTML entities and ROT13." },
			{ href: "/iban", title: "IBAN Validator", description: "Validate International Bank Account Numbers via mod-97 checksum." },
			{ href: "/luhn", title: "Luhn Validator", description: "Validate or compute Luhn checksums for credit cards, IMEI, etc." },
			{ href: "/social-count", title: "Social Character Counter", description: "Count characters and check limits across social platforms." },
			{ href: "/robots", title: "robots.txt Builder", description: "Build robots.txt with User-agent groups and Sitemap." },
			{ href: "/sitemap", title: "Sitemap.xml Builder", description: "Build Sitemap 0.9 XML from a URL list." },
			{ href: "/vcard", title: "vCard Generator", description: "Build a vCard 4.0 contact file from form fields." },
			{ href: "/set-ops", title: "Set Operations", description: "Union, intersection, and difference of two line-based lists." }
		]
	}
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export function findCategoryForHref(href: string): ToolCategory | undefined {
	return categories.find((c) => c.tools.some((t) => t.href === href));
}

export function findTool(href: string): Tool | undefined {
	return allTools.find((t) => t.href === href);
}
