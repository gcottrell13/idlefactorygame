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
import Big from "../bigmath";
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

    function calculateStorage(itemName: Items): Big {
        const canBeStoredIn = GAME.itemsCanBeStoreIn[itemName];
        if (canBeStoredIn.length === 0) return Big.Infinity();
        const storage = stateRef.current.storage[itemName];
        if (storage === undefined) return GAME.MIN_STORAGE;
        const assemblers = stateRef.current.assemblers[itemName] ?? {};
        const assemblersMap = keys(assemblers).map(
            (key) => (assemblers[key] ?? Big.Zero).mul(GAME.storageSizes[key])
        );
        return Big.sum(
            Big.max(Big.sum(...assemblersMap), Big.Zero),
            Big.max(
                Big.sum(
                    ...keys(storage).map(
                        (key) =>
                            (storage[key] ?? Big.Zero).mul(canBeStoredIn.includes(key)
                                ? GAME.storageSizes[key] ?? Big.Zero
                                : Big.Zero),
                    )
                ),
                Big.Zero,
            ),
            GAME.MIN_STORAGE
        );
    }

    function hasStorageCapacity(item: Items): Big {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? Big.Zero;
        return calculateStorage(item).sub(currentAmount);
    }

    function addToTotal(itemName: Items, recipeCount: Big): boolean {
        if (GAME.sideProducts[itemName].length > 0) {
            const itemsChosen: partialItems<Big> = {};

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

            const canProduce = Big.min(recipeCount, ...Object.values(itemsChosen));

            if (canProduce.gte(Big.One)) {
                keys(itemsChosen).forEach((x) => addAmount(x, canProduce));
            } else {
                return false;
            }

            return true;
        } else {
            const capacity = Big.min(recipeCount, hasStorageCapacity(itemName));
            if (capacity.gte(Big.One)) {
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
        ] ??= Big.Zero);
        const state = ((stateRef.current.productionState[itemName] ??= {})[
            assemblerName
        ] ??= PRODUCTION_NO_INPUT);
        return [time, state] as const;
    }

    const addAmount = useCallback((itemName: Items, amount: Big) => {
        const k = stateRef.current.amountThatWeHave[itemName] ?? Big.Zero;
        stateRef.current.amountThatWeHave[itemName] = Big.max(Big.Zero, k.add(amount));
        const b = stateRef.current.amountCreated[itemName] ?? Big.Zero;
        stateRef.current.amountCreated[itemName] = b.add(amount);

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
                setAmount(parseFormat(action.amount), action.item);
                break;
            }
            case 'add-amount': {
                addAmount(action.item, parseFormat(action.amount));
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
    
    const setAmount = (amount: bigint = 1n, itemName: Items = "") => {
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
            k[level] = bigMax(0n, appliedAssemblers + amount);
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
