<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";

	const tools = [
		{
			href: "/cidr",
			title: "CIDR Calculator",
			description: "Calculate IP ranges, subnet masks, and more from CIDR notation."
		},
		{
			href: "/image-editor",
			title: "Image Editor",
			description: "Crop, rotate, resize, and optimize images directly in your browser."
		},
		{
			href: "/gif-maker",
			title: "GIF Maker",
			description: "Create animated GIFs from multiple images with custom speed and size."
		},
		{
			href: "/video-to-gif",
			title: "Video to GIF",
			description: "Convert video files to optimized animated GIFs directly in your browser."
		},
		{
			href: "/base64",
			title: "Base64 Encoder / Decoder",
			description: "Encode and decode Base64 text or files entirely in your browser."
		},
		{
			href: "/json",
			title: "JSON Formatter",
			description: "Pretty-print, minify, validate, and sort keys in JSON documents."
		},
		{
			href: "/jwt",
			title: "JWT Decoder",
			description: "Inspect JWT header, payload, and claims locally without verification."
		},
		{
			href: "/number-base",
			title: "Number Base Converter",
			description: "Convert between binary, octal, decimal, and hexadecimal."
		},
		{
			href: "/url-codec",
			title: "URL Encoder / Decoder",
			description: "Encode, decode, and parse URLs with query parameter inspection."
		},
		{
			href: "/uuid",
			title: "UUID Generator",
			description: "Generate UUID v4, time-ordered v7, or NanoID via your browser's CSPRNG."
		},
		{
			href: "/hash",
			title: "Hash Generator",
			description: "Compute SHA-1/256/384/512 of text or files using the Web Crypto API."
		},
		{
			href: "/timestamp",
			title: "Unix Timestamp Converter",
			description: "Convert between Unix epoch (s/ms) and human-readable dates."
		},
		{
			href: "/password",
			title: "Password Generator",
			description: "Generate strong random passwords with configurable character sets."
		},
		{
			href: "/color",
			title: "Color Converter",
			description: "Convert HEX/RGB/HSL and check WCAG contrast ratios."
		},
		{
			href: "/text-case",
			title: "Text Case Converter",
			description: "camelCase / snake_case / kebab-case / Title Case with stats."
		},
		{
			href: "/regex",
			title: "Regex Tester",
			description: "Test JavaScript regex with live match highlighting and replace."
		},
		{
			href: "/lorem",
			title: "Lorem Ipsum Generator",
			description: "Generate placeholder paragraphs, sentences, or words."
		},
		{
			href: "/diff",
			title: "Text Diff",
			description: "Compare two text snippets line-by-line with LCS diff."
		},
		{
			href: "/qr",
			title: "QR Code Generator",
			description: "Generate QR codes from text or URLs and download as PNG or SVG."
		},
		{
			href: "/csv",
			title: "CSV ↔ JSON Converter",
			description: "Convert between CSV and JSON with quote-aware parsing."
		},
		{
			href: "/html-entities",
			title: "HTML Entities",
			description: "Encode and decode named or numeric HTML entities."
		},
		{
			href: "/slugify",
			title: "Slugify",
			description: "Turn any text into a URL-friendly slug with Unicode normalization."
		},
		{
			href: "/yaml",
			title: "YAML ↔ JSON Converter",
			description: "Convert between YAML 1.2 and JSON in your browser."
		},
		{
			href: "/markdown",
			title: "Markdown Preview",
			description: "Live GitHub-flavored Markdown preview with DOMPurify sanitization."
		},
		{
			href: "/cron",
			title: "Cron Parser",
			description: "Translate cron expressions to English and preview upcoming runs."
		},
		{
			href: "/xml",
			title: "XML Formatter",
			description: "Pretty-print or minify XML using the browser's DOMParser."
		},
		{
			href: "/mock-data",
			title: "Mock Data Generator",
			description: "Generate fake JSON or CSV records with a custom schema."
		},
		{
			href: "/unit",
			title: "Unit Converter",
			description: "Convert length, weight, temperature, data size, and time units."
		},
		{
			href: "/http-status",
			title: "HTTP Status Codes",
			description: "Searchable reference for common HTTP status codes."
		},
		{
			href: "/md-table",
			title: "Markdown Table Generator",
			description: "Build Markdown tables interactively with alignment options."
		},
		{
			href: "/cipher",
			title: "Classical Ciphers",
			description: "Caesar, ROT13, Atbash, and Vigenère for puzzles and CTFs."
		},
		{
			href: "/morse",
			title: "Morse Code",
			description: "Translate between text and international Morse code."
		},
		{
			href: "/timezone",
			title: "Time Zone Converter",
			description: "Compare a moment in time across multiple IANA time zones."
		},
		{
			href: "/random",
			title: "Random Generator",
			description: "Numbers, dice, coin flips, and random picks via crypto-grade entropy."
		},
		{
			href: "/roman",
			title: "Roman Numerals",
			description: "Convert between integers and Roman numerals (1–3999)."
		},
		{
			href: "/hmac",
			title: "HMAC Generator",
			description: "Compute HMAC-SHA-1/256/384/512 with hex or base64 output."
		},
		{
			href: "/punycode",
			title: "Punycode / IDN",
			description: "Convert internationalized domain names to and from xn-- form."
		},
		{
			href: "/mime",
			title: "MIME Type Lookup",
			description: "Searchable reference for file extensions and MIME types."
		},
		{
			href: "/latlon",
			title: "Lat/Lon Converter",
			description: "Convert between decimal degrees and DMS notation."
		},
		{
			href: "/word-counter",
			title: "Word Counter",
			description: "Live text statistics, reading time, and top word frequency."
		},
		{
			href: "/json-xml",
			title: "JSON ↔ XML Converter",
			description: "Convert between JSON and XML with attribute support."
		},
		{
			href: "/ip",
			title: "IP Address Inspector",
			description: "Validate and decode IPv4/IPv6 with classification."
		},
		{
			href: "/curl",
			title: "cURL Command Builder",
			description: "Build a portable cURL command from form inputs (no request is sent)."
		},
		{
			href: "/sql",
			title: "SQL Formatter",
			description: "Pretty-print SQL for many dialects (PostgreSQL, MySQL, BigQuery, ...)."
		},
		{
			href: "/luhn",
			title: "Luhn Validator",
			description: "Validate or compute Luhn checksums for credit cards, IMEI, etc."
		},
		{
			href: "/nato",
			title: "NATO Phonetic Alphabet",
			description: "Spell text aloud using NATO/ICAO phonetic alphabet."
		},
		{
			href: "/ascii-table",
			title: "ASCII Table",
			description: "All 128 ASCII codes in dec/hex/oct/binary with control names."
		},
		{
			href: "/toml",
			title: "TOML ↔ JSON Converter",
			description: "Convert between TOML 1.0 and JSON."
		},
		{
			href: "/ini",
			title: "INI ↔ JSON Converter",
			description: "Convert between INI config and JSON."
		},
		{
			href: "/headers",
			title: "HTTP Headers Reference",
			description: "Searchable reference for request, response, and security headers."
		},
		{
			href: "/date-diff",
			title: "Date Difference",
			description: "Calculate duration between two timestamps in many units."
		},
		{
			href: "/file-magic",
			title: "File Type Detector",
			description: "Identify file format from magic bytes (no extension dependency)."
		},
		{
			href: "/json-types",
			title: "JSON → TypeScript Types",
			description: "Infer TypeScript interfaces, types, or Zod schemas from JSON."
		},
		{
			href: "/iban",
			title: "IBAN Validator",
			description: "Validate International Bank Account Numbers via mod-97 checksum."
		},
		{
			href: "/iso-codes",
			title: "ISO Code Lookup",
			description: "ISO 3166 countries, 4217 currencies, and 639 language codes."
		},
		{
			href: "/box-shadow",
			title: "CSS Box Shadow",
			description: "Build layered CSS box-shadow visually with live preview."
		},
		{
			href: "/jsonpath",
			title: "JSON Path Query",
			description: "Query JSON with JSONPath (keys, indexes, wildcards, slices)."
		},
		{
			href: "/emoji",
			title: "Emoji Picker",
			description: "Search and copy emojis by name or keyword."
		},
		{
			href: "/chmod",
			title: "chmod Calculator",
			description: "Convert between octal and symbolic Unix file permissions."
		},
		{
			href: "/gradient",
			title: "CSS Gradient Generator",
			description: "Build linear, radial, or conic CSS gradients with color stops."
		},
		{
			href: "/json-diff",
			title: "JSON Diff",
			description: "Structurally compare two JSON documents (added/removed/changed)."
		},
		{
			href: "/set-ops",
			title: "Set Operations",
			description: "Union, intersection, and difference of two line-based lists."
		},
		{
			href: "/cookie",
			title: "Cookie Parser & Builder",
			description: "Parse Cookie headers or build a Set-Cookie value with attributes."
		},
		{
			href: "/iso-duration",
			title: "ISO 8601 Duration",
			description: "Parse and build ISO 8601 duration strings (P1Y2DT3H)."
		},
		{
			href: "/semver",
			title: "Semver Tools",
			description: "Compare, bump, sort, and check Semantic Versioning ranges."
		},
		{
			href: "/stats",
			title: "Statistics Calculator",
			description: "Mean, median, stdev, quartiles, and more for a list of numbers."
		},
		{
			href: "/num-words",
			title: "Number → Words",
			description: "Convert numbers to English cardinal and ordinal words."
		},
		{
			href: "/pomodoro",
			title: "Pomodoro Timer",
			description: "Focus and break intervals with audible chime."
		},
		{
			href: "/counter",
			title: "Tally Counter",
			description: "Track multiple counts with adjustable step size."
		},
		{
			href: "/html-preview",
			title: "HTML Preview",
			description: "Render HTML live with DOMPurify sanitization."
		},
		{
			href: "/aspect-ratio",
			title: "Aspect Ratio Calculator",
			description: "Compute aspect ratios and resize dimensions while preserving them."
		},
		{
			href: "/bezier",
			title: "Cubic-Bezier Visualizer",
			description: "Build CSS cubic-bezier easing curves with live animation preview."
		},
		{
			href: "/factor",
			title: "Number Factorizer",
			description: "Prime check, factorization, divisors, and GCD/LCM with BigInt."
		},
		{
			href: "/haversine",
			title: "Haversine Distance",
			description: "Great-circle distance and bearing between two coordinates."
		},
		{
			href: "/ports",
			title: "TCP/UDP Port Reference",
			description: "Searchable list of common TCP/UDP port numbers and services."
		},
		{
			href: "/json-schema",
			title: "JSON Schema Generator",
			description: "Infer a JSON Schema (Draft 2020-12) from a sample document."
		},
		{
			href: "/css-unit",
			title: "CSS Unit Converter",
			description: "Convert px to rem/em/pt/vw/vh and physical units."
		},
		{
			href: "/string-sim",
			title: "String Similarity",
			description: "Levenshtein, Jaro-Winkler, Dice, and Hamming distance."
		},
		{
			href: "/base32-58",
			title: "Base32 / Base58",
			description: "Encode and decode text via RFC 4648 Base32 or Bitcoin Base58."
		},
		{
			href: "/math-eval",
			title: "Math Expression Evaluator",
			description: "Evaluate math expressions safely with built-in functions and constants."
		},
		{
			href: "/mac",
			title: "MAC Address Tools",
			description: "Validate, format, and inspect Ethernet MAC addresses."
		},
		{
			href: "/totp",
			title: "TOTP Generator",
			description: "RFC 6238 time-based one-time passwords (Google Authenticator-compatible)."
		},
		{
			href: "/pluralize",
			title: "English Pluralizer",
			description: "Convert English nouns between singular and plural with irregulars."
		},
		{
			href: "/clamp",
			title: "CSS clamp() Generator",
			description: "Build fluid CSS clamp() values that scale between viewports."
		},
		{
			href: "/unicode",
			title: "Unicode Inspector",
			description: "Inspect code points, UTF-8/16 encoding, HTML/JS escapes per character."
		},
		{
			href: "/date-math",
			title: "Date Math",
			description: "Add or subtract years, months, days, and time from a base date."
		},
		{
			href: "/pkce",
			title: "OAuth PKCE Generator",
			description: "Generate code_verifier/code_challenge, state, and nonce for OAuth/OIDC."
		},
		{
			href: "/resistor",
			title: "Resistor Color Decoder",
			description: "Decode 3-, 4-, 5-, and 6-band axial resistor color codes."
		},
		{
			href: "/dotenv",
			title: "Dotenv Parser",
			description: "Parse .env files into JSON or shell export with quote/escape handling."
		},
		{
			href: "/csv-sql",
			title: "CSV → SQL INSERT",
			description: "Convert CSV rows into SQL INSERT statements with type inference."
		},
		{
			href: "/vcard",
			title: "vCard Generator",
			description: "Build a vCard 4.0 contact file from form fields."
		},
		{
			href: "/ics",
			title: "iCalendar (.ics) Event",
			description: "Build VEVENT files for Google/Apple/Outlook calendars."
		},
		{
			href: "/css-spec",
			title: "CSS Specificity",
			description: "Compute CSS selector specificity (a, b, c) for any selector."
		},
		{
			href: "/md-toc",
			title: "Markdown TOC Generator",
			description: "Generate a table of contents from Markdown headings."
		},
		{
			href: "/fraction",
			title: "Decimal → Fraction",
			description: "Convert decimals to exact fractions or best rational approximation."
		},
		{
			href: "/url-params",
			title: "URL Params ↔ Object",
			description: "Convert query strings to JSON objects and back."
		},
		{
			href: "/quadratic",
			title: "Quadratic Solver",
			description: "Solve ax² + bx + c = 0 (real or complex roots, vertex)."
		},
		{
			href: "/tw-colors",
			title: "Tailwind Color Reference",
			description: "Tailwind 3.x default palette swatches with click-to-copy class names."
		},
		{
			href: "/palette",
			title: "Color Palette Generator",
			description: "Generate harmonic palettes (analogous, triadic, tetradic, …)."
		},
		{
			href: "/json-graphql",
			title: "JSON → GraphQL Types",
			description: "Infer GraphQL type definitions from a sample JSON document."
		},
		{
			href: "/diceware",
			title: "Diceware Passphrase",
			description: "Generate memorable passphrases with crypto-grade entropy."
		},
		{
			href: "/whitespace",
			title: "Whitespace Visualizer",
			description: "Reveal hidden whitespace, line endings, and zero-width characters."
		},
		{
			href: "/csv-cols",
			title: "CSV Column Extractor",
			description: "Pick columns and filter rows from CSV; output is also CSV."
		},
		{
			href: "/html-md",
			title: "HTML → Markdown",
			description: "Convert HTML to Markdown via Turndown."
		},
		{
			href: "/json5",
			title: "JSON5 ↔ JSON",
			description: "Convert between JSON5 (comments, trailing commas) and strict JSON."
		},
		{
			href: "/num-format",
			title: "Number Formatter",
			description: "Format numbers with locale, currency, percent, or unit (Intl)."
		},
		{
			href: "/note-freq",
			title: "Musical Note ↔ Frequency",
			description: "Convert between note names, MIDI numbers, and Hz."
		},
		{
			href: "/anagram",
			title: "Anagram Finder",
			description: "Find anagrams against a dictionary and enumerate letter permutations."
		},
		{
			href: "/hangul",
			title: "Hangul Tools",
			description: "Korean Hangul ↔ Romaja, Jamo split, and Sino-Korean numerals."
		},
		{
			href: "/geometry",
			title: "Geometry Calculator",
			description: "Areas, perimeters, and volumes for circles, triangles, spheres, ..."
		},
		{
			href: "/csv-md",
			title: "CSV → Markdown Table",
			description: "Convert CSV into a Markdown table with alignment and padding."
		},
		{
			href: "/md-links",
			title: "Markdown Link Extractor",
			description: "Pull inline, reference, autolink, and bare URLs from Markdown."
		},
		{
			href: "/meta-tags",
			title: "Meta Tags Generator",
			description: "Build SEO, Open Graph, and Twitter Card meta tags."
		},
		{
			href: "/strftime",
			title: "strftime Cheatsheet",
			description: "Format codes for POSIX strftime with a live preview."
		},
		{
			href: "/robots",
			title: "robots.txt Builder",
			description: "Build robots.txt with User-agent groups and Sitemap."
		},
		{
			href: "/sitemap",
			title: "Sitemap.xml Builder",
			description: "Build Sitemap 0.9 XML from a URL list."
		},
		{
			href: "/json-ld",
			title: "JSON-LD Generator",
			description: "Schema.org structured data (Person/Org/Product/Article/FAQ)."
		},
		{
			href: "/list-sort",
			title: "List Sort & Shuffle",
			description: "Sort, shuffle, dedupe, or trim a line-based list."
		},
		{
			href: "/hash-compare",
			title: "Hash Verifier",
			description: "Hash a file locally and compare to an expected checksum."
		},
		{
			href: "/json-sort",
			title: "JSON Sorter",
			description: "Sort JSON arrays by property or alphabetize all object keys."
		},
		{
			href: "/md-images",
			title: "Markdown Image Extractor",
			description: "Extract inline, reference, and HTML images from Markdown."
		},
		{
			href: "/word-diff",
			title: "Word-level Diff",
			description: "Compare two text snippets word by word for prose changes."
		},
		{
			href: "/latex",
			title: "LaTeX Symbol Search",
			description: "Search math symbols and copy LaTeX commands."
		},
		{
			href: "/cidr-agg",
			title: "CIDR Aggregator",
			description: "Merge IPv4 CIDRs/ranges/IPs into the minimal set of CIDRs."
		},
		{
			href: "/frontmatter",
			title: "Markdown Frontmatter",
			description: "Extract YAML, TOML, or JSON frontmatter from Markdown documents."
		},
		{
			href: "/html-strip",
			title: "HTML Stripper",
			description: "Extract plain text from HTML; strips script/style."
		},
		{
			href: "/csv-stats",
			title: "CSV Column Statistics",
			description: "Per-column counts, unique values, and numeric statistics."
		},
		{
			href: "/perm-comb",
			title: "Permutations & Combinations",
			description: "Factorials, P(n,r), C(n,r) with and without repetition (BigInt)."
		},
		{
			href: "/bpm",
			title: "BPM / Tempo Tools",
			description: "Tap to find BPM, compute note delays, and play a metronome."
		},
		{
			href: "/vector",
			title: "Vector Calculator",
			description: "Add, subtract, dot, cross, normalize, and project 2D/3D vectors."
		},
		{
			href: "/basic-auth",
			title: "HTTP Basic Auth",
			description: "Build and decode HTTP Basic Authorization headers."
		},
		{
			href: "/random-hex",
			title: "Random Bytes Generator",
			description: "Generate crypto-grade random bytes in hex, base64, integer."
		},
		{
			href: "/social-count",
			title: "Social Character Counter",
			description: "Count characters and check limits across social platforms."
		},
		{
			href: "/csv-schema",
			title: "CSV → SQL Schema",
			description: "Infer CREATE TABLE from CSV across PostgreSQL/MySQL/SQLite/MSSQL."
		},
		{
			href: "/box-draw",
			title: "Box Drawing Characters",
			description: "Click to copy Unicode box-drawing, block, and shape characters."
		},
		{
			href: "/md-strip",
			title: "Markdown Stripper",
			description: "Strip Markdown formatting to get plain text."
		},
		{
			href: "/matrix",
			title: "Matrix Calculator",
			description: "2×2 and 3×3 matrix det, transpose, inverse, multiply."
		},
		{
			href: "/email-valid",
			title: "Email Validator",
			description: "Strict syntactic email validation per RFC 5321/5322."
		},
		{
			href: "/email-obfuscate",
			title: "Email Obfuscator",
			description: "Hide an email from scrapers via HTML entities and ROT13."
		},
		{
			href: "/md-escape",
			title: "Markdown Escape",
			description: "Escape Markdown special characters to display them literally."
		},
		{
			href: "/identifier",
			title: "Identifier Validator",
			description: "Check identifier validity and reserved-word status (JS/Py/Java/SQL)."
		},
		{
			href: "/sequences",
			title: "Number Sequences",
			description: "Fibonacci, primes, squares, factorials, AP/GP, and more (BigInt)."
		},
		{
			href: "/md5",
			title: "MD5 Hash",
			description: "Compute MD5 digest of text or files (non-cryptographic)."
		},
		{
			href: "/ascii85",
			title: "Ascii85 (Base85)",
			description: "Adobe Ascii85 encode/decode with wrappers and z shorthand."
		},
		{
			href: "/trig",
			title: "Trigonometry Calculator",
			description: "sin/cos/tan/inverse with degrees or radians."
		},
		{
			href: "/right-tri",
			title: "Right Triangle Solver",
			description: "Solve a right triangle from any two known values."
		},
		{
			href: "/spinner",
			title: "CSS Spinner Generator",
			description: "Build pure-CSS loading spinners (circle/ring/dots/bars/pulse)."
		},
		{
			href: "/json-ptr",
			title: "JSON Pointer (RFC 6901)",
			description: "Resolve and enumerate JSON Pointers with proper escapes."
		},
		{
			href: "/html-format",
			title: "HTML Formatter",
			description: "Pretty-print or minify HTML; preserves pre/script/style."
		},
		{
			href: "/crc",
			title: "Checksum Tools",
			description: "CRC-32, Adler-32, FNV-1a, and DJB2 (non-cryptographic)."
		},
		{
			href: "/url-builder",
			title: "URL Builder",
			description: "Compose URLs from parts with auto-encoded query parameters."
		},
		{
			href: "/cache-header",
			title: "HTTP Cache Header Analyzer",
			description: "Parse Cache-Control / Expires / ETag and explain caching behavior."
		},
		{
			href: "/csv-table",
			title: "CSV → ASCII Table",
			description: "Render CSV as aligned text tables (box, double, ASCII, RST)."
		},
		{
			href: "/cidr-table",
			title: "CIDR Subnet Cheatsheet",
			description: "IPv4 prefixes with subnet masks, wildcards, and host counts."
		},
		{
			href: "/image-format",
			title: "Image Format Converter",
			description: "Convert PNG ↔ JPEG ↔ WebP via canvas, with quality and resize."
		},
		{
			href: "/stopwatch",
			title: "Stopwatch",
			description: "Sub-second precision stopwatch with lap tracking."
		},
		{
			href: "/js-to-json",
			title: "JS Object → JSON",
			description: "Convert relaxed JS / JSON5 objects to strict JSON."
		},
		{
			href: "/sample-pick",
			title: "Weighted Random Picker",
			description: "Pick random items with optional weights and replacement."
		},
		{
			href: "/user-agent",
			title: "User Agent Strings",
			description: "Reference of common browser, mobile, bot, and CLI UAs."
		},
		{
			href: "/md-to-csv",
			title: "Markdown Table → CSV",
			description: "Convert Markdown pipe tables into properly quoted CSV."
		},
		{
			href: "/cidr-contains",
			title: "CIDR Contains",
			description: "Check whether IPv4 / IPv6 addresses fall inside CIDR blocks."
		},
		{
			href: "/img-colors",
			title: "Image Color Palette",
			description: "Extract dominant colors from a local image."
		},
		{
			href: "/jwt-verify",
			title: "JWT Verifier",
			description: "Verify HMAC-signed JWTs (HS256/384/512) against a secret."
		},
		{
			href: "/data-url",
			title: "Data URL",
			description: "Encode files to data: URLs and decode them back to bytes."
		},
		{
			href: "/hsv-conv",
			title: "HSV / HSL / RGB / HEX",
			description: "Bidirectional color converter with sliders."
		},
		{
			href: "/json-ts",
			title: "JSON → TypeScript",
			description: "Infer TypeScript interfaces from a JSON sample."
		},
		{
			href: "/hex-dump",
			title: "Hex Dump",
			description: "View text or files as a side-by-side hex / ASCII dump."
		},
		{
			href: "/jwt-sign",
			title: "JWT Signer",
			description: "Build and sign HS256 / 384 / 512 JWTs locally."
		},
		{
			href: "/backslash-escape",
			title: "Backslash Escape / Unescape",
			description: "Escape or unescape \\n, \\t, \\xNN, \\uNNNN, \\u{...}."
		},
		{
			href: "/css-triangle",
			title: "CSS Triangle",
			description: "Generate CSS arrows with the transparent-border technique."
		},
		{
			href: "/html-table-json",
			title: "HTML Table → JSON",
			description: "Extract <table> rows as JSON objects."
		},
		{
			href: "/aes-gcm",
			title: "AES-GCM Encrypt / Decrypt",
			description: "AES-GCM with PBKDF2 key derivation, all in-browser."
		},
		{
			href: "/geohash",
			title: "Geohash",
			description: "Encode lat/lon to geohash and decode it back to a centroid."
		},
		{
			href: "/json-go",
			title: "JSON → Go struct",
			description: "Generate Go structs with JSON tags from a sample."
		},
		{
			href: "/color-mix",
			title: "Color Mixer",
			description: "Blend colors with custom weights (sRGB / linear / HSL)."
		},
		{
			href: "/ansi-decode",
			title: "ANSI Escape Decoder",
			description: "Render terminal output with SGR colors or strip ANSI codes."
		},
		{
			href: "/filesize",
			title: "File Size Converter",
			description: "Parse human file sizes and break bytes into KiB/KB units."
		}
	];
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
	<header class="mb-10 border-b pb-6">
		<h1 class="text-4xl font-bold tracking-tight">ORY TOOLS</h1>
		<p class="text-muted-foreground mt-2">Select a tool from the list below.</p>
	</header>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each tools as tool (tool.href)}
			<a
				href={tool.href}
				class="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
			>
				<Card.Root
					class="hover:border-foreground/20 h-full transition-all hover:-translate-y-1 hover:shadow-md"
				>
					<Card.Header>
						<Card.Title class="text-primary">{tool.title}</Card.Title>
						<Card.Description>{tool.description}</Card.Description>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</main>
