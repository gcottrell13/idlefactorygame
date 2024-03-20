
export default class Big {
    mantissa: bigint;
    exponent: bigint;
    infinite: boolean;
    frozen: boolean;

    static Zero = new Big(0n, 0n, false, true);
    static One = new Big(1n, 0n, false, true);
    static Two = new Big(2n, 0n, false, true);
    static Three = new Big(3n, 0n, false, true);
    static Four = new Big(4n, 0n, false, true);
    static Five = new Big(5n, 0n, false, true);
    static Six = new Big(6n, 0n, false, true);
    static Seven = new Big(7n, 0n, false, true);
    static Eight = new Big(8n, 0n, false, true);
    static Nine = new Big(9n, 0n, false, true);
    static Ten = new Big(10n, 0n, false, true);
    static Hundred = new Big(100n, 0n, false, true);
    static Infinity = new Big(0n, 0n, true, true);

    constructor(mantissa: bigint, exponent: bigint = 0n, infinite: boolean = false, frozen: boolean = false) {
        this.mantissa = mantissa;
        this.exponent = exponent;
        this.infinite = infinite;
        this.frozen = frozen;
    }

    static fromNumberOrBigInt(n: number | bigint) {
        if (typeof n === 'bigint') return Big.fromBigInt(n);
        let exponent = 0n;
        while (n % 1 !== 0) {
            n *= 10;
            exponent -= 1n;
        }
        return new Big(BigInt(n), exponent);
    }

    static fromBigInt(n: bigint) {
        return new Big(n).normalize();
    }

    toNumber() : number {
        if (this.infinite) return this.mantissa > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
        return Number(this.mantissa) * (10 ** Number(this.exponent));
    }

    toBigint() {
        if (this.infinite) throw new Error("attempted infinite big int"); 
        return this.mantissa * (10n ** this.exponent);
    }

    normalize() {
        if (this.mantissa === 0n) {
            this.exponent = 0n;
            return this;
        }
        if (this.exponent > 0n) {
            this.mantissa *= 10n ** this.exponent;
            this.exponent = 0n;
            return this;
        }
        while (this.mantissa % 10n === 0n) {
            this.exponent ++;
            this.mantissa /= 10n;
        }
        return this;
    }

    clone() {
        return new Big(this.mantissa, this.exponent, this.infinite);
    }

    powEq(power: number | bigint) {
        if (this.frozen) throw new Error("frozen");
        power = BigInt(power);

        if (power === 0n) {
            this.mantissa = 1n;
            this.exponent = 0n;
            return this;
        }
        if (power === 1n) 
            return this;
        
        this.mantissa = this.mantissa ** power;
        this.exponent *= power;
        return this.normalize();
    }

    pow(power: number) {
        return this.clone().powEq(power);
    }

    mulEq(b: Big) {
        if (this.frozen) throw new Error("frozen");
        this.mantissa *= b.mantissa;
        this.exponent += b.exponent;
        return this.normalize();
    }

    negateEq() {
        if (this.frozen) throw new Error("frozen");
        this.mantissa *= -1n;
        return this;
    }

    negate() {
        return new Big(-this.mantissa, this.exponent, this.infinite);
    }

    mul(b: Big) {
        return this.clone().mulEq(b);
    }

    addEq(b: Big) {
        if (this.frozen) throw new Error("frozen");
        let [smaller, bigger] = b.exponent < this.exponent ? [b, this] : [this, b];
        bigger = bigger.clone();

        while (bigger.exponent > smaller.exponent) {
            bigger.exponent --;
            bigger.mantissa *= 10n;
        }
        this.mantissa = bigger.mantissa + smaller.mantissa;
        this.exponent = smaller.exponent;
        return this.normalize();
    }

    add(b: Big) {
        return this.clone().addEq(b);
    }

    divEq(b: Big) {
        if (this.frozen) throw new Error("frozen");
        if (b.mantissa === 0n) 
            return Big.Infinity;
        this.mantissa *= 100n;
        this.mantissa /= b.mantissa;
        this.exponent -= b.exponent + 2n;
        return this;
    }

    div(b: Big) {
        return this.clone().divEq(b);
    }

    subEq(b: Big) {
        if (this.frozen) throw new Error("frozen");
        return this.addEq(new Big(-b.mantissa, b.exponent));
    }

    sub(b: Big){
        return this.clone().subEq(b);
    }

    magnitude() {
        return this.mantissa.toString().length + Number(this.exponent) - 1;
    }

    lt(b: Big) {
        if (b.infinite && !this.infinite) return true;
        if (!b.infinite && this.infinite) return false;
        return (b.exponent > this.exponent) || (b.exponent === this.exponent && b.mantissa > this.mantissa);
    }

    gt(b: Big) {
        if (!b.infinite && this.infinite) return true;
        if (b.infinite && !this.infinite) return false;
        return (b.exponent < this.exponent) || (b.exponent === this.exponent && b.mantissa < this.mantissa);
    }

    lte(b: Big) {
        if (b.infinite && !this.infinite) return true;
        if (!b.infinite && this.infinite) return false;
        return (b.exponent > this.exponent) || (b.exponent === this.exponent && b.mantissa >= this.mantissa);
    }

    gte(b: Big) {
        if (!b.infinite && this.infinite) return true;
        if (b.infinite && !this.infinite) return false;
        return (b.exponent < this.exponent) || (b.exponent === this.exponent && b.mantissa <= this.mantissa);
    }

    /**
     * Rounds towards zero
     */
    floorEq() {
        if (this.exponent >= 0) 
            return this;
        this.mantissa -= this.mantissa % (10n ** -this.exponent);
        return this.normalize();
    }

    /**
     * Rounds towards zero
     */
    floored() {
        return this.clone().floorEq();
    }

    /**
     * Rounds away from zero
     */
    ceilEq() {
        if (this.exponent >= 0) 
            return this;
        const f = 10n ** -this.exponent;
        this.mantissa -= this.mantissa % f;
        this.mantissa += f;
        return this.normalize();
    }
    
    /**
     * Rounds away from zero
     */
    ceiled() {
        return this.clone().ceilEq();
    }

    eq(b: Big) {
        return b.mantissa === this.mantissa && b.exponent === this.exponent && b.infinite === this.infinite;
    }

    neq(b: Big) {
        return b.mantissa !== this.mantissa || b.exponent !== this.exponent || b.infinite !== this.infinite;
    }

    static max(...nums: Big[]): Big {
        let first = nums[0] ?? Big.Zero;
        for (const c of nums) {
            if (c.gt(first)) first = c;
        }
        return first;
    }

    static min(...nums: Big[]): Big {
        let first = nums[0] ?? Big.Zero;
        for (const c of nums) {
            if (c.lt(first)) first = c;
        }
        return first;
    }

    static sum(...nums: Big[]): Big {
        let first = (nums[0] ?? Big.Zero).clone();
        for (const c of nums) {
            first.addEq(c);
        }
        return first;
    }
}