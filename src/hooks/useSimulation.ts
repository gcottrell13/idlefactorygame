import { useCallback, useEffect, useRef, useState } from "react";
import GAME from "../values";
import { Items } from "../content/itemNames";
import _ from "lodash";
import { forEach, keys, mapPairs, values } from "../smap";
import { VERSION } from "../version";
import { useLocalStorage } from "./useLocalStorage";
import {
    State,
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
    PRODUCTION_HAS_POWER,
    PRODUCTION_RUNNING,
    PRODUCTION_OUTPUT_BLOCKED,
} from "../typeDefs/State";
import * as Assembly from "../assembly";

export function useProduction(ticksPerSecond: number) {
    const { existingStorage, saveGame, resetGame } = useLocalStorage();
    const stateRef = useRef<State>(existingStorage);
    const makeByHandTimeRef = useRef<number>(0);

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = { ...stateRef.current, ...state };
    };

    const [fps, setFps] = useState<number>(0);

    function calculateStorage(itemName: Items) {
        const canBeStoredIn = GAME.itemsCanBeStoreIn(itemName);
        if (canBeStoredIn.length === 0) return Number.MAX_SAFE_INTEGER;
        const storage = stateRef.current.storage[itemName];
        if (storage === undefined) return GAME.MIN_STORAGE;
        const assemblers = stateRef.current.assemblers[itemName] ?? {};
        return (
            Math.max(
                _.sumBy(
                    keys(assemblers),
                    (key) => GAME.storageSizes(key) * (assemblers[key] ?? 0),
                ),
                0,
            ) +
            Math.max(
                _.sumBy(
                    keys(storage),
                    (key) =>
                        (canBeStoredIn.includes(key)
                            ? GAME.storageSizes(key) ?? 0
                            : 0) * (storage[key] ?? 0),
                ),
                0,
            ) +
            GAME.MIN_STORAGE
        );
    }

    function hasStorageCapacity(item: Items, amt: number) {
        const currentAmount = stateRef.current.amountThatWeHave[item] ?? 0;
        return calculateStorage(item) - currentAmount >= amt;
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

    function getPower(itemName: Items, building: Items) {
        const power = ((stateRef.current.powerConsumptionProgress[itemName] ??=
            {})[building] ??= 0);
        const state = ((stateRef.current.powerConsumptionState[itemName] ??=
            {})[building] ??= PRODUCTION_NO_POWER);
        return [power, state] as const;
    }

    function getDedicatedResources(itemName: Items, building: Items) {
        const r = stateRef.current.dedicatedResources[itemName]?.[building];
        return r;
    }

    function checkHas(
        itemName: Items,
        assemblerName: Items,
        ingredient: Items,
        amount: number,
    ) {
        const { amountThatWeHave } = stateRef.current;
        const building = getDedicatedResources(itemName, assemblerName);
        const dedicated = building?.[ingredient];
        if (dedicated) {
            return dedicated[0] >= amount;
        } else {
            return (amountThatWeHave[ingredient] ?? 0) >= amount;
        }
    }

    function consumeMaterials(
        itemName: Items,
        assemblerName: Items,
        ingredient: Items,
        amount: number,
    ) {
        const { amountThatWeHave } = stateRef.current;
        const building = getDedicatedResources(itemName, assemblerName);
        const dedicated = building?.[ingredient];
        if (dedicated) {
            dedicated[0] = Math.max(0, dedicated[0] - amount);
        } else {
            const d = amountThatWeHave[ingredient] ?? 0;
            amountThatWeHave[ingredient] = Math.max(0, d - amount);
        }
    }

    function doPowerConsumption(itemName: Items, building: Items) {
        const [power, state] = getPower(itemName, building);
        if (state === PRODUCTION_HAS_POWER && power >= ticksPerSecond) {
            let amount = stateRef.current.assemblers[itemName]![building]!;
            const r = GAME.buildingPowerRequirementsPerSecond(building);
            mapPairs(r, (v, k) =>
                consumeMaterials(itemName, building, k, v * amount),
            );
        }
    }

    function checkPowerConsumption(itemName: Items, building: Items): boolean {
        const [power, state] = getPower(itemName, building);
        if (state === PRODUCTION_NO_POWER) {
            const r = GAME.buildingPowerRequirementsPerSecond(building);
            if (
                _.every(
                    mapPairs(r, (v, k) => checkHas(itemName, building, k, v)),
                )
            ) {
                stateRef.current.powerConsumptionProgress[itemName]![
                    building
                ] = 0;
                stateRef.current.powerConsumptionState[itemName]![building] =
                    PRODUCTION_HAS_POWER;
                return true;
            }
            return false;
        } else if (power >= ticksPerSecond) {
            stateRef.current.powerConsumptionState[itemName]![building] =
                PRODUCTION_NO_POWER;
            return checkPowerConsumption(itemName, building);
        } else {
            stateRef.current.powerConsumptionProgress[itemName]![building]! =
                power + 1;
            return true;
        }
    }

    function getProductionProgress(itemName: Items, assemblerName: Items) {
        const time = ((stateRef.current.productionProgress[itemName] ??= {})[
            assemblerName
        ] ??= 0);
        const state = ((stateRef.current.productionState[itemName] ??= {})[
            assemblerName
        ] ??= PRODUCTION_NO_INPUT);
        return [time, state] as const;
    }

    function buildingConsume(itemName: Items, assemblerName: Items) {
        const { amountThatWeHave } = stateRef.current;
        const scale = Math.pow(
            GAME.recipeScaleFactor(itemName),
            amountThatWeHave[itemName] ?? 0,
        );

        const recipe = GAME.recipes(itemName);
        if (!recipe) return null;

        let ingredient: Items;
        for (ingredient in recipe) {
            const amt = scale * (recipe[ingredient] ?? 0);
            if (!checkHas(itemName, assemblerName, ingredient, amt))
                return null;
        }

        for (ingredient in recipe) {
            const amt = scale * (recipe[ingredient] ?? 0);
            consumeMaterials(itemName, assemblerName, ingredient, amt);
        }
    }

    function doProduction(timeStep: number) {
        const {
            assemblers,
            amountThatWeHave,
            productionProgress,
            productionState,
            storage,
        } = stateRef.current;

        keys(assemblers)
            .sort()
            .forEach((itemName) => {
                forEach(
                    assemblers[itemName],
                    (assemblerCount, assemblerName) => {
                        if (
                            stateRef.current.disabledRecipes[itemName] === true
                        ) {
                            return;
                        }

                        let amountAddPerTick =
                            (GAME.assemblerSpeeds(assemblerName) *
                                assemblerCount *
                                timeStep) /
                            GAME.timePerRecipe(itemName);

                        const booster = GAME.buildingBoosts[assemblerName];
                        if (booster) {
                            amountAddPerTick *= Math.pow(
                                2,
                                amountThatWeHave[booster] ?? 0,
                            );
                        }

                        let [time, state] = getProductionProgress(
                            itemName,
                            assemblerName,
                        );

                        if (Number.isNaN(time) || time === undefined) time = 0;

                        if (!storage[itemName]) storage[itemName] = {};

                        // there's probably a better way to organize this code

                        if (state === PRODUCTION_OUTPUT_BLOCKED) {
                            if (addToTotal(itemName, 1)) {
                                time = 0;
                                state = PRODUCTION_NO_INPUT;
                            } else {
                                return;
                            }
                        }

                        const hadNoInput = state === PRODUCTION_NO_INPUT;
                        const hasPower = checkPowerConsumption(
                            itemName,
                            assemblerName,
                        );

                        if (hasPower && hadNoInput) {
                            const result = buildingConsume(
                                itemName,
                                assemblerName,
                            );
                            if (result === null) state = PRODUCTION_NO_INPUT;
                            else if (hadNoInput) {
                                time = -fps * amountAddPerTick;
                                state = PRODUCTION_RUNNING;
                            }
                        }

                        if (state === PRODUCTION_RUNNING) {
                            if (!hasPower) {
                                return;
                            }
                            doPowerConsumption(itemName, assemblerName);

                            let t: number = time as any;
                            t += amountAddPerTick;
                            time = t;

                            while (t >= 1) {
                                if (addToTotal(itemName, 1)) {
                                    t -= 1;
                                    time = t;
                                    if (
                                        buildingConsume(
                                            itemName,
                                            assemblerName,
                                        ) === null
                                    ) {
                                        state = PRODUCTION_NO_INPUT;
                                        break;
                                    }
                                } else {
                                    state = PRODUCTION_OUTPUT_BLOCKED;
                                    break;
                                }
                            }
                        }

                        productionProgress[itemName]![assemblerName] = time;
                        productionState[itemName]![assemblerName] = state;
                    },
                );
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
    }, []);

    const makeItemByhand = useCallback((itemName: Items, count: number) => {
        const now = new Date().getTime();
        if (makeByHandTimeRef.current >= now - 200) return;
        makeByHandTimeRef.current = now;
        for (let i = 0; i < count; i++) {
            if (addToTotal(itemName, 1)) {
                Assembly.consumeMaterialsFromRecipe(
                    itemName,
                    stateRef.current.amountThatWeHave,
                );
                updateUI();
            }
        }
    }, []);

    const canMakeItemByHand = useCallback((itemName: Items) => {
        if (GAME.requiredBuildings(itemName).includes("by-hand") === false)
            return null;
        if (
            Assembly.howManyRecipesCanBeMade(
                itemName,
                stateRef.current.amountThatWeHave,
            ) <= 0
        )
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
            updateUI();
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
            updateUI();
        },
        [],
    );

    const updateUI = useCallback(() => {
        const now = new Date().getTime();
        const before =
            stateRef.current.lastUIUpdateTimestamp === 0
                ? now - 1
                : stateRef.current.lastUIUpdateTimestamp;
        const timeDiff = Math.min(1, (now - before) / 1000);
        let fps = stateRef.current.ticksSinceLastUIUpdate / timeDiff;
        if (!isNaN(fps)) setFps(fps);
        stateRef.current.lastUIUpdateTimestamp = now;
        stateRef.current.ticksSinceLastUIUpdate = 0;
        stateRef.current.timeSpentPlaying += timeDiff;
    }, []);

    const resetAll = useCallback(() => {
        setState(resetGame());
        updateUI();
    }, []);

    const markVisibility = useCallback((item: Items, b: boolean) => {
        stateRef.current.visible[item] = b;
        stateRef.current.acknowledged[item] ??= false;
        updateUI();
    }, []);

    const disableRecipe = useCallback((itemName: Items, disable: boolean) => {
        stateRef.current.disabledRecipes[itemName] = disable;
        updateUI();
    }, []);

    const acknowledgeItem = (item: Items) => {
        stateRef.current.acknowledged[item] = true;
        updateUI();
    };

    const setAmount = (amount: number = 1, itemName: Items = "") => {
        stateRef.current.amountThatWeHave[itemName] = amount;
        stateRef.current.visible[itemName] ??= true;
        updateUI();
    };

    useEffect(() => {
        const i = setInterval(() => {
            const now = new Date().getTime();
            const timeDiff = Math.min(
                1,
                (now - stateRef.current.lastTickTimestamp) / 1000,
            );
            doProduction(timeDiff);
            stateRef.current.lastTickTimestamp = now;
            stateRef.current.ticksSinceLastUIUpdate++;
        }, 1000 / ticksPerSecond);
        return () => {
            clearInterval(i);
        };
    }, []);

    const UI_UPDATE_FREQUENCY_PER_SEC = 2;
    useEffect(() => {
        const i = setInterval(() => {
            updateUI();
        }, 1000 / UI_UPDATE_FREQUENCY_PER_SEC);
        return () => {
            clearInterval(i);
        };
    }, []);

    useEffect(() => {
        if (existingStorage.version[0] !== VERSION()[0]) {
            resetAll();
        }
        (document as any).setAmount = setAmount;
        setInterval(() => saveGame(stateRef.current), 10 * 1000);
    }, []);

    Assembly.checkVisible(stateRef.current);

    return {
        ...stateRef.current,
        state: {
            ...stateRef.current,
            calculateStorage,
        },
        fps,
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
