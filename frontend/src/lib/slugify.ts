export interface SlugifyOptions {
	separator: string;
	lowercase: boolean;
	stripStopwords: boolean;
	maxLength: number | null;
}

const STOPWORDS = new Set([
	"a", "an", "and", "as", "at", "be", "but", "by", "for", "from", "in", "is", "it", "of", "on",
	"or", "that", "the", "this", "to", "with"
]);

export function slugify(input: string, opts: SlugifyOptions): string {
	if (!input) return "";
	let result = input.normalize("NFKD").replace(/[̀-ͯ]/g, "");
	if (opts.lowercase) result = result.toLowerCase();
	result = result.replace(/[^\p{L}\p{N}\s-]+/gu, " ");
	let parts = result.split(/[\s-]+/).filter(Boolean);
	if (opts.stripStopwords) parts = parts.filter((p) => !STOPWORDS.has(p.toLowerCase()));
	let slug = parts.join(opts.separator);
	if (opts.maxLength && opts.maxLength > 0 && slug.length > opts.maxLength) {
		slug = slug.slice(0, opts.maxLength).replace(new RegExp(`${escapeRegex(opts.separator)}[^${escapeRegex(opts.separator)}]*$`), "");
		if (!slug) slug = parts.join(opts.separator).slice(0, opts.maxLength);
	}
	return slug;
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
