import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import _ from "lodash";
import {
    useProduction,
    State,
    howManyRecipesCanBeMade,
    PRODUCTION_OUTPUT_BLOCKED,
    PRODUCTION_NO_INPUT,
    PRODUCTION_NO_POWER,
} from "./assembly";
import GAME from "./values";
import { Items, partialItems } from "./content/itemNames";
import "./css.css";
import {
    Button,
    Row,
    Col,
    OverlayTrigger,
    ButtonGroup,
    Badge,
    Tabs,
    Tab,
    ButtonToolbar,
    Nav,
    Table,
} from "react-bootstrap";
import Popover from "react-bootstrap/Popover";
import Container from "react-bootstrap/Container";
import { SMap, keys, mapValues, values, mapPairs } from "./smap";
import "bootstrap/dist/css/bootstrap.min.css";
import { VERSION } from "./version";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faThumbsUp,
    faChevronCircleDown,
    faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { formatNumber as d } from "./numberFormatter";

const TICKS_PER_SECOND = 20;

type func = () => void;

function ItemDisplay({
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
}: {
    amt: number;
    itemName: Items;
    state: ReturnType<typeof useProduction>["state"];
    assemblerButtons: JSX.Element[];
    assemblersMakingThis: partialItems<number>;
    boxButtons: JSX.Element[];
    makeByHand: func | false | null;
    onMouseover: func | undefined;
    disableRecipe: func;
    currentClickAmount: number;
}) {
    const byHandCb =
        makeByHand === false || makeByHand === null ? undefined : makeByHand;
    const canMakeByHand = Math.min(
        currentClickAmount,
        howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
        state.calculateStorage(itemName) - amt,
        GAME.maxCraftAtATime(itemName),
    );
    const makeByHandButton =
        makeByHand === null ? undefined : (
            <Button
                className={"make-by-hand"}
                onClick={byHandCb}
                disabled={makeByHand === false}
            >
                {GAME.byHandVerbs(itemName)}{" "}
                {canMakeByHand > 1 ? Math.floor(canMakeByHand) : ""}
            </Button>
        );

    const recipeDisabled = state.disabledRecipes[itemName] === true;
    const progress = state.productionProgress[itemName] ?? {};

    const baseCraftTime = GAME.timePerRecipe(itemName);
    const thisPower = state.powerConsumptionProgress[itemName] ?? {};
    const thisPowerRequirements =
        GAME.buildingPowerRequirementsPerSecond(itemName);

    const assemblers = keys(assemblersMakingThis).map((name) => {
        const no = assemblersMakingThis[name] ?? 0;
        const speedPer = GAME.assemblerSpeeds(name) / baseCraftTime;
        let label = (
            <span>
                <span className={"assembler-count-name"}>
                    {no} {GAME.displayNames(name)} ({d(speedPer)}/s):
                </span>{" "}
                ({d(speedPer * no)}/s)
            </span>
        );
        const prog = progress[name] ?? null;
        if (thisPower[name] === PRODUCTION_NO_POWER) {
            label = (
                <span>
                    {label}{" "}
                    <Badge bg={"danger"}>
                        <FontAwesomeIcon icon={faBolt} /> No Power
                    </Badge>
                </span>
            );
        } else if (recipeDisabled) {
            label = (
                <span>
                    {label} <Badge bg={"secondary"}>Disabled</Badge>
                </span>
            );
        } else if (prog === null || prog === PRODUCTION_NO_INPUT) {
            label = (
                <span>
                    {label} <Badge bg={"danger"}>No Input</Badge>
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

        const powerRequirements = GAME.buildingPowerRequirementsPerSecond(name);
        if (keys(powerRequirements).length > 0) {
            const overlay = (
                <Popover className={"popover-no-max-width"}>
                    <Popover.Body>
                        {Math.floor(no)} {GAME.displayNames(name)} consuming:
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
                                                    {GAME.displayNames(
                                                        requirement,
                                                    )}
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
            <div className={"assembler-count"} key={name}>
                {label}
            </div>
        );
    });

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

    const assemblerDisplay =
        assemblers.length > 0 ? (
            <span className="assembler-display">{assemblers}</span>
        ) : null;

    const byproducts = _.uniq(
        GAME.sideProducts(itemName).flatMap((x) => keys(x)),
    ).filter((x) => x != itemName);
    const byproductString = byproducts.map(GAME.displayNames).join(", ");

    const producingRate = _.sum(
        values(state.effectiveProductionRates[itemName]),
    );
    const othersConsuming = state.effectiveConsumptionRates[itemName] ?? {};
    const othersConsumingAsPower = state.powerConsumptionRates[itemName] ?? {};
    const othersConsumingAsPowerRate = _.sumBy(
        values(othersConsumingAsPower),
        (k) => k[2],
    );
    const othersConsumingRate =
        _.sum(values(othersConsuming)) + othersConsumingAsPowerRate;

    const recipe = GAME.recipes(itemName);
    const formatIngredients = keys(recipe)
        .map((name) => [name, recipe[name]!] as const)
        .filter(([_name, count]) => count > 0)
        .map(([name, count]) => (
            <tr key={name}>
                <td className={"popover-ingredient-count"}>{count}</td>
                <td>{GAME.displayNames(name)}</td>
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
    const storageObjects = GAME.itemsCanBeStoreIn(itemName).map(
        GAME.displayNames,
    );

    const storageValueIfContainer = GAME.storageSizes(itemName);

    const maxValue = state.calculateStorage(itemName);

    const assemblerSpeed = GAME.assemblerSpeeds(itemName);
    const unlocks = GAME.unlocks(itemName).map(GAME.displayNames);
    const madeIn = GAME.requiredBuildings(itemName).map(GAME.displayNames);

    const historyVisible =
        assemblers.length > 0 ||
        producingRate > 0 ||
        keys(othersConsumingAsPower).length > 0
            ? "visible"
            : "";
    const netRate = producingRate - othersConsumingRate;

    const othersConsumingThis = GAME.recipesConsumingThis(itemName)
        .filter((recipeName) => state.assemblers[recipeName])
        .map((recipeName) => {
            const states = keys(state.assemblers[recipeName]).map((an) =>
                state.assemblerIsStuckOrDisabled(recipeName, an),
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
                            {total} {GAME.displayNames(name)}
                        </td>
                        <td>({d(consumption)}/s)</td>
                        <td className={color}>
                            {count} / {total}
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
                    producing: {d(producingRate)}/s
                    <br />
                    consumed: {d(othersConsumingRate)}/s
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
                    {GAME.displayNames(item)}
                </td>
                <td>{d(value)}/s</td>
            </tr>
        ),
    );

    const parts = [
        GAME.flavorText[itemName] && <div>{GAME.flavorText[itemName]}</div>,
        madeIn.length > 0 && (
            <div className={"made-in"}>Made with: {madeIn.join(", ")}</div>
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
                Storage Size: {storageValueIfContainer}
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
        unlocks.length > 0 && (
            <div className={"unlock-list"}>Unlocks: {unlocks.join(", ")}</div>
        ),
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
                    {GAME.displayNames(itemName)}
                </span>
            </Popover.Header>
            <Popover.Body>{displayParts}</Popover.Body>
        </Popover>
    );

    return (
        <Row className="item-row" onMouseEnter={onMouseover}>
            <Col xs={1}>
                {!state.acknowledged[itemName] && (
                    <Badge className={"new-item-badge"}>New</Badge>
                )}
                {makeByHandButton}
            </Col>
            <Col xs={2}>
                <OverlayTrigger placement="right" overlay={tooltip}>
                    <span>
                        <span className="item-name">
                            {GAME.displayNames(itemName)}
                        </span>
                        {recipeDisabled ? (
                            <Badge bg={"danger"}>DISABLED</Badge>
                        ) : null}
                    </span>
                </OverlayTrigger>
            </Col>
            <Col xs={2}>
                <span className="item-count">
                    {historyDisplay} {d(amt)}
                </span>
                <span className="item-max">
                    {maxValue === Number.MAX_SAFE_INTEGER
                        ? ""
                        : `/ ${maxValue}`}
                </span>
                {producingRate > 0 && (
                    <span className={"speed"}> (+{d(producingRate)}/s)</span>
                )}
            </Col>
            <Col xs={3}>
                {disableButton}
                {assemblerDisplay}
            </Col>
            <Col xs={1}>{boxButtons}</Col>
            <Col xs={3}>{assemblerButtons}</Col>
        </Row>
    );
}

function App() {
    const {
        assemblers,
        amountThatWeHave,
        visible,
        acknowledgeItem,
        acknowledged,
        addAssemblers,
        resetAll,
        makeItemByhand,
        canMakeItemByHand,
        addContainer,
        disableRecipe,
        disabledRecipes,
        state,
    } = useProduction(TICKS_PER_SECOND);

    function calculateMaxMake(itemName: Items, n: number) {
        return Math.min(
            currentClickAmount,
            howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
            state.calculateStorage(itemName) - n,
            GAME.maxCraftAtATime(itemName),
        );
    }

    function calculateMaxAdd(itemName: Items) {
        return Math.min(
            currentClickAmount,
            state.amountThatWeHave[itemName] ?? 0,
        );
    }

    const haveAssemblers = GAME.allAssemblers.filter(
        (key) => (amountThatWeHave[key] ?? 0) > 0,
    );

    let [currentTab, setCurrentTab] = useState<string | null>(null);
    const [currentClickAmount, setCurrentClickAmount] = useState<number>(1);

    if (currentTab === null) {
        setCurrentTab(
            _.values(GAME.sections).filter((x) =>
                x.SubSections.some((ss) =>
                    ss.Items.some((item) => visible[item]),
                ),
            )[0].Name,
        );
        return null;
    }

    const sections: SMap<JSX.Element[]> = {};
    const sectionData = GAME.sections.find((x) => x.Name == currentTab);

    sectionData?.SubSections.forEach((subSection) => {
        sections[currentTab!] ??= [];
        const elements = sections[currentTab!];
        const thisSectionItems: JSX.Element[] = [];
        subSection.Items.forEach((itemName) => {
            if (!visible[itemName]) return;

            const amt = amountThatWeHave[itemName] ?? 0;
            const recipe = GAME.recipes(itemName);
            if (recipe === undefined) return;

            const buildingsToMakeThis = GAME.requiredBuildings(itemName);
            const makeByHand = canMakeItemByHand(itemName);
            const assemblerCount = assemblers[itemName];
            const assemblersMakingThis = _.pickBy(
                assemblerCount,
                (x) => x !== 0,
            );
            const assemblerButtons: JSX.Element[] = [];
            const boxButtons: JSX.Element[] = [];

            GAME.itemsCanBeStoreIn(itemName).forEach((container) => {
                if ((amountThatWeHave[container] ?? 0) > 0) {
                    boxButtons.push(
                        <Button
                            className={"add-container"}
                            key={container}
                            onClick={() => {
                                addContainer(
                                    itemName,
                                    container,
                                    currentClickAmount,
                                );
                            }}
                            variant="info"
                        >
                            Add {calculateMaxAdd(container)}{" "}
                            {GAME.displayNames(container)}
                        </Button>,
                    );
                }
            });

            haveAssemblers.forEach((assemblerName) => {
                if (buildingsToMakeThis.includes(assemblerName) === false)
                    return;
                assemblerButtons.push(
                    <Button
                        className={"add-assembler"}
                        key={assemblerName}
                        onClick={() => {
                            addAssemblers(
                                assemblerName,
                                itemName,
                                currentClickAmount,
                            );
                        }}
                        variant="secondary"
                    >
                        Add {calculateMaxAdd(assemblerName)}{" "}
                        {GAME.displayNames(assemblerName)}
                    </Button>,
                );
            });

            const isAcked = acknowledged[itemName] === true;

            thisSectionItems.push(
                <ItemDisplay
                    key={itemName}
                    amt={amt ?? 0}
                    state={state}
                    assemblersMakingThis={assemblersMakingThis}
                    boxButtons={boxButtons}
                    itemName={itemName}
                    assemblerButtons={assemblerButtons}
                    currentClickAmount={currentClickAmount}
                    makeByHand={
                        makeByHand === null
                            ? null
                            : makeByHand === false
                            ? false
                            : () => {
                                  makeItemByhand(
                                      itemName as Items,
                                      calculateMaxMake(itemName, amt),
                                  );
                              }
                    }
                    disableRecipe={() =>
                        disableRecipe(
                            itemName,
                            !(disabledRecipes[itemName] ?? false),
                        )
                    }
                    onMouseover={
                        !isAcked
                            ? () => {
                                  acknowledgeItem(itemName);
                              }
                            : undefined
                    }
                />,
            );
        });

        if (thisSectionItems.length > 0) {
            elements.push(
                <Row className="subsection-header">
                    <Col xs={12}>{subSection.Name}</Col>
                </Row>,
            );
            elements.push(...thisSectionItems);
        }
    });

    return (
        <Container fluid className={"game-container"}>
            <div className={"sticky"}>
                <Button onClick={resetAll} variant={"secondary"}>
                    Reset
                </Button>{" "}
                <span>v{VERSION.join(".")}</span>
            </div>
            <Tabs
                activeKey={currentTab}
                onSelect={setCurrentTab}
                className={"section-tabs sticky"}
            >
                {GAME.sections.map((section) => {
                    let title: React.ReactNode = section.Name;

                    if (
                        section.SubSections.every((ss) =>
                            ss.Items.every((j) => !visible[j]),
                        )
                    )
                        return null;

                    if (
                        section.SubSections.some((ss) =>
                            ss.Items.some((j) => acknowledged[j] === false),
                        )
                    )
                        title = (
                            <span>
                                {title}{" "}
                                <Badge className={"new-item-badge"}>New</Badge>
                            </span>
                        );

                    return (
                        <Tab
                            key={section.Name}
                            eventKey={section.Name}
                            title={title}
                        >
                            {sections[section.Name]}
                        </Tab>
                    );
                })}
            </Tabs>
            {amountThatWeHave["research-mass-click"] === 1 ? (
                <ButtonToolbar className={"per-click-amount-buttons"}>
                    Per Click:
                    <Button
                        onClick={() => setCurrentClickAmount(1)}
                        active={currentClickAmount == 1}
                    >
                        1
                    </Button>
                    <Button
                        onClick={() => setCurrentClickAmount(10)}
                        active={currentClickAmount == 10}
                    >
                        10
                    </Button>
                    <Button
                        onClick={() =>
                            setCurrentClickAmount(Number.MAX_SAFE_INTEGER)
                        }
                        active={currentClickAmount == Number.MAX_SAFE_INTEGER}
                    >
                        MAX
                    </Button>
                </ButtonToolbar>
            ) : null}
        </Container>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);

document.title = "idlefactorygame v" + VERSION.join(".");
document.addEventListener(
    "mousedown",
    function (event) {
        if (event.detail > 1) {
            event.preventDefault();
            // of course, you still do not know what you prevent here...
            // You could also check event.ctrlKey/event.shiftKey/event.altKey
            // to not prevent something useful.
        }
    },
    false,
);
