import { useCallback, useEffect, useRef, useState } from 'react';
import GAME, { partialItems, Items } from './values';
import _ from 'lodash';
import { SMap, forEach, keys, values } from './smap';

const PRECISION = 1e5;
function round(n: number) {
    return Math.round(n * PRECISION) / PRECISION;
}

type productionTime = [ticksLeft: number, totalTicks: number, recipesCreated: number, percentDone: number];

const zeroProduction: productionTime = [0, 0, 0, 0];

interface State {
    assemblers: partialItems<partialItems<number>>;
    displayAmount: partialItems<number>;
    amountThatWeHave: partialItems<number>;
    timeLeftInProduction: partialItems<partialItems<productionTime>>;

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
    timeLeftInProduction: {},
    amountCreated: {},
} satisfies State;

const ex = localStorage.getItem('state');
const existingStorage = {...defaultState, ...(ex ? JSON.parse(ex) : {})};

function increaseDisplayAmount(itemName: Items, display: SMap<number>, [ticksLeft, totalTicks, recipesCreated, _]: productionTime): productionTime {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return zeroProduction;

    const amt = display[itemName] ?? 0;


    if (ticksLeft > 0) {
        display[itemName] = amt + recipesCreated / totalTicks;
        return [ticksLeft - 1, totalTicks, recipesCreated, 1 - (ticksLeft / totalTicks)];
    }
    return zeroProduction;
}


function assemble(itemName: Items, assemblerCount: number, speed: number, timeStep: number, amounts: SMap<number>, storage: partialItems<number>): productionTime {
    const recipe = GAME.recipes(itemName);
    if (recipe === undefined) return zeroProduction;
    // not producing, so let's try to grab materials

    let numberOfRecipesToMake = assemblerCount ?? 0;
    if (numberOfRecipesToMake <= 0)
        return zeroProduction;
    
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
    
    const amt = amounts[itemName] ?? 0;
    const maxValue = calculateStorage(itemName, storage);
    if (maxValue > -1) {
        numberOfRecipesToMake = Math.floor(Math.min(maxValue - amt, numberOfRecipesToMake));
    }

    if (numberOfRecipesToMake <= 0)
        return zeroProduction;

    _.toPairs(recipe).forEach(pair => {
        const [ingredientName, requiredCount] = pair;
        const toGrab = numberOfRecipesToMake * requiredCount;

        const weHave = amounts[ingredientName] ?? 0;
        amounts[ingredientName] = round(Math.max(0, weHave - toGrab));
    });

    if (numberOfRecipesToMake <= 0)
        return zeroProduction;

    const craftTime = GAME.timePerRecipe(itemName);
    const ticksToMake = Math.floor(craftTime / speed / timeStep);
    return [ticksToMake, ticksToMake, Math.round(numberOfRecipesToMake), 0];
}

export function calculateStorage(itemName: Items, storage?: partialItems<number>) {
    const canBeStoredIn = GAME.itemsCanBeStoreIn(itemName);
    if (canBeStoredIn === undefined) 
        return -1;
    if (storage === undefined)
        return 10;
    return Math.max(_.sumBy(keys(storage), key => {
        return (canBeStoredIn.includes(key) ? GAME.storageSizes(key) ?? 0 : 0) * (storage[key] ?? 0);
    }), 10);
}

function addToTotal(itemName: Items, recipeCount: number, amounts: partialItems<number>, storage: partialItems<partialItems<number>>): boolean {
    // const recipe = recipes[itemName];
    // if (recipe === undefined) return [0, 0, 0];
    
    if (GAME.sideProducts(itemName)) {
        for (let i = 0; i < recipeCount; i++) {
            GAME.sideProducts(itemName).forEach(sideProduct => {
                const total = _.sum(values(sideProduct));
                let runningTotal = 0;
                _.forIn(keys(sideProduct), key => {
                    const k = key as Items;
                    runningTotal += sideProduct[k] ?? 0;
                    if (Math.random() <= (runningTotal / total)) {
                        const maxValue = calculateStorage(k, storage[k]);
                        const newVal = (amounts[k] ?? 0) + 1;
                        if (maxValue === -1 || maxValue > newVal)
                            amounts[k] = round(newVal);
                        return false;
                    }
                });
            });
        }
    }
    else {
        const maxValue = calculateStorage(itemName, storage[itemName]);
        const newVal = (amounts[itemName] ?? 0) + recipeCount;;
        if (maxValue === -1 || maxValue >= newVal) {
            amounts[itemName] = round(newVal);
            return true;
        }
    }
    return false;
}

export function useProduction(ticksPerSecond: number) {

    const stateRef = useRef<State>(existingStorage);

    function hasStorageCapacity(item: Items, amt: number) {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? 0;
        return calculateStorage(item, stateRef.current.storage[item]) - currentAmount <= amt;
    }

    function doProduction(timeStep: number) {
        const {
            assemblers,
            amountThatWeHave: _amountsThatWeHave,
            timeLeftInProduction,
            displayAmount: _display,
            storage,
        } = stateRef.current;

        const amounts: partialItems<number> = { ..._amountsThatWeHave };
        const displayAmount: partialItems<number> = { ..._display };

        keys(assemblers).sort().forEach(level => {
            forEach(assemblers[level], (assemblerCount, itemName) => {
                let time = timeLeftInProduction[itemName]?.[level] ?? zeroProduction;

                if (!storage[itemName]) storage[itemName] = {};

                if (time[0] === 0) {
                    // gather more materials
                    time = assemble(itemName, assemblerCount ?? 0, GAME.assemblerSpeeds(level) ?? 0, timeStep, amounts, storage[itemName]!);
                }
                
                if (time[0] !== 0) {
                    time = increaseDisplayAmount(itemName, displayAmount, time);

                    if (time[0] === 0) {
                        addToTotal(itemName, time[2], amounts, storage);
                        time = zeroProduction;
                    }
                }

                if (!timeLeftInProduction[itemName]) 
                    timeLeftInProduction[itemName] = {};
                timeLeftInProduction[itemName]![level] = time;
            });
        });

        return {
            amountThatWeHave: amounts,
            displayAmount,
        };
    }

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = {...stateRef.current, ...state};
        localStorage.setItem('state', JSON.stringify(stateRef.current));
    };

    const [c, setCounter] = useState<number>(0);

    const addAmount = useCallback(
        (itemName: Items, amount: number) => {
            const k = stateRef.current.amountThatWeHave[itemName] ?? 0;
            stateRef.current.amountThatWeHave[itemName] = k + amount;
            stateRef.current.displayAmount[itemName] = stateRef.current.amountThatWeHave[itemName];
            setState();
        },
        []
    );

    const makeItemByhand = useCallback(
        (itemName: Items) => {
            if (addToTotal(itemName, 1, stateRef.current.amountThatWeHave, stateRef.current.storage)) {
                const recipe = GAME.recipes(itemName);
                _.toPairs(recipe).forEach(pair => {
                    const [ingredientName, requiredCount] = pair;
                    const weHave = stateRef.current.amountThatWeHave[ingredientName as Items] ?? 0;
                    const newTotal = Math.max(0, weHave - requiredCount);
                    stateRef.current.amountThatWeHave[ingredientName as Items] = newTotal;
                    stateRef.current.displayAmount[ingredientName as Items] = newTotal;
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
            return hasStorageCapacity(itemName, 1);
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

        keys(GAME.recipes).forEach(itemName => {
            if (visible[itemName] === undefined) {
                if ((amountThatWeHave[itemName] ?? 0) <= 0) {
                    const required = GAME.requiredBuildings(itemName);
                    const haveBuilding = required.some(x => amountThatWeHave[x as Items] ?? 0) || required.includes('by-hand');
                    const recipe = GAME.recipes[itemName];
                    const haveIngredients = keys(recipe).every(key => (amountThatWeHave[key as Items] ?? 0) > 0);
                    if (haveBuilding && haveIngredients) {
                        markVisibility(itemName, true);
                    }
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
    return { ...stateRef.current, addAmount, addAssemblers, resetAll, makeItemByhand, canMakeItemByHand, addContainer };
}