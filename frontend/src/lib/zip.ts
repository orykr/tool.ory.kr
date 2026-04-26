// Minimal store-only (no compression) ZIP writer.
// Output is a valid .zip with entries stored uncompressed.
// Suitable for shipping browser-generated frame sequences as a single archive.

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[i] = c >>> 0;
	}
	return table;
})();

function crc32(data: Uint8Array): number {
	let c = 0xffffffff;
	for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

const enc = new TextEncoder();

export type ZipEntry = { name: string; data: Uint8Array };

export function makeZip(entries: ZipEntry[]): Blob {
	const parts: Uint8Array[] = [];
	const central: Uint8Array[] = [];
	let offset = 0;
	const now = new Date();
	const dosTime = ((now.getHours() & 0x1f) << 11) | ((now.getMinutes() & 0x3f) << 5) | ((now.getSeconds() >>> 1) & 0x1f);
	const dosDate = (((now.getFullYear() - 1980) & 0x7f) << 9) | (((now.getMonth() + 1) & 0x0f) << 5) | (now.getDate() & 0x1f);

	for (const e of entries) {
		const nameBytes = enc.encode(e.name);
		const crc = crc32(e.data);
		const size = e.data.length;

		const local = new Uint8Array(30 + nameBytes.length);
		const dv = new DataView(local.buffer);
		dv.setUint32(0, 0x04034b50, true);
		dv.setUint16(4, 20, true);
		dv.setUint16(6, 0, true);
		dv.setUint16(8, 0, true);
		dv.setUint16(10, dosTime, true);
		dv.setUint16(12, dosDate, true);
		dv.setUint32(14, crc, true);
		dv.setUint32(18, size, true);
		dv.setUint32(22, size, true);
		dv.setUint16(26, nameBytes.length, true);
		dv.setUint16(28, 0, true);
		local.set(nameBytes, 30);
		parts.push(local, e.data);

		const cdh = new Uint8Array(46 + nameBytes.length);
		const dv2 = new DataView(cdh.buffer);
		dv2.setUint32(0, 0x02014b50, true);
		dv2.setUint16(4, 20, true);
		dv2.setUint16(6, 20, true);
		dv2.setUint16(8, 0, true);
		dv2.setUint16(10, 0, true);
		dv2.setUint16(12, dosTime, true);
		dv2.setUint16(14, dosDate, true);
		dv2.setUint32(16, crc, true);
		dv2.setUint32(20, size, true);
		dv2.setUint32(24, size, true);
		dv2.setUint16(28, nameBytes.length, true);
		dv2.setUint16(30, 0, true);
		dv2.setUint16(32, 0, true);
		dv2.setUint16(34, 0, true);
		dv2.setUint16(36, 0, true);
		dv2.setUint32(38, 0, true);
		dv2.setUint32(42, offset, true);
		cdh.set(nameBytes, 46);
		central.push(cdh);

		offset += local.length + e.data.length;
	}

	const centralStart = offset;
	let centralSize = 0;
	for (const c of central) centralSize += c.length;

	const eocd = new Uint8Array(22);
	const dve = new DataView(eocd.buffer);
	dve.setUint32(0, 0x06054b50, true);
	dve.setUint16(4, 0, true);
	dve.setUint16(6, 0, true);
	dve.setUint16(8, entries.length, true);
	dve.setUint16(10, entries.length, true);
	dve.setUint32(12, centralSize, true);
	dve.setUint32(16, centralStart, true);
	dve.setUint16(20, 0, true);

	return new Blob([...parts, ...central, eocd], { type: "application/zip" });
}
