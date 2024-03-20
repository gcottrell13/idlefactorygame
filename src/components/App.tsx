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
import Big from "../bigmath";
import { ClickAmountButtons } from "./ClickAmountButtons";
import "./App.scss";
import { useMinigames } from "../hooks/useMinigames";
import { Sprite } from "./Sprite";
import { Difficulty } from "../typeDefs/minigame";
import { MinigameConfig } from "../content/minigamePrizes";

type Props = {
    ticksPerSecond: number;
};

const MAX_BIG = BigInt(Number.MAX_VALUE);
const MULTI_CLICK_OPTIONS = {
    "1": new Big(1n),
    "10": new Big(10n),
    "100": new Big(100n),
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
    const [currentClickAmount, setCurrentClickAmount] = useState<Big>(MULTI_CLICK_OPTIONS["1"]);

    const [isPlayingMinigame, setIsPlayingMinigame] = useState<boolean>(false);
    const [miniGameConfig, setMiniGameConfig] = useState<MinigameConfig | null>(null);
    const [miniGamePrize, setMiniGamePrize] = useState<Items | null>(null);
    const { getMiniGame, resetMinigame, pickMinigameByItem } = useMinigames();

    const MiniGameClass = isPlayingMinigame ? getMiniGame(miniGameConfig?.minigame) : null;

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

    function calculateMaxMake(itemName: Items, n: Big) {
        return Big.min(
            currentClickAmount.lt(Big.One) ? Big.One : currentClickAmount,
            howManyRecipesCanBeMade(itemName, state.amountThatWeHave),
            state.calculateStorage(itemName).sub(n),
            GAME.maxCraftAtATime(itemName, state),
        );
    }

    function calculateBuildingsToSatisfy(building: Items, recipe: Items) {
        const consumption = Big.sum(
            ...values(rates.effectiveConsumptionRates[recipe] ?? {}),
            ...values(rates.powerConsumptionRates[recipe] ?? {}).map(x => x[2]),
        );
        const production = Big.sum(...values(rates.effectiveProductionRates[recipe] ?? {}));
        const speed = GAME.assemblerSpeeds[building]
            .mul(GAME.calculateBoost(building, state))
            .divEq(GAME.timePerRecipe[recipe]);
        if (speed.eq(Big.Zero)) return Big.One;
        return consumption
            .sub(production)
            .divEq(speed)
            .ceilEq();
    }

    function calculateMaxAdd(itemName: Items, target?: Items) {
        const amt = currentClickAmount.eq(Big.Zero) && target
            ? calculateBuildingsToSatisfy(itemName, target)
            : currentClickAmount;
        return Big.min(
            amt.lt(Big.One) ? Big.One : amt,
            state.amountThatWeHave[itemName] ?? Big.Zero,
        );
    }

    const haveAssemblers = GAME.allAssemblers.filter(
        (key) => (amountThatWeHave[key] ?? Big.Zero).gt(Big.Zero),
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

            const amt = amountThatWeHave[itemName] ?? Big.Zero;
            const recipe = GAME.recipes[itemName];
            if (recipe === undefined) continue;

            const buildingsToMakeThis = GAME.requiredBuildings(itemName);
            const makeByHand = canMakeItemByHand(itemName);
            const assemblerCount = assemblers[itemName];
            const assemblersMakingThis = _.pickBy(
                assemblerCount,
                (x) => x.neq(Big.Zero),
            );
            const assemblerButtons: JSX.Element[] = [];
            const boxButtons: JSX.Element[] = [];

            GAME.itemsCanBeStoreIn[itemName].forEach((container) => {
                if (!state.visible[container]) return;
                if (state.hideAddButtons[container]) return;
                const num = calculateMaxAdd(container);
                const disabled = (amountThatWeHave[container] ?? Big.Zero).lt(Big.One);
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
                        Add {num.gt(Big.Zero) ? formatNumber(num) : ''}{" "}
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
                        Add {num.gt(Big.Zero) ? formatNumber(num) : ''}{" "}
                        {GAME.displayNames(assemblerName)}
                    </Button>,
                );
            });

            if (pickMinigameByItem(itemName) && (amountThatWeHave['research-minigames'] ?? Big.Zero).gt(Big.Zero)) {
                assemblerButtons.push(
                    <Button
                        key={'playminigame'}
                        onClick={() => {
                            setIsPlayingMinigame(true);
                            setMiniGameConfig(pickMinigameByItem(itemName));
                            setMiniGamePrize(itemName);
                        }}
                    >
                        Play a Mini Game
                    </Button>
                );
            }

            thisSectionItems.push(
                <ItemDisplay
                    key={itemName}
                    amt={amt ?? Big.Zero}
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
                    {subSection.Icon && (
                        <Sprite name={subSection.Icon} />
                    )}
                    {subSection.Name}
                </div>,
            );
            elements.push(...thisSectionItems);
        }
    }

    let multiClickOptions = {};

    if (amountThatWeHave["research-mass-click"]?.gte(Big.One)) {
        multiClickOptions = {
            ...multiClickOptions,
            ...MULTI_CLICK_OPTIONS,
        };
    }

    if (amountThatWeHave["research-satisfy-button"]?.gte(Big.One)) {
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
                    let title = (
                        <span>

                            {section.Icon && (
                                <Sprite name={section.Icon} />
                            )}
                            {section.Name}
                        </span>
                    );

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
                        <Sprite name={miniGamePrize} amount={miniGameConfig?.count} />
                        {GAME.displayNames(miniGamePrize)}
                    </span>}
                    onSolve={() => {
                        doAction({
                            action: 'add-amount',
                            amount: miniGameConfig!.count,
                            item: miniGamePrize,
                        });
                        setIsPlayingMinigame(false);
                        setMiniGamePrize(null);
                    }}
                    difficulty={miniGameConfig!.difficulty}
                    onCancel={stopMinigame}
                />
            )}
        </Container>
    );
}
