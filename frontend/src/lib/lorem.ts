const WORDS = [
	"lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
	"sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
	"magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
	"ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis",
	"aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat",
	"nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
	"sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
	"aenean", "vehicula", "magna", "non", "sagittis", "blandit", "vivamus", "vitae", "tincidunt",
	"libero", "fusce", "rhoncus", "interdum", "lacinia", "morbi", "consectetur", "ligula",
	"vel", "felis", "fringilla", "auctor", "praesent", "hendrerit", "nibh", "et", "tortor"
];

function randomInt(max: number): number {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	return buf[0] % max;
}

function pickWord(): string {
	return WORDS[randomInt(WORDS.length)];
}

export function generateWords(count: number): string {
	if (count <= 0) return "";
	const out: string[] = [];
	for (let i = 0; i < count; i++) out.push(pickWord());
	out[0] = out[0][0].toUpperCase() + out[0].slice(1);
	return out.join(" ") + ".";
}

export function generateSentence(): string {
	const wordCount = 6 + randomInt(10);
	const words: string[] = [];
	for (let i = 0; i < wordCount; i++) words.push(pickWord());
	if (wordCount > 5 && Math.random() < 0.4) {
		const insertAt = 2 + randomInt(wordCount - 3);
		words[insertAt] = words[insertAt] + ",";
	}
	const sentence = words.join(" ");
	return sentence[0].toUpperCase() + sentence.slice(1) + ".";
}

export function generateSentences(count: number): string {
	const out: string[] = [];
	for (let i = 0; i < count; i++) out.push(generateSentence());
	return out.join(" ");
}

export function generateParagraph(): string {
	const sentenceCount = 3 + randomInt(5);
	return generateSentences(sentenceCount);
}

export function generateParagraphs(count: number, startsWithLorem = true): string {
	const paragraphs: string[] = [];
	for (let i = 0; i < count; i++) paragraphs.push(generateParagraph());
	if (startsWithLorem && paragraphs.length) {
		paragraphs[0] =
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
			paragraphs[0];
	}
	return paragraphs.join("\n\n");
}
