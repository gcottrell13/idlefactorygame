import _ from "lodash";
import { Items, partialItems } from "../content/itemNames";
import { mapPairs, keys, fromPairs } from "../smap";
import { PRODUCTION_OUTPUT_BLOCKED, State } from "../typeDefs/State";
import GAME from "../values";
import { bigToNum, bigpow } from "../bigmath";

export function useCalculateRates(state: State, itemFilter: Items[]) {
    const effectiveProductionRates: partialItems<partialItems<number>> = {};
    const effectiveConsumptionRates: partialItems<partialItems<number>> = {};

    /**
     * [what's being consumed][the building]
     */
    const powerConsumptionRates: partialItems<
        partialItems<[count: number, total: number, consumption: number]>
    > = {};

    const { assemblers, disabledRecipes, productionProgress, productionState } =
        state;

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

    const assemblerBoosts: partialItems<bigint> = fromPairs(
        GAME.allAssemblers.map((assemblerName) => [
            assemblerName,
            bigpow(
                2,
                state.amountThatWeHave[
                GAME.buildingBoosts[assemblerName] ?? ""
                ] ?? 0n,
            ),
        ]),
    );

    function getBoost(item: Items) {
        return bigToNum(assemblerBoosts[item]) ?? 1;
    }

    itemFilter.forEach((itemName) => {
        const production: partialItems<number> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond[itemName], (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName && disabledRecipes[producer]
                        ? 0
                        : bigToNum(assemblerNumber) * (GAME.assemblerSpeeds[assemblerName] *
                            getBoost(assemblerName) *
                            rate),
            );
            production[producer] = _.sum(speeds);
        });

        if (GAME.sideProducts[itemName].length === 0) {
            const assemblersMakingThis = assemblers[itemName] ?? {};
            const baseCraftTime = GAME.timePerRecipe[itemName];
            mapPairs(assemblersMakingThis, (assemblerCount, assemblerName) => {
                const speed =
                    bigToNum(assemblerCount) * GAME.assemblerSpeeds[assemblerName] *
                        getBoost(assemblerName) / baseCraftTime
                    ;
                production[assemblerName] = speed;
            });
        }
    });

    function addAssemblerPowerConsumption(
        assemblerName: Items,
        count: number,
        recipeName: Items,
    ) {
        const power = GAME.buildingPowerRequirementsPerSecond[assemblerName];
        const counted = !assemblerIsStuckOrDisabled(recipeName, assemblerName);
        mapPairs(power, (requiredCount, ingredient) => {
            (powerConsumptionRates[ingredient] ??= {})[assemblerName] ??= [
                0, 0, 0,
            ];
            const k = powerConsumptionRates[ingredient]![assemblerName]!;

            k[1] += count;
            if (counted) {
                k[0] += count;
                k[2] += bigToNum(requiredCount) * count;
            }
        });
    }

    keys(assemblers).forEach((itemName) => {
        mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
            addAssemblerPowerConsumption(
                assemblerName,
                bigToNum(assemblerCount),
                itemName,
            );
        });
        if (disabledRecipes[itemName]) return;
        const recipe = GAME.recipes[itemName];
        const baseCraftTime = GAME.timePerRecipe[itemName];
        mapPairs(recipe, (count, ingredient) => {
            let rate = 0n;

            mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
                if (assemblerIsStuckOrDisabled(itemName, assemblerName)) return;
                rate +=
                    assemblerCount / BigInt(1 / (GAME.assemblerSpeeds[assemblerName] *
                        getBoost(assemblerName) / baseCraftTime)
                    );
            });
            (effectiveConsumptionRates[ingredient] ??= {})[itemName] =
                bigToNum(count * rate);
        });
    });

    return {
        effectiveConsumptionRates,
        effectiveProductionRates,
        powerConsumptionRates,
        assemblerIsStuckOrDisabled,
    };
}
