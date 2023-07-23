import { useCallback, useEffect, useRef, useState } from "react";
import GAME, { partialItems, Items } from "./values";
import _ from "lodash";
import { SMap, forEach, keys, mapPairs, values } from "./smap";
import { VERSION } from "./version";

export const PRODUCTION_OUTPUT_BLOCKED = "blocked";
export const PRODUCTION_NO_INPUT = "noinput";

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
            .forEach((itemName) => {
                forEach(assemblers[itemName], (assemblerCount, level) => {
                    if (stateRef.current.disabledRecipes[itemName] === true) {
                        return;
                    }
                    const amountAddPerTick =
                        (GAME.assemblerSpeeds(level) *
                            assemblerCount *
                            timeStep) /
                        GAME.timePerRecipe(itemName);
                    let time = productionProgress[itemName]?.[level];

                    if (Number.isNaN(time) || time === undefined) time = null;

                    if (!storage[itemName]) storage[itemName] = {};

                    // there's probably a better way to organize this code

                    if (time === PRODUCTION_OUTPUT_BLOCKED) {
                        if (addToTotal(itemName, 1)) {
                            time = null;
                        } else {
                            return;
                        }
                    }

                    const hadNoInput = time === PRODUCTION_NO_INPUT;

                    if (time === null || hadNoInput) {
                        time = consumeMaterials(itemName, amountThatWeHave);
                        if (time === null) time = PRODUCTION_NO_INPUT;
                        else if (hadNoInput)
                            time = -amountAddPerTick * ticksPerSecond * 0.5;
                    }

                    if (typeof time === "number") {
                        let t: number = time as any;
                        t += amountAddPerTick;
                        time = t;

                        while (t >= 1) {
                            if (addToTotal(itemName, 1)) {
                                t -= 1;
                                time = t;
                                if (
                                    consumeMaterials(
                                        itemName,
                                        amountThatWeHave,
                                    ) === null
                                ) {
                                    time = PRODUCTION_NO_INPUT;
                                    break;
                                }
                            } else {
                                time = PRODUCTION_OUTPUT_BLOCKED;
                                break;
                            }
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
            const k = stateRef.current.assemblers[itemName] ?? {};
            const appliedAssemblers = k[level] ?? 0;
            const haveAssemblers =
                stateRef.current.amountThatWeHave[level] ?? 0;
            amount = Math.min(amount, haveAssemblers);
            k[level] = appliedAssemblers + amount;
            stateRef.current.assemblers[itemName] = k;
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

    useEffect(() => {
        const i = setTimeout(() => {
            setState(doProduction(1 / ticksPerSecond));
            setCounter(c + 1);
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

    const effectiveProductionRates: partialItems<partialItems<number>> = {};
    const effectiveConsumptionRates: partialItems<partialItems<number>> = {};
    const { assemblers, disabledRecipes, productionProgress } =
        stateRef.current;

    function assemblerIsStuckOrDisabled(itemName: Items, assembler: Items) {
        if (disabledRecipes[itemName]) return "disabled";
        if (
            (productionProgress[itemName] ?? {})[assembler] ===
            PRODUCTION_OUTPUT_BLOCKED
        )
            return "full";
        return false;
    }

    GAME.allItemNames.forEach((itemName) => {
        const production: partialItems<number> = {};
        effectiveProductionRates[itemName] = production;

        mapPairs(GAME.byproductRatesPerSecond(itemName), (rate, producer) => {
            const speeds = mapPairs(
                assemblers[producer],
                (assemblerNumber, assemblerName) =>
                    producer != itemName &&
                    assemblerIsStuckOrDisabled(producer, assemblerName)
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

    keys(stateRef.current.assemblers).forEach((itemName) => {
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
        ...stateRef.current,
        state: {
            ...stateRef.current,
            effectiveConsumptionRates,
            effectiveProductionRates,
            assemblerIsStuckOrDisabled,
        },
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
