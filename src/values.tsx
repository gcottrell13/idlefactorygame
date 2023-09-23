import _ from "lodash";
import { keys, mapPairs, mapValues, values } from "./smap";
import { Items, itemsMap, partialItems } from "./content/itemNames";
import buildings from "./content/buildings";
import byproducts from "./content/byproducts";
import displayStrings from "./content/displayStrings";
import hideOnBuy from "./content/hideOnBuy";
import recipeValues from "./content/recipeValues";
import storage from "./content/storage";
import layout from "./content/layout";
import unlockedWith from "./content/unlockedWith";
import maxCraft from "./content/maxCraft";
import { NumToBig, SCALE, SCALE_N, bigToNum, bigpow } from "./bigmath";
import { State } from "./typeDefs/State";

const byproductRatesPerSecond: partialItems<partialItems<number>> = {};
const recipesConsumingThis: partialItems<Items[]> = {};

const allItemNames = keys(recipeValues.recipes).sort();
allItemNames.shift();
const unlocks: partialItems<Items[]> = {};
keys(unlockedWith.unlockedWith).forEach((l) => {
    unlockedWith.unlockedWith[l]?.forEach((k) => {
        unlocks[k] ??= [];
        unlocks[k]?.push(l);
    });
});

function fillWithDefault<T>(partial: partialItems<T>, defaultItem: () => any): itemsMap<T> {
    allItemNames.forEach(name => {
        if (partial[name] === undefined) {
            partial[name] = defaultItem();
        }
    });
    return partial as itemsMap<T>;
}

type BigIntRecipes = itemsMap<partialItems<bigint>>;

const ex = {
    sections: layout.sections,
    assemblerSpeeds: fillWithDefault(buildings.assemblerSpeeds, () => 0),
    byHandVerbs: fillWithDefault(displayStrings.byHandVerbs, () => "craft"),
    displayNames: (item: Items | "by-hand"): string =>
        item === "by-hand"
            ? "By Hand"
            : displayStrings.displayNames[item] ?? item,
    hideOnBuy: (item: Items): boolean => hideOnBuy.hideOnBuy.includes(item),
    itemsCanBeStoreIn: fillWithDefault(storage.itemsCanBeStoreIn, () => []) as itemsMap<Items[]>,
    recipeScaleFactor: fillWithDefault(recipeValues.recipeScaleFactor, () => 1.0),
    recipes: mapValues(recipeValues.recipes, recipe => mapValues(recipe, v => NumToBig(v))) as BigIntRecipes,
    requiredBuildings: (item: Items): (Items | "by-hand")[] =>
        buildings.requiredBuildings[item] ?? ["by-hand"],
    timePerRecipe: recipeValues.timePerRecipe,
    sideProducts: fillWithDefault(byproducts.byproducts, () => []),
    storageSizes: fillWithDefault(storage.storageSizes, () => 0n),
    unlockedWith: fillWithDefault(unlockedWith.unlockedWith, () => []),
    unlocks: fillWithDefault(unlocks, () => []),

    allItemNames: allItemNames,
    allAssemblers: keys(buildings.assemblerSpeeds),

    /**
     *
     * @param item the item made as a byproduct
     * @returns the recipes that make this item as a byproduct
     */
    makesAsASideProduct: (item: Items) => makesAsASideProduct[item],

    maxCraftAtATime: (item: Items, state: State) => {
        const max = maxCraft.maxCraftAtATime[item] ?? maxCraft.ABSOLUTE_MAX_CRAFT;
        if (typeof max === 'bigint') {
            return max;
        }
        return max(ex, state);
    },

    flavorText: displayStrings.flavorText,
    byproductRatesPerSecond: fillWithDefault(byproductRatesPerSecond, () => ({})),

    recipesConsumingThis: fillWithDefault(recipesConsumingThis, () => []),
    MIN_STORAGE: NumToBig(storage.MIN_STORAGE),
    buildingPowerRequirementsPerSecond: fillWithDefault(
        mapValues(buildings.buildingPowerRequirementsPerSecond, recipe => mapValues(recipe, v => NumToBig(v))), 
        () => ({}),
    ) as BigIntRecipes,

    buildingBoosts: buildings.buildingBoosts as partialItems<Items>,
    buildingBoostTiers: fillWithDefault(buildings.buildingBoostTiers, () => buildings.defaultBuildingBoostTiers),
    buildingPowerDisplayWord: buildings.buildingPowerDisplayWord,
    calculateBoost: (boostingItem: Items | undefined, amount: bigint | undefined): number => {
        if (!amount || !boostingItem) return 1;
        const boost = ex.buildingBoostTiers[boostingItem][Number(amount) / SCALE];
        if (!boost) return 2 ** bigToNum(amount);
        return boost;
    },
    calculateRecipeScale: (item: Items | undefined, amount: bigint | undefined): bigint => {
        if (!item || !amount) return SCALE_N;
        const scale = ex.recipeScaleFactor[item];
        return bigpow(scale, amount);
    },
};

keys(recipeValues.recipes).forEach((item) => {
    if (item.startsWith("research-")) {
        displayStrings.byHandVerbs[item] = "research";
        maxCraft.maxCraftAtATime[item] = NumToBig(1);
    }

    // calculate side product rates per second (assuming constructor rate 1x)
    if (byproducts.byproducts[item]) {
        const rate = recipeValues.timePerRecipe[item];
        byproducts.byproducts[item]?.forEach((pool) => {
            const sum = _.sum(values(pool));
            keys(pool).forEach((byproduct) => {
                byproductRatesPerSecond[byproduct] ??= {};
                byproductRatesPerSecond[byproduct]![item] ??= 0;
                const chance = pool[byproduct] ?? 0;
                byproductRatesPerSecond[byproduct]![item]! +=
                    chance / sum / rate;
            });
        });
    }

    const recipe = recipeValues.recipes[item];
    mapPairs(recipe, (count, ingredient) => {
        (recipesConsumingThis[ingredient] ??= []).push(item);
    });
});

const makesAsASideProduct = mapValues(recipeValues.recipes, (_, item) => {
    return keys(byproducts.byproducts).filter(
        (mainOutput) =>
            mainOutput !== item &&
            ex.sideProducts[mainOutput].some((p) => p[item]),
    );
});


export type GAMEVALUES = typeof ex;
export default ex;
