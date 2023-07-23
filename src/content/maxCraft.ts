import { partialItems } from "./itemNames";

const ABSOLUTE_MAX_CRAFT = 1000;
const maxCraftAtATime: partialItems<number> = {
    "copper-ore": 2,
    "iron-ore": 2,
    coal: 2,
    stone: 2,
    begin: 1,
};

export default {
    ABSOLUTE_MAX_CRAFT,
    maxCraftAtATime,
};
