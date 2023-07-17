import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { calculateStorage, useProduction } from "./assembly";
import {
    recipes,
    Items,
    assemblerSpeeds,
    timePerRecipe,
    requiredBuildings,
    byHandVerbs,
    sideProducts,
    requiredOtherProducts,
    partialItems,
    itemsCanBeStoreIn,
} from './values';
import './css.css';
import { Button, Row, Col, OverlayTrigger, ProgressBar, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import Popover from 'react-bootstrap/Popover';
import Container from 'react-bootstrap/Container';
import { SMap, keys, mapValues, values } from './smap';
import 'bootstrap/dist/css/bootstrap.min.css';

function d(n: number | undefined) {
    n ??= 0;
    return (Math.round(n * 100) / 100).toFixed(2);
}

const TICKS_PER_SECOND = 20;

type func = () => void;

function ItemDisplay({
    amt,
    itemName,
    assemblerCount,
    assemblerButtons,
    makeByHand,
    progress,
    storage,
}: {
    amt: number,
    itemName: Items,
    assemblerCount: partialItems<number>,
    assemblerButtons: JSX.Element[],
    makeByHand: null | func,
    progress: partialItems<number>,
    storage: partialItems<number>,
}) {

    const byHandVerb = byHandVerbs[itemName as Items] ?? 'make';
    const makeByHandButton = makeByHand && (
        <Button className={'make-by-hand'} onClick={makeByHand}>{byHandVerb} {itemName}</Button>
    );
    const baseCraftTime = timePerRecipe[itemName as Items];

    const assemblers = keys(assemblerCount).map(name => {
        const no = assemblerCount[name] ?? 0;
        const speedPer = (assemblerSpeeds[name as Items] ?? 0) / baseCraftTime;
        let label = <span><span className={'assembler-count-name'}>{name} ({d(speedPer)}/s):</span> {no} ({d(speedPer * no)}/s)</span>;
        if (progress[name]) {
            label = <span>{label} {d(progress[name])}%</span>;
        }
        return (
            <div className={'assembler-count'} key={name}>
                {label}
            </div>
        )
    });
    const assemblerDisplay = assemblers.length > 0 ? (
        <div className='assembler-count'>buildings making {itemName}: {assemblers}</div>
    ) : null;

    const speed = d(_.sum(keys(assemblerCount).map(key => (assemblerSpeeds[key] ?? 0) * (assemblerCount[key] ?? 0) / baseCraftTime)));

    const formatIngredients = _.toPairs(recipes[itemName as Items]).map(([name, count]) => <tr><td className={'popover-ingredient-count'}>{count}</td><td>{name}</td></tr>);

    const byproductOf = keys(sideProducts).filter(mainProduct => sideProducts[mainProduct]?.some(v => v[itemName as Items] !== undefined));

    const maxValue = calculateStorage(itemName as Items, storage);

    const tooltip = (props: any) => (
        <Popover id="" {...props}>
            <Popover.Header>
                {itemName} - {baseCraftTime}s
            </Popover.Header>
            <Popover.Body>
                Made in: {(requiredBuildings[itemName as Items] ?? ['by-hand']).join(', ')}
                {
                    formatIngredients.length > 0 ? (
                        <span>
                            <hr />
                            Ingredients: <table>{formatIngredients}</table>
                        </span>
                    ) : null
                }
                {
                    byproductOf.length > 0 ? (
                        <div>Byproduct of: {byproductOf.join(', ')}</div>
                    ) : null
                }
            </Popover.Body>
        </Popover>
    );

    return (
        <Row className='item-row'>
            <Col xs={1}>
                {makeByHandButton}
            </Col>
            <Col xs={1}>
                <OverlayTrigger placement='right' overlay={tooltip}>
                    <span className="item-name">{itemName}</span>
                </OverlayTrigger>
            </Col>
            <Col xs={2}>
                <span className="item-count">{d(amt)}</span>
                <span className="item-max">{maxValue === -1 ? '' : `/ ${maxValue}`}</span>
                <span className={'speed'}> (+{speed}/s)</span>
            </Col>
            <Col xs={4}>
                {assemblerDisplay}
            </Col>
            <Col xs={4}>
                <ButtonGroup>
                    {assemblerButtons}
                </ButtonGroup>
            </Col>
        </Row>
    );
}


function App() {
    const {
        assemblers, amountThatWeHave, displayAmount, timeLeftInProduction, storage, 
        addAssemblers, resetAll,
        makeItem, canMakeItem,
        seen, markAsSeen,
        addContainer,
    } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = _.mapValues(assemblerSpeeds, (value, key) => amountThatWeHave[key as Items] ?? 0);

    keys(recipes).sort().forEach(itemName => {
        const amt = amountThatWeHave[itemName] ?? 0;
        const recipe = recipes[itemName];
        if (recipe === undefined) return;

        const buildingsToMakeThis = requiredBuildings[itemName] ?? ['by-hand'];
        const makeByHand = buildingsToMakeThis.includes('by-hand') && canMakeItem(itemName);
        const assemblerCount = _.mapValues(assemblers, (value, key) => value?.[itemName] ?? 0);
        const assemblersMakingThis = _.pickBy(assemblerCount, x => x !== 0);
        const assemblerButtons: JSX.Element[] = [];

        keys(haveAssemblers).forEach(assemblerName => {
            if (buildingsToMakeThis.includes(assemblerName) === false) return;
            if ((haveAssemblers[assemblerName] ?? 0) < 1) return;
            assemblerButtons.push(
                <Button
                    className={'add-assembler'}
                    key={assemblerName}
                    onClick={() => {
                        addAssemblers(assemblerName, itemName, 1);
                    }}
                    variant="secondary"
                >
                    Add {assemblerName}
                </Button>
            );
        });

        itemsCanBeStoreIn[itemName]?.forEach(container => {
            if (amountThatWeHave[container]) {
                assemblerButtons.push(
                    <Button
                        className={'add-container'}
                        key={container}
                        onClick={() => {
                            addContainer(itemName, container, 1);
                        }}
                        variant="info"
                    >
                        Add {container}
                    </Button>
                );
            }
        });

        if (seen.includes(itemName) === false) {
            if (amt <= 0) {
                const haveProducers = Object.keys(assemblersMakingThis).length > 0;
                const canAddProducer = buildingsToMakeThis.some(x => (amountThatWeHave[x as Items] ?? 0) > 0);
                const canBeMadeByHand = buildingsToMakeThis.includes('by-hand');
                const haveIngredients = _.keys(recipe).every(key => (amountThatWeHave[key as Items] ?? 0) > 0);
                const requiredUnlocks = requiredOtherProducts[itemName] ?? [];
                const haveRequiredUnlocks = requiredUnlocks.length === 0 || requiredUnlocks.some(list => seen.every(x => seen.includes(x)));

                if (canBeMadeByHand) {
                    if (!haveIngredients) return;
                    if (!haveRequiredUnlocks) return;
                }
                else {
                    if (haveProducers === false && canAddProducer === false) return;
                    if (haveIngredients === false && amt <= 0) return;
                    if (!haveRequiredUnlocks) return;
                }

            }
            markAsSeen(itemName as Items);
        }

        parts.push(
            <ItemDisplay
                key={itemName}
                amt={amt ?? 0}
                assemblerCount={assemblersMakingThis}
                itemName={itemName}
                assemblerButtons={assemblerButtons}
                makeByHand={makeByHand ? () => {
                    makeItem(itemName as Items);
                } : null}
                progress={mapValues(timeLeftInProduction[itemName], (v, k) => v[3] * 100)}
                storage={storage[itemName] ?? {}}
            />
        );
    });


    return (
        <Container fluid className={'game-container'}>
            <Button onClick={resetAll}>Reset</Button>
            {parts}
        </Container>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);