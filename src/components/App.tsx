import React, { useState } from "react";
import _ from "lodash";
import { howManyRecipesCanBeMade } from "../assembly";
import GAME from "../values";
import { Items } from "../content/itemNames";
import { Button, Badge, Tabs, Tab, ButtonToolbar } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { SMap } from "../smap";
import "bootstrap/dist/css/bootstrap.min.css";
import { VERSION } from "../version";
import { ItemDisplay } from "./ItemDisplay";
import { useProduction } from "../hooks/useSimulation";
import { useCalculateRates } from "../hooks/useCalculateRates";
import { formatNumber, formatSeconds } from "../numberFormatter";

type Props = {
    ticksPerSecond: number;
};

export function App({ ticksPerSecond }: Props) {
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
        fps,
    } = useProduction(ticksPerSecond);

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

    const rates = useCalculateRates(
        state,
        sectionData?.SubSections.flatMap((x) => x.Items) ?? [],
    );

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
                        acknowledged[itemName] !== true
                            ? () => {
                                  acknowledgeItem(itemName);
                              }
                            : undefined
                    }
                    {...rates}
                />,
            );
        });

        if (thisSectionItems.length > 0) {
            elements.push(
                <div
                    className="subsection-header"
                    key={"ss-" + subSection.Name}
                >
                    {subSection.Name}
                </div>,
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
                <span>v{VERSION().join(".")}</span>
                <span className={"play-timer"}>
                    Play Time: {formatSeconds(state.timeSpentPlaying)}
                </span>
                <span className={"fps"}>{formatNumber(fps)} UPS</span>
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
                            <div className={"main-grid"}>
                                {sections[section.Name]}
                            </div>
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
