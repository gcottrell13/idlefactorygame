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

    if (n.e <= 30) {
        const factor = Math.floor(n.e / 3);
        if (factor < 1)
            return n.toNumber();
        const lead = (n.toNumber() / Math.pow(10, factor * 3)).toFixed(2);
        return `${lead} ${under30[factor]}`;
    }

    return n.toString();
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
    'No',
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