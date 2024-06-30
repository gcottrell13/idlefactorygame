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
import { parseFormat } from "../numberFormatter";
import { ACTIONS } from "../content/actions";
import Decimal from "decimal.js";
import { INFINITY, ONE, ZERO } from "../decimalConsts";

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

    function calculateStorage(itemName: Items): Decimal {
        const canBeStoredIn = GAME.itemsCanBeStoreIn[itemName];
        if (canBeStoredIn.length === 0) return INFINITY;
        const storage = stateRef.current.storage[itemName];
        if (storage === undefined) return GAME.MIN_STORAGE;
        const assemblers = stateRef.current.assemblers[itemName] ?? {};
        const assemblersMap = keys(assemblers).map(
            (key) => (assemblers[key] ?? ZERO).mul(GAME.storageSizes[key])
        );
        return Decimal.sum(
            Decimal.max(Decimal.sum(...assemblersMap), ZERO),
            Decimal.max(
                Decimal.sum(
                    ...keys(storage).map(
                        (key) =>
                            (storage[key] ?? ZERO).mul(canBeStoredIn.includes(key)
                                ? GAME.storageSizes[key] ?? ZERO
                                : ZERO),
                    )
                ),
                ZERO,
            ),
            GAME.MIN_STORAGE
        );
    }

    function hasStorageCapacity(item: Items): Decimal {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? ZERO;
        return calculateStorage(item).sub(currentAmount);
    }

    function addToTotal(itemName: Items, recipeCount: Decimal): boolean {
        if (GAME.sideProducts[itemName].length > 0) {
            const itemsChosen: partialItems<Decimal> = {};

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

            const canProduce = Decimal.min(recipeCount, ...Object.values(itemsChosen));

            if (canProduce.gte(ONE)) {
                keys(itemsChosen).forEach((x) => addAmount(x, canProduce));
            } else {
                return false;
            }

            return true;
        } else {
            const capacity = Decimal.min(recipeCount, hasStorageCapacity(itemName));
            if (capacity.gte(ONE)) {
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
        ] ??= ZERO);
        const state = ((stateRef.current.productionState[itemName] ??= {})[
            assemblerName
        ] ??= PRODUCTION_NO_INPUT);
        return [time, state] as const;
    }

    const addAmount = useCallback((itemName: Items, amount: Decimal) => {
        const k = stateRef.current.amountThatWeHave[itemName] ?? ZERO;
        stateRef.current.amountThatWeHave[itemName] = Decimal.max(ZERO, k.add(amount));
        const b = stateRef.current.amountCreated[itemName] ?? ZERO;
        stateRef.current.amountCreated[itemName] = b.add(amount);

        if (GAME.hideOnBuy(itemName)) {
            markVisibility(itemName, false);
            stateRef.current.assemblers[itemName] = {};
        }
    }, []);

    const makeItemByhand = useCallback((itemName: Items, count: Decimal) => {
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
                addAssemblers(action.building, action.recipe, action.amount.negated());
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
    
    const setAmount = (amount: Decimal = ONE, itemName: Items = "") => {
        stateRef.current.amountThatWeHave[itemName] = amount;
        stateRef.current.visible[itemName] ??= true;
    };
    
    const addAssemblers = useCallback(
        (level: Items, itemName: Items, amount: Decimal) => {
            const k = stateRef.current.assemblers[itemName] ?? {};
            const appliedAssemblers = k[level] ?? ZERO;
            const haveAssemblers =
                stateRef.current.amountThatWeHave[level] ?? ZERO;
            amount = Decimal.min(amount, haveAssemblers);
            k[level] = Decimal.max(ZERO, appliedAssemblers.add(amount));
            stateRef.current.assemblers[itemName] = k;
            stateRef.current.amountThatWeHave[level] = haveAssemblers.sub(amount);
        },
        [],
    );

    const addContainer = useCallback(
        (itemName: Items, container: Items, amount: Decimal) => {
            stateRef.current.storage[itemName] ??= {};
            const haveStorage =
                stateRef.current.storage[itemName]![container] ?? ZERO;
            const haveContainers =
                stateRef.current.amountThatWeHave[container] ?? ZERO;
            amount = Decimal.min(amount, haveContainers);
            stateRef.current.storage[itemName]![container] = haveStorage.add(amount);
            stateRef.current.amountThatWeHave[container] = haveContainers.sub(amount);
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
