import _ from "lodash";
import { Items, partialItems } from "../content/itemNames";
import { mapPairs, keys, fromPairs } from "../smap";
import { PRODUCTION_OUTPUT_BLOCKED, State } from "../typeDefs/State";
import GAME from "../values";
import { bigMul, bigSum, bigToNum, scaleBigInt } from "../bigmath";

export function useCalculateRates(state: State, itemFilter: Items[]) {
    const effectiveProductionRates: partialItems<partialItems<bigint>> = {};
    const maxConsumptionRates: partialItems<bigint> = {};
    const effectiveConsumptionRates: partialItems<partialItems<bigint>> = {};

    function addToMaxRate(ingredient: Items, rate: bigint) {
        if (maxConsumptionRates[ingredient] === undefined) {
            maxConsumptionRates[ingredient] = 0n;
        }
        maxConsumptionRates[ingredient]! += rate;
    }

    /**
     * [what's being consumed][the building]
     */
    const powerConsumptionRates: partialItems<
        partialItems<[count: bigint, total: bigint, consumption: bigint]>
    > = {};

    const { assemblers, disabledRecipes, productionState } = state;

    function assemblerStuck(itemName: Items, assembler: Items) {
        return (
            (productionState[itemName] ?? {})[assembler] ===
            PRODUCTION_OUTPUT_BLOCKED
        );
    }
    function assemblerIsStuckOrDisabled(itemName: Items, assembler: Items) {
        if (disabledRecipes[itemName]) return "disabled";
        if (assemblerStuck(itemName, assembler)) return "full";
        return false;
    }

    const assemblerBoosts: partialItems<number> = fromPairs(
        GAME.allAssemblers.map((assemblerName) => [
            assemblerName,
            GAME.calculateBoost(assemblerName, state)
        ]),
    );

    function getBoost(item: Items) {
        return assemblerBoosts[item] ?? 1;
    }

    itemFilter.forEach((itemName) => {
        const production: partialItems<bigint> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond[itemName], (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName && disabledRecipes[producer]
                        ? 0n
                        : scaleBigInt(assemblerNumber, GAME.assemblerSpeeds[assemblerName] *
                            getBoost(assemblerName) *
                            rate),
            );
            production[producer] = bigSum(speeds);
        });

        if (GAME.sideProducts[itemName].length === 0) {
            const assemblersMakingThis = assemblers[itemName] ?? {};
            const baseCraftTime = GAME.timePerRecipe[itemName];
            mapPairs(assemblersMakingThis, (assemblerCount, assemblerName) => {
                const speed =
                    scaleBigInt(assemblerCount, GAME.assemblerSpeeds[assemblerName] *
                        getBoost(assemblerName) / baseCraftTime)
                    ;
                production[assemblerName] = speed;
            });
        }
    });

    function addAssemblerPowerConsumption(
        assemblerName: Items,
        count: bigint,
        recipeName: Items,
    ) {
        const power = GAME.buildingPowerRequirementsPerSecond[assemblerName];
        const counted = !assemblerIsStuckOrDisabled(recipeName, assemblerName);
        mapPairs(power, (requiredCount, ingredient) => {
            (powerConsumptionRates[ingredient] ??= {})[assemblerName] ??= [
                0n, 0n, 0n,
            ];
            const k = powerConsumptionRates[ingredient]![assemblerName]!;
            const q = bigMul(requiredCount, count);
            addToMaxRate(ingredient, q);

            k[1] += count;
            if (counted) {
                k[0] += count;
                k[2] += q;
            }
        });
    }

    keys(assemblers).forEach((itemName) => {
        mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
            addAssemblerPowerConsumption(
                assemblerName,
                assemblerCount,
                itemName,
            );
        });
        if (disabledRecipes[itemName]) return;
        const recipe = GAME.recipes[itemName];
        const baseCraftTime = GAME.timePerRecipe[itemName];
        mapPairs(recipe, (count, ingredient) => {
            let rate = 0;
            let maxRate = 0;

            mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
                const subRate = bigToNum(assemblerCount) * (GAME.assemblerSpeeds[assemblerName] *
                    getBoost(assemblerName) / baseCraftTime
                );
                maxRate += subRate;
                if (assemblerIsStuckOrDisabled(itemName, assemblerName)) return;
                rate += subRate;
            });
            addToMaxRate(ingredient, scaleBigInt(count, maxRate));
            (effectiveConsumptionRates[ingredient] ??= {})[itemName] = scaleBigInt(count, rate);
        });
    });

    return {
        effectiveConsumptionRates,
        effectiveProductionRates,
        powerConsumptionRates,
        maxConsumptionRates,
        assemblerIsStuckOrDisabled,
    };
}
