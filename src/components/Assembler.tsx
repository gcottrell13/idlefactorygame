import React, { useEffect, useState } from "react";
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
    const [progressDisplay, setProgressDisplay] = useState<number>(0);
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<
        number | null
    >(null);

    const progress =
        (state.productionProgress[itemName] ?? {})[assemblerName] ?? null;
    const progressState =
        (state.productionState[itemName] ?? {})[assemblerName] ?? null;

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
        <span>
            <span className={"assembler-count-name"}>
                {no} {GAME.displayNames(assemblerName)} ({d(speedPer)}/s):
            </span>{" "}
            ({d(totalSpeed)}/s)
        </span>
    );
    let stateDisplay: JSX.Element | null = null;

    if (thisPowerState[assemblerName] === PRODUCTION_NO_POWER) {
        const word = GAME.buildingPowerDisplayWord[assemblerName] ?? "Power";
        stateDisplay = (
            <ProgressBar
                className={"building-progress"}
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
            <span>
                <Badge bg={"secondary"}>Disabled</Badge>
            </span>
        );
    } else if (progress === null || progressState === PRODUCTION_NO_INPUT) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress"}
                now={100}
                variant={"danger"}
                label={"Missing Input"}
            />
        );
    } else if (progressState === PRODUCTION_OUTPUT_BLOCKED) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress"}
                now={100}
                variant={"warning"}
                label={"Full"}
            />
        );
    } else if (progress < 0) {
        stateDisplay = (
            <span>
                <Badge>Starting...</Badge>
            </span>
        );
    } else if (progressState === PRODUCTION_RUNNING) {
        stateDisplay = (
            <ProgressBar
                className={"building-progress"}
                now={progressDisplay}
            />
        );
    }

    const updateSpeed = Math.max(4, 4 * totalSpeed);
    useEffect(() => {
        if (progressState === PRODUCTION_RUNNING) {
            const intervalHandle = setTimeout(() => {
                const now = new Date().getTime();
                if (lastUpdateTimestamp === null && progress) {
                    setProgressDisplay(progress * 100);
                    setLastUpdateTimestamp(now);
                } else {
                    const l = lastUpdateTimestamp ?? now;
                    const timeDelta = (now - l) / 1000;
                    const newProgress =
                        (progressDisplay + 100 * totalSpeed * timeDelta) % 100;
                    setProgressDisplay(newProgress);
                    setLastUpdateTimestamp(now);
                }
            }, 1000 / updateSpeed);
            return () => {
                clearTimeout(intervalHandle);
            };
        } else if (progressState === PRODUCTION_NO_INPUT) {
            setProgressDisplay(0);
            setLastUpdateTimestamp(null);
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
                                                {GAME.displayNames(requirement)}
                                            </td>
                                            <td>
                                                {state.amountThatWeHave[
                                                    requirement
                                                ] ?? 0}
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
        <div className={"assembler-count"}>
            {label} {stateDisplay}
        </div>
    );
}
