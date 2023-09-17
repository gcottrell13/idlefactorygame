import { NumToBig } from "../bigmath";
import { fromPairs, mapPairs } from "../smap";
import { partialItems } from "./itemNames";

const ABSOLUTE_MAX_CRAFT = NumToBig(2);
const maxCraftAtATime: partialItems<number> = {
    "copper-ore": 2,
    "iron-ore": 2,
    coal: 2,
    stone: 2,
    begin: 1,
};

export default {
    ABSOLUTE_MAX_CRAFT,
    maxCraftAtATime: fromPairs(mapPairs(maxCraftAtATime, (amount, item) => {
        return [item, NumToBig(amount)];
    })),
};
