import _ from "lodash";
import { Items, partialItems } from "../content/itemNames";
import { mapPairs, keys, fromPairs } from "../smap";
import { PRODUCTION_OUTPUT_BLOCKED, State } from "../typeDefs/State";
import GAME from "../values";
import Big from "../bigmath";

export function useCalculateRates(state: State, itemFilter: Items[]) {
    const effectiveProductionRates: partialItems<partialItems<Big>> = {};
    const maxConsumptionRates: partialItems<Big> = {};
    const effectiveConsumptionRates: partialItems<partialItems<Big>> = {};

    function addToMaxRate(ingredient: Items, rate: Big) {
        maxConsumptionRates[ingredient] ??= Big.Zero.clone();
        maxConsumptionRates[ingredient]?.addEq(rate);
    }

    /**
     * [what's being consumed][the building]
     */
    const powerConsumptionRates: partialItems<
        partialItems<[count: Big, total: Big, consumption: Big]>
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

    const assemblerBoosts: partialItems<Big> = fromPairs(
        GAME.allAssemblers.map((assemblerName) => [
            assemblerName,
            GAME.calculateBoost(assemblerName, state)
        ]),
    );

    function getBoost(item: Items) {
        return assemblerBoosts[item] ?? Big.One;
    }

    itemFilter.forEach((itemName) => {
        const production: partialItems<Big> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond[itemName], (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName && disabledRecipes[producer]
                        ? Big.Zero
                        : assemblerNumber.mul(GAME.assemblerSpeeds[assemblerName]).mul(getBoost(assemblerName)).mul(rate),
            );
            production[producer] = Big.sum(...speeds);
        });

        if (GAME.sideProducts[itemName].length === 0) {
            const assemblersMakingThis = assemblers[itemName] ?? {};
            const baseCraftTime = GAME.timePerRecipe[itemName];
            mapPairs(assemblersMakingThis, (assemblerCount, assemblerName) => {
                const speed = assemblerCount
                    .mul(GAME.assemblerSpeeds[assemblerName])
                    .mulEq(getBoost(assemblerName))
                    .divEq(baseCraftTime);
                production[assemblerName] = speed;
            });
        }
    });

    function addAssemblerPowerConsumption(
        assemblerName: Items,
        count: Big,
        recipeName: Items,
    ) {
        const power = GAME.buildingPowerRequirementsPerSecond[assemblerName];
        const counted = !assemblerIsStuckOrDisabled(recipeName, assemblerName);
        mapPairs(power, (requiredCount, ingredient) => {
            (powerConsumptionRates[ingredient] ??= {})[assemblerName] ??= [
                Big.Zero.clone(), Big.Zero.clone(), Big.Zero.clone(),
            ];
            const k = powerConsumptionRates[ingredient]![assemblerName]!;
            const q = requiredCount.mul(count);
            addToMaxRate(ingredient, q);

            k[1].addEq(count);
            if (counted) {
                k[0].addEq(count);
                k[2].addEq(q);
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
            let rate = Big.Zero.clone();
            let maxRate = Big.Zero.clone();

            mapPairs(assemblers[itemName], (assemblerCount, assemblerName) => {
                const subRate = assemblerCount
                    .mul(GAME.assemblerSpeeds[assemblerName])
                    .mulEq(getBoost(assemblerName))
                    .divEq(baseCraftTime);
                maxRate.addEq(subRate);
                if (assemblerIsStuckOrDisabled(itemName, assemblerName)) return;
                rate.addEq(subRate);
            });
            addToMaxRate(ingredient, maxRate.mulEq(count));
            (effectiveConsumptionRates[ingredient] ??= {})[itemName] = rate.mulEq(count);
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
