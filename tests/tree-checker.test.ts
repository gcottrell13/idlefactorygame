import { checkVisible } from "../src/assembly";
import { Items } from "../src/content/itemNames";
import { Queue } from "../src/queue";
import { State } from "../src/typeDefs/State";
import GAME from "../src/values";

describe("tree-check", () => {
    /**
     * Make sure that all items can be reached via progress
     */
    test("all-items-are-reachable", () => {
        const state: State = {
            timeSpentPlaying: 0,
            timeUnlockedAt: {},
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
            ticksSinceLastUIUpdate: 0,
            lastTickTimestamp: 0,
            lastUIUpdateTimestamp: 0,
            powerConsumptionState: {},
            productionState: {},
            hideAddButtons: {},
        };

        const discoveryLog: string[] = [];

        const addOneToItemQueue = new Queue<Items>(["begin"]);

        const maxItemLength = Math.max(
            ...GAME.allItemNames
                .filter((x) => x.startsWith("research-"))
                .map((x) => x.length),
        );

        while (true) {
            let addOne: Items | undefined;
            if ((addOne = addOneToItemQueue.pop())) {
                state.amountThatWeHave[addOne] = 1n;
            } else {
                break;
            }

            const itemsDiscovered = checkVisible(state, (a) => {
                if (a.action === 'unhide-item') {
                    state.visible[a.itemName] = true;
                }
            });
            if (itemsDiscovered.length > 0)
                discoveryLog.push(
                    addOne.padEnd(maxItemLength) +
                        " unlocks: " +
                        itemsDiscovered.join(", "),
                );
            itemsDiscovered
                .filter((x) => !x.startsWith("research-"))
                .forEach(addOneToItemQueue.push);
            itemsDiscovered
                .filter((x) => x.startsWith("research-"))
                .forEach(addOneToItemQueue.push);
        }

        console.log("Discovery log:\n" + discoveryLog.join("\n"));

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
