import { partialItems } from "../content/itemNames";
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
    assemblers: partialItems<partialItems<bigint>>;
    displayAmount: partialItems<number>;

    // actually a multiple of 10 x the actual amount, defined in GAME.AMOUNT_SCALE
    amountThatWeHave: partialItems<bigint>;

    /**
     * all buildings making these recipes should not do so
     */
    disabledRecipes: partialItems<boolean>;

    /**
     * [whats being made] [the building making it]
     */
    productionProgress: partialItems<partialItems<bigint>>;
    productionState: partialItems<partialItems<PRODUCTION_STATE>>;

    /**
     * [whats being made] [the building making it]
     */
    powerConsumptionProgress: partialItems<partialItems<number>>;
    powerConsumptionState: partialItems<partialItems<POWER_STATE>>;

    // for each item, how many storage containers are there.
    // this storage is a soft limit, the actual values may go over via direct production, but not from byproducts
    storage: partialItems<partialItems<bigint>>;

    // true if visible, false or undefined if not.
    // undefined objects will check each tick if they should be revealed
    visible: partialItems<boolean>;

    acknowledged: partialItems<boolean>;

    // how many of each item has been made
    amountCreated: partialItems<bigint>;
}
