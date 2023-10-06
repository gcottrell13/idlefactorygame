import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { howManyRecipesCanBeMade } from "../assembly";
import GAME from "../values";
import { Items, partialItems } from "../content/itemNames";
import {
    Button,
    Row,
    Col,
    OverlayTrigger,
    Badge,
    Table,
    ProgressBar,
} from "react-bootstrap";
import Popover from "react-bootstrap/Popover";
import { keys, values, mapPairs } from "../smap";
import "bootstrap/dist/css/bootstrap.min.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faThumbsUp,
    faChevronCircleDown,
    faBolt,
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { formatNumber as d, formatSeconds } from "../numberFormatter";
import { useCalculateRates } from "../hooks/useCalculateRates";
import { useProduction } from "../hooks/useSimulation";
import { Assembler } from "./Assembler";
import { Sprite } from "./Sprite";
import { REALLY_BIG, bigDiv, bigFloor, bigGt, bigMin, bigMul, bigSum, bigToNum } from "../bigmath";
import { useGameState } from "../hooks/useGameState";

type func = () => void;

type Props = {
    amt: bigint;
    itemName: Items;
    state: ReturnType<typeof useProduction>["state"];
    assemblerButtons: JSX.Element[];
    assemblersMakingThis: partialItems<bigint>;
    boxButtons: JSX.Element[];
    makeByHand: func | false | null;
    onMouseover: func | undefined;
    disableRecipe: func;
    currentClickAmount: bigint;
} & ReturnType<typeof useCalculateRates>;

export function ItemDisplay({
    amt,
    itemName,
    assemblerButtons,
    boxButtons,
    makeByHand,
    onMouseover,
    disableRecipe,
    assemblersMakingThis,
    state,
    currentClickAmount,
    effectiveConsumptionRates,
    effectiveProductionRates,
    powerConsumptionRates,
    assemblerIsStuckOrDisabled,
    maxConsumptionRates,
}: Props) {
    const canMakeByHand = bigMin(
        currentClickAmount,
        howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
        bigFloor(state.calculateStorage(itemName) - amt),
        GAME.maxCraftAtATime(itemName, state),
    );

    const { dispatchAction } = useGameState();

    const recipeDisabled = state.disabledRecipes[itemName] === true;
    const thisPowerRequirements =
        GAME.buildingPowerRequirementsPerSecond[itemName];

    const assemblers = keys(assemblersMakingThis).map((name) => (
        <Assembler
            assemblerName={name}
            assemblersMakingThis={assemblersMakingThis}
            itemName={itemName}
            state={state}
            key={name}
        />
    ));

    const disableButton =
        assemblers.length > 0 ? (
            <Button
                className={"assembler-disable-button"}
                onClick={disableRecipe}
                variant={recipeDisabled ? "primary" : "secondary"}
            >
                {recipeDisabled ? "Start" : "Stop"}
            </Button>
        ) : null;

    const byproducts = _.uniq(
        GAME.sideProducts[itemName].flatMap((x) => keys(x)),
    ).filter((x) => x != itemName);
    const byproductString = byproducts.map(GAME.displayNames).join(", ");

    const producingRate = bigSum(values(effectiveProductionRates[itemName]));
    const othersConsuming = effectiveConsumptionRates[itemName] ?? {};
    const othersConsumingAsPower = powerConsumptionRates[itemName] ?? {};
    const othersConsumingAsPowerRate = bigSum(
        values(othersConsumingAsPower).map((k) => k[2]),
    );
    const othersConsumingRate =
        bigSum(values(othersConsuming)) + othersConsumingAsPowerRate;

    const recipe = GAME.recipes[itemName];
    const formatIngredients = keys(recipe)
        .map((name) => [name, recipe[name]!] as const)
        .filter(([_name, count]) => count > 0)
        .map(([name, count]) => (
            <tr key={name}>
                <td className={"popover-ingredient-count"}>
                    {d(bigMul(count, GAME.calculateRecipeScale(itemName, amt)))}
                </td>
                <td>
                    <Sprite name={name} />
                </td>
                <td>
                    {GAME.displayNames(name)}
                </td>
                <td>
                    <span className={"popover-ingredient-has"}>
                        ({d(state.amountThatWeHave[name] ?? 0)})
                    </span>
                </td>
            </tr>
        ));

    const byproductOf = GAME.makesAsASideProduct(itemName).map(
        GAME.displayNames,
    );
    const storageObjects = GAME.itemsCanBeStoreIn[itemName].map(
        GAME.displayNames,
    );

    const storageValueIfContainer = GAME.storageSizes[itemName];

    const maxValue = state.calculateStorage(itemName);

    const assemblerSpeed = GAME.assemblerSpeeds[itemName];
    const unlocks = GAME.unlocks[itemName].map(GAME.displayNames);
    const madeIn = GAME.requiredBuildings(itemName).map(GAME.displayNames);

    const historyVisible =
        assemblers.length > 0 ||
            producingRate > 0 ||
            keys(othersConsumingAsPower).length > 0
            ? "visible"
            : "";
    const netRate = producingRate - othersConsumingRate;
    const satisfactionPercent = othersConsumingRate > 0n
        ? bigToNum(bigDiv(producingRate * 100n, othersConsumingRate))
        : 100;

    const othersConsumingThis = GAME.recipesConsumingThis[itemName]
        .filter((recipeName) => keys(state.assemblers[recipeName]).length > 0)
        .sort((a, b) => (othersConsuming[a] ?? 0n) > (othersConsuming[b] ?? 0n) ? 1 : -1)
        .map((recipeName) => {
            const states = keys(state.assemblers[recipeName]).map((an) =>
                assemblerIsStuckOrDisabled(recipeName, an),
            );
            const fullness = states.filter((x) => x === "full");
            let s = "";
            let color = "";
            const rate = othersConsuming[recipeName];
            if (state.disabledRecipes[recipeName]) {
                s = "disabled";
                color = "text-danger";
            } else if (fullness.length > 0) {
                s = "full";
                color = "text-warning";
            }
            return (
                <tr key={recipeName}>
                    <td>{GAME.displayNames(recipeName)}</td>
                    <td>({d(rate)}/s)</td>
                    <td className={color}>{s}</td>
                </tr>
            );
        });

    othersConsumingThis.push(
        ...mapPairs(
            othersConsumingAsPower,
            ([count, total, consumption], name) => {
                const color = count < total ? "text-warning" : "";
                return (
                    <tr key={`power-${name}`}>
                        <td>
                            {d(total)} {GAME.displayNames(name)}
                        </td>
                        <td>({d(consumption)}/s)</td>
                        <td className={color}>
                            {d(count)} / {d(total)}
                        </td>
                    </tr>
                );
            },
        ),
    );

    const g = (
        <FontAwesomeIcon
            icon={netRate >= 0 ? faThumbsUp : faChevronCircleDown}
            className={netRate >= 0 ? "" : "text-danger"}
        />
    );
    let historyDisplay = (
        <span className={`history-display ${historyVisible}`}>{g}</span>
    );

    if (historyVisible) {
        const overlay = (
            <Popover className={"popover-no-max-width"}>
                <Popover.Body>
                    producing: {d(producingRate)}/s - {satisfactionPercent}%
                    <br />
                    consumed: {d(othersConsumingRate)}/s
                    <span className={'rate-per'}>
                        (max {d(maxConsumptionRates[itemName])}/s)
                    </span>
                    <br />
                    <ProgressBar
                        now={satisfactionPercent}
                        variant={
                            satisfactionPercent < 20 ? 'danger' :
                            satisfactionPercent < 50 ? 'warning' :
                            'success'
                        }
                    />
                    <Table>
                        <tbody>{othersConsumingThis}</tbody>
                    </Table>
                </Popover.Body>
            </Popover>
        );
        historyDisplay = (
            <OverlayTrigger placement="right" overlay={overlay}>
                {historyDisplay}
            </OverlayTrigger>
        );
    }

    const powerRequirementDisplay = mapPairs(
        thisPowerRequirements,
        (value, item) => (
            <tr key={item}>
                <td>
                    <FontAwesomeIcon icon={faBolt} />
                </td>
                <td style={{ paddingRight: "10px" }}>
                    <Sprite name={item} /> {GAME.displayNames(item)}
                </td>
                <td>{d(value)}/s</td>
            </tr>
        ),
    );

    const unlockedAt = formatSeconds(state.timeUnlockedAt[itemName] ?? 0);
    const costScale = GAME.recipeScaleFactor[itemName];

    const boostedBy = GAME.buildingBoosts[itemName];

    const parts = [
        GAME.flavorText[itemName] && <div>{GAME.flavorText[itemName]}</div>,
        madeIn.length > 0 && (
            <div className={"made-in"}>Made with: {madeIn.join(", ")}</div>
        ),
        costScale !== 1 && (
            <div>Cost scales {costScale}x per item owned</div>
        ),
        formatIngredients.length > 0 && (
            <div className={"ingredient-list"}>
                Ingredients:
                <table>
                    <tbody>{formatIngredients}</tbody>
                </table>
            </div>
        ),
        powerRequirementDisplay.length > 0 && (
            <Table className={"power-requirement-display"}>
                <tbody>{powerRequirementDisplay}</tbody>
            </Table>
        ),
        storageObjects.length > 0 && (
            <div className={"storage-options"}>
                Stored in: {storageObjects.join(", ")}
            </div>
        ),
        storageValueIfContainer > 0 && (
            <div className={"storage-size"}>
                Storage Size: {d(storageValueIfContainer)}
            </div>
        ),
        assemblerSpeed > 0 && (
            <div className={"item-assembler-speed"}>
                Crafting Speed: {assemblerSpeed}x
            </div>
        ),
        byproducts.length > 0 && (
            <div className={"byproduct-list"}>
                Byproducts: {byproductString}
            </div>
        ),
        byproductOf.length > 0 && (
            <div className={"byproduct-of-list"}>
                Byproduct of: {byproductOf.join(", ")}
            </div>
        ),
        boostedBy && (
            <div>Boosted by: <Sprite name={boostedBy} /> {GAME.displayNames(boostedBy)}</div>
        ),
        unlocks.length > 0 && (
            <div className={"unlock-list"}>
                <b>Unlocks:</b> {unlocks.join(", ")}
            </div>
        ),
        <i>Unlocked at: {unlockedAt}</i>,
    ];

    const displayParts: JSX.Element[] = [];
    parts.forEach((part, i) => {
        if (part) {
            displayParts.push(
                <div key={i} className={"item-popup-detail"}>
                    {part}
                </div>,
            );
        }
    });

    const tooltip = (props: any) => (
        <Popover id={`${itemName}-popover`} {...props}>
            <Popover.Header>
                <span className={"popover-name"}>
                    <Sprite name={itemName} /> {GAME.displayNames(itemName)}
                </span>
            </Popover.Header>
            <Popover.Body>{displayParts}</Popover.Body>
        </Popover>
    );

    const isNew = state.acknowledged[itemName] !== true;
    const hasStorage = maxValue !== REALLY_BIG;

    const hasButton = GAME.allAssemblers.includes(itemName as any) || GAME.storageSizes[itemName] !== 0n;
    const hideButton = hasButton ? (
        <OverlayTrigger placement={"left"} overlay={<Popover><Popover.Body>Hide Add Buttons</Popover.Body></Popover>}>
            <Button
                onClick={() => dispatchAction({
                    action: state.hideAddButtons[itemName] ? 'unhide-building-add-button' : 'hide-building-add-button',
                    building: itemName,
                })}
                variant={'secondary'}
            >
                <FontAwesomeIcon icon={state.hideAddButtons[itemName] ? faEyeSlash : faEye} />
            </Button>
        </OverlayTrigger>
    ) : null;

    return (
        <div className="item-row" onMouseEnter={onMouseover}>
            <div className={"new-badge"}>
                <ByHandButton
                    itemName={itemName}
                    count={canMakeByHand}
                    makeByHand={makeByHand}
                />
            </div>
            <div className={"item-name-container"}>
                <OverlayTrigger placement="right" overlay={tooltip}>
                    <table>
                        <tbody>
                            <tr>
                                <td><Sprite name={itemName} /></td>
                                <td>
                                    <span className="item-name">
                                        {GAME.displayNames(itemName)}
                                    </span>
                                    {isNew && (
                                        <Badge className={"new-item-badge"}>New</Badge>
                                    )}
                                    {recipeDisabled ? (
                                        <Badge bg={"danger"}>DISABLED</Badge>
                                    ) : null}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </OverlayTrigger>
            </div>
            <div className={"rate-container"}>
                {
                    hasStorage || amt > 0 || producingRate > 0 ? (
                        <span className="item-count">
                            {historyDisplay} {d(amt)}
                        </span>
                    ) : null
                }
                <span className="item-max">
                    {hasStorage
                        ? `/ ${d(maxValue)}`
                        : ""}
                </span>
                {producingRate > 0 && (
                    <span className={"speed"}> (+{d(producingRate)}/s)</span>
                )}
            </div>
            <div className={"assembler-display-container"}>
                {disableButton}
                {assemblers}
            </div>
            <div className={"add-button-container"}>
                <div className={"buttons-display"}>
                    {boxButtons}
                    {assemblerButtons}
                </div>
            </div>
            <div className={'hide-add-button-container'}>
                {hideButton}
            </div>
        </div>
    );
}

interface ByHandButtonProps {
    makeByHand: false | null | (() => void);
    itemName: Items;
    count: bigint;
}


function ByHandButton({ makeByHand, itemName, count }: ByHandButtonProps) {
    const isPressed = useRef<boolean>(false);
    const intervalIdRef = useRef<any>(0);
    const [MAKE_BY_HAND_INTERVAL, setIntervalId] = useState<any>(0);

    useEffect(() => {
        return () => {
            clearInterval(intervalIdRef.current);
        };
    }, []);

    useEffect(
        () => {
            if (!makeByHand && isPressed.current) {
                isPressed.current = false;
                clearInterval(intervalIdRef.current);
            }
        },
        [makeByHand],
    );

    return makeByHand === null ? undefined : (
        <Button
            className={`make-by-hand ${isPressed.current ? "shake" : ""}`}
            onMouseDown={() => {
                if (makeByHand) {
                    makeByHand();
                    const interval = setInterval(() => {
                        if (!isPressed.current) {
                            clearInterval(intervalIdRef.current);
                            return;
                        }
                        console.log(`making ${itemName}`);
                        makeByHand();
                    }, 200);
                    isPressed.current = true;
                    intervalIdRef.current = interval;
                    setIntervalId(interval);
                }
            }}
            onMouseUp={() => {
                clearInterval(intervalIdRef.current);
                isPressed.current = false;
                if (makeByHand) makeByHand();
            }}
            onMouseLeave={() => {
                isPressed.current = false;
                clearInterval(intervalIdRef.current);
            }}
            disabled={makeByHand === false}
        >
            {GAME.byHandVerbs[itemName]} {bigGt(count, 1) ? d(count) : ""}
        </Button>
    );
}
