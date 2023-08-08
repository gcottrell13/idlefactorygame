import { Items, partialItems } from "../content/itemNames";
import { VERSION } from "../version";

export const PRODUCTION_RUNNING = Symbol("RUNNING");
export const PRODUCTION_OUTPUT_BLOCKED = Symbol("OUTPUT_BLOCKED");
export const PRODUCTION_NO_INPUT = Symbol("NO_INPUT");
export const PRODUCTION_HAS_POWER = Symbol("HAS_POWER");
export const PRODUCTION_NO_POWER = Symbol("NO_POWER");

export type POWER_STATE =
    | typeof PRODUCTION_HAS_POWER
    | typeof PRODUCTION_NO_POWER;

export type PRODUCTION_STATE =
    | typeof PRODUCTION_RUNNING
    | typeof PRODUCTION_OUTPUT_BLOCKED
    | typeof PRODUCTION_NO_INPUT;

export interface State {
    version: ReturnType<typeof VERSION>;

    /**
     * the number of seconds spent playing
     */
    timeSpentPlaying: number;
    lastUIUpdateTimestamp: number;
    ticksSinceLastUIUpdate: number;
    lastTickTimestamp: number;

    timeUnlockedAt: partialItems<number>;

    /**
     * [what its making][the building]
     */
    assemblers: partialItems<partialItems<number>>;
    displayAmount: partialItems<number>;

    /**
     * The amount in "general storage".
     * Any recipes/buildings that are not in a priority list will consume from here.
     */
    amountThatWeHave: partialItems<number>;

    /**
     * Dedicated resources for:
     * [recipe][building making it][ingredient] => storage amount and maximum
     *
     * The ingredient MAY define a priority list, and it MAY include this recipe/building,
     * in which case there will be a number defined at this path.
     *
     * If the path exists, then the building must only consume the ingredient from this, and must not consume
     * from amountThatWeHave.
     *
     * The distribution algorithm will attempt to supply any defined paths with the following amounts:
     * - In the case of recipe ingredients, twice the recipe amount.
     * - In the case of power requirements, requirements-per-second amount (for a total of 1 second worth of power);
     * - If a building requires the same ingredient for power and recipe, the amounts will be added.
     */
    dedicatedResources: partialItems<
        partialItems<partialItems<[amount: number, max: number]>>
    >;

    /**
     * [item being made] => [recipe, building]
     *
     * defines a dedicatedResources for [recipe][building][item being made]
     *
     * general algorithm for distribution:
     *  - set OVERFLOW = amountThatWeHave
     *  - set LASTOVERFLOW = amountThatWeHave
     *  - set TARGETS = items in priority list where amount < max
     *  - while OVERFLOW > 0 && #TARGETS > 0 && LASTOVERFLOW != OVERFLOW:
     *     - set ADD = OVERFLOW divide by #TARGETS
     *     - set NEWAMOUNT = 0
     *     - for each item in TARGETS:
     *        - set EXTRA = Math.max((amount + ADD) - max, 0)
     *        - set amount = Math.min(amount + ADD, max)
     *        - NEWAMOUNT += EXTRA
     *     - set LASTOVERFLOW = OVERFLOW
     *     - set OVERFLOW = NEWAMOUNT
     *     - recalculate TARGETS
     *  - set amountThatWeHave = OVERFLOW
     */
    priorityLists: partialItems<[recipe: Items, building: Items][]>;

    /**
     * all buildings making these recipes should not do so
     */
    disabledRecipes: partialItems<boolean>;

    /**
     * [whats being made] [the building making it]
     */
    productionProgress: partialItems<partialItems<number>>;
    productionState: partialItems<partialItems<PRODUCTION_STATE>>;

    /**
     * [whats being made] [the building making it]
     */
    powerConsumptionProgress: partialItems<partialItems<number>>;
    powerConsumptionState: partialItems<partialItems<POWER_STATE>>;

    // for each item, how many storage containers are there.
    // this storage is a soft limit, the actual values may go over via direct production, but not from byproducts
    storage: partialItems<partialItems<number>>;

    // true if visible, false or undefined if not.
    // undefined objects will check each tick if they should be revealed
    visible: partialItems<boolean>;

    acknowledged: partialItems<boolean>;

    // how many of each item has been made
    amountCreated: partialItems<number>;
}
