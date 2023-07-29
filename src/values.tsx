import _ from "lodash";
import { SMap, keys, mapValues, values } from "./smap";
import { Items, partialItems } from "./content/itemNames";
import buildings, { Buildings } from "./content/buildings";
import byproducts from "./content/byproducts";
import displayStrings from "./content/displayStrings";
import hideOnBuy from "./content/hideOnBuy";
import recipeValues, { Recipe } from "./content/recipeValues";
import storage from "./content/storage";
import layout from "./content/layout";
import unlockedWith from "./content/unlockedWith";
import maxCraft from "./content/maxCraft";

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

const ex = {
    sections: layout.sections,
    assemblerSpeeds: (item: Items): number =>
        (buildings.assemblerSpeeds as SMap<number>)[item] ?? 0,
    byHandVerbs: (item: Items): string =>
        displayStrings.byHandVerbs[item] ?? "craft",
    displayNames: (item: Items | "by-hand"): string =>
        item === "by-hand"
            ? "By Hand"
            : displayStrings.displayNames[item] ?? item,
    hideOnBuy: (item: Items): boolean => hideOnBuy.hideOnBuy.includes(item),
    itemsCanBeStoreIn: (item: Items): Items[] =>
        storage.itemsCanBeStoreIn[item] ?? [],
    recipeScaleFactor: (item: Items): number =>
        recipeValues.recipeScaleFactor[item] ?? 1.0,
    recipes: (item: Items): Recipe => recipeValues.recipes[item],
    requiredBuildings: (item: Items): (Items | "by-hand")[] =>
        buildings.requiredBuildings[item] ?? ["by-hand"],
    timePerRecipe: (item: Items): number => recipeValues.timePerRecipe[item],
    sideProducts: (item: Items): partialItems<number>[] =>
        byproducts.byproducts[item] ?? [],
    storageSizes: (item: Items): number =>
        (storage.storageSizes as SMap<number>)[item] ?? 0,
    unlockedWith: (item: Items): Items[] =>
        unlockedWith.unlockedWith[item] ?? [],
    unlocks: (item: Items): Items[] => unlocks[item] ?? [],

    allItemNames: allItemNames,
    allAssemblers: keys(buildings.assemblerSpeeds),

    /**
     *
     * @param item the item made as a byproduct
     * @returns the recipes that make this item as a byproduct
     */
    makesAsASideProduct: (item: Items) => makesAsASideProduct[item],

    maxCraftAtATime: (item: Items) =>
        maxCraft.maxCraftAtATime[item] ?? maxCraft.ABSOLUTE_MAX_CRAFT,

    flavorText: displayStrings.flavorText,
    byproductRatesPerSecond: (item: Items) =>
        byproductRatesPerSecond[item] ?? {},

    recipesConsumingThis: (item: Items) => recipesConsumingThis[item] ?? [],
    MIN_STORAGE: storage.MIN_STORAGE,
    buildingPowerRequirementsPerSecond: (item: Items) =>
        buildings.buildingPowerRequirementsPerSecond[item] ?? {},

    buildingBoosts: buildings.buildingBoosts as partialItems<Items>,
    buildingPowerDisplayWord: buildings.buildingPowerDisplayWord,
};

keys(recipeValues.recipes).forEach((item) => {
    if (item.startsWith("research-")) {
        displayStrings.byHandVerbs[item] = "research";
        maxCraft.maxCraftAtATime[item] = 1;
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
    keys(recipe).forEach((ingredient) => {
        (recipesConsumingThis[ingredient] ??= []).push(item);
    });
});

const makesAsASideProduct = mapValues(recipeValues.recipes, (_, item) => {
    return keys(byproducts.byproducts).filter(
        (mainOutput) =>
            mainOutput !== item &&
            ex.sideProducts(mainOutput).some((p) => p[item]),
    );
});

export default ex;
