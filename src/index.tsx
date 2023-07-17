import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { useProduction } from "./assembly";
import { recipes, Items, assemblerSpeeds } from './values';
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

    const assemblers = _.toPairs(assemblerCount).map(([name, no]) => <span className={'assembler-count'} key={name}><span className={'ass-count-name'}>{name}:</span> {no}</span>);

    return (
        <Row className='item-row'>
            <Col xs={3}>
                <span className="item-name">{itemName}</span>
            </Col>
            <Col xs={3}>
                <span className="item-count">{Math.round(amt)}</span>
            </Col>
            <Col xs={3}>
                <div className='assembler-count'>assemblers making {itemName}: {assemblers}</div>
            </Col>
            <Col xs={3}>
                {makeByHandButton}
                {assemblerButtons}
            </Col>
        </Row>
    );
}


function App() {
    const { assemblers, amountThatWeHave, addAmount, addAssemblers, resetAll } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = _.mapValues(assemblerSpeeds, (value, key) => amountThatWeHave[key as Items] ?? 0);

    _.keys(amountThatWeHave).sort().forEach(itemName => {
        const amt = amountThatWeHave[itemName as Items];
        const recipe = recipes[itemName as Items];
        if (recipe === undefined) return;

        const makeByHand = Object.keys(recipes[itemName as Items]).length === 0;
        const assemblerCount = _.mapValues(assemblers, (value, key) => value[itemName] ?? 0);

        const assemblerButtons: JSX.Element[] = [];

        _.keys(haveAssemblers).forEach(assemblerName => {
            if ((haveAssemblers[assemblerName] ?? 0) <= 0) return;
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
                assemblerCount={assemblerCount}
                itemName={itemName}
                assemblerButtons={assemblerButtons}
                makeByHand={makeByHand ? () => {
                    addAmount(itemName as Items, 1);
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