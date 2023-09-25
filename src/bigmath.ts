


export const SCALE = 100;
export const SCALE_N = BigInt(SCALE);



export function bigpow(base: number, power: bigint): bigint;
export function bigpow(base: bigint, power: bigint): bigint;
export function bigpow(base: bigint | number, power: bigint): bigint {
    if (base == 1) return NumToBig(base);
    power /= SCALE_N;
    if (power === 1n) return NumToBig(base);
    if (typeof base === 'number') {
        base = NumToBig(base);
    }

    return (base ** power) / (SCALE_N ** (power - 1n));
}

export function bigMax(...nums: bigint[]): bigint {
    let max = nums[0];
    nums.forEach(n => {
        if (n > max) max = n;
    })
    return BigInt(max);
}

export function bigMul(...nums: bigint[]): bigint {
    let product = 1n;
    nums.forEach(n => product *= n);
    return product / (SCALE_N ** BigInt(nums.length - 1));
}

export function bigDiv(a: bigint, b: bigint): bigint {
    if (b === 0n) debugger;
    return a * SCALE_N / b;
}

export function bigMin(...nums: bigint[]): bigint {
    let min = nums[0];
    nums.forEach(n => {
        if (n < min) min = n;
    })
    return BigInt(min);
}

export function NumToBig(n: number | bigint) {
    if (typeof n === 'bigint') return n;
    return BigInt(n * SCALE);
}

export function bigToNum(n: bigint): number;
export function bigToNum(n: bigint | undefined | null): number | null;
export function bigToNum(n: bigint | undefined | null): number | null {
    if (n === undefined || n === null) return null;
    return Number(BigInt.asIntN(64, n)) / SCALE;
}

export function scaleBigInt(n: bigint, scale: number) {
    const s = Math.floor(scale * 10000);
    return (n * BigInt(s)) / 10000n;
}

export function bigSum(nums: bigint[]) : bigint {
    let sum = 0n;
    nums.forEach(n => sum += n);
    return sum;
}

export const REALLY_BIG = 10n ** 1000n;

export function bigGt(a: bigint, b: number | bigint): boolean {
    return a > NumToBig(b);
}
export function bigGtE(a: bigint, b: number | bigint): boolean {
    return a >= NumToBig(b);
}
export function bigLt(a: bigint, b: number | bigint): boolean {
    return a < NumToBig(b);
}
export function bigLtE(a: bigint, b: number | bigint): boolean {
    return a <= NumToBig(b);
}
export function bigEq(a: bigint, b: number | bigint): boolean {
    return a === NumToBig(b);
}
export function bigFloor(a: bigint): bigint {
    return a - (a % SCALE_N);
}