

const MANTISSA_PRECISION = 6;

export default class Big {
    mantissa: number;
    exponent: number;
    infinite: boolean;

    static Zero = new Big(0);
    static One = new Big(1);
    static Infinity = new Big(0, 0, true);

    constructor(mantissa: number, exponent: number = 1, infinite: boolean = false) {
        this.mantissa = mantissa;
        this.exponent = exponent;
        this.infinite = infinite;
    }

    static fromNumberOrBigInt(n: number | bigint) {
        if (typeof n === 'bigint') return Big.fromBigInt(n);
        return new Big(n);
    }

    static fromBigInt(n: bigint) {
        const exponent = n.toString().length - 1;
        if (exponent <= MANTISSA_PRECISION) {
            return new Big(Number(n)).normalize();
        }
        const factor = 10n ** BigInt(exponent - MANTISSA_PRECISION);
        n /= factor;
        return new Big(Number(n), exponent - MANTISSA_PRECISION).normalize();
    }

    toNumber() : number {
        return this.mantissa * Math.pow(10, this.exponent);
    }

    normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return this;
        }
        const isNegative = this.mantissa < 0;
        this.mantissa = isNegative ? -this.mantissa : this.mantissa;
        while (this.mantissa < 1) {
            this.mantissa *= 10;
            this.exponent -= 1;
        }
        while (this.mantissa > 10) {
            this.mantissa *= 0.1;
            this.exponent += 1;
        }
        return this;
    }

    clone() {
        return new Big(this.mantissa, this.exponent);
    }

    powEq(power: number) {
        power = Math.floor(power);

        if (power === 0) {
            this.mantissa = 1;
            this.exponent = 0;
            return this;
        }
        if (power === 1) 
            return this;
        
        this.mantissa = Math.pow(this.mantissa, power);
        this.exponent *= power;
        return this.normalize();
    }

    pow(power: number) {
        return this.clone().powEq(power);
    }

    mulEq(b: Big) {
        this.mantissa *= b.mantissa;
        this.exponent += b.exponent;
        return this.normalize();
    }

    mul(b: Big) {
        return this.clone().mulEq(b);
    }

    addEq(b: Big) {
        if (b.exponent - this.exponent <= -MANTISSA_PRECISION)
            // b is too small to matter, ignore
            return this;
        if (this.exponent - b.exponent <= -MANTISSA_PRECISION)
            // we are too small to matter
            return b;

        b = b.clone();
        while (b.exponent > this.exponent) {
            b.exponent --;
            b.mantissa *= 10;
        }
        while (b.exponent < this.exponent) {
            b.exponent ++;
            b.mantissa *= 0.1;
        }
        this.mantissa += b.mantissa;
        return this.normalize();
    }

    add(b: Big) {
        return this.clone().addEq(b);
    }

    divEq(b: Big) {
        return this.mulEq(new Big(b.mantissa, -b.exponent));
    }

    div(b: Big) {
        return this.clone().divEq(b);
    }

    subEq(b: Big) {
        return this.addEq(new Big(-b.mantissa, b.exponent));
    }

    sub(b: Big){
        return this.clone().subEq(b);
    }

    lt(b: Big) {
        if (b.infinite || !this.infinite) return true;
        return (b.exponent > this.exponent) || (b.exponent === this.exponent && b.mantissa > this.mantissa);
    }

    gt(b: Big) {
        if (!b.infinite || this.infinite) return true;
        return (b.exponent < this.exponent) || (b.exponent === this.exponent && b.mantissa < this.mantissa);
    }

    lte(b: Big) {
        if (b.infinite || !this.infinite) return true;
        return (b.exponent > this.exponent) || (b.exponent === this.exponent && b.mantissa >= this.mantissa);
    }

    gte(b: Big) {
        if (!b.infinite || this.infinite) return true;
        return (b.exponent < this.exponent) || (b.exponent === this.exponent && b.mantissa <= this.mantissa);
    }

    /**
     * Rounds towards zero
     */
    floorEq() {
        if (this.exponent < 0) {
            this.mantissa = 0;
            this.exponent = 0;
            return this;
        }
        if (this.exponent > MANTISSA_PRECISION) {
            // too small, ignore
            return this;
        }
        while (this.exponent > 0) {
            this.mantissa *= 10;
            this.exponent --;
        }
        this.mantissa = Math.floor(this.mantissa);
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
        if (this.exponent < 0) {
            this.mantissa = 0;
            this.exponent = 0;
            return this;
        }
        if (this.exponent > MANTISSA_PRECISION) {
            // too small, ignore
            return this;
        }
        while (this.exponent > 0) {
            this.mantissa *= 10;
            this.exponent --;
        }
        this.mantissa = Math.ceil(this.mantissa);
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
        let first = nums[0];
        for (const c of nums) {
            if (c.gt(first)) first = c;
        }
        return first;
    }

    static min(...nums: Big[]): Big {
        let first = nums[0];
        for (const c of nums) {
            if (c.lt(first)) first = c;
        }
        return first;
    }

    static sum(...nums: Big[]): Big {
        let first = nums[0].clone();
        for (const c of nums) {
            first.addEq(c);
        }
        return first;
    }
}