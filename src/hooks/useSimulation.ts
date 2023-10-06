import { useCallback, useEffect, useReducer, useState } from "react";
import GAME from "../values";
import { Items } from "../content/itemNames";
import _ from "lodash";
import { forEach, keys } from "../smap";
import {
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
import { NumToBig, bigFloor, bigGtE, bigLt, scaleBigInt } from "../bigmath";
import { ACTIONS } from "../content/actions";
import { useGameState } from "./useGameState";
import { NumberFormat, setMode } from "../numberFormatter";

export const PRODUCTION_SCALE = 10000;
export const PRODUCTION_SCALE_N = BigInt(PRODUCTION_SCALE);

const updateTimestamps: number[] = [];

export function useProduction(ticksPerSecond: number) {
    const {
        stateRef,
        addToTotal,
        dispatchAction,
        getPower,
        getProductionProgress,
        hasStorageCapacity,
        setAmount,
        saveGame,
        calculateStorage,
    } = useGameState();

    const [fps, setFps] = useState(0);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

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

                        amountAddPerTick = scaleBigInt(amountAddPerTick,
                            GAME.calculateBoost(assemblerName, stateRef.current)
                        );

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

                            const amountToProduce = time / PRODUCTION_SCALE_N;
                            if (bigGtE(amountToProduce, 1)) {
                                if (addToTotal(itemName, bigFloor(amountToProduce))) {
                                    time -= amountToProduce * PRODUCTION_SCALE_N;
                                    if (
                                        !consumeMaterialsFromRecipe(
                                            itemName,
                                            amountThatWeHave,
                                            bigFloor(amountToProduce),
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


    const canMakeItemByHand = useCallback((itemName: Items) => {
        if (!stateRef.current.visible[itemName])
            return false;
        if (GAME.requiredBuildings(itemName).includes("by-hand") === false)
            return null;
        if (
            bigLt(howManyRecipesCanBeMade(
                itemName,
                stateRef.current.amountThatWeHave,
            ), 1)
        )
            return false;
        return bigGtE(hasStorageCapacity(itemName), 1);
    }, []);


    const updateUI = useCallback(() => {
        const now = new Date().getTime();

        while (updateTimestamps[0] < now - 1000) {
            updateTimestamps.shift();
        }
        setFps(updateTimestamps.length);
        forceUpdate();
        const before =
            stateRef.current.lastUIUpdateTimestamp === 0
                ? now - 1
                : stateRef.current.lastUIUpdateTimestamp;
        const timeDiff = Math.min(1, (now - before) / 1000);
        stateRef.current.lastUIUpdateTimestamp = now;
        stateRef.current.ticksSinceLastUIUpdate = 0;
        stateRef.current.timeSpentPlaying += timeDiff;
    }, []);

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

    const clearVisibles = () => {
        stateRef.current.visible = {};
        const {
            timeUnlockedAt,
            acknowledged,
            assemblers,
            visible,
        } = stateRef.current;
        checkVisible(stateRef.current, doAction);
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
            updateTimestamps.push(now);
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
        (document as any).game ??= {};
        (document as any).game.setAmount = setAmount;
        (document as any).game.clearVisibles = clearVisibles;
        setInterval(() => saveGame(stateRef.current), 10 * 1000);
    }, []);

    function doAction(action: ACTIONS) {
        dispatchAction(action);
        updateUI();
    }

    checkVisible(stateRef.current, doAction);

    setMode(stateRef.current.numberFormatMode ?? NumberFormat.SUFFIX);

    return {
        ...stateRef.current,
        state: {
            ...stateRef.current,
            calculateStorage,
        },
        fps,
        canMakeItemByHand,
        doAction,
    };
}
