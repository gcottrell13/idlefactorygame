


export const SCALE = 100;
export const SCALE_N = BigInt(SCALE);



export function bigpow(base: number, power: bigint): bigint;
export function bigpow(base: bigint, power: bigint): bigint;
export function bigpow(base: bigint | number, power: bigint): bigint {
    if (typeof base === 'bigint') {
        let result = 1n;
        while (power > 0n) {
            result *= base;
            power --;
        }
        return result;
    }
    let result = 1;
    while (power > 0n) {
        result *= base;
        power --;
    }
    return BigInt(result);
}

export function bigToNum(n: bigint) : number;
export function bigToNum(n: bigint | undefined | null) : number | null;
export function bigToNum(n: bigint | undefined | null): number | null {
    if (!n) return null;
    return Number(BigInt.asIntN(64, n));
}

export function bigMax(...nums: (bigint | number)[]): bigint {
    let max = nums[0];
    nums.forEach(n => {
        if (n > max) max = n;
    })
    return BigInt(max);
}

export function bigMin(...nums: (bigint | number)[]): bigint {
    let min = nums[0];
    nums.forEach(n => {
        if (n < min) min = n;
    })
    return BigInt(min);
}

export const REALLY_BIG = bigpow(BigInt(1e10), BigInt(10));