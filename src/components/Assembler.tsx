import React, { useEffect, useRef, useState } from "react";
import GAME from "../values";
import { OverlayTrigger, Badge, Table } from "react-bootstrap";
import {
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
    PRODUCTION_OUTPUT_BLOCKED,
    PRODUCTION_RUNNING,
    State,
} from "../typeDefs/State";
import Popover from "react-bootstrap/Popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { keys } from "../smap";
import { Items, partialItems } from "../content/itemNames";
import { formatNumber as d } from "../numberFormatter";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Sprite } from "./Sprite";

type Props = {
    itemName: Items;
    assemblerName: Items;
    state: State;
    assemblersMakingThis: partialItems<number>;
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

    const progress =
        (state.productionProgress[itemName] ?? {})[assemblerName] ?? 0;
    const progressState =
        (state.productionState[itemName] ?? {})[assemblerName] ?? null;

    const [progressDisplay, setProgressDisplay] = useState<number>(progress);
    const knownActualProgress = useRef<number>(progress);

    const baseCraftTime = GAME.timePerRecipe(itemName);
    // const thisPower = state.powerConsumptionProgress[itemName] ?? {};
    const thisPowerState = state.powerConsumptionState[itemName] ?? {};

    const no = assemblersMakingThis[assemblerName] ?? 0;
    const boost = GAME.buildingBoosts[assemblerName];
    let speedPer = GAME.assemblerSpeeds(assemblerName) / baseCraftTime;
    if (boost) {
        speedPer *= Math.pow(2, state.amountThatWeHave[boost] ?? 0);
    }
    const totalSpeed = speedPer * no;

    let label = (
        <span className={"assembler-count"}>
            <span className={"assembler-count-name"}>
                {no} <Sprite name={assemblerName} />
                {GAME.displayNames(assemblerName)} ({d(speedPer)}/s):
            </span>{" "}
            ({d(totalSpeed)}/s)
        </span>
    );
    let stateDisplay: JSX.Element | null = null;
    const updateSpeed = Math.min(20, Math.max(4, 4 * totalSpeed));

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
                className={"building-progress " + speedClass}
                now={progressDisplay * 100}
            />
        );
    }

    useEffect(() => {
        if (progressState === PRODUCTION_RUNNING) {
            if (totalSpeed > 5) {
                setProgressDisplay(1);
                return;
            }
            const intervalHandle = setTimeout(() => {
                const now = new Date().getTime();
                if (knownActualProgress.current !== progress) {
                    if (progress < knownActualProgress.current) {
                        setInstantAnim(true);
                        setProgressDisplay(0);
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
                        progressDisplay + totalSpeed * timeDelta;
                    setProgressDisplay(newProgress);
                }
                setLastUpdateTimestamp(now);
            }, 1000 / updateSpeed);
            return () => {
                clearTimeout(intervalHandle);
            };
        } else {
            setProgressDisplay(0);
            setLastUpdateTimestamp(null);
            setInstantAnim(true);
        }
    }, [totalSpeed, progressDisplay, progressState, lastUpdateTimestamp]);

    const powerRequirements =
        GAME.buildingPowerRequirementsPerSecond(assemblerName);
    if (keys(powerRequirements).length > 0) {
        const overlay = (
            <Popover className={"popover-no-max-width"}>
                <Popover.Body>
                    {Math.floor(no)} {GAME.displayNames(assemblerName)}{" "}
                    consuming:
                    <Table>
                        <tbody>
                            {keys(powerRequirements)
                                .sort()
                                .map((requirement) => {
                                    const rate =
                                        powerRequirements[requirement] ?? 0;
                                    return (
                                        <tr key={requirement}>
                                            <td>
                                                <Sprite name={requirement} />
                                                {GAME.displayNames(requirement)}
                                            </td>
                                            <td>
                                                {d(
                                                    state.amountThatWeHave[
                                                        requirement
                                                    ],
                                                )}
                                            </td>
                                            <td className="assembler-count-name">
                                                ({d(rate)}/s)
                                            </td>
                                            <td>{d(no * rate)}/s</td>
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
            <span className={"building-state-display"}>{stateDisplay}</span>
        </>
    );
}
