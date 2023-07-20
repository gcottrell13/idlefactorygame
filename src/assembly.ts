import { useCallback, useEffect, useRef, useState } from 'react';
import GAME, { partialItems, Items } from './values';
import _ from 'lodash';
import { SMap, forEach, keys, values } from './smap';

const PRECISION = 1e5;
function round(n: number) {
    return Math.round(n * PRECISION) / PRECISION;
}

export function getByItem<T>(dict: { [p in Items]?: T }, item: Items, _default: T): T {
    return dict[item] ?? _default;
}

interface State {
    /**
     * [the building][what its making]
     */
    assemblers: partialItems<partialItems<number>>;
    displayAmount: partialItems<number>;
    amountThatWeHave: partialItems<number>;

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

    // how many of each item has been made
    amountCreated: partialItems<number>;
}

const defaultState = {
    displayAmount: {},
    amountThatWeHave: {},
    assemblers: {},
    visible: {},
    storage: {},
    productionProgress: {},
    amountCreated: {},
} satisfies State;

const ex = localStorage.getItem('state');
const existingStorage = { ...defaultState, ...(ex ? JSON.parse(ex) : {}) };

function consumeMaterials(
    itemName: Items,
    amounts: SMap<number>
): number | null {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return 0;
    // not producing, so let's try to grab materials

    let numberOfRecipesToMake = 1;

    _.toPairs(recipe).forEach(pair => {
        const [ingredientName, requiredCount] = pair;
        const weHave = amounts[ingredientName] ?? 0;
        if (weHave < requiredCount) {
            numberOfRecipesToMake = 0;
        }
        else {
            numberOfRecipesToMake = Math.min(Math.floor(weHave / requiredCount), numberOfRecipesToMake);
        }
    });

    if (numberOfRecipesToMake <= 0)
        return null;

    _.toPairs(recipe).forEach(pair => {
        const [ingredientName, requiredCount] = pair;
        const toGrab = numberOfRecipesToMake * requiredCount;

        const weHave = amounts[ingredientName] ?? 0;
        amounts[ingredientName] = round(Math.max(0, weHave - toGrab));
    });

    if (numberOfRecipesToMake <= 0)
        return null;
    return 0;
}

export function calculateStorage(itemName: Items, storage?: partialItems<number>) {
    const canBeStoredIn = GAME.itemsCanBeStoreIn(itemName);
    if (canBeStoredIn.length === 0)
        return Number.MAX_SAFE_INTEGER;
    if (storage === undefined)
        return 10;
    return Math.max(_.sumBy(keys(storage), key => {
        return (canBeStoredIn.includes(key) ? GAME.storageSizes(key) ?? 0 : 0) * (storage[key] ?? 0);
    }), 0) + 10;
}

function saveGame(state: State) {
    localStorage.setItem('state', JSON.stringify(state));
}

export function useProduction(ticksPerSecond: number) {

    const stateRef = useRef<State>(existingStorage);

    function hasStorageCapacity(item: Items, amt: number) {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? 0;
        return calculateStorage(item, stateRef.current.storage[item]) - currentAmount >= amt;
    }

    function addToTotal(itemName: Items, recipeCount: number): boolean {
        if (GAME.sideProducts(itemName).length > 0) {
            for (let i = 0; i < recipeCount; i++) {
                GAME.sideProducts(itemName).forEach(sideProduct => {
                    const total = _.sum(values(sideProduct));
                    let runningTotal = 0;
                    _.forIn(keys(sideProduct), key => {
                        const k = key as Items;
                        runningTotal += sideProduct[k] ?? 0;
                        if (Math.random() <= (runningTotal / total)) {
                            if (hasStorageCapacity(k, 1))
                                addAmount(k, 1);
                            return false;
                        }
                    });
                });
            }
        }
        else {
            if (hasStorageCapacity(itemName, recipeCount)) {
                addAmount(itemName, recipeCount);
                return true;
            }
        }
        return false;
    }

    function doProduction(timeStep: number) {
        const {
            assemblers,
            amountThatWeHave,
            productionProgress,
            storage,
        } = stateRef.current;

        keys(assemblers).sort().forEach(level => {
            forEach(assemblers[level], (assemblerCount, itemName) => {
                let time = productionProgress[itemName]?.[level] ?? null;

                if (!storage[itemName]) storage[itemName] = {};

                // there's probably a better way to organize this code

                if (time === -1) {
                    if (addToTotal(itemName, 1)) {
                        time = null;
                    }
                    else {
                        return;
                    }
                }
                
                if (time === null) {
                    time = consumeMaterials(itemName, amountThatWeHave);

                    if (time === null) return;
                }

                time += GAME.assemblerSpeeds(level) * assemblerCount * timeStep / GAME.timePerRecipe(itemName);

                while (time >= 1) {
                    if (addToTotal(itemName, 1)) {
                        time -= 1;
                        if (consumeMaterials(itemName, amountThatWeHave) === null) {
                            time = null;
                            break;
                        }
                    }
                    else {
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

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = { ...stateRef.current, ...state };
    };

    const [c, setCounter] = useState<number>(0);

    const addAmount = useCallback(
        (itemName: Items, amount: number) => {
            const k = stateRef.current.amountThatWeHave[itemName] ?? 0;
            stateRef.current.amountThatWeHave[itemName] = Math.max(0, k + amount);
            stateRef.current.displayAmount[itemName] = stateRef.current.amountThatWeHave[itemName];

            const b = stateRef.current.amountCreated[itemName] ?? 0;
            stateRef.current.amountCreated[itemName] = b + amount;

            if (GAME.hideOnBuy(itemName)) {
                markVisibility(itemName, false);
            }

            setState();
        },
        []
    );

    const makeItemByhand = useCallback(
        (itemName: Items) => {
            if (addToTotal(itemName, 1)) {
                const recipe = GAME.recipes(itemName);
                _.toPairs(recipe).forEach(pair => {
                    const [ingredientName, requiredCount] = pair;
                    addAmount(ingredientName as Items, -requiredCount);
                });
                setState();
            }
        },
        []
    );

    const canMakeItemByHand = useCallback(
        (itemName: Items) => {
            if (GAME.requiredBuildings(itemName).includes('by-hand') === false)
                return false;

            const recipe = GAME.recipes(itemName);
            let canMake = true;
            _.toPairs(recipe).forEach(pair => {
                const [ingredientName, requiredCount] = pair;
                const weHave = stateRef.current.amountThatWeHave[ingredientName as Items] ?? 0;
                if (weHave < requiredCount) canMake = false;
            });
            return canMake && hasStorageCapacity(itemName, 1);
        },
        []
    );

    const addAssemblers = useCallback(
        (level: Items, itemName: Items, amount: number) => {
            const k = stateRef.current.assemblers[level] ?? {};
            const current = k[itemName] ?? 0;
            k[itemName] = current + amount;
            stateRef.current.assemblers[level] = k;
            stateRef.current.amountThatWeHave[level]! -= 1;
            stateRef.current.displayAmount[level] = stateRef.current.amountThatWeHave[level];
            setState();
        },
        []
    );

    const addContainer = useCallback(
        (itemName: Items, container: Items, amount: number) => {
            stateRef.current.storage[itemName] ??= {};
            const v = stateRef.current.storage[itemName]![container] ?? 0;
            stateRef.current.storage[itemName]![container] = v + amount;
            stateRef.current.amountThatWeHave[container]! -= amount;
        },
        [],
    );

    const resetAll = useCallback(
        () => {
            setState(defaultState);
        },
        [],
    );

    const markVisibility = useCallback(
        (item: Items, b: boolean) => {
            stateRef.current.visible[item] = b;
            setState();
        },
        []
    );

    const checkVisible = () => {
        const {
            visible,
            amountThatWeHave,
        } = stateRef.current;

        GAME.allItemNames.forEach(itemName => {
            if (visible[itemName] === undefined) {
                if ((amountThatWeHave[itemName] ?? 0) <= 0) {
                    const required = GAME.requiredBuildings(itemName);
                    const haveBuilding = required.some(x => visible[x as Items]) || required.includes('by-hand');
                    const recipe = GAME.recipes(itemName);
                    const haveIngredients = keys(recipe).every(key => visible[key as Items]);
                    const unlockedWith = GAME.unlockedWith(itemName).every(x => amountThatWeHave[x] ?? 0);
                    if (haveBuilding && unlockedWith && (keys(recipe).length === 0 || haveIngredients)) {
                        markVisibility(itemName, true);
                    }
                }
                else {
                    markVisibility(itemName, true);
                }
            }
        });
    };

    useEffect(
        () => {
            const i = setTimeout(() => {
                checkVisible();
                setState(doProduction(1 / ticksPerSecond));
                setCounter(c + 1);
            }, 1000 / ticksPerSecond);
            return () => {
                clearTimeout(i);
            };
        }
    );

    useEffect(
        () => {
            setInterval(() => saveGame(stateRef.current), 10 * 1000);
        },
        []
    );

    return { ...stateRef.current, addAmount, addAssemblers, resetAll, makeItemByhand, canMakeItemByHand, addContainer };
}