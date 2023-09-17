


export const SCALE = 100;
export const SCALE_N = BigInt(SCALE);



export function bigpow(base: number, power: bigint): number;
export function bigpow(base: bigint, power: bigint): bigint;
export function bigpow(base: bigint | number, power: bigint): bigint | number {
    if (typeof base === 'bigint') {
        return base ** power;
    }
    if (base === 1) return base;
    
    let result = 1;
    while (power > 0n) {
        result *= base;
        power--;
    }
    return result;
}

export function bigMax(...nums: bigint[]): bigint {
    let max = nums[0];
    nums.forEach(n => {
        if (n > max) max = n;
    })
    return BigInt(max);
}

export function bigMin(...nums: bigint[]): bigint {
    let min = nums[0];
    nums.forEach(n => {
        if (n < min) min = n;
    })
    return BigInt(min);
}

export function NumToBig(n: number) {
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

export const REALLY_BIG = bigpow(BigInt(1e10), BigInt(10));