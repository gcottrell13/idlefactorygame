import { NumToBig, SCALE, SCALE_N, bigToNum } from "./bigmath";


const scale_exp = SCALE_N.toString().length;

const powers: {[p: number]: string} = {
    0: '',
    1: 'K',
    2: 'M',
    3: 'B',
    4: 'T',
    5: 'Qa',
    6: 'Qi',
    7: 'Sx',
    8: 'Sp',
    9: 'Oc',
    10: 'N',
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
        if (powers[majorExp] !== undefined) {
            return r + ' ' + powers[majorExp];
        }
        return r + ' ' + powers_over_100(exp) + powers_under_30(exp) + powers_under_100(exp);
    }
    
    if (typeof n === 'bigint')  {
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


function powers_under_30(exp: number) {
    return {
        0: '',
        1: 'U',
        2: 'D',
        3: 'T',
        4: 'Qa',
        5: 'Qi',
        6: 'Sx',
        7: 'St',
        8: 'Oc',
        9: 'N',
    }[Math.floor(exp / 3) % 10];
}

function powers_under_100(exp: number) {
    return {
        0: '',
        1: 'Dc',
        2: 'Vi',
        3: 'Tr',
        4: 'Ta',
        5: 'Qui',
        6: 'Sxt',
        7: 'Stt',
        8: 'Oct',
        9: 'Nc',
    }[Math.floor(exp / 30) % 10];
}

function powers_over_100(exp: number) {
    return {
        0: '',
        1: 'Ct',
        2: 'VoiceChat',
        3: 'TwitchStream',
        4: 'QuantumTunnel',
        5: 'QuickMart',
        6: 'Sextant',
        7: 'Stilts',
        8: 'Octal',
        9: 'Nonnonun',
    }[Math.floor(exp / 300) % 10];
}