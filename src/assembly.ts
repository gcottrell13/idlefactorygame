import GAME from "./values";
import { Items } from "./content/itemNames";
import _ from "lodash";
import { SMap, keys, mapPairs } from "./smap";
import { State } from "./typeDefs/State";
import { NumToBig, REALLY_BIG, SCALE_N, bigMax, bigMin, bigToNum, bigpow, scaleBigInt } from "./bigmath";

const PRECISION = 1e5;
export function round(n: number) {
    return Math.round(n * PRECISION) / PRECISION;
}

export function checkAmounts(
    amounts: SMap<bigint>,
    requirements: SMap<bigint>,
) {
    return mapPairs(
        requirements,
        (amt, key) => (amounts[key] ?? 0) >= amt,
    ).every((x) => x === true);
}

export function howManyRecipesCanBeMade(
    itemName: Items,
    amounts: SMap<bigint>,
): bigint {
    const recipe = GAME.recipes[itemName];
    if (recipe === undefined) return 0n;

    let numberOfRecipesToMake = REALLY_BIG;

    const scale = Math.pow(
        GAME.recipeScaleFactor[itemName],
        bigToNum(amounts[itemName] ?? 0n),
    );

    _.toPairs(recipe).forEach((pair) => {
        let [ingredientName, requiredCount] = pair;
        const totalRequired = bigToNum(requiredCount) * scale;
        const weHave = amounts[ingredientName] ?? 0;
        if (weHave < totalRequired) {
            numberOfRecipesToMake = 0n;
        } else {
            numberOfRecipesToMake = bigMin(
                scaleBigInt(weHave, 1 / totalRequired),
                numberOfRecipesToMake,
            );
        }
    });

    return numberOfRecipesToMake;
}

export function consumeMaterials(
    itemName: Items | undefined,
    amountWeHave: SMap<bigint>,
    recipe: SMap<bigint>,
    recipeCount: bigint
) {
    const scale = itemName ? bigToNum(scaleBigInt(recipeCount, Math.pow(
        GAME.recipeScaleFactor[itemName],
        bigToNum(amountWeHave[itemName] ?? 0n),
    ))) : 1;

    _.toPairs(recipe).forEach((pair) => {
        let [ingredientName, requiredCount] = pair;
        const toGrab = scaleBigInt(requiredCount, scale);

        const weHave = amountWeHave[ingredientName] ?? 0n;
        amountWeHave[ingredientName] = bigMax(0n, weHave - toGrab);
    });
}

export function consumeMaterialsFromRecipe(
    itemName: Items,
    amounts: SMap<bigint>,
    recipeCount: bigint,
): boolean {
    const recipe = GAME.recipes[itemName];
    if (recipe === undefined) return false;
    // not producing, so let's try to grab materials

    if (howManyRecipesCanBeMade(itemName, amounts) < recipeCount) return false;

    consumeMaterials(itemName, amounts, recipe, recipeCount);
    return true;
}

export function checkVisible(state: State) {
    const {
        visible,
        amountThatWeHave,
        acknowledged,
        timeSpentPlaying,
        timeUnlockedAt,
    } = state;
    let discoveredSomething = true;
    const itemsDiscovered: Items[] = [];
    function _visible(itemName: Items) {
        visible[itemName] = true;
        acknowledged[itemName] ??= false;
        itemsDiscovered.push(itemName);
        discoveredSomething = true;
        timeUnlockedAt[itemName] ??= timeSpentPlaying;
    }

    while (discoveredSomething) {
        discoveredSomething = false;
        GAME.allItemNames.forEach((itemName) => {
            if (visible[itemName] === undefined) {
                const unlockedWith = GAME.unlockedWith[itemName].every(
                    (x) => (amountThatWeHave[x] ?? 0) > 0,
                );
                if (GAME.unlockedWith[itemName].length > 0 && unlockedWith) {
                    _visible(itemName);
                    return;
                }
                if (!unlockedWith) {
                    return;
                }

                const required = GAME.requiredBuildings(itemName);
                const haveBuilding =
                    required.some((x) => visible[x as Items]) ||
                    required.includes("by-hand");
                const recipe = GAME.recipes[itemName];
                const haveIngredients = keys(recipe).every(
                    (key) => visible[key as Items],
                );
                if (
                    haveBuilding &&
                    unlockedWith &&
                    (keys(recipe).length === 0 || haveIngredients)
                ) {
                    _visible(itemName);
                    return;
                }

                if (
                    GAME.makesAsASideProduct(itemName).some((x) => visible[x])
                ) {
                    _visible(itemName);
                    return;
                }
            }
        });
    }

    return itemsDiscovered;
}
