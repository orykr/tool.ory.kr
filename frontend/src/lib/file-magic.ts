export interface MagicSignature {
	bytes: number[];
	offset?: number;
	mask?: number[];
	name: string;
	mimeType: string;
}

export const SIGNATURES: MagicSignature[] = [
	{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], name: "PNG", mimeType: "image/png" },
	{ bytes: [0xff, 0xd8, 0xff], name: "JPEG", mimeType: "image/jpeg" },
	{ bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], name: "GIF (87a)", mimeType: "image/gif" },
	{ bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], name: "GIF (89a)", mimeType: "image/gif" },
	{ bytes: [0x42, 0x4d], name: "BMP", mimeType: "image/bmp" },
	{ bytes: [0x49, 0x49, 0x2a, 0x00], name: "TIFF (LE)", mimeType: "image/tiff" },
	{ bytes: [0x4d, 0x4d, 0x00, 0x2a], name: "TIFF (BE)", mimeType: "image/tiff" },
	{ bytes: [0x52, 0x49, 0x46, 0x46], name: "RIFF (WebP/WAV/AVI)", mimeType: "application/octet-stream" },

	{ bytes: [0x25, 0x50, 0x44, 0x46], name: "PDF", mimeType: "application/pdf" },
	{ bytes: [0x50, 0x4b, 0x03, 0x04], name: "ZIP (or DOCX/XLSX/JAR/APK)", mimeType: "application/zip" },
	{ bytes: [0x50, 0x4b, 0x05, 0x06], name: "ZIP (empty)", mimeType: "application/zip" },
	{ bytes: [0x1f, 0x8b], name: "Gzip", mimeType: "application/gzip" },
	{ bytes: [0x42, 0x5a, 0x68], name: "Bzip2", mimeType: "application/x-bzip2" },
	{ bytes: [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00], name: "XZ", mimeType: "application/x-xz" },
	{ bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], name: "7z", mimeType: "application/x-7z-compressed" },
	{ bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], name: "RAR", mimeType: "application/vnd.rar" },

	{ bytes: [0x66, 0x4c, 0x61, 0x43], name: "FLAC", mimeType: "audio/flac" },
	{ bytes: [0x4f, 0x67, 0x67, 0x53], name: "OGG", mimeType: "audio/ogg" },
	{ bytes: [0x49, 0x44, 0x33], name: "MP3 (ID3)", mimeType: "audio/mpeg" },

	{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, name: "MP4/MOV (ftyp)", mimeType: "video/mp4" },
	{ bytes: [0x1a, 0x45, 0xdf, 0xa3], name: "Matroska/WebM", mimeType: "video/webm" },

	{ bytes: [0x4d, 0x5a], name: "Windows EXE/DLL (PE)", mimeType: "application/octet-stream" },
	{ bytes: [0x7f, 0x45, 0x4c, 0x46], name: "ELF (Linux executable)", mimeType: "application/x-elf" },
	{ bytes: [0xca, 0xfe, 0xba, 0xbe], name: "Java class / Mach-O fat", mimeType: "application/octet-stream" },
	{ bytes: [0xcf, 0xfa, 0xed, 0xfe], name: "Mach-O 64-bit", mimeType: "application/octet-stream" },
	{ bytes: [0xfe, 0xed, 0xfa, 0xce], name: "Mach-O 32-bit", mimeType: "application/octet-stream" },

	{ bytes: [0xef, 0xbb, 0xbf], name: "UTF-8 BOM", mimeType: "text/plain" },
	{ bytes: [0xff, 0xfe], name: "UTF-16 LE BOM", mimeType: "text/plain" },
	{ bytes: [0xfe, 0xff], name: "UTF-16 BE BOM", mimeType: "text/plain" },

	{ bytes: [0x77, 0x4f, 0x46, 0x46], name: "WOFF font", mimeType: "font/woff" },
	{ bytes: [0x77, 0x4f, 0x46, 0x32], name: "WOFF2 font", mimeType: "font/woff2" },
	{ bytes: [0x00, 0x01, 0x00, 0x00, 0x00], name: "TrueType font", mimeType: "font/ttf" },
	{ bytes: [0x4f, 0x54, 0x54, 0x4f], name: "OpenType font (CFF)", mimeType: "font/otf" }
];

export interface MagicMatch {
	signature: MagicSignature;
	bytesShown: number[];
}

export function identify(bytes: Uint8Array): MagicMatch[] {
	const matches: MagicMatch[] = [];
	for (const sig of SIGNATURES) {
		const offset = sig.offset ?? 0;
		if (bytes.length < offset + sig.bytes.length) continue;
		let ok = true;
		for (let i = 0; i < sig.bytes.length; i++) {
			if (bytes[offset + i] !== sig.bytes[i]) {
				ok = false;
				break;
			}
		}
		if (ok) {
			matches.push({
				signature: sig,
				bytesShown: Array.from(bytes.subarray(offset, offset + sig.bytes.length))
			});
		}
	}
	return matches;
}

export function bytesToHex(bytes: Uint8Array, max = 16): string {
	const slice = bytes.subarray(0, max);
	return Array.from(slice)
		.map((b) => b.toString(16).padStart(2, "0").toUpperCase())
		.join(" ");
}

export function bytesToAscii(bytes: Uint8Array, max = 16): string {
	const slice = bytes.subarray(0, max);
	let out = "";
	for (const b of slice) {
		out += b >= 32 && b < 127 ? String.fromCharCode(b) : ".";
	}
	return out;
}
