import React, { useState } from "react";
import _ from "lodash";
import { howManyRecipesCanBeMade } from "../assembly";
import GAME from "../values";
import { Items } from "../content/itemNames";
import { Button, Badge, Tabs, Tab, ButtonToolbar } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { SMap, mapPairs } from "../smap";
import "bootstrap/dist/css/bootstrap.min.css";
import { VERSION } from "../version";
import { ItemDisplay } from "./ItemDisplay";
import { useProduction } from "../hooks/useSimulation";
import { useCalculateRates } from "../hooks/useCalculateRates";
import { formatNumber, formatSeconds } from "../numberFormatter";
import { ReleaseNotes } from "./ReleaseNotes";
import { NumToBig, bigMin, bigLt, bigEq } from "../bigmath";

type Props = {
    ticksPerSecond: number;
};

const MAX_BIG = BigInt(Number.MAX_VALUE);
const MULTI_CLICK_OPTIONS = {
    "1": NumToBig(1),
    "10": NumToBig(10),
    "MAX": MAX_BIG,
}

export function App({ ticksPerSecond }: Props) {
    const {
        assemblers,
        amountThatWeHave,
        visible,
        doAction,
        acknowledged,
        canMakeItemByHand,
        disabledRecipes,
        state,
        fps,
    } = useProduction(ticksPerSecond);

    function calculateMaxMake(itemName: Items, n: bigint) {
        return bigMin(
            currentClickAmount,
            howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
            state.calculateStorage(itemName) - n,
            GAME.maxCraftAtATime(itemName, state),
        );
    }

    function calculateMaxAdd(itemName: Items) {
        return bigMin(
            currentClickAmount,
            state.amountThatWeHave[itemName] ?? 0n,
        );
    }

    const haveAssemblers = GAME.allAssemblers.filter(
        (key) => (amountThatWeHave[key] ?? 0) > 0,
    );

    let [currentTab, setCurrentTab] = useState<string | null>(null);
    const [currentClickAmount, setCurrentClickAmount] = useState<bigint>(MULTI_CLICK_OPTIONS["1"]);

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

            const amt = amountThatWeHave[itemName] ?? 0n;
            const recipe = GAME.recipes[itemName];
            if (recipe === undefined) return;

            const buildingsToMakeThis = GAME.requiredBuildings(itemName);
            const makeByHand = canMakeItemByHand(itemName);
            const assemblerCount = assemblers[itemName];
            const assemblersMakingThis = _.pickBy(
                assemblerCount,
                (x) => x !== 0n,
            );
            const assemblerButtons: JSX.Element[] = [];
            const boxButtons: JSX.Element[] = [];

            GAME.itemsCanBeStoreIn[itemName].forEach((container) => {
                if (!state.visible[container]) return;
                if (state.hideAddButtons[container]) return;
                const num = calculateMaxAdd(container);
                const disabled = bigLt(amountThatWeHave[container] ?? 0n, 1);
                boxButtons.push(
                    <Button
                        className={"add-container"}
                        key={container}
                        onClick={() => {
                            doAction({
                                action: 'add-box',
                                amount: currentClickAmount,
                                box: container,
                                recipe: itemName,
                            });
                        }}
                        variant="info"
                        disabled={disabled}
                    >
                        Add {num > 0 ? formatNumber(num) : ''}{" "}
                        {GAME.displayNames(container)}
                    </Button>,
                );
            });

            buildingsToMakeThis.forEach((assemblerName) => {
                if (assemblerName === 'by-hand') return;
                if (!state.visible[assemblerName]) return;
                if (state.hideAddButtons[assemblerName]) return;
                const a = assemblerName as (typeof haveAssemblers)[0];
                const haveAny = haveAssemblers.includes(assemblerName as any);
                const num = calculateMaxAdd(a);
                assemblerButtons.push(
                    <Button
                        className={"add-assembler"}
                        key={assemblerName}
                        onClick={() => {
                            doAction({
                                action: 'add-building',
                                amount: currentClickAmount,
                                building: a,
                                recipe: itemName,
                            })
                        }}
                        variant="secondary"
                        disabled={!haveAny}
                    >
                        Add {num > 0 ? formatNumber(num) : ''}{" "}
                        {GAME.displayNames(assemblerName)}
                    </Button>,
                );
            });

            thisSectionItems.push(
                <ItemDisplay
                    key={itemName}
                    amt={amt ?? 0n}
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
                                    doAction({
                                        action: 'craft-byhand',
                                        amount: calculateMaxMake(itemName, amt),
                                        recipe: itemName,
                                    })
                                }
                    }
                    disableRecipe={
                        () => disabledRecipes[itemName] ? doAction({
                            action: 'disable-recipe',
                            recipe: itemName
                        }) : doAction({
                            action: 'enable-recipe',
                            recipe: itemName,
                        })
                    }
                    onMouseover={
                        acknowledged[itemName] !== true
                            ? () => {
                                doAction({
                                    action: 'ack',
                                    recipe: itemName,
                                })
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
                <Button onClick={() => doAction({action: 'reset-game'})} variant={"secondary"}>
                    Reset
                </Button>{" "}
                <ReleaseNotes version={VERSION().join(".")} />{" "}
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
                            <span className={"layout-tab"}>
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
            {bigEq(amountThatWeHave["research-mass-click"] ?? 0n, 1) ? (
                <ButtonToolbar className={"per-click-amount-buttons"}>
                    Per Click:
                    {
                        mapPairs(MULTI_CLICK_OPTIONS, (value, display) => {
                            return (
                                <Button
                                    onClick={() => setCurrentClickAmount(value)}
                                    active={currentClickAmount === value}
                                >
                                    {display}
                                </Button>
                            );
                        })
                    }
                </ButtonToolbar>
            ) : null}
        </Container>
    );
}
