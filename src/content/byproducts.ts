import { partialItems } from "./itemNames";

/**
 * instead of producing 1 of the listed item, use these tables to determine what to create instead.
 * each item in the array is guaranteed to produce one of the items
 * determined by their relative values
 */
const byproducts: partialItems<partialItems<number>[]> = {
    land: [
        { "iron-node": 1 },
        { "stony-land": 1 },
        { "wet-land": 1 },
        { "copper-node": 1 },
        { "coal-node": 1 },
        { "sandy-land": 1 },
        { wood: 1 },
    ],
    begin: [{ begin: 1 }, { prospector: 1 }],
    u235: [{ u235: 0.1, u234: 0.9 }, { slag: 1 }],
    "evaporate-water": [{ "wet-land": 1 }],
};

export default {
    byproducts,
};
