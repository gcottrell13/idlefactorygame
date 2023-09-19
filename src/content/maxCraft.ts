import { NumToBig, SCALE_N, bigSum, scaleBigInt } from "../bigmath";
import { fromPairs, mapPairs } from "../smap";
import { State } from "../typeDefs/State";
import { GAMEVALUES } from "../values";
import { Items, partialItems } from "./itemNames";

type maxCraftFunc = (game: GAMEVALUES, amt: State) => bigint;
type pairsType = [Items, maxCraftFunc | bigint];


function maxCraftByAssemblerSpeed(game: GAMEVALUES, state: State, item: Items) {
    const pairs = mapPairs(state.assemblers[item], (numAssemblers, assemblerName) => {
        const boostingItem = game.buildingBoosts[assemblerName];
        if (!boostingItem) return numAssemblers;
        return scaleBigInt(numAssemblers, 
            game.calculateBoost(boostingItem, state.amountThatWeHave[boostingItem]));
    });
    return bigSum(pairs);
}



const ABSOLUTE_MAX_CRAFT = NumToBig(2);
const maxCraftAtATime: partialItems<number | maxCraftFunc> = {
    "copper-ore": 2,
    "iron-ore": 2,
    coal: 2,
    stone: 2,
    begin: 1,
    "wizard-degree": 100,
    money: (game, state) => maxCraftByAssemblerSpeed(game, state, "money"),
    bank: (game, state) => 10n * (state.assemblers["money"]?.["bank"] ?? 0n) / 100n,
};

const m = fromPairs(mapPairs(maxCraftAtATime, (amount, item) => {
    if (typeof amount === "number")
        return [item, NumToBig(amount)] as pairsType;
    return [item, amount] as pairsType;
}));

export default {
    ABSOLUTE_MAX_CRAFT,
    maxCraftAtATime: m,
};
