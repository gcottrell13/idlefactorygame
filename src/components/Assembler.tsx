import React, { useEffect, useRef, useState } from "react";
import GAME from "../values";
import { OverlayTrigger, Badge, Table, Button } from "react-bootstrap";
import {
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
    PRODUCTION_OUTPUT_BLOCKED,
    PRODUCTION_RUNNING,
    State,
} from "../typeDefs/State";
import Popover from "react-bootstrap/Popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { keys } from "../smap";
import { Items, partialItems } from "../content/itemNames";
import { formatNumber as d } from "../numberFormatter";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Sprite } from "./Sprite";
import { NumToBig, bigGt, bigToNum, scaleBigInt, bigMul } from "../bigmath";
import { PRODUCTION_SCALE, PRODUCTION_SCALE_N } from "../hooks/useSimulation";
import { useGameState } from "../hooks/useGameState";

type Props = {
    itemName: Items;
    assemblerName: Items;
    state: State;
    assemblersMakingThis: partialItems<bigint>;
};

export function Assembler({
    itemName,
    assemblerName,
    assemblersMakingThis,
    state,
}: Props) {
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<
        number | null
    >(null);
    const [instantAnim, setInstantAnim] = useState(false);
    const { dispatchAction } = useGameState();

    const progress =
        (state.productionProgress[itemName] ?? {})[assemblerName] ?? 0n;
    const progressState =
        (state.productionState[itemName] ?? {})[assemblerName] ?? null;

    const [progressDisplay, setProgressDisplay] = useState(progress);
    const knownActualProgress = useRef(progress);

    const progressDisplayNumber = bigToNum(progressDisplay) / PRODUCTION_SCALE;

    const baseCraftTime = GAME.timePerRecipe[itemName];
    // const thisPower = state.powerConsumptionProgress[itemName] ?? {};
    const thisPowerState = state.powerConsumptionState[itemName] ?? {};

    const no = assemblersMakingThis[assemblerName] ?? 0n;
    let speedPer = GAME.assemblerSpeeds[assemblerName] / baseCraftTime;
    speedPer *= GAME.calculateBoost(assemblerName, state);
    const totalSpeed = scaleBigInt(no, speedPer);

    let label = (
        <span className={"assembler-count"}>
            <span className={"assembler-count-name"}>
                {d(no)} <Sprite name={assemblerName} />
                {GAME.displayNames(assemblerName)}
                <span className={"rate-per"}>({d(speedPer)}/s):</span>
            </span>{" "}
            ({d(totalSpeed)}/s)
        </span>
    );
    let stateDisplay: JSX.Element | null = null;
    const updateSpeed = bigGt(totalSpeed, 20) ? 20 : Math.max(4, bigToNum(totalSpeed) * 4);

    if (thisPowerState[assemblerName] === PRODUCTION_NO_POWER) {
        const word = GAME.buildingPowerDisplayWord[assemblerName] ?? "Power";
        stateDisplay = (
            <ProgressBar
                className={"building-progress instant"}
                now={100}
                variant={"danger"}
                label={
                    <span>
                        <FontAwesomeIcon icon={faBolt} /> No {word}
                    </span>
                }
            />
        );
    } else if (state.disabledRecipes[itemName]) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress secondary instant"}
                now={100}
                label={"Disabled"}
            />
        );
    } else if (progressState === PRODUCTION_NO_INPUT) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress instant"}
                now={100}
                variant={"danger"}
                label={"Missing Input"}
            />
        );
    } else if (progressState === PRODUCTION_OUTPUT_BLOCKED) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress instant"}
                now={100}
                variant={"warning"}
                label={"Full"}
            />
        );
    } else if (progress < 0) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress instant"}
                now={100}
                label={"Starting..."}
            />
        );
    } else if (progressState === PRODUCTION_RUNNING) {
        let speedClass = "slow";
        if (instantAnim) speedClass = "instant";
        else if (updateSpeed > 15) speedClass = "instant";
        else if (updateSpeed > 8) speedClass = "fast";
        stateDisplay = (
            <ProgressBar
                animated={progressDisplayNumber === 1}
                className={"building-progress " + speedClass}
                now={progressDisplayNumber * 100}
            />
        );
    }

    useEffect(() => {
        if (progressState === PRODUCTION_RUNNING) {
            if (bigGt(totalSpeed, 5)) {
                setProgressDisplay(100n * PRODUCTION_SCALE_N);
                return;
            }
            const intervalHandle = setTimeout(() => {
                const now = new Date().getTime();
                if (knownActualProgress.current !== progress) {
                    if (progress < knownActualProgress.current) {
                        setInstantAnim(true);
                        setProgressDisplay(0n);
                    } else {
                        setInstantAnim(false);
                        setProgressDisplay(progress);
                    }
                    knownActualProgress.current = progress;
                } else if (lastUpdateTimestamp === null && progress) {
                    setProgressDisplay(progress);
                } else {
                    const l = lastUpdateTimestamp ?? now;
                    const timeDelta = (now - l) / 1000;
                    const newProgress =
                        progressDisplay + scaleBigInt(totalSpeed, Math.floor(timeDelta * PRODUCTION_SCALE));
                    setProgressDisplay(newProgress);
                }
                setLastUpdateTimestamp(now);
            }, 1000 / updateSpeed);
            return () => {
                clearTimeout(intervalHandle);
            };
        } else {
            setProgressDisplay(0n);
            setLastUpdateTimestamp(null);
            setInstantAnim(true);
        }
    }, [totalSpeed, progressDisplay, progressState, lastUpdateTimestamp]);

    const powerRequirements =
        GAME.buildingPowerRequirementsPerSecond[assemblerName];
    if (keys(powerRequirements).length > 0) {
        const overlay = (
            <Popover className={"popover-no-max-width"}>
                <Popover.Body>
                    {d(no)} {GAME.displayNames(assemblerName)}{" "}
                    consuming:
                    <Table>
                        <tbody>
                            {keys(powerRequirements)
                                .sort()
                                .map((requirement) => {
                                    const rate =
                                        powerRequirements[requirement] ?? 0n;
                                    return (
                                        <tr key={requirement}>
                                            <td>
                                                <Sprite name={requirement} />
                                                {GAME.displayNames(requirement)}
                                            </td>
                                            <td>
                                                {d(state.amountThatWeHave[requirement])}
                                            </td>
                                            <td className="rate-per">
                                                ({d(rate)}/s)
                                            </td>
                                            <td>{d(bigMul(no, rate))}/s</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Table>
                </Popover.Body>
            </Popover>
        );
        label = (
            <OverlayTrigger placement={"right"} overlay={overlay}>
                {label}
            </OverlayTrigger>
        );
    }

    return (
        <>
            <span className={"building-label"}>{label}</span>
            <span className={'remove-building-container'}>
                <OverlayTrigger placement={"left"} overlay={<Popover><Popover.Body>Remove All</Popover.Body></Popover>}>
                    <Button
                        className={'assembler-remove-button'}
                        onClick={() => dispatchAction({
                            action: 'remove-building',
                            amount: no,
                            building: assemblerName,
                            recipe: itemName,
                        })}
                        variant={'secondary'}
                    >
                        -
                    </Button>
                </OverlayTrigger>
            </span>
            <span className={"building-state-display"}>{stateDisplay}</span>
        </>
    );
}
