import { State, checkVisible } from "../src/assembly";
import GAME from "../src/values";

describe("tree-check", () => {
    /**
     * Make sure that all items can be reached via progress
     */
    test("all-items-are-reachable", () => {
        const state: State = {
            version: [0, 0, 0] as any,
            displayAmount: {},
            amountThatWeHave: {},
            assemblers: {},
            visible: {},
            storage: {},
            productionProgress: {},
            amountCreated: {},
            acknowledged: {},
            disabledRecipes: {},
            powerConsumptionProgress: {},
        };

        function oneOfEverything() {
            GAME.allItemNames.forEach((itemName) => {
                state.amountThatWeHave[itemName] ??= 1;
            });
        }

        oneOfEverything();

        checkVisible(state);

        const notMarkedVisible: string[] = [];
        GAME.allItemNames.forEach((itemName) => {
            if (state.visible[itemName] === undefined) {
                notMarkedVisible.push(itemName);
            }
        });

        if (notMarkedVisible.length > 0) {
            throw new Error(`
Some Items Unreachable:
${notMarkedVisible.join("\n")}
            `);
        }
    });

    /**
     * make sure that everything can be seen in the UI
     */
    test("all-items-in-layout", () => {
        const foundItems: string[] = [];

        GAME.sections.forEach((section) => {
            section.SubSections.forEach((ss) => {
                foundItems.push(...ss.Items);
            });
        });

        const notMarkedVisible: string[] = [];
        GAME.allItemNames.forEach((itemName) => {
            if (!foundItems.includes(itemName)) {
                notMarkedVisible.push(itemName);
            }
        });

        if (notMarkedVisible.length > 0) {
            throw new Error(`
Some Items Not Visible in Layout:
${notMarkedVisible.join("\n")}
            `);
        }
    });
});
