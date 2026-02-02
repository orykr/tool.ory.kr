export function calculateCidrInfo(input: string) {
    try {
        const [ipPart, cidrPart] = input.split('/');
        if (!ipPart || !cidrPart) {
            throw new Error('Invalid format');
        }

        const cidr = parseInt(cidrPart, 10);
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
            throw new Error('Invalid CIDR prefix');
        }

        const ip = ipToLong(ipPart);
        const mask = cidr === 0 ? 0 : (~0) << (32 - cidr);
        
        const network = ip & mask;
        const broadcast = network | (~mask); // In JS bitwise operations are on signed 32-bit, careful with unsigned.

        // Javascript bitwise operators treat operands as 32-bit signed integers.
        // We need to handle the unsigned conversion for display.
        
        const startIp = longToIp(network);
        const endIp = longToIp(broadcast);
        const subnetMask = longToIp(mask);

        return {
            startIp,
            endIp,
            subnetMask,
            error: null
        };
    } catch (e) {
        return {
            startIp: '',
            endIp: '',
            subnetMask: '',
            error: (e as Error).message
        };
    }
}

function ipToLong(ip: string): number {
    const parts = ip.split('.');
    if (parts.length !== 4) throw new Error('Invalid IP address');
    
    let result = 0;
    for (const part of parts) {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) throw new Error('Invalid IP address');
        result = (result << 8) | num;
    }
    // Convert to unsigned 32-bit integer
    return result >>> 0;
}

function longToIp(long: number): string {
    const part1 = (long >>> 24) & 255;
    const part2 = (long >>> 16) & 255;
    const part3 = (long >>> 8) & 255;
    const part4 = long & 255;
    return `${part1}.${part2}.${part3}.${part4}`;
}
