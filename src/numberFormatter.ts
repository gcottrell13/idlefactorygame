import _ from "lodash";
import Big from "./bigmath";


const scale_exp = SCALE_N.toString().length;

export enum NumberFormat {
    SUFFIX = 'suffix',
    EXPONENT = 'exponent',
}

let mode: NumberFormat = NumberFormat.SUFFIX;

export function setMode(s: NumberFormat) {
    mode = s;
}

export function formatNumber(n: number | bigint | null | undefined) {
    if (!n) {
        return '0';
    }

    const isBig = (typeof n === 'bigint' && n >= 1000n * SCALE_N) || (
        typeof n === 'number' && n >= 1000
    );

    if (isBig) {
        if (typeof n === 'number') {
            if (n == Infinity) return "Infinity";
            n = NumToBig(Math.floor(n));
        }

        const rep = n.toString();
        const exp = rep.length - scale_exp;
        const majorExp = Math.floor(exp / 3);
        const minorExp = exp % 3;

        const r = (parseInt(rep.substring(0, minorExp + 3)) / 100).toFixed(2);
        if (mode === NumberFormat.SUFFIX) {
            return r + ' ' + (bigExponents[majorExp] ?? `e${exp}`);
        }
        else if (mode === NumberFormat.EXPONENT) {
            return r + ' ' + `e${exp}`;
        }
    }

    if (typeof n === 'bigint') {
        n = bigToNum(n);
    }
    let value = n.toFixed(2);
    if (value.endsWith('.00')) return Math.floor(n);
    return value.substring(0, value.indexOf('.') + 3);
}

export function formatSeconds(n: number) {
    let seconds = Math.floor(n);
    let minutes = "00";
    let hours = "00";
    if (seconds >= 3600) {
        hours = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        seconds = seconds % 3600;
    }
    if (seconds >= 60) {
        minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        seconds = seconds % 60;
    }
    return `${hours}:${minutes}:${seconds.toString().padStart(2, "0")}`;
}


const under30 = [
    '',
    'K',
    'M',
    'B',
    'T',
    'Qa',
    'Qi',
    'Sx',
    'Sp',
    'Oc',
    'N',
];
const firstOrder = [
    '',
    'U',
    'D',
    'T',
    'Q',
    'Qi',
    'Sx',
    'St',
    'Oc',
    'N',
];

const secondOrder = [
    'Dc',
    'Vi',
    'Tr',
    'Ta',
    'Qui',
    'Sxt',
    'Stt',
    'Oct',
    'Nc',
];

const thirdOrder = [
    '',
    'Ct',
    'Vc',
    'Tc',
    'Qc',
    'Qmc',
    'Sic',
    'Stc',
    'Occ',
    'Ntc',
];


const crossproduct = _.flatMapDeep(thirdOrder.map(third => {
    const s = secondOrder.map(second => {
        return firstOrder.map(first => {
            return `${third}${first}${second}`;
        });
    });
    return ['Ct', ...s];
}));
const bigExponents = _.concat(under30, crossproduct);

const bigLookup = _.fromPairs(bigExponents.map((exp, i) => {
    return [exp, i];
}));

((document as any).game ??= {}).REALLY_BIG_FORMATTED = formatNumber(REALLY_BIG);
((document as any).game ??= {}).bigExponents = bigExponents;

export function parseFormat(amount: number | bigint | string): bigint {
    if (typeof amount === 'number') return NumToBig(amount);
    if (typeof amount === 'bigint') return amount;

    let [mantissaStr, exp] = amount.split(' ');

    if (_.isEmpty(exp)) {
        return NumToBig(parseFloat(mantissaStr));
    }

    const mantissa = parseFloat(mantissaStr);

    function scale(exponent: string | number) {
        if (typeof exponent === 'string') exponent = parseInt(exponent);
        const power = 10n ** BigInt(exponent);
        return scaleBigInt(power, mantissa) * SCALE_N;
    }

    const power = bigLookup[exp] ?? -1;

    if (power == -1)
        throw new Error(`unable to parse ${amount}`);

    return scale(power * 3);
}