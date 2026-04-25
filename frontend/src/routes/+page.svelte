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
