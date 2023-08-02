import { useCallback, useEffect, useRef, useState } from "react";
import GAME from "../values";
import { Items } from "../content/itemNames";
import _ from "lodash";
import { forEach, keys, values } from "../smap";
import { VERSION } from "../version";
import { useLocalStorage } from "./useLocalStorage";
import {
    State,
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
    PRODUCTION_OUTPUT_BLOCKED,
} from "../typeDefs/State";
import {
    checkAmounts,
    checkVisible,
    consumeMaterials,
    consumeMaterialsFromRecipe,
    howManyRecipesCanBeMade,
} from "../assembly";

export function useProduction(ticksPerSecond: number) {
    const { existingStorage, saveGame, resetGame } = useLocalStorage();
    const stateRef = useRef<State>(existingStorage);

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

    function doPowerConsumption(itemName: Items, building: Items) {
        const power = ((stateRef.current.powerConsumptionProgress[itemName] ??=
            {})[building] ??= PRODUCTION_NO_POWER);
        if (typeof power === "number" && power >= ticksPerSecond) {
            let amount = stateRef.current.assemblers[itemName]![building]!;
            const r = GAME.buildingPowerRequirementsPerSecond(building);
            while (amount-- > 0)
                consumeMaterials(
                    undefined,
                    stateRef.current.amountThatWeHave,
                    r,
                );
        }
    }

    function checkPowerConsumption(itemName: Items, building: Items): boolean {
        const power = ((stateRef.current.powerConsumptionProgress[itemName] ??=
            {})[building] ??= PRODUCTION_NO_POWER);
        if (power === PRODUCTION_NO_POWER) {
            const r = GAME.buildingPowerRequirementsPerSecond(building);
            if (checkAmounts(stateRef.current.amountThatWeHave, r)) {
                stateRef.current.powerConsumptionProgress[itemName]![
                    building
                ] = 0;
                return true;
            }
            return false;
        } else if (power >= ticksPerSecond) {
            stateRef.current.powerConsumptionProgress[itemName]![building] =
                PRODUCTION_NO_POWER;
            return checkPowerConsumption(itemName, building);
        } else {
            stateRef.current.powerConsumptionProgress[itemName]![building]! =
                power + 1;
            return true;
        }
    }

    function doProduction(timeStep: number) {
        const { assemblers, amountThatWeHave, productionProgress, storage } =
            stateRef.current;

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

                        let time =
                            productionProgress[itemName]?.[assemblerName];

                        if (Number.isNaN(time) || time === undefined)
                            time = null;

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
                        const hasPower = checkPowerConsumption(
                            itemName,
                            assemblerName,
                        );

                        if (hasPower && (time === null || hadNoInput)) {
                            time = consumeMaterialsFromRecipe(
                                itemName,
                                amountThatWeHave,
                            );
                            if (time === null) time = PRODUCTION_NO_INPUT;
                            else if (hadNoInput)
                                time = -ticksPerSecond * 0.5 * amountAddPerTick;
                        }

                        if (typeof time === "number") {
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
                                        consumeMaterialsFromRecipe(
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
                        productionProgress[itemName]![assemblerName] = time;
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
        for (let i = 0; i < count; i++) {
            if (addToTotal(itemName, 1)) {
                consumeMaterialsFromRecipe(
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
            howManyRecipesCanBeMade(
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

    const UI_UPDATE_FREQUENCY_PER_SEC = 4;
    useEffect(() => {
        const i = setInterval(() => {
            updateUI();
        }, 1000 / UI_UPDATE_FREQUENCY_PER_SEC);
        return () => {
            clearInterval(i);
        };
    }, []);

    useEffect(() => {
        if (existingStorage.version[0] !== VERSION[0]) {
            resetAll();
        }
        (document as any).setAmount = setAmount;
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
