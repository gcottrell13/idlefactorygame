import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { useProduction } from "./assembly";
import { recipes, assemblersPerRecipe, Items } from './values';
import './css.css';

const TICKS_PER_SECOND = 20;


function App() {
    const amounts = useProduction(TICKS_PER_SECOND);

    const parts: JSX.Element[] = [];

    _.forEach(assemblersPerRecipe, (assemblerCount, itemName) => {
        const recipe = recipes[itemName as Items];
        const amt = amounts[itemName] ?? 0;
        if (recipe === undefined) return;
        if (!assemblerCount) return;

        parts.push(
            <div key={itemName}>
                <span className="item-name">{itemName}</span>
                <span className="item-count">{Math.round(amt)}</span>
                <br />
                <span className='assembler-count'>Assemblers: {assemblerCount}</span>
            </div>
        )
    });


    return (
        <div>
            {parts}
        </div>
    );
}

const root = createRoot(document.getElementById("view")!);
root.render(<App />);