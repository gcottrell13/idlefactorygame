import { useCallback, useEffect, useRef, useState } from "react";
import GAME from "../values";
import { Items, partialItems } from "../content/itemNames";
import _ from "lodash";
import { forEach, keys, values } from "../smap";
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
import {
    checkAmounts,
    checkVisible,
    consumeMaterials,
    consumeMaterialsFromRecipe,
    hideTheHideOnBuyItems,
    howManyRecipesCanBeMade,
} from "../assembly";
import { NumToBig, REALLY_BIG, SCALE, SCALE_N, bigMax, bigMin, bigSum, bigToNum, scaleBigInt } from "../bigmath";

export const PRODUCTION_SCALE = 10000;
export const PRODUCTION_SCALE_N = BigInt(PRODUCTION_SCALE);

export function useProduction(ticksPerSecond: number) {
    const { existingStorage, saveGame, resetGame } = useLocalStorage();
    const stateRef = useRef<State>(existingStorage);
    const makeByHandTimeRef = useRef<number>(0);

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = { ...stateRef.current, ...state };
    };

    const [fps, setFps] = useState<number>(0);

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

            if (canProduce >= SCALE_N) {
                keys(itemsChosen).forEach((x) => addAmount(x, canProduce));
            } else {
                return false;
            }

            return true;
        } else {
            const capacity = bigMin(recipeCount, hasStorageCapacity(itemName));
            if (capacity >= SCALE_N) {
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

    function doPowerConsumption(itemName: Items, building: Items) {
        const [power, state] = getPower(itemName, building);
        if (state === PRODUCTION_HAS_POWER && power >= ticksPerSecond) {
            let amount = stateRef.current.assemblers[itemName]![building]!;
            const r = GAME.buildingPowerRequirementsPerSecond[building];
            consumeMaterials(
                undefined,
                stateRef.current.amountThatWeHave,
                r,
                amount,
            );
        }
    }

    function checkPowerConsumption(itemName: Items, building: Items): boolean {
        const [power, state] = getPower(itemName, building);
        if (state === PRODUCTION_NO_POWER) {
            const r = GAME.buildingPowerRequirementsPerSecond[building];
            if (checkAmounts(stateRef.current.amountThatWeHave, r)) {
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
        ] ??= 0n);
        const state = ((stateRef.current.productionState[itemName] ??= {})[
            assemblerName
        ] ??= PRODUCTION_NO_INPUT);
        return [time, state] as const;
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

                        let amountAddPerTick = scaleBigInt(
                            assemblerCount,
                            PRODUCTION_SCALE * GAME.assemblerSpeeds[assemblerName] * timeStep /
                            GAME.timePerRecipe[itemName]
                        );

                        const booster = GAME.buildingBoosts[assemblerName];
                        if (booster) {
                            const amt = amountThatWeHave[booster] ?? 0n;
                            amountAddPerTick = scaleBigInt(amountAddPerTick, GAME.calculateBoost(booster, amt));
                        }

                        let [time, state] = getProductionProgress(
                            itemName,
                            assemblerName,
                        );

                        if (!storage[itemName]) storage[itemName] = {};

                        // there's probably a better way to organize this code

                        if (state === PRODUCTION_OUTPUT_BLOCKED) {
                            if (addToTotal(itemName, NumToBig(1))) {
                                time = 0n;
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
                            const result = consumeMaterialsFromRecipe(
                                itemName,
                                amountThatWeHave,
                                NumToBig(1),
                            );
                            if (!result) state = PRODUCTION_NO_INPUT;
                            else if (hadNoInput) {
                                time = scaleBigInt(amountAddPerTick, -fps);
                                state = PRODUCTION_RUNNING;
                            }
                        }

                        if (state === PRODUCTION_RUNNING) {
                            if (!hasPower) {
                                return;
                            }
                            doPowerConsumption(itemName, assemblerName);

                            time += amountAddPerTick;
                            
                            const amountToProduce = time / PRODUCTION_SCALE_N / SCALE_N;
                            if (amountToProduce >= 1) {
                                if (addToTotal(itemName, amountToProduce)) {
                                    time -= amountToProduce * PRODUCTION_SCALE_N;
                                    if (
                                        !consumeMaterialsFromRecipe(
                                            itemName,
                                            amountThatWeHave,
                                            amountToProduce,
                                        )
                                    ) {
                                        state = PRODUCTION_NO_INPUT;
                                    }
                                } else {
                                    state = PRODUCTION_OUTPUT_BLOCKED;
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
        updateUI();
    }, []);

    const canMakeItemByHand = useCallback((itemName: Items) => {
        if (GAME.requiredBuildings(itemName).includes("by-hand") === false)
            return null;
        if (
            howManyRecipesCanBeMade(
                itemName,
                stateRef.current.amountThatWeHave,
            ) < SCALE_N
        )
            return false;
        return hasStorageCapacity(itemName) >= SCALE_N;
    }, []);

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
            updateUI();
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

    const setAmount = (amount: number | bigint = 1, itemName: Items = "") => {
        if (typeof amount === 'number') amount = NumToBig(amount);
        stateRef.current.amountThatWeHave[itemName] = amount;
        stateRef.current.visible[itemName] ??= true;
        updateUI();
    };
    const clearVisibles = () => {
        stateRef.current.visible = {};
        const {
            timeUnlockedAt, 
            acknowledged, 
            assemblers,
            visible,
        } = stateRef.current;
        checkVisible(stateRef.current);
        hideTheHideOnBuyItems(stateRef.current);
        keys(timeUnlockedAt).forEach(itemName => {
            if (visible[itemName] === undefined) {
                delete timeUnlockedAt[itemName];
                delete acknowledged[itemName];
            }
            if (visible[itemName] === false) {
                delete assemblers[itemName];
            }
        });
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
        (document as any).game = {};
        (document as any).game.setAmount = setAmount;
        (document as any).game.clearVisibles = clearVisibles;
        setInterval(() => saveGame(stateRef.current), 10 * 1000);
    }, []);

    checkVisible(stateRef.current);

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
