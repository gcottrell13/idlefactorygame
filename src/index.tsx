import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { calculateStorage, useProduction } from "./assembly";
import GAME, { Items, partialItems } from './values';
import './css.css';
import { Button, Row, Col, OverlayTrigger, ButtonGroup, Badge } from 'react-bootstrap';
import Popover from 'react-bootstrap/Popover';
import Container from 'react-bootstrap/Container';
import { keys, mapValues } from './smap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { VERSION } from './version';

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
    boxButtons,
    makeByHand,
    progress = {},
    storage,
}: {
    amt: number,
    itemName: Items,
    assemblerCount: partialItems<number>,
    assemblerButtons: JSX.Element[],
    boxButtons: JSX.Element[],
    makeByHand: null | func,
    progress: partialItems<number | null> | undefined,
    storage: partialItems<number>,
}) {

    const makeByHandButton = makeByHand && (
        <Button className={'make-by-hand'} onClick={makeByHand}>{GAME.byHandVerbs(itemName)}</Button>
    );
    const baseCraftTime = GAME.timePerRecipe(itemName);

    const assemblers = keys(assemblerCount).map(name => {
        const no = assemblerCount[name] ?? 0;
        const speedPer = GAME.assemblerSpeeds(name) / baseCraftTime;
        let label = <span><span className={'assembler-count-name'}>{GAME.displayNames(name)} ({d(speedPer)}/s):</span> {no} ({d(speedPer * no)}/s)</span>;
        const prog = progress[name] ?? null;
        if (prog === null) {
            label = <span>{label} <Badge bg={'danger'}>No Input</Badge></span>;
        }
        else if (prog < 0) {
            label = <span>{label} <Badge bg={'warning'}>Output Blocked</Badge></span>;
        }
        else {
            label = <span>{label} <Badge>Working {d(prog * 100)}%</Badge></span>;
        }
        return (
            <div className={'assembler-count'} key={name}>
                {label}
            </div>
        )
    });

    const assemblerDisplay = assemblers.length > 0 ? (
        <div className='assembler-count'>buildings making {GAME.displayNames(itemName)}: {assemblers}</div>
    ) : null;

    const speed = d(_.sum(keys(assemblerCount).map(key => GAME.assemblerSpeeds(key) * (assemblerCount[key] ?? 0) / baseCraftTime)));

    const recipe = GAME.recipes(itemName);
    const formatIngredients = keys(recipe).map(name => [name, recipe[name]!] as const).filter(([_name, count]) => count > 0).map(
        ([name, count]) => (
            <tr key={name}>
                <td className={'popover-ingredient-count'}>{count}</td><td>{GAME.displayNames(name)}</td>
            </tr>
        )
    );

    const byproductOf = GAME.makesAsASideProduct(itemName).map(GAME.displayNames);
    const storageObjects = GAME.itemsCanBeStoreIn(itemName).map(GAME.displayNames);

    const storageValueIfContainer = GAME.storageSizes(itemName);

    const byproducts = _.uniq(GAME.sideProducts(itemName).flatMap(x => keys(x))).filter(x => x != itemName).map(GAME.displayNames).join(', ');

    const maxValue = calculateStorage(itemName as Items, storage);

    const assemblerSpeed = GAME.assemblerSpeeds(itemName);
    const unlocks = GAME.unlocks(itemName).map(GAME.displayNames);

    const parts = [
        (
            formatIngredients.length > 0 && (
                <div className={'ingredient-list'}>
                    Ingredients: <table><tbody>{formatIngredients}</tbody></table>
                </div>
            )
        ),
        (
            storageObjects.length > 0 && (
                <div className={'storage-options'}>
                    Stored in: {storageObjects.join(', ')}
                </div>
            )
        ),
        (
            storageValueIfContainer > 0 && (
                <div className={'storage-size'}>
                    Storage Size: {storageValueIfContainer}
                </div>
            )
        ),
        (
            assemblerSpeed > 0 && (
                <div className={'item-assembler-speed'}>
                    Crafting Speed: {assemblerSpeed}x
                </div>
            )
        ),
        (
            byproducts.length > 0 && (
                <div className={'byproduct-list'}>Byproducts: {byproducts}</div>
            )
        ),
        (
            byproductOf.length > 0 && (
                <div className={'byproduct-of-list'}>Byproduct of: {byproductOf.join(', ')}</div>
            )
        ),
        (
            unlocks.length > 0 && (
                <div className={'unlock-list'}>Unlocks: {unlocks.join(', ')}</div>
            )
        ),
    ];

    const displayParts: JSX.Element[] = [];
    parts.forEach(part => {
        if (part) {
            displayParts.push(<hr />);
            displayParts.push(part);
        }
    })

    const tooltip = (props: any) => (
        <Popover id={`${itemName}-popover`} {...props}>
            <Popover.Header>
                <span className={'popover-name'}>{GAME.displayNames(itemName)}</span>
            </Popover.Header>
            <Popover.Body>
                <div className={'made-in'}>
                    Made in: <br />{GAME.requiredBuildings(itemName).map(GAME.displayNames).join(', ')}
                </div>
                {displayParts}
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
                    <span className="item-name">{GAME.displayNames(itemName)}</span>
                </OverlayTrigger>
            </Col>
            <Col xs={2}>
                <span className="item-count">{d(amt)}</span>
                <span className="item-max">{maxValue === Number.MAX_SAFE_INTEGER ? '' : `/ ${maxValue}`}</span>
                <span className={'speed'}> (+{speed}/s)</span>
            </Col>
            <Col xs={3}>
                {assemblerDisplay}
            </Col>
            <Col xs={1}>
                {boxButtons}
            </Col>
            <Col xs={4}>
                {assemblerButtons}
            </Col>
        </Row>
    );
}


function App() {
    const {
        assemblers, amountThatWeHave, productionProgress, storage, visible,
        addAssemblers, resetAll,
        makeItemByhand, canMakeItemByHand,
        addContainer,
    } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = GAME.allAssemblers.filter(key => (amountThatWeHave[key] ?? 0) > 0);

    GAME.allItemNames.forEach(itemName => {
        if (!visible[itemName]) return;

        const amt = amountThatWeHave[itemName] ?? 0;
        const recipe = GAME.recipes(itemName);
        if (recipe === undefined) return;

        const buildingsToMakeThis = GAME.requiredBuildings(itemName);
        const makeByHand = canMakeItemByHand(itemName);
        const assemblerCount = _.mapValues(assemblers, (value, key) => value?.[itemName] ?? 0);
        const assemblersMakingThis = _.pickBy(assemblerCount, x => x !== 0);
        const assemblerButtons: JSX.Element[] = [];
        const boxButtons: JSX.Element[] = [];

        GAME.itemsCanBeStoreIn(itemName).forEach(container => {
            if ((amountThatWeHave[container] ?? 0) > 0) {
                boxButtons.push(
                    <Button
                        className={'add-container'}
                        key={container}
                        onClick={() => {
                            addContainer(itemName, container, 1);
                        }}
                        variant="info"
                    >
                        Add {GAME.displayNames(container)}
                    </Button>
                );
            }
        });

        haveAssemblers.forEach(assemblerName => {
            if (buildingsToMakeThis.includes(assemblerName) === false) return;
            assemblerButtons.push(
                <Button
                    className={'add-assembler'}
                    key={assemblerName}
                    onClick={() => {
                        addAssemblers(assemblerName, itemName, 1);
                    }}
                    variant="secondary"
                >
                    Add {GAME.displayNames(assemblerName)}
                </Button>
            );
        });

        const prodStatus = productionProgress[itemName];

        parts.push(
            <ItemDisplay
                key={itemName}
                amt={amt ?? 0}
                assemblerCount={assemblersMakingThis}
                boxButtons={boxButtons}
                itemName={itemName}
                assemblerButtons={assemblerButtons}
                makeByHand={makeByHand ? () => {
                    makeItemByhand(itemName as Items);
                } : null}
                progress={prodStatus}
                storage={storage[itemName] ?? {}}
            />
        );
    });


    return (
        <Container fluid className={'game-container'}>
            <Button onClick={resetAll} variant={'secondary'}>Reset</Button> <span>{VERSION}</span>
            {parts}
        </Container>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);

document.title = "idlefactorygame " + VERSION;