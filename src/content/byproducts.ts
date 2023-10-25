import { partialItems } from "./itemNames";

/**
 * instead of producing 1 of the listed item, use these tables to determine what to create instead.
 * each item in the array is guaranteed to produce one of the items
 * determined by their relative values
 */
const byproducts: partialItems<partialItems<number>[]> = {
    begin: [{ begin: 1 }, { prospector: 1 }, { food: 1 }],
    "research-woodcutting": [{ "research-woodcutting": 1 }, { lumberjack: 1 }],
    u235: [{ u235: 0.1, u234: 0.9 }, { slag: 1 }],

    "consume-arcane-wizard": [{ "wizard-degree": 1 }, { "consume-arcane-wizard": 1 }],
    "consume-fire-wizard": [{ "wizard-degree": 1 }, { "consume-fire-wizard": 1 }],
    "consume-necro-wizard": [{ "wizard-degree": 1 }, { "consume-necro-wizard": 1 }],
    "consume-wizard-pop": [{ "wizard-power": 1 }],

    "redeem-mc--science5": [{ "science5": 1 }],
    "redeem-mc--assembler": [{ "assembler": 1 }],
};

const hideByproducts: partialItems<boolean> = {
    "redeem-mc--assembler": true,
    "redeem-mc--science5": true,
};

export default {
    byproducts,
    hideByproducts,
};
