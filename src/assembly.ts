import GAME from "./values";
import { Items } from "./content/itemNames";
import _ from "lodash";
import { SMap, keys, mapPairs } from "./smap";
import { State } from "./typeDefs/State";
import Big from "./bigmath";
import { dispatch } from "./content/actions";


export function checkAmounts(
    amounts: SMap<Big>,
    requirements: SMap<Big>,
) {
    return mapPairs(
        requirements,
        (amt, key) => (amounts[key] ?? 0) >= amt,
    ).every((x) => x === true);
}

export function howManyRecipesCanBeMade(
    itemName: Items,
    amounts: SMap<Big>,
): Big {
    const recipe = GAME.recipes[itemName];
    if (recipe === undefined) return Big.Zero;

    let numberOfRecipesToMake = Big.Infinity;

    const scale = GAME.calculateRecipeScale(itemName, amounts[itemName]);

    _.toPairs(recipe).forEach((pair) => {
        let [ingredientName, requiredCount] = pair;
        const totalRequired = requiredCount.mul(scale);
        // const totalRequired = requiredCount * scale;
        const weHave = amounts[ingredientName] ?? Big.Zero;
        if (weHave.lt(totalRequired)) {
            numberOfRecipesToMake = Big.Zero;
        } else {
            numberOfRecipesToMake = Big.min(
                weHave.div(totalRequired),
                numberOfRecipesToMake,
            );
        }
    });

    return numberOfRecipesToMake.floorEq();
}

export function consumeMaterials(
    itemName: Items | undefined,
    amountWeHave: SMap<Big>,
    recipe: SMap<Big>,
    recipeCount: Big
) {
    const scale = itemName
        ? GAME.calculateRecipeScale(itemName, amountWeHave[itemName])
        : recipeCount;

    _.toPairs(recipe).forEach((pair) => {
        let [ingredientName, requiredCount] = pair;
        const toGrab = requiredCount.mul(scale);

        const weHave = amountWeHave[ingredientName] ?? 0n;
        amountWeHave[ingredientName] = Big.max(Big.Zero, weHave.sub(toGrab));
    });
}

export function consumeMaterialsFromRecipe(
    itemName: Items,
    amounts: SMap<Big>,
    recipeCount: Big,
): boolean {
    const recipe = GAME.recipes[itemName];
    if (recipe === undefined) return false;
    // not producing, so let's try to grab materials

    if (howManyRecipesCanBeMade(itemName, amounts).lt(recipeCount)) return false;

    consumeMaterials(itemName, amounts, recipe, recipeCount);
    return true;
}

export function checkVisible(state: State, dispatch: dispatch) {
    const {
        visible,
        amountThatWeHave,
    } = state;
    let discoveredSomething = true;
    const itemsDiscovered: Items[] = [];
    function _visible(itemName: Items) {
        dispatch({ action: 'unhide-item', itemName: itemName });
        itemsDiscovered.push(itemName);
        discoveredSomething = true;
    }

    while (discoveredSomething) {
        discoveredSomething = false;
        GAME.allItemNames.forEach((itemName) => {
            if (visible[itemName] === undefined) {
                const unlockedWith = GAME.unlockedWith[itemName].every(
                    (x) => (amountThatWeHave[x] ?? Big.Zero).mantissa > 0,
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

export function hideTheHideOnBuyItems(state: State) {
    const {
        visible,
        amountThatWeHave,
    } = state;
    GAME.allItemNames.forEach((itemName) => {
        if (GAME.hideOnBuy(itemName) && (amountThatWeHave[itemName] ?? Big.Zero).mantissa > 0) {
            visible[itemName] = false;
        }
    });
}
