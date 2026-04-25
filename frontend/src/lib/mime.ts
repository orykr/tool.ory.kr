export interface MimeEntry {
	extension: string;
	type: string;
	description: string;
}

export const MIME_TYPES: MimeEntry[] = [
	{ extension: "txt", type: "text/plain", description: "Plain text" },
	{ extension: "html", type: "text/html", description: "HTML document" },
	{ extension: "htm", type: "text/html", description: "HTML document" },
	{ extension: "css", type: "text/css", description: "Cascading Style Sheets" },
	{ extension: "csv", type: "text/csv", description: "Comma-separated values" },
	{ extension: "js", type: "application/javascript", description: "JavaScript" },
	{ extension: "mjs", type: "application/javascript", description: "ES module JavaScript" },
	{ extension: "json", type: "application/json", description: "JSON" },
	{ extension: "xml", type: "application/xml", description: "XML" },
	{ extension: "yaml", type: "application/yaml", description: "YAML" },
	{ extension: "yml", type: "application/yaml", description: "YAML" },
	{ extension: "md", type: "text/markdown", description: "Markdown" },
	{ extension: "pdf", type: "application/pdf", description: "PDF document" },
	{ extension: "doc", type: "application/msword", description: "Word document (legacy)" },
	{ extension: "docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Word document" },
	{ extension: "xls", type: "application/vnd.ms-excel", description: "Excel spreadsheet (legacy)" },
	{ extension: "xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Excel spreadsheet" },
	{ extension: "ppt", type: "application/vnd.ms-powerpoint", description: "PowerPoint (legacy)" },
	{ extension: "pptx", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", description: "PowerPoint" },
	{ extension: "zip", type: "application/zip", description: "ZIP archive" },
	{ extension: "tar", type: "application/x-tar", description: "TAR archive" },
	{ extension: "gz", type: "application/gzip", description: "Gzip archive" },
	{ extension: "7z", type: "application/x-7z-compressed", description: "7z archive" },
	{ extension: "rar", type: "application/vnd.rar", description: "RAR archive" },

	{ extension: "png", type: "image/png", description: "PNG image" },
	{ extension: "jpg", type: "image/jpeg", description: "JPEG image" },
	{ extension: "jpeg", type: "image/jpeg", description: "JPEG image" },
	{ extension: "gif", type: "image/gif", description: "GIF image" },
	{ extension: "webp", type: "image/webp", description: "WebP image" },
	{ extension: "avif", type: "image/avif", description: "AVIF image" },
	{ extension: "svg", type: "image/svg+xml", description: "SVG vector image" },
	{ extension: "ico", type: "image/vnd.microsoft.icon", description: "Windows icon" },
	{ extension: "bmp", type: "image/bmp", description: "Bitmap image" },
	{ extension: "tiff", type: "image/tiff", description: "TIFF image" },

	{ extension: "mp3", type: "audio/mpeg", description: "MP3 audio" },
	{ extension: "wav", type: "audio/wav", description: "WAV audio" },
	{ extension: "ogg", type: "audio/ogg", description: "Ogg audio" },
	{ extension: "flac", type: "audio/flac", description: "FLAC audio" },
	{ extension: "m4a", type: "audio/mp4", description: "M4A audio" },

	{ extension: "mp4", type: "video/mp4", description: "MP4 video" },
	{ extension: "webm", type: "video/webm", description: "WebM video" },
	{ extension: "mov", type: "video/quicktime", description: "QuickTime video" },
	{ extension: "avi", type: "video/x-msvideo", description: "AVI video" },
	{ extension: "mkv", type: "video/x-matroska", description: "Matroska video" },

	{ extension: "ttf", type: "font/ttf", description: "TrueType font" },
	{ extension: "otf", type: "font/otf", description: "OpenType font" },
	{ extension: "woff", type: "font/woff", description: "Web Open Font" },
	{ extension: "woff2", type: "font/woff2", description: "Web Open Font 2" },

	{ extension: "wasm", type: "application/wasm", description: "WebAssembly" },
	{ extension: "bin", type: "application/octet-stream", description: "Binary" },
	{ extension: "exe", type: "application/octet-stream", description: "Executable" },
	{ extension: "iso", type: "application/x-iso9660-image", description: "ISO disc image" }
];
