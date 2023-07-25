import { partialItems } from "../content/itemNames";
import { VERSION } from "../version";

export const PRODUCTION_OUTPUT_BLOCKED = "blocked";
export const PRODUCTION_NO_INPUT = "noinput";
export const PRODUCTION_NO_POWER = "nopower";

export interface State {
    version: typeof VERSION;

    /**
     * [what its making][the building]
     */
    assemblers: partialItems<partialItems<number>>;
    displayAmount: partialItems<number>;
    amountThatWeHave: partialItems<number>;

    /**
     * all buildings making these recipes should not do so
     */
    disabledRecipes: partialItems<boolean>;

    /**
     * [whats being made] [the building making it]
     */
    productionProgress: partialItems<
        partialItems<
            | number
            | null
            | typeof PRODUCTION_OUTPUT_BLOCKED
            | typeof PRODUCTION_NO_INPUT
        >
    >;

    /**
     * [whats being made] [the building making it]
     */
    powerConsumptionProgress: partialItems<
        partialItems<number | typeof PRODUCTION_NO_POWER>
    >;

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
