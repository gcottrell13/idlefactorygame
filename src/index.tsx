import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { useProduction } from "./assembly";
import { recipes, Items, assemblerSpeeds, timePerRecipe, requiredBuildings } from './values';
import './css.css';
import { Button, Row, Col } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { SMap } from './smap';
import 'bootstrap/dist/css/bootstrap.min.css';

const TICKS_PER_SECOND = 20;

type func = () => void;

function ItemDisplay({
    amt,
    itemName,
    assemblerCount,
    assemblerButtons,
    makeByHand,
}: {
    amt: number,
    itemName: string,
    assemblerCount: SMap<number>,
    assemblerButtons: JSX.Element[],
    makeByHand: null | func,
}) {
    const makeByHandButton = makeByHand && (
        <Button className={'make-by-hand'} onClick={makeByHand}>Make 1 {itemName}</Button>
    );
    const baseCraftTime = timePerRecipe[itemName as Items];

    const assemblers = _.toPairs(assemblerCount).map(([name, no]) => (
        <span className={'assembler-count'} key={name}>
            <span className={'assembler-count-name'}>{name} ({baseCraftTime * (assemblerSpeeds[name as Items] ?? 0)}/s):</span> {no} ({baseCraftTime * (assemblerSpeeds[name as Items] ?? 0) * no}/s)
        </span>
    ));
    const assemblerDisplay = assemblers.length > 0 ? (
        <div className='assembler-count'>buildings making {itemName}: {assemblers}</div>
    ) : null;

    const speed = _.sum(_.keys(assemblerCount).map(key => (assemblerSpeeds[key as Items] ?? 0) * assemblerCount[key] / baseCraftTime));

    return (
        <Row className='item-row'>
            <Col xs={1}>
                <span className="item-name">{itemName}</span>
            </Col>
            <Col xs={1}>
                <span className="item-count">{Math.round(amt)}</span> <span className={'speed'}> (+{speed}/s)</span>
            </Col>
            <Col xs={5}>
                {assemblerDisplay}
            </Col>
            <Col xs={5}>
                {makeByHandButton}
                {assemblerButtons}
            </Col>
        </Row>
    );
}


function App() {
    const { 
        assemblers, amountThatWeHave, addAssemblers, resetAll,
        makeItem, canMakeItem, 
    } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = _.mapValues(assemblerSpeeds, (value, key) => amountThatWeHave[key as Items] ?? 0);

    _.keys(recipes).sort().forEach(itemName => {
        const amt = amountThatWeHave[itemName as Items];
        const recipe = recipes[itemName as Items];
        if (recipe === undefined) return;

        if (_.keys(recipe).every(key => (amountThatWeHave[key as Items] ?? 0) > 0) === false) return;

        const makeByHand = (requiredBuildings[itemName as Items] ?? ['by-hand']).includes('by-hand') && canMakeItem;
        const assemblerCount = _.mapValues(assemblers, (value, key) => value[itemName] ?? 0);

        const assemblerButtons: JSX.Element[] = [];

        _.keys(haveAssemblers).forEach(assemblerName => {
            if ((haveAssemblers[assemblerName as Items] ?? 0) <= 0) return;
            assemblerButtons.push(
                <Button
                    className={'add-assembler'}
                    key={assemblerName}
                    onClick={() => {
                        addAssemblers(assemblerName as Items, itemName as Items, 1);
                    }}
                >
                    Add {assemblerName}
                </Button>
            );
        });

        parts.push(
            <ItemDisplay
                key={itemName}
                amt={amt ?? 0}
                assemblerCount={_.pickBy(assemblerCount, x => x !== 0)}
                itemName={itemName}
                assemblerButtons={assemblerButtons}
                makeByHand={makeByHand ? () => {
                    makeItem(itemName as Items);
                } : null}
            />
        );
    });


    return (
        <Container fluid>
            <Button onClick={resetAll}>Reset</Button>
            {parts}
        </Container>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);