import Big from "../bigmath";
import { fromPairs, mapPairs } from "../smap";
import { State } from "../typeDefs/State";
import { GAMEVALUES } from "../values";
import { Items, partialItems } from "./itemNames";

type maxCraftFunc = (game: GAMEVALUES, amt: State) => Big;
type pairsType = [Items, maxCraftFunc | Big];


function maxCraftByAssemblerSpeed(game: GAMEVALUES, state: State, item: Items) {
    const pairs = mapPairs(state.assemblers[item], (numAssemblers, assemblerName) => {
        const boostingItem = game.buildingBoosts[assemblerName];
        if (!boostingItem) return numAssemblers;
        return numAssemblers.mul(game.calculateBoost(assemblerName, state).normalize());
    });
    return Big.sum(...pairs);
}



const ABSOLUTE_MAX_CRAFT = Big.Two;
const maxCraftAtATime: partialItems<number | maxCraftFunc> = {
    "copper-ore": 2,
    "iron-ore": 2,
    coal: 2,
    stone: 2,
    begin: 1,
    "wizard-degree": 100,
    "wizard-essence": 10,
    // money: (game, state) => bigMax(ABSOLUTE_MAX_CRAFT, maxCraftByAssemblerSpeed(game, state, "money")),
    bank: (game, state) => Big.max(ABSOLUTE_MAX_CRAFT, (state.assemblers["money"]?.["bank"] ?? Big.Zero).mul(Big.Ten)),
};

const m = fromPairs(mapPairs(maxCraftAtATime, (amount, item) => {
    if (typeof amount === "number")
        return [item, Big.fromNumberOrBigInt(amount)] as pairsType;
    return [item, amount] as pairsType;
}));

export default {
    ABSOLUTE_MAX_CRAFT,
    maxCraftAtATime: m,
};
