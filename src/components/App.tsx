import React, { useState } from "react";
import _ from "lodash";
import { howManyRecipesCanBeMade } from "../assembly";
import GAME from "../values";
import { Items } from "../content/itemNames";
import { Button, Badge, Tabs, Tab } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { SMap, values } from "../smap";
import { VERSION } from "../version";
import { ItemDisplay } from "./ItemDisplay";
import { useProduction } from "../hooks/useSimulation";
import { useCalculateRates } from "../hooks/useCalculateRates";
import { formatNumber, formatSeconds } from "../numberFormatter";
import { ReleaseNotes } from "./ReleaseNotes";
import { NumToBig, bigMin, bigLt, bigEq, bigSum, bigDiv, bigCeil, bigGt } from "../bigmath";
import { ClickAmountButtons } from "./ClickAmountButtons";
import "./App.scss";
import { useMinigames } from "../hooks/useMinigames";
import { Sprite } from "./Sprite";

type Props = {
    ticksPerSecond: number;
};

const MAX_BIG = BigInt(Number.MAX_VALUE);
const MULTI_CLICK_OPTIONS = {
    "1": NumToBig(1),
    "10": NumToBig(10),
    "100": NumToBig(100),
    "MAX": MAX_BIG,
}

const SATISFY_CLICK_OPTIONS = {
    "SATISFY": 0n,
};

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

    let [currentTab, setCurrentTab] = useState<string | null>(null);
    const [currentClickAmount, setCurrentClickAmount] = useState<bigint>(MULTI_CLICK_OPTIONS["1"]);

    const [isPlayingMinigame, setIsPlayingMinigame] = useState<boolean>(false);
    const [miniGamePrize, setMiniGamePrize] = useState<[item: Items, amount: bigint | string] | null>(null);
    const { getMiniGame, resetMinigame } = useMinigames();

    const MiniGameClass = isPlayingMinigame ? getMiniGame() : null;

    function stopMinigame() {
        resetMinigame();
        setIsPlayingMinigame(false);
    }

    const sections: SMap<JSX.Element[]> = {};
    const sectionData = GAME.sections.find((x) => x.Name == currentTab);

    const rates = useCalculateRates(
        state,
        sectionData?.SubSections.flatMap((x) => x.Items) ?? [],
    );

    function calculateMaxMake(itemName: Items, n: bigint) {
        return bigMin(
            bigLt(currentClickAmount, 1) ? NumToBig(1) : currentClickAmount,
            howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
            state.calculateStorage(itemName) - n,
            GAME.maxCraftAtATime(itemName, state),
        );
    }

    function calculateBuildingsToSatisfy(building: Items, recipe: Items) {
        const consumption = bigSum(values(rates.effectiveConsumptionRates[recipe] ?? {})) +
            bigSum(values(rates.powerConsumptionRates[recipe] ?? {}).map(x => x[2]));
        const production = bigSum(values(rates.effectiveProductionRates[recipe] ?? {}));
        const speed = NumToBig(
            GAME.assemblerSpeeds[building] * GAME.calculateBoost(building, state) / GAME.timePerRecipe[recipe]
        );
        if (speed === 0n) return NumToBig(1);
        return bigCeil(bigDiv(consumption - production, speed));
    }

    function calculateMaxAdd(itemName: Items, target?: Items) {
        const amt = currentClickAmount === 0n && target
            ? calculateBuildingsToSatisfy(itemName, target)
            : currentClickAmount;
        return bigMin(
            bigLt(amt, 1) ? NumToBig(1) : amt,
            state.amountThatWeHave[itemName] ?? 0n,
        );
    }

    const haveAssemblers = GAME.allAssemblers.filter(
        (key) => (amountThatWeHave[key] ?? 0) > 0,
    );

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

    for (const subSection of sectionData?.SubSections ?? []) {
        sections[currentTab!] ??= [];
        const elements = sections[currentTab!];
        const thisSectionItems: JSX.Element[] = [];
        for (const itemName of subSection.Items) {

            if (!visible[itemName]) continue;

            const amt = amountThatWeHave[itemName] ?? 0n;
            const recipe = GAME.recipes[itemName];
            if (recipe === undefined) continue;

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
                                amount: num,
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
                const num = calculateMaxAdd(a, itemName);
                assemblerButtons.push(
                    <Button
                        className={"add-assembler"}
                        key={assemblerName}
                        onClick={() => {
                            doAction({
                                action: 'add-building',
                                amount: num,
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

            if (itemName === 'mystic-coin' && bigGt(amountThatWeHave['research-minigames'] ?? 0n, 0)) {
                assemblerButtons.push(
                    <Button
                        onClick={() => {
                            setIsPlayingMinigame(true);
                            setMiniGamePrize(['mystic-coin', '2']);
                        }}
                    >
                        Play a Mini Game
                    </Button>
                );
            }

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
                                    });
                                }
                    }
                    disableRecipe={
                        () => !disabledRecipes[itemName] ? doAction({
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
        }

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
    }

    let multiClickOptions = {};

    if (bigEq(amountThatWeHave["research-mass-click"], 1)) {
        multiClickOptions = {
            ...multiClickOptions,
            ...MULTI_CLICK_OPTIONS,
        };
    }

    if (bigEq(amountThatWeHave["research-satisfy-button"], 1)) {
        multiClickOptions = {
            ...multiClickOptions,
            ...SATISFY_CLICK_OPTIONS,
        };
    }

    return (
        <Container fluid className={"game-container noselect"}>
            <div className={"sticky"}>
                <Button onClick={() => doAction({ action: 'reset-game' })} variant={"secondary"}>
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
                                <Badge className={"new-item-tab-badge"}>New</Badge>
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

            <ClickAmountButtons
                current={currentClickAmount}
                multiClickOptions={multiClickOptions}
                onClick={setCurrentClickAmount}
            />
            {MiniGameClass && miniGamePrize && (
                <MiniGameClass
                    giftRepr={<span>
                        <Sprite name={miniGamePrize[0]} amount={miniGamePrize[1]} />
                        {GAME.displayNames(miniGamePrize[0])}
                    </span>}
                    onSolve={() => {
                        doAction({
                            action: 'add-amount',
                            amount: miniGamePrize[1],
                            item: miniGamePrize[0],
                        });
                        setIsPlayingMinigame(false);
                        setMiniGamePrize(null);
                    }}
                    size={10}
                    onCancel={stopMinigame}
                />
            )}
        </Container>
    );
}
