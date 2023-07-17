import { useEffect, useState } from 'react';
import { recipes, amountThatWeHave, assemblersPerRecipe, Items } from './values';
import _ from 'lodash';
import { SMap } from './smap';


function doProduction(rate: number) {
    const amounts: {[p: string]: number} = {};
    _.forEach(assemblersPerRecipe, (assemblerCount, itemName) => {
        const recipe = recipes[itemName as Items];
        if (recipe === undefined) return;
        if (!assemblerCount) return;

        const amt = amountThatWeHave[itemName as Items] ?? 0;

        let numberOfRecipesToMake = assemblerCount;
        _.toPairs(recipe).forEach(pair => {
            const [ingredientName, requiredCount] = pair;
            const weHave = amountThatWeHave[ingredientName as Items] ?? 0;
            numberOfRecipesToMake = Math.min(weHave / requiredCount, numberOfRecipesToMake);
        });

        _.toPairs(recipe).forEach(pair => {
            const [ingredientName, requiredCount] = pair;
            const weHave = amountThatWeHave[ingredientName as Items] ?? 0;
            amountThatWeHave[ingredientName as Items] = Math.max(0, weHave - (numberOfRecipesToMake * requiredCount));
        });

        amounts[itemName] = amt + numberOfRecipesToMake * rate;
        amountThatWeHave[itemName as Items] = amounts[itemName];
    });
    return amounts;
}

export function useProduction(rate: number) {
    const [state, setState] = useState<SMap<number>>({});
    useEffect(
        () => {
            const i = setInterval(() => {
                setState(doProduction(1 / rate));
            }, 1000 / rate);
            return () => {
                clearInterval(i);
            }
        },
        [rate]
    );
    return state;
}