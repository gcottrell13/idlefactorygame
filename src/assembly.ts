import { useCallback, useEffect, useRef, useState } from 'react';
import { recipes, Items, assemblerSpeeds, timePerRecipe } from './values';
import _ from 'lodash';
import { SMap } from './smap';

type productionTime = [ticksLeft: number, productCount: number];
interface State {
    assemblers: {[p: string]: Partial<SMap<number>>};
    amountThatWeHave: { [p in Items]?: number };
    timeLeftInProduction: {[p in Items]?: productionTime};
    seen: Items[];
}

const defaultState = {
    amountThatWeHave: {},
    assemblers: {},
    seen: [],
    timeLeftInProduction: {},
} satisfies State;

const ex = localStorage.getItem('state');
const existingStorage = {...defaultState, ...(ex ? JSON.parse(ex) : {})};


function assemble(itemName: Items, assemblerCount: number, speed: number, timeStep: number, amounts: SMap<number>, [ticksLeft, productCount]: productionTime): productionTime {
    const recipe = recipes[itemName as Items];
    if (recipe === undefined) return [0, 0];

    const amt = amounts[itemName as Items] ?? 0;
    const craftTime = timePerRecipe[itemName];
    const timePerTick = timeStep * speed / craftTime;

    if (ticksLeft > 0) {
        amounts[itemName] = amt + productCount * timePerTick;
        return [ticksLeft - 1, productCount];
    }

    // not producing, so let's try to grab materials

    let numberOfRecipesToMake = assemblerCount ?? 0;
    if (numberOfRecipesToMake <= 0)
        return [0, 0];
    
    _.toPairs(recipe).forEach(pair => {
        const [ingredientName, requiredCount] = pair;
        const weHave = amounts[ingredientName as Items] ?? 0;
        if (weHave < requiredCount) {
            numberOfRecipesToMake = 0;
        }
        else {
            numberOfRecipesToMake = Math.min(Math.floor(weHave / requiredCount), numberOfRecipesToMake);
        }
    });

    _.toPairs(recipe).forEach(pair => {
        const [ingredientName, requiredCount] = pair;
        const toGrab = numberOfRecipesToMake * requiredCount;

        const weHave = amounts[ingredientName as Items] ?? 0;
        amounts[ingredientName as Items] = Math.max(0, weHave - toGrab);
    });

    if (numberOfRecipesToMake <= 0)
        return [0, 0];

    const ticksToMake = Math.floor(1 / timePerTick);
    return [ticksToMake, numberOfRecipesToMake];
}


function doProduction({
    assemblers,
    amountThatWeHave: _amountsThatWeHave,
    timeLeftInProduction,
}: State, timeStep: number) {
    const amounts: { [p: string]: number } = { ..._amountsThatWeHave };

    _.keys(assemblers).sort().forEach(level => {
        _.forEach(assemblers[level], (assemblerCount, itemName) => {
            const time = assemble(itemName as Items, assemblerCount ?? 0, assemblerSpeeds[level as Items] ?? 0, timeStep, amounts, timeLeftInProduction[itemName as Items] ?? [0, 0]);
            timeLeftInProduction[itemName as Items] = time;
        });
    });

    return {
        amountThatWeHave: amounts as { [p in Items]: number },
    };
}

export function useProduction(ticksPerSecond: number) {

    const stateRef = useRef<State>(existingStorage);

    const setState = (state: Partial<State> = {}) => {
        stateRef.current = {...stateRef.current, ...state};
        localStorage.setItem('state', JSON.stringify(stateRef.current));
    };

    const [c, setCounter] = useState<number>(0);

    const addAmount = useCallback(
        (itemName: Items, amount: number) => {
            const k = stateRef.current.amountThatWeHave[itemName] ?? 0;
            stateRef.current.amountThatWeHave[itemName] = k + amount;
            setState();
        },
        []
    );

    const makeItem = useCallback(
        (itemName: Items) => {
            const recipe = recipes[itemName];
            _.toPairs(recipe).forEach(pair => {
                const [ingredientName, requiredCount] = pair;
                const weHave = stateRef.current.amountThatWeHave[ingredientName as Items] ?? 0;
                stateRef.current.amountThatWeHave[ingredientName as Items] = Math.max(0, weHave - requiredCount);
            });
            stateRef.current.amountThatWeHave[itemName] = (stateRef.current.amountThatWeHave[itemName] ?? 0) + 1;
        },
        []
    );

    const canMakeItem = useCallback(
        (itemName: Items) => {
            const recipe = recipes[itemName];
            let canMake = true;
            _.toPairs(recipe).forEach(pair => {
                const [ingredientName, requiredCount] = pair;
                const weHave = stateRef.current.amountThatWeHave[ingredientName as Items] ?? 0;
                if (weHave < requiredCount) canMake = false;
            });
            return canMake;
        },
        []
    );

    const addAssemblers = useCallback(
        (level: Items, itemName: Items, amount: number) => {
            const k = stateRef.current.assemblers[level] ?? {};
            const current = k[itemName] ?? 0;
            k[itemName] = current + amount;
            stateRef.current.assemblers[level] = k;
            stateRef.current.amountThatWeHave[level]! -= 1;
            setState();
        },
        []
    );

    const resetAll = useCallback(
        () => {
            setState(defaultState);
        },
        [],
    );

    const markAsSeen = useCallback(
        (item: Items) => {
            if (!stateRef.current.seen.includes(item)) {
                stateRef.current.seen.push(item);
                setState();
            }
        },
        []
    );

    useEffect(
        () => {
            const i = setTimeout(() => {
                setState(doProduction(stateRef.current, 1 / ticksPerSecond));
                setCounter(c + 1);
            }, 1000 / ticksPerSecond);
            return () => {
                clearTimeout(i);
            };
        }
    );
    return { ...stateRef.current, addAmount, addAssemblers, resetAll, makeItem, canMakeItem, markAsSeen };
}