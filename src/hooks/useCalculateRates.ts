import _ from "lodash";
import { Items, partialItems } from "../content/itemNames";
import { mapPairs, keys, fromPairs } from "../smap";
import { PRODUCTION_OUTPUT_BLOCKED, State } from "../typeDefs/State";
import GAME from "../values";
import Decimal from "decimal.js";
import { ONE, ZERO } from "../decimalConsts";

export function useCalculateRates(state: State, itemFilter: Items[]) {
    const effectiveProductionRates: partialItems<partialItems<Decimal>> = {};
    const maxConsumptionRates: partialItems<Decimal> = {};
    const effectiveConsumptionRates: partialItems<partialItems<Decimal>> = {};

    function addToMaxRate(ingredient: Items, rate: Decimal) {
        maxConsumptionRates[ingredient] ??= ZERO;
        maxConsumptionRates[ingredient] = maxConsumptionRates[ingredient]?.add(rate);
    }

    /**
     * [what's being consumed][the building]
     */
    const powerConsumptionRates: partialItems<
        partialItems<[count: Decimal, total: Decimal, consumption: Decimal]>
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

    const assemblerBoosts: partialItems<Decimal> = fromPairs(
        GAME.allAssemblers.map((assemblerName) => [
            assemblerName,
            GAME.calculateBoost(assemblerName, state)
        ]),
    );

    function getBoost(item: Items) {
        return assemblerBoosts[item] ?? ONE;
    }

    itemFilter.forEach((itemName) => {
        const production: partialItems<Decimal> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond[itemName], (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName && disabledRecipes[producer]
                        ? ZERO
                        : assemblerNumber.mul(GAME.assemblerSpeeds[assemblerName]).mul(getBoost(assemblerName)).mul(rate),
            );
            production[producer] = Decimal.sum(...speeds);
        });

        if (GAME.sideProducts[itemName].length === 0) {
            const assemblersMakingThis = assemblers[itemName] ?? {};
            const baseCraftTime = GAME.timePerRecipe[itemName];
            mapPairs(assemblersMakingThis, (assemblerCount, assemblerName) => {
                const speed = assemblerCount
                    .mul(GAME.assemblerSpeeds[assemblerName])
                    .mul(getBoost(assemblerName))
                    .div(baseCraftTime);
                production[assemblerName] = speed;
            });
        }
    });

    function addAssemblerPowerConsumption(
        assemblerName: Items,
        count: Decimal,
        recipeName: Items,
    ) {
        const power = GAME.buildingPowerRequirementsPerSecond[assemblerName];
        const counted = !assemblerIsStuckOrDisabled(recipeName, assemblerName);
        mapPairs(power, (requiredCount, ingredient) => {
            (powerConsumptionRates[ingredient] ??= {})[assemblerName] ??= [
                ZERO, ZERO, ZERO,
            ];
            const k = powerConsumptionRates[ingredient]![assemblerName]!;
            const q = requiredCount.mul(count);
            addToMaxRate(ingredient, q);

            k[1] = k[1].add(count);
            if (counted) {
                k[0] = k[0].add(count);
                k[2] = k[2].add(q);
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
            let rate = ZERO;
            let maxRate = ZERO;

            mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
                const subRate = assemblerCount
                    .mul(GAME.assemblerSpeeds[assemblerName])
                    .mul(getBoost(assemblerName))
                    .div(baseCraftTime);
                maxRate = maxRate.add(subRate);
                if (assemblerIsStuckOrDisabled(itemName, assemblerName)) return;
                rate = rate.add(subRate);
            });
            addToMaxRate(ingredient, maxRate.mul(count));
            (effectiveConsumptionRates[ingredient] ??= {})[itemName] = rate.mul(count);
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
