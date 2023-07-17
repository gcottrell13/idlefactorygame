import { useCallback, useEffect, useRef, useState } from 'react';
import { recipes, Items } from './values';
import _ from 'lodash';
import { SMap } from './smap';

interface State {
    assemblersPerRecipe: Partial<SMap<number>>;
    amountThatWeHave: { [p in Items]: number };
}

function doProduction({
    assemblersPerRecipe,
    amountThatWeHave,
}: State, rate: number) {
    const amounts: { [p: string]: number } = { ...amountThatWeHave };
    _.forEach(assemblersPerRecipe, (assemblerCount, itemName) => {
        const recipe = recipes[itemName as Items];
        if (recipe === undefined) return;

        const amt = amountThatWeHave[itemName as Items] ?? 0;

        let numberOfRecipesToMake = assemblerCount ?? 0;
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
    return {
        assemblersPerRecipe,
        amountThatWeHave: amounts as { [p in Items]: number },
    };
}

export function useProduction(rate: number) {
    const stateRef = useRef<State>({
        amountThatWeHave: {
            "iron-bar": 0,
            "iron-ore": 0,
            assembler: 0,
        }, assemblersPerRecipe: {}
    });

    const [c, setCounter] = useState<number>(0);

    const addAmount = useCallback(
        (itemName: Items, amount: number) => {
            stateRef.current.amountThatWeHave[itemName] += amount;
        },
        []
    );
    const addAssemblers = useCallback(
        (itemName: Items, amount: number) => {
            const current = stateRef.current.assemblersPerRecipe[itemName] ?? 0;
            stateRef.current.assemblersPerRecipe[itemName] = current + amount;
        },
        []
    );

    useEffect(
        () => {
            const i = setTimeout(() => {
                stateRef.current = doProduction(stateRef.current, 1 / rate);
                setCounter(c + 1);
            }, 1000 / rate);
        }
    );
    return { ...stateRef.current, addAmount, addAssemblers };
}