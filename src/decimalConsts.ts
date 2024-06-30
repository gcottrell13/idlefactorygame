import Decimal from "decimal.js";


export const INFINITY = new Decimal(1/0);
export const MINUS_ONE = new Decimal(-1);
export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);
export const TWO = new Decimal(2);
export const THREE = new Decimal(3);
export const FOUR = new Decimal(4);
export const FIVE = new Decimal(5);
export const TEN = new Decimal(10);
export const HUNDRED = new Decimal(100);
export const THOUSAND = new Decimal(1_000);
export const MILLION = new Decimal(1_000_000);
export const HUNDREDTH = new Decimal(1).div(100);
export const THOUSANDTH = new Decimal(1).div(1_000);
export const MILLIONTH = new Decimal(1).div(1_000_000);

export function fromNumberOrBigInt(n: number | bigint): Decimal {
    return new Decimal(n.toString());
}