import React from "react";
import GAME from "../values";
import { OverlayTrigger, Badge, Table } from "react-bootstrap";
import {
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
    PRODUCTION_OUTPUT_BLOCKED,
    State,
} from "../typeDefs/State";
import Popover from "react-bootstrap/Popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { keys } from "../smap";
import { Items, partialItems } from "../content/itemNames";
import { formatNumber as d } from "../numberFormatter";

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
    const progress = state.productionProgress[itemName] ?? {};

    const baseCraftTime = GAME.timePerRecipe(itemName);
    const thisPower = state.powerConsumptionProgress[itemName] ?? {};

    const no = assemblersMakingThis[assemblerName] ?? 0;
    const boost = GAME.buildingBoosts[assemblerName];
    let speedPer = GAME.assemblerSpeeds(assemblerName) / baseCraftTime;
    if (boost) {
        speedPer *= Math.pow(2, state.amountThatWeHave[boost] ?? 0);
    }
    let label = (
        <span>
            <span className={"assembler-count-name"}>
                {no} {GAME.displayNames(assemblerName)} ({d(speedPer)}/s):
            </span>{" "}
            ({d(speedPer * no)}/s)
        </span>
    );
    const prog = progress[assemblerName] ?? null;
    if (thisPower[assemblerName] === PRODUCTION_NO_POWER) {
        const word = GAME.buildingPowerDisplayWord[assemblerName] ?? "Power";
        label = (
            <span>
                {label}{" "}
                <Badge bg={"danger"}>
                    <FontAwesomeIcon icon={faBolt} /> No {word}
                </Badge>
            </span>
        );
    } else if (state.disabledRecipes[itemName]) {
        label = (
            <span>
                {label} <Badge bg={"secondary"}>Disabled</Badge>
            </span>
        );
    } else if (prog === null || prog === PRODUCTION_NO_INPUT) {
        label = (
            <span>
                {label} <Badge bg={"danger"}>Missing Input</Badge>
            </span>
        );
    } else if (prog === PRODUCTION_OUTPUT_BLOCKED) {
        label = (
            <span>
                {label} <Badge bg={"warning"}>Output Full</Badge>
            </span>
        );
    } else if (typeof prog === "number" && prog < 0) {
        label = (
            <span>
                {label} <Badge>Starting...</Badge>
            </span>
        );
    } else {
        label = (
            <span>
                {label} <Badge>Working {d((prog as any) * 100)}%</Badge>
            </span>
        );
    }

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

    return <div className={"assembler-count"}>{label}</div>;
}
