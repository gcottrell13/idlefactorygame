import React from "react";
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
import { useGameState } from "../hooks/useGameState";
import { ByHandButton } from "./ByHandButton";
import "./ItemDisplay.scss";
import Decimal from "decimal.js";
import { FIVE, HUNDRED, ONE, TEN, TWO, ZERO } from "../decimalConsts";

type func = () => void;

type Props = {
    amt: Decimal;
    itemName: Items;
    state: ReturnType<typeof useProduction>["state"];
    assemblerButtons: JSX.Element[];
    assemblersMakingThis: partialItems<Decimal>;
    boxButtons: JSX.Element[];
    makeByHand: func | false | null;
    onMouseover: func | undefined;
    disableRecipe: func;
    currentClickAmount: Decimal;
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
    const canMakeByHand = Decimal.min(
        currentClickAmount,
        howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
        state.calculateStorage(itemName).sub(amt).floor(),
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

    const producingRate = Decimal.sum(ZERO, ...values(effectiveProductionRates[itemName]));
    const othersConsuming = effectiveConsumptionRates[itemName] ?? {};
    const othersConsumingAsPower = powerConsumptionRates[itemName] ?? {};
    const othersConsumingAsPowerRate = Decimal.sum(ZERO, ...values(othersConsumingAsPower).map((k) => k[2]));
    const othersConsumingRate = Decimal.sum(ZERO, ...values(othersConsuming)).add(othersConsumingAsPowerRate);
    
    const recipeScale = GAME.calculateRecipeScale(itemName, amt);

    const recipe = GAME.recipes[itemName];
    const formatIngredients = keys(recipe)
        .map((name) => [name, recipe[name]!] as const)
        .filter(([_name, count]) => count.gt(ZERO))
        .map(([name, count]) => (
            <tr key={name}>
                <td className={"popover-ingredient-count"}>
                    {d(count.mul(recipeScale))}
                </td>
                <td>
                    <Sprite name={name} />
                </td>
                <td>
                    {GAME.displayNames(name)}
                </td>
                <td>
                    <span className={"popover-ingredient-has"}>
                        ({d(state.amountThatWeHave[name] ?? ZERO)})
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
    const madeIn = GAME.requiredBuildings(itemName);

    const historyVisible =
        assemblers.length > 0 ||
            producingRate.gt(ZERO) ||
            keys(othersConsumingAsPower).length > 0
            ? "visible"
            : "";
    const netRate = producingRate.sub(othersConsumingRate);
    const satisfactionPercent = othersConsumingRate.gt(ZERO)
        ? producingRate.mul(HUNDRED).div(othersConsumingRate)
        : HUNDRED;

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
            icon={netRate.gt(ZERO) ? faThumbsUp : faChevronCircleDown}
            className={netRate.gt(ZERO) ? "" : "text-danger"}
        />
    );
    let historyDisplay = (
        <span className={`history-display ${historyVisible}`}>{g}</span>
    );

    if (historyVisible) {
        const overlay = (
            <Popover className={"popover-no-max-width"}>
                <Popover.Body>
                    producing: {d(producingRate)}/s - {satisfactionPercent.toNumber()}%
                    <br />
                    consumed: {d(othersConsumingRate)}/s
                    <span className={'rate-per'}>
                        (max {d(maxConsumptionRates[itemName])}/s)
                    </span>
                    <br />
                    <ProgressBar
                        now={satisfactionPercent.toNumber()}
                        variant={
                            satisfactionPercent.lt(new Decimal(20)) ? 'danger' :
                            satisfactionPercent.lt(new Decimal(50)) ? 'warning' :
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
        madeIn.length > 0 && !_.isEqual(madeIn, ['by-hand']) && (
            <div className={"made-in"}>Made with: {madeIn.map(GAME.displayNames).join(", ")}</div>
        ),
        !costScale.eq(ONE) && (
            <div>Cost scales {costScale.toNumber()}x per item owned</div>
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
        storageValueIfContainer.gt(ZERO) && (
            <div className={"storage-size"}>
                Storage Size: {d(storageValueIfContainer)}
            </div>
        ),
        assemblerSpeed.gt(ZERO) && (
            <div className={"item-assembler-speed"}>
                Crafting Speed: {assemblerSpeed.toNumber()}x
            </div>
        ),
        byproducts.length > 0 && GAME.hideByproducts[itemName] === false && (
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
        unlocks.length > 0 && GAME.hideUnlocks[itemName] === false && (
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
    const hasStorage = maxValue.isFinite();

    const hasButton = GAME.allAssemblers.includes(itemName as any) || GAME.storageSizes[itemName].gt(ZERO);
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
                    hasStorage || amt.gt(ZERO) || producingRate.gt(ZERO) ? (
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
                {producingRate.gt(ZERO) && (
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
