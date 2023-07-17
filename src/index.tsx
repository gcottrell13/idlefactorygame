import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { useProduction } from "./assembly";
import {
    recipes,
    Items,
    assemblerSpeeds,
    timePerRecipe,
    requiredBuildings,
    byHandVerbs,
} from './values';
import './css.css';
import { Button, Row, Col, OverlayTrigger, ProgressBar } from 'react-bootstrap';
import Popover from 'react-bootstrap/Popover';
import Container from 'react-bootstrap/Container';
import { SMap, keys, mapValues, values } from './smap';
import 'bootstrap/dist/css/bootstrap.min.css';

function d(n: number) {
    return (Math.floor(n * 100) / 100).toFixed(2);
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
}: {
    amt: number,
    itemName: string,
    assemblerCount: SMap<number>,
    assemblerButtons: JSX.Element[],
    makeByHand: null | func,
    progress: SMap<number>,
}) {

    const byHandVerb = byHandVerbs[itemName as Items] ?? 'make';
    const makeByHandButton = makeByHand && (
        <Button className={'make-by-hand'} onClick={makeByHand}>{byHandVerb} {itemName}</Button>
    );
    const baseCraftTime = timePerRecipe[itemName as Items];

    const assemblers = _.toPairs(assemblerCount).map(([name, no]) => {
        let label = <span><span className={'assembler-count-name'}>{name} ({d((assemblerSpeeds[name as Items] ?? 0) / baseCraftTime)}/s):</span> {no} ({d((assemblerSpeeds[name as Items] ?? 0) * no / baseCraftTime)}/s)</span>;
        if (progress[name] !== 0) {
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

    const speed = d(_.sum(_.keys(assemblerCount).map(key => (assemblerSpeeds[key as Items] ?? 0) * assemblerCount[key] / baseCraftTime)));

    const formatIngredients = _.toPairs(recipes[itemName as Items]).map(([name, count]) => <tr><td className={'popover-ingredient-count'}>{count}</td><td>{name}</td></tr>);

    const tooltip = (props: any) => (
        <Popover id="" {...props}>
            <Popover.Header>
                {itemName}
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
            <Col xs={1}>
                <span className="item-count">{d(amt)}</span> <span className={'speed'}> (+{speed}/s)</span>
            </Col>
            <Col xs={4}>
                {assemblerDisplay}
            </Col>
            <Col xs={4}>
                {assemblerButtons}
            </Col>
        </Row>
    );
}


function App() {
    const {
        assemblers, amountThatWeHave, displayAmount, timeLeftInProduction,
        addAssemblers, resetAll,
        makeItem, canMakeItem,
        seen, markAsSeen,
    } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = _.mapValues(assemblerSpeeds, (value, key) => amountThatWeHave[key as Items] ?? 0);

    keys(recipes).sort().forEach(itemName => {
        const amt = displayAmount[itemName as Items] ?? 0;
        const recipe = recipes[itemName as Items];
        if (recipe === undefined) return;

        const buildingsToMakeThis = requiredBuildings[itemName as Items] ?? ['by-hand'];
        const makeByHand = buildingsToMakeThis.includes('by-hand') && canMakeItem(itemName as Items);
        const assemblerCount = _.mapValues(assemblers, (value, key) => value?.[itemName] ?? 0);
        const assemblersMakingThis = _.pickBy(assemblerCount, x => x !== 0);
        const assemblerButtons: JSX.Element[] = [];

        _.keys(haveAssemblers).forEach(assemblerName => {
            if (buildingsToMakeThis.includes(assemblerName as Items) === false) return;
            if ((haveAssemblers[assemblerName as Items] ?? 0) < 1) return;
            assemblerButtons.push(
                <Button
                    className={'add-assembler'}
                    key={assemblerName}
                    onClick={() => {
                        addAssemblers(assemblerName as Items, itemName as Items, 1);
                    }}
                    variant="secondary"
                >
                    Add {assemblerName}
                </Button>
            );
        });

        const haveIngredients = _.keys(recipe).every(key => (amountThatWeHave[key as Items] ?? 0) > 0);
        const haveProducers = Object.keys(assemblersMakingThis).length > 0;
        if (haveIngredients === false && haveProducers === false && amt <= 0 && seen.includes(itemName as Items) === false) return;
        markAsSeen(itemName as Items);

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