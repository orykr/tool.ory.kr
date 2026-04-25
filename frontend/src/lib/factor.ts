export function isPrime(n: bigint): boolean {
	if (n < 2n) return false;
	if (n < 4n) return true;
	if (n % 2n === 0n) return false;
	const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
	let d = n - 1n;
	let r = 0n;
	while (d % 2n === 0n) {
		d /= 2n;
		r++;
	}
	for (const a of witnesses) {
		if (a >= n) continue;
		let x = modPow(a, d, n);
		if (x === 1n || x === n - 1n) continue;
		let composite = true;
		for (let i = 0n; i < r - 1n; i++) {
			x = (x * x) % n;
			if (x === n - 1n) {
				composite = false;
				break;
			}
		}
		if (composite) return false;
	}
	return true;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
	let result = 1n;
	base = base % mod;
	while (exp > 0n) {
		if (exp & 1n) result = (result * base) % mod;
		exp >>= 1n;
		base = (base * base) % mod;
	}
	return result;
}

export function factorize(n: bigint, limit = 1_000_000n): { factors: Map<bigint, number>; remaining: bigint | null } {
	const factors = new Map<bigint, number>();
	if (n <= 1n) return { factors, remaining: null };
	let m = n;
	for (const p of [2n, 3n]) {
		while (m % p === 0n) {
			factors.set(p, (factors.get(p) ?? 0) + 1);
			m /= p;
		}
	}
	let i = 5n;
	while (i <= limit && i * i <= m) {
		for (const p of [i, i + 2n]) {
			while (m % p === 0n) {
				factors.set(p, (factors.get(p) ?? 0) + 1);
				m /= p;
			}
		}
		i += 6n;
	}
	if (m > 1n) {
		if (m * m <= m * limit) {
			factors.set(m, (factors.get(m) ?? 0) + 1);
			return { factors, remaining: null };
		}
		if (isPrime(m)) {
			factors.set(m, (factors.get(m) ?? 0) + 1);
			return { factors, remaining: null };
		}
		return { factors, remaining: m };
	}
	return { factors, remaining: null };
}

export function gcd(a: bigint, b: bigint): bigint {
	a = a < 0n ? -a : a;
	b = b < 0n ? -b : b;
	while (b) {
		[a, b] = [b, a % b];
	}
	return a;
}

export function lcm(a: bigint, b: bigint): bigint {
	if (a === 0n || b === 0n) return 0n;
	return ((a < 0n ? -a : a) / gcd(a, b)) * (b < 0n ? -b : b);
}

export function divisors(n: bigint, limit = 1_000_000): bigint[] {
	if (n <= 0n) return [];
	const small: bigint[] = [];
	const large: bigint[] = [];
	let i = 1n;
	let count = 0;
	while (i * i <= n && count < limit) {
		if (n % i === 0n) {
			small.push(i);
			if (i !== n / i) large.push(n / i);
		}
		i++;
		count++;
	}
	return [...small, ...large.reverse()];
}
