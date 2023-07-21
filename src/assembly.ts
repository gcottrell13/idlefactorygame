import { useCallback, useEffect, useRef, useState } from "react";
import GAME, { partialItems, Items } from "./values";
import _ from "lodash";
import { SMap, forEach, keys, values } from "./smap";
import { VERSION } from "./version";
import { Queue } from "./queue";

export const AMOUNT_HISTORY_LENGTH_SECONDS = 60;
const AMOUNT_HISTORY_INTERVAL_SECONDS = 1;

const PRECISION = 1e5;
function round(n: number) {
    return Math.round(n * PRECISION) / PRECISION;
}

export function getByItem<T>(
    dict: { [p in Items]?: T },
    item: Items,
    _default: T,
): T {
    return dict[item] ?? _default;
}

export interface State {
    version: typeof VERSION;

    /**
     * [the building][what its making]
     */
    assemblers: partialItems<partialItems<number>>;
    displayAmount: partialItems<number>;
    amountThatWeHave: partialItems<number>;

    /**
     * a history of each item's value at regular intervals, up to a limit.
     */
    itemAmountHistory: partialItems<number[]>;

    /**
     * all buildings making these recipes should not do so
     */
    disabledRecipes: partialItems<boolean>;

    /**
     * [whats being made] [the building making it]
     */
    productionProgress: partialItems<partialItems<number | null>>;

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

const defaultState = {
    version: VERSION,
    displayAmount: {},
    amountThatWeHave: {},
    assemblers: {},
    visible: {},
    storage: {},
    productionProgress: {},
    amountCreated: {},
    acknowledged: {},
    disabledRecipes: {},
    itemAmountHistory: {},
} satisfies State;

const ex = localStorage.getItem("state");
const existingStorage = {
    ...defaultState,
    ...((ex ? JSON.parse(ex) : {}) as State),
};

export function howManyCanBeMade(
    itemName: Items,
    amounts: SMap<number>,
): number {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return 0;

    let numberOfRecipesToMake = Number.MAX_SAFE_INTEGER;

    _.toPairs(recipe).forEach((pair) => {
        const [ingredientName, requiredCount] = pair;
        const weHave = amounts[ingredientName] ?? 0;
        if (weHave < requiredCount) {
            numberOfRecipesToMake = 0;
        } else {
            numberOfRecipesToMake = Math.min(
                Math.floor(weHave / requiredCount),
                numberOfRecipesToMake,
            );
        }
    });

    return numberOfRecipesToMake;
}

function consumeMaterials(
    itemName: Items,
    amounts: SMap<number>,
): number | null {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return 0;
    // not producing, so let's try to grab materials

    if (howManyCanBeMade(itemName, amounts) <= 0) return null;

    _.toPairs(recipe).forEach((pair) => {
        const [ingredientName, requiredCount] = pair;
        const toGrab = requiredCount;

        const weHave = amounts[ingredientName] ?? 0;
        amounts[ingredientName] = round(Math.max(0, weHave - toGrab));
    });
    return 0;
}

export function calculateStorage(
    itemName: Items,
    storage?: partialItems<number>,
) {
    const canBeStoredIn = GAME.itemsCanBeStoreIn(itemName);
    if (canBeStoredIn.length === 0) return Number.MAX_SAFE_INTEGER;
    if (storage === undefined) return 10;
    return (
        Math.max(
            _.sumBy(keys(storage), (key) => {
                return (
                    (canBeStoredIn.includes(key)
                        ? GAME.storageSizes(key) ?? 0
                        : 0) * (storage[key] ?? 0)
                );
            }),
            0,
        ) + 10
    );
}

function saveGame(state: State) {
    localStorage.setItem("state", JSON.stringify(state));
}

export function useProduction(ticksPerSecond: number) {
    const stateRef = useRef<State>(existingStorage);

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = { ...stateRef.current, ...state };
    };

    const [c, setCounter] = useState<number>(0);
    const [historyTicks, setHistoryTicks] = useState(0);

    function hasStorageCapacity(item: Items, amt: number) {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? 0;
        return (
            calculateStorage(item, stateRef.current.storage[item]) -
                currentAmount >=
            amt
        );
    }

    function addToTotal(itemName: Items, recipeCount: number): boolean {
        if (GAME.sideProducts(itemName).length > 0) {
            for (let i = 0; i < recipeCount; i++) {
                const itemsChosen: Items[] = [];

                GAME.sideProducts(itemName).forEach((sideProduct) => {
                    const total = _.sum(values(sideProduct));
                    let runningTotal = 0;
                    _.forIn(keys(sideProduct), (key) => {
                        const k = key as Items;
                        runningTotal += sideProduct[k] ?? 0;
                        if (Math.random() <= runningTotal / total) {
                            itemsChosen.push(k);
                            return false;
                        }
                    });
                });

                if (itemsChosen.every((x) => hasStorageCapacity(x, 1))) {
                    itemsChosen.forEach((x) => addAmount(x, 1));
                } else {
                    return false;
                }
            }
            return true;
        } else {
            if (hasStorageCapacity(itemName, recipeCount)) {
                addAmount(itemName, recipeCount);
                return true;
            }
        }
        return false;
    }

    function doProduction(timeStep: number) {
        const { assemblers, amountThatWeHave, productionProgress, storage } =
            stateRef.current;

        keys(assemblers)
            .sort()
            .forEach((level) => {
                forEach(assemblers[level], (assemblerCount, itemName) => {
                    if (stateRef.current.disabledRecipes[itemName] === true) {
                        return;
                    }

                    let time = productionProgress[itemName]?.[level] ?? null;

                    if (!storage[itemName]) storage[itemName] = {};

                    // there's probably a better way to organize this code

                    if (time === -1) {
                        if (addToTotal(itemName, 1)) {
                            time = null;
                        } else {
                            return;
                        }
                    }

                    if (time === null) {
                        time = consumeMaterials(itemName, amountThatWeHave);

                        if (time === null) return;
                    }

                    time +=
                        (GAME.assemblerSpeeds(level) *
                            assemblerCount *
                            timeStep) /
                        GAME.timePerRecipe(itemName);

                    while (time >= 1) {
                        if (addToTotal(itemName, 1)) {
                            time -= 1;
                            if (
                                consumeMaterials(itemName, amountThatWeHave) ===
                                null
                            ) {
                                time = null;
                                break;
                            }
                        } else {
                            time = -1;
                            break;
                        }
                    }

                    if (!productionProgress[itemName])
                        productionProgress[itemName] = {};
                    productionProgress[itemName]![level] = time;
                });
            });

        return {
            amountThatWeHave,
        };
    }

    const addAmount = useCallback((itemName: Items, amount: number) => {
        const k = stateRef.current.amountThatWeHave[itemName] ?? 0;
        stateRef.current.amountThatWeHave[itemName] = Math.max(0, k + amount);
        stateRef.current.displayAmount[itemName] =
            stateRef.current.amountThatWeHave[itemName];

        const b = stateRef.current.amountCreated[itemName] ?? 0;
        stateRef.current.amountCreated[itemName] = b + amount;

        if (GAME.hideOnBuy(itemName)) {
            markVisibility(itemName, false);
        }

        setState();
    }, []);

    const makeItemByhand = useCallback((itemName: Items, count: number) => {
        for (let i = 0; i < count; i++) {
            if (addToTotal(itemName, 1)) {
                consumeMaterials(itemName, stateRef.current.amountThatWeHave);
                setState();
            }
        }
    }, []);

    const canMakeItemByHand = useCallback((itemName: Items) => {
        if (GAME.requiredBuildings(itemName).includes("by-hand") === false)
            return null;
        if (howManyCanBeMade(itemName, stateRef.current.amountThatWeHave) <= 0)
            return false;
        return hasStorageCapacity(itemName, 1);
    }, []);

    const addAssemblers = useCallback(
        (level: Items, itemName: Items, amount: number) => {
            const k = stateRef.current.assemblers[level] ?? {};
            const appliedAssemblers = k[itemName] ?? 0;
            const haveAssemblers =
                stateRef.current.amountThatWeHave[level] ?? 0;
            amount = Math.min(amount, haveAssemblers);
            k[itemName] = appliedAssemblers + amount;
            stateRef.current.assemblers[level] = k;
            stateRef.current.amountThatWeHave[level] = haveAssemblers - amount;
            setState();
        },
        [],
    );

    const addContainer = useCallback(
        (itemName: Items, container: Items, amount: number) => {
            stateRef.current.storage[itemName] ??= {};
            const haveStorage =
                stateRef.current.storage[itemName]![container] ?? 0;
            const haveContainers =
                stateRef.current.amountThatWeHave[container] ?? 0;
            amount = Math.min(amount, haveContainers);
            stateRef.current.storage[itemName]![container] =
                haveStorage + amount;
            stateRef.current.amountThatWeHave[container] =
                haveContainers - amount;
        },
        [],
    );

    const resetAll = useCallback(() => {
        setState(defaultState);
        saveGame(defaultState);
    }, []);

    const markVisibility = useCallback((item: Items, b: boolean) => {
        stateRef.current.visible[item] = b;
        stateRef.current.acknowledged[item] ??= false;
        setState();
    }, []);

    const disableRecipe = useCallback((itemName: Items, disable: boolean) => {
        stateRef.current.disabledRecipes[itemName] = disable;
        setState();
    }, []);

    const checkVisible = () => {
        const { visible, amountThatWeHave } = stateRef.current;

        let discoveredSomething = true;
        const itemsDiscovered: Items[] = [];

        while (discoveredSomething) {
            discoveredSomething = false;
            GAME.allItemNames.forEach((itemName) => {
                if (visible[itemName] === undefined) {
                    if ((amountThatWeHave[itemName] ?? 0) <= 0) {
                        const required = GAME.requiredBuildings(itemName);
                        const haveBuilding =
                            required.some((x) => visible[x as Items]) ||
                            required.includes("by-hand");
                        const recipe = GAME.recipes(itemName);
                        const haveIngredients = keys(recipe).every(
                            (key) => visible[key as Items],
                        );
                        const unlockedWith = GAME.unlockedWith(itemName).every(
                            (x) => amountThatWeHave[x] ?? 0,
                        );
                        if (
                            haveBuilding &&
                            unlockedWith &&
                            (keys(recipe).length === 0 || haveIngredients)
                        ) {
                            markVisibility(itemName, true);
                            itemsDiscovered.push(itemName);
                            discoveredSomething = true;
                        }
                    } else {
                        markVisibility(itemName, true);
                        discoveredSomething = true;
                        itemsDiscovered.push(itemName);
                    }
                }
            });
        }

        itemsDiscovered.forEach((item) => {
            stateRef.current.acknowledged[item] = false;
        });

        if (
            itemsDiscovered.length > 0 &&
            itemsDiscovered.includes("begin") === false
        ) {
            // alert(`New Items Discovered!:\n${itemsDiscovered.map(GAME.displayNames).join(',\n')}`);
        }
    };

    const acknowledgeItem = (item: Items) => {
        stateRef.current.acknowledged[item] = true;
        setState();
    };

    const oneOfEverything = () => {
        GAME.allItemNames.forEach((itemName) => {
            stateRef.current.amountThatWeHave[itemName] ??= 1;
        });
    };

    function addItemHistory() {
        const { itemAmountHistory, amountThatWeHave } = stateRef.current;
        keys(amountThatWeHave).forEach((itemName) => {
            const h = itemAmountHistory[itemName] ?? [];
            itemAmountHistory[itemName] = h;
            const amt = amountThatWeHave[itemName] ?? 0;
            new Queue(
                h,
                1 +
                    AMOUNT_HISTORY_LENGTH_SECONDS /
                        AMOUNT_HISTORY_INTERVAL_SECONDS,
            ).push(amt);
        });
    }

    useEffect(() => {
        const i = setTimeout(() => {
            setState(doProduction(1 / ticksPerSecond));
            setCounter(c + 1);
            setHistoryTicks(historyTicks + 1);

            if (
                historyTicks >
                AMOUNT_HISTORY_INTERVAL_SECONDS * ticksPerSecond
            ) {
                addItemHistory();
                setHistoryTicks(0);
            }
        }, 1000 / ticksPerSecond);
        return () => {
            clearTimeout(i);
        };
    });

    useEffect(() => {
        if (existingStorage.version[0] !== VERSION[0]) {
            setState(defaultState);
        }
        (document as any).oneOfEverything = oneOfEverything;
        setInterval(() => saveGame(stateRef.current), 10 * 1000);
    }, []);

    checkVisible();

    return {
        ...stateRef.current,
        state: stateRef.current,
        addAmount,
        addAssemblers,
        resetAll,
        makeItemByhand,
        canMakeItemByHand,
        addContainer,
        acknowledgeItem,
        disableRecipe,
    };
}
