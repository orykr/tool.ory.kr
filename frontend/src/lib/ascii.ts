export interface AsciiEntry {
	dec: number;
	hex: string;
	oct: string;
	binary: string;
	char: string;
	name: string;
	category: string;
}

const CONTROL_NAMES: Record<number, string> = {
	0: "NUL (null)",
	1: "SOH (start of heading)",
	2: "STX (start of text)",
	3: "ETX (end of text)",
	4: "EOT (end of transmission)",
	5: "ENQ (enquiry)",
	6: "ACK (acknowledge)",
	7: "BEL (bell)",
	8: "BS (backspace)",
	9: "HT (horizontal tab)",
	10: "LF (line feed)",
	11: "VT (vertical tab)",
	12: "FF (form feed)",
	13: "CR (carriage return)",
	14: "SO (shift out)",
	15: "SI (shift in)",
	16: "DLE (data link escape)",
	17: "DC1 (XON)",
	18: "DC2",
	19: "DC3 (XOFF)",
	20: "DC4",
	21: "NAK (negative acknowledge)",
	22: "SYN (synchronous idle)",
	23: "ETB (end of trans. block)",
	24: "CAN (cancel)",
	25: "EM (end of medium)",
	26: "SUB (substitute)",
	27: "ESC (escape)",
	28: "FS (file separator)",
	29: "GS (group separator)",
	30: "RS (record separator)",
	31: "US (unit separator)",
	127: "DEL (delete)"
};

export function buildAsciiTable(): AsciiEntry[] {
	const result: AsciiEntry[] = [];
	for (let i = 0; i < 128; i++) {
		const isControl = i < 32 || i === 127;
		const isPrintable = i >= 32 && i < 127;
		let category = "Control";
		if (i === 32) category = "Whitespace";
		else if (i >= 48 && i <= 57) category = "Digit";
		else if ((i >= 65 && i <= 90) || (i >= 97 && i <= 122)) category = "Letter";
		else if (isPrintable) category = "Punctuation / Symbol";

		result.push({
			dec: i,
			hex: i.toString(16).padStart(2, "0").toUpperCase(),
			oct: i.toString(8).padStart(3, "0"),
			binary: i.toString(2).padStart(7, "0"),
			char: isPrintable ? String.fromCharCode(i) : "·",
			name: CONTROL_NAMES[i] ?? (isPrintable ? String.fromCharCode(i) : ""),
			category
		});
	}
	return result;
}
