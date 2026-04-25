export const NATO_ALPHABET: Record<string, string> = {
	A: "Alfa",
	B: "Bravo",
	C: "Charlie",
	D: "Delta",
	E: "Echo",
	F: "Foxtrot",
	G: "Golf",
	H: "Hotel",
	I: "India",
	J: "Juliett",
	K: "Kilo",
	L: "Lima",
	M: "Mike",
	N: "November",
	O: "Oscar",
	P: "Papa",
	Q: "Quebec",
	R: "Romeo",
	S: "Sierra",
	T: "Tango",
	U: "Uniform",
	V: "Victor",
	W: "Whiskey",
	X: "X-ray",
	Y: "Yankee",
	Z: "Zulu",
	"0": "Zero",
	"1": "One",
	"2": "Two",
	"3": "Three",
	"4": "Four",
	"5": "Five",
	"6": "Six",
	"7": "Seven",
	"8": "Eight",
	"9": "Nine"
};

export function textToNato(text: string): string {
	const upper = text.toUpperCase();
	const out: string[] = [];
	for (const ch of upper) {
		if (NATO_ALPHABET[ch]) out.push(NATO_ALPHABET[ch]);
		else if (ch === " ") out.push("(space)");
		else if (ch === "\n") out.push("\n");
		else out.push(`(${ch})`);
	}
	return out.join(" ").replace(/ \n /g, "\n");
}
