import _ from "lodash";
import { Items, partialItems } from "../content/itemNames";
import { mapPairs, keys } from "../smap";
import { PRODUCTION_OUTPUT_BLOCKED, State } from "../typeDefs/State";
import GAME from "../values";

export function useCalculateRates(state: State, itemFilter: Items[]) {
    const effectiveProductionRates: partialItems<partialItems<number>> = {};
    const effectiveConsumptionRates: partialItems<partialItems<number>> = {};

    /**
     * [what's being consumed][the building]
     */
    const powerConsumptionRates: partialItems<
        partialItems<[count: number, total: number, consumption: number]>
    > = {};

    const { assemblers, disabledRecipes, productionProgress } = state;

    function assemblerStuck(itemName: Items, assembler: Items) {
        return (
            (productionProgress[itemName] ?? {})[assembler] ===
            PRODUCTION_OUTPUT_BLOCKED
        );
    }
    function assemblerIsStuckOrDisabled(itemName: Items, assembler: Items) {
        if (disabledRecipes[itemName]) return "disabled";
        if (assemblerStuck(itemName, assembler)) return "full";
        return false;
    }

    itemFilter.forEach((itemName) => {
        const production: partialItems<number> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond(itemName), (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName && disabledRecipes[producer]
                        ? 0
                        : GAME.assemblerSpeeds(assemblerName) *
                          assemblerNumber *
                          rate,
            );
            production[producer] = _.sum(speeds);
        });

        if (GAME.sideProducts(itemName).length === 0) {
            const assemblersMakingThis = assemblers[itemName] ?? {};
            const baseCraftTime = GAME.timePerRecipe(itemName);
            mapPairs(assemblersMakingThis, (assemblerCount, key) => {
                const speed =
                    (GAME.assemblerSpeeds(key) * assemblerCount) /
                    baseCraftTime;
                production[key] = speed;
            });
        }
    });

    function addAssemblerPowerConsumption(
        assemblerName: Items,
        count: number,
        recipeName: Items,
    ) {
        const power = GAME.buildingPowerRequirementsPerSecond(assemblerName);
        const counted = !assemblerIsStuckOrDisabled(recipeName, assemblerName);
        mapPairs(power, (requiredCount, ingredient) => {
            (powerConsumptionRates[ingredient] ??= {})[assemblerName] ??= [
                0, 0, 0,
            ];
            const k = powerConsumptionRates[ingredient]![assemblerName]!;

            k[1] += count;
            if (counted) {
                k[0] += count;
                k[2] += requiredCount * count;
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
        const recipe = GAME.recipes(itemName);
        const baseCraftTime = GAME.timePerRecipe(itemName);
        mapPairs(recipe, (count, ingredient) => {
            let rate = 0;

            mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
                if (assemblerIsStuckOrDisabled(itemName, assemblerName)) return;
                rate +=
                    (GAME.assemblerSpeeds(assemblerName) * assemblerCount) /
                    baseCraftTime;
            });
            (effectiveConsumptionRates[ingredient] ??= {})[itemName] =
                count * rate;
        });
    });

    return {
        effectiveConsumptionRates,
        effectiveProductionRates,
        powerConsumptionRates,
        assemblerIsStuckOrDisabled,
    };
}
