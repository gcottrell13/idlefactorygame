import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { calculateStorage, useProduction } from "./assembly";
import GAME, { Items, partialItems } from './values';
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

    const byHandVerb = GAME.byHandVerbs(itemName) ?? 'make';
    const makeByHandButton = makeByHand && (
        <Button className={'make-by-hand'} onClick={makeByHand}>{byHandVerb} {itemName}</Button>
    );
    const baseCraftTime = GAME.timePerRecipe(itemName);

    const assemblers = keys(assemblerCount).map(name => {
        const no = assemblerCount[name] ?? 0;
        const speedPer = GAME.assemblerSpeeds(name) / baseCraftTime;
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

    const speed = d(_.sum(keys(assemblerCount).map(key => GAME.assemblerSpeeds(key) * (assemblerCount[key] ?? 0) / baseCraftTime)));

    const formatIngredients = _.toPairs(GAME.recipes(itemName)).map(([name, count]) => <tr><td className={'popover-ingredient-count'}>{count}</td><td>{name}</td></tr>);

    const byproductOf = GAME.makesAsASideProduct(itemName);
    const storageObjects = GAME.itemsCanBeStoreIn(itemName);

    const maxValue = calculateStorage(itemName as Items, storage);

    const tooltip = (props: any) => (
        <Popover id="" {...props}>
            <Popover.Header>
                {itemName} - {baseCraftTime}s
                <div className={'storage-options'}>
                    Stored in: {storageObjects.join(', ')}
                </div>
            </Popover.Header>
            <Popover.Body>
                Made in: {GAME.requiredBuildings(itemName).join(', ')}
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
        assemblers, amountThatWeHave, timeLeftInProduction, storage,
        addAssemblers, resetAll,
        makeItemByhand, canMakeItemByHand,
        addContainer,
    } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = _.mapValues(GAME.assemblerSpeeds, (value, key) => amountThatWeHave[key as Items] ?? 0);

    GAME.allItemNames.forEach(itemName => {
        const amt = amountThatWeHave[itemName] ?? 0;
        const recipe = GAME.recipes(itemName);
        if (recipe === undefined) return;

        const buildingsToMakeThis = GAME.requiredBuildings(itemName);
        const makeByHand = canMakeItemByHand(itemName);
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

        GAME.itemsCanBeStoreIn(itemName).forEach(container => {
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

        const prod = timeLeftInProduction[itemName];

        parts.push(
            <ItemDisplay
                key={itemName}
                amt={amt ?? 0}
                assemblerCount={assemblersMakingThis}
                itemName={itemName}
                assemblerButtons={assemblerButtons}
                makeByHand={makeByHand ? () => {
                    makeItemByhand(itemName as Items);
                } : null}
                progress={mapValues(prod, (v, k) => v[3] * 100)}
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