import _ from "lodash";
import Decimal from "decimal.js";

export enum NumberFormat {
    SUFFIX = 'suffix',
    EXPONENT = 'exponent',
}

let mode: NumberFormat = NumberFormat.SUFFIX;

export function setMode(s: NumberFormat) {
    mode = s;
}

export function formatNumber(n: Decimal | null | undefined) {
    if (!n) {
        return '0';
    }

    if (n.e >= 3) {
        const rep = n.d.join('');
        const exp = rep.length;
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

    let value = n.toNumber().toFixed(2);
    if (value.endsWith('.00')) return Math.floor(n.toNumber());
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

((document as any).game ??= {}).bigExponents = bigExponents;

export function parseFormat(amount: number | bigint | Decimal | string): Decimal {
    if (amount instanceof Decimal) return amount;
    if (typeof amount == 'bigint') return new Decimal(amount.toString());
    return new Decimal(amount);
}