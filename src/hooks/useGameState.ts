import { useCallback, useRef } from "react";
import GAME from "../values";
import { Items, partialItems } from "../content/itemNames";
import _ from "lodash";
import { keys, values } from "../smap";
import { useLocalStorage } from "./useLocalStorage";
import {
    State,
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
} from "../typeDefs/State";
import {
    consumeMaterialsFromRecipe,
} from "../assembly";
import { NumToBig, REALLY_BIG, bigGtE, bigMax, bigMin, bigSum, scaleBigInt } from "../bigmath";
import { parseFormat } from "../numberFormatter";
import { ACTIONS } from "../content/actions";

const stateRef = {
    current: null as any as State,
};

export function useGameState() {
    const { existingStorage, saveGame, resetGame } = useLocalStorage();
    if (!stateRef.current) {
        stateRef.current = existingStorage;
    }

    const makeByHandTimeRef = useRef<number>(0);

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = { ...stateRef.current, ...state };
    };

    const markVisibility = useCallback((item: Items, b: boolean) => {
        stateRef.current.visible[item] = b;
        stateRef.current.acknowledged[item] ??= false;
    }, []);

    const disableRecipe = useCallback((itemName: Items, disable: boolean) => {
        stateRef.current.disabledRecipes[itemName] = disable;
    }, []);

    const acknowledgeItem = (item: Items) => {
        stateRef.current.acknowledged[item] = true;
    };

    const resetAll = useCallback(() => {
        setState(resetGame());
    }, []);

    function calculateStorage(itemName: Items): bigint {
        const canBeStoredIn = GAME.itemsCanBeStoreIn[itemName];
        if (canBeStoredIn.length === 0) return REALLY_BIG;
        const storage = stateRef.current.storage[itemName];
        if (storage === undefined) return GAME.MIN_STORAGE;
        const assemblers = stateRef.current.assemblers[itemName] ?? {};
        return (
            bigMax(
                bigSum(
                    keys(assemblers).map(
                        (key) => scaleBigInt(assemblers[key] ?? 0n, GAME.storageSizes[key])
                    ),
                ),
                0n,
            ) +
            bigMax(
                bigSum(
                    keys(storage).map(
                        (key) =>
                            scaleBigInt(storage[key] ?? 0n, canBeStoredIn.includes(key)
                                ? GAME.storageSizes[key] ?? 0
                                : 0),
                    )
                ),
                0n,
            ) +
            GAME.MIN_STORAGE
        );
    }

    function hasStorageCapacity(item: Items): bigint {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? 0n;
        return calculateStorage(item) - currentAmount;
    }

    function addToTotal(itemName: Items, recipeCount: bigint): boolean {
        if (GAME.sideProducts[itemName].length > 0) {
            const itemsChosen: partialItems<bigint> = {};

            GAME.sideProducts[itemName].forEach((sideProduct) => {
                const total = _.sum(values(sideProduct));
                let runningTotal = 0;
                _.forIn(keys(sideProduct), (key) => {
                    const k = key as Items;
                    runningTotal += sideProduct[k] ?? 0;
                    if (Math.random() <= runningTotal / total) {
                        itemsChosen[k] = hasStorageCapacity(k);
                        return false;
                    }
                });
            });

            const canProduce = bigMin(recipeCount, ...Object.values(itemsChosen));

            if (bigGtE(canProduce, 1)) {
                keys(itemsChosen).forEach((x) => addAmount(x, canProduce));
            } else {
                return false;
            }

            return true;
        } else {
            const capacity = bigMin(recipeCount, hasStorageCapacity(itemName));
            if (bigGtE(capacity, 1)) {
                addAmount(itemName, capacity);
                return true;
            }
        }
        return false;
    }

    function getPower(itemName: Items, building: Items) {
        const power = ((stateRef.current.powerConsumptionProgress[itemName] ??=
            {})[building] ??= 0);
        const state = ((stateRef.current.powerConsumptionState[itemName] ??=
            {})[building] ??= PRODUCTION_NO_POWER);
        return [power, state] as const;
    }

    function getProductionProgress(itemName: Items, assemblerName: Items) {
        const time = ((stateRef.current.productionProgress[itemName] ??= {})[
            assemblerName
        ] ??= 0n);
        const state = ((stateRef.current.productionState[itemName] ??= {})[
            assemblerName
        ] ??= PRODUCTION_NO_INPUT);
        return [time, state] as const;
    }

    const addAmount = useCallback((itemName: Items, amount: bigint) => {
        const k = stateRef.current.amountThatWeHave[itemName] ?? 0n;
        stateRef.current.amountThatWeHave[itemName] = bigMax(0n, k + amount);
        const b = stateRef.current.amountCreated[itemName] ?? 0n;
        stateRef.current.amountCreated[itemName] = b + amount;

        if (GAME.hideOnBuy(itemName)) {
            markVisibility(itemName, false);
            stateRef.current.assemblers[itemName] = {};
        }
    }, []);

    const makeItemByhand = useCallback((itemName: Items, count: bigint) => {
        const now = new Date().getTime();
        if (makeByHandTimeRef.current > now - 200) return;
        makeByHandTimeRef.current = now;
        if (
            consumeMaterialsFromRecipe(
                itemName,
                stateRef.current.amountThatWeHave,
                count,
            )
        ) {
            addToTotal(itemName, count);
        }
    }, []);
    
    function dispatchAction(action: ACTIONS) {
        switch (action.action) {
            case 'add-box': {
                addContainer(action.recipe, action.box, action.amount); break;
            }
            case 'add-building': {
                addAssemblers(action.building, action.recipe, action.amount); break;
            }
            case 'craft-byhand': {
                makeItemByhand(action.recipe, action.amount); break;
            }
            case 'hide-item': {
                if (!stateRef.current.visible[action.itemName]) return;
                stateRef.current.visible[action.itemName] = false;
                break;
            }
            case 'unhide-item': {
                if (stateRef.current.visible[action.itemName]) return;
                const {
                    visible,
                    acknowledged,
                    timeSpentPlaying,
                    timeUnlockedAt,
                } = stateRef.current;
                visible[action.itemName] = true;
                acknowledged[action.itemName] ??= !GAME.displayNewBadge[action.itemName];
                timeUnlockedAt[action.itemName] ??= timeSpentPlaying;
                break;
            }
            case 'remove-building': {
                addAssemblers(action.building, action.recipe, -action.amount);
                break;
            }
            case 'ack': {
                acknowledgeItem(action.recipe);
                break;
            }
            case 'disable-recipe': {
                disableRecipe(action.recipe, true);
                break;
            }
            case 'enable-recipe': {
                disableRecipe(action.recipe, false);
                break;
            }
            case 'reset-game': {
                resetAll();
                break;
            }
            case 'set-amount': {
                setAmount(action.amount, action.item);
                break;
            }
            case 'hide-building-add-button': {
                if (stateRef.current.hideAddButtons[action.building]) return;
                stateRef.current.hideAddButtons[action.building] = true;
                break;
            }
            case 'unhide-building-add-button': {
                if (!stateRef.current.hideAddButtons[action.building]) return;
                stateRef.current.hideAddButtons[action.building] = false;
                break;
            }
            default: {
                const _EXHAUSTIVE: never = action;
            }
        }
    }
    
    const setAmount = (amount: string | number | bigint = 1, itemName: Items = "") => {
        if (typeof amount === 'string') {
            amount = parseFormat(amount);
        }
        if (typeof amount === 'number') amount = NumToBig(amount);
        stateRef.current.amountThatWeHave[itemName] = amount;
        stateRef.current.visible[itemName] ??= true;
    };
    
    const addAssemblers = useCallback(
        (level: Items, itemName: Items, amount: bigint) => {
            const k = stateRef.current.assemblers[itemName] ?? {};
            const appliedAssemblers = k[level] ?? 0n;
            const haveAssemblers =
                stateRef.current.amountThatWeHave[level] ?? 0n;
            amount = bigMin(amount, haveAssemblers);
            k[level] = appliedAssemblers + amount;
            stateRef.current.assemblers[itemName] = k;
            stateRef.current.amountThatWeHave[level] = haveAssemblers - amount;
        },
        [],
    );

    const addContainer = useCallback(
        (itemName: Items, container: Items, amount: bigint) => {
            stateRef.current.storage[itemName] ??= {};
            const haveStorage =
                stateRef.current.storage[itemName]![container] ?? 0n;
            const haveContainers =
                stateRef.current.amountThatWeHave[container] ?? 0n;
            amount = bigMin(amount, haveContainers);
            stateRef.current.storage[itemName]![container] =
                haveStorage + amount;
            stateRef.current.amountThatWeHave[container] =
                haveContainers - amount;
        },
        [],
    );

    return {
        stateRef,
        addAmount,
        addAssemblers,
        addContainer,
        addToTotal,
        setAmount,
        dispatchAction,
        makeItemByhand,
        getPower,
        getProductionProgress,
        markVisibility,
        hasStorageCapacity,
        saveGame,
        calculateStorage,
    };
}