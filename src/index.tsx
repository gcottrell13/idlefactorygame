import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { useProduction } from "./assembly";
import { recipes, Items } from './values';
import './css.css';
import { Button } from 'react-bootstrap';

const TICKS_PER_SECOND = 20;

type func = () => void;

function ItemDisplay({
    amt,
    itemName,
    assemblerCount,
    onAddAssembler,
    makeByHand,
}: {
    amt: number,
    itemName: string,
    assemblerCount: number,
    onAddAssembler: null | func,
    makeByHand: null | func,
}) {
    const addAssemblerButton = onAddAssembler && (
        <Button onClick={onAddAssembler}>+ Assembler</Button>
    );
    const makeByHandButton = makeByHand && (
        <Button onClick={makeByHand}>Make 1 {itemName}</Button>
    );

    return (
        <div key={itemName}>
            <span className="item-name">{itemName}</span>
            <span className="item-count">{Math.round(amt)}</span>
            <span className='assembler-count'>assemblers making {itemName}: {assemblerCount}</span> {addAssemblerButton}
            {makeByHandButton}
        </div>
    );
}


function App() {
    const {assemblersPerRecipe, amountThatWeHave, addAmount, addAssemblers } = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    const haveAssemblers = amountThatWeHave['assembler'] ?? 0;

    _.forEach(amountThatWeHave, (amt, itemName) => {
        const recipe = recipes[itemName as Items];
        const assemblerCount = assemblersPerRecipe[itemName] ?? 0;
        if (recipe === undefined) return;

        const makeByHand = Object.keys(recipes[itemName as Items]).length === 0;

        parts.push(
            <ItemDisplay
                amt={amt ?? 0}
                assemblerCount={assemblerCount} 
                itemName={itemName} 
                onAddAssembler={haveAssemblers > 0 ? (() => {
                    addAssemblers(itemName as Items, 1);
                    addAmount('assembler', -1);
                }) : null}
                makeByHand={makeByHand ? () => {
                    addAmount(itemName as Items, 1);
                } : null}
            />
        );
    });


    return (
        <div>
            {parts}
        </div>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);