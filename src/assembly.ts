import GAME from "./values";
import { Items } from "./content/itemNames";
import _ from "lodash";
import { SMap, keys, mapPairs } from "./smap";
import { State } from "./typeDefs/State";

const PRECISION = 1e5;
export function round(n: number) {
    return Math.round(n * PRECISION) / PRECISION;
}

export function checkAmounts(
    amounts: SMap<number>,
    requirements: SMap<number>,
) {
    return mapPairs(
        requirements,
        (amt, key) => (amounts[key] ?? 0) >= amt,
    ).every((x) => x === true);
}

export function howManyRecipesCanBeMade(
    itemName: Items,
    amounts: SMap<number>,
): number {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return 0;

    let numberOfRecipesToMake = Number.MAX_SAFE_INTEGER;

    _.toPairs(recipe).forEach((pair) => {
        const [ingredientName, requiredCount] = pair;
        const weHave = amounts[ingredientName] ?? 0;
        if (weHave < requiredCount) {
            numberOfRecipesToMake = 0;
        } else {
            numberOfRecipesToMake = Math.min(
                Math.floor(weHave / requiredCount),
                numberOfRecipesToMake,
            );
        }
    });

    return numberOfRecipesToMake;
}

export function consumeMaterials(
    amountWeHave: SMap<number>,
    recipe: SMap<number>,
) {
    _.toPairs(recipe).forEach((pair) => {
        const [ingredientName, requiredCount] = pair;
        const toGrab = requiredCount;

        const weHave = amountWeHave[ingredientName] ?? 0;
        amountWeHave[ingredientName] = round(Math.max(0, weHave - toGrab));
    });
}

export function consumeMaterialsFromRecipe(
    itemName: Items,
    amounts: SMap<number>,
): number | null {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return 0;
    // not producing, so let's try to grab materials

    if (howManyRecipesCanBeMade(itemName, amounts) <= 0) return null;

    consumeMaterials(amounts, recipe);
    return 0;
}

export function checkVisible(state: State) {
    const { visible, amountThatWeHave, acknowledged } = state;
    let discoveredSomething = true;
    const itemsDiscovered: Items[] = [];
    function _visible(itemName: Items) {
        visible[itemName] = true;
        acknowledged[itemName] ??= false;
        itemsDiscovered.push(itemName);
        discoveredSomething = true;
    }

    while (discoveredSomething) {
        discoveredSomething = false;
        GAME.allItemNames.forEach((itemName) => {
            if (visible[itemName] === undefined) {
                const unlockedWith = GAME.unlockedWith(itemName).every(
                    (x) => amountThatWeHave[x] ?? 0,
                );
                if (GAME.unlockedWith(itemName).length > 0 && unlockedWith) {
                    _visible(itemName);
                    return;
                }

                const required = GAME.requiredBuildings(itemName);
                const haveBuilding =
                    required.some((x) => visible[x as Items]) ||
                    required.includes("by-hand");
                const recipe = GAME.recipes(itemName);
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
