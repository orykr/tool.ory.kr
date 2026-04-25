export const MORSE_TABLE: Record<string, string> = {
	A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
	I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
	Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
	Y: "-.--", Z: "--..",
	"0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
	"5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
	".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
	"/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
	";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
	'"': ".-..-.", "$": "...-..-", "@": ".--.-."
};

const REVERSE: Record<string, string> = Object.fromEntries(
	Object.entries(MORSE_TABLE).map(([k, v]) => [v, k])
);

export function textToMorse(text: string): string {
	return text
		.toUpperCase()
		.split("\n")
		.map((line) =>
			line
				.split(/\s+/)
				.filter(Boolean)
				.map((word) =>
					Array.from(word)
						.map((ch) => MORSE_TABLE[ch] ?? "")
						.filter(Boolean)
						.join(" ")
				)
				.join("   ")
		)
		.join("\n");
}

export function morseToText(morse: string): string {
	return morse
		.split("\n")
		.map((line) =>
			line
				.split(/\s{3,}|\/|\|/)
				.map((word) =>
					word
						.trim()
						.split(/\s+/)
						.map((sym) => REVERSE[sym] ?? "")
						.join("")
				)
				.join(" ")
		)
		.join("\n");
}
