import { useCallback, useMemo } from "react";
import { State } from "../typeDefs/State";
import { VERSION } from "../version";
import { keys } from "../smap";

const defaultState = {
    version: VERSION(),
    displayAmount: {},
    amountThatWeHave: {},
    assemblers: {},
    visible: {},
    storage: {},
    productionProgress: {},
    amountCreated: {},
    acknowledged: {},
    disabledRecipes: {},
    powerConsumptionProgress: {},
    timeSpentPlaying: 0,
    timeUnlockedAt: {},
    ticksSinceLastUIUpdate: 0,
    lastTickTimestamp: 0,
    lastUIUpdateTimestamp: 0,
    powerConsumptionState: {},
    productionState: {},
} satisfies State;

function makeName(name: string) {
    return `idlefactory.${name}`;
}

function serializer(this: any, key: string, value: any) {
    if (typeof value === "number") {
        return Math.round(value * 1000) / 1000;
    }
    if (typeof value === 'bigint') {
        return `bigint=${value}`;
    }
    return value;
}

function deserializer(this: any, key: string, value: any) {
    if (typeof value === 'string' && value.startsWith('bigint=')) {
        const [, val] = value.split('=');
        return BigInt(val);
    }
    return value;
}

function loadStorage(): State {
    const monoState = localStorage.getItem("state");
    if (monoState) {
        const existingStorage = {
            ...defaultState,
            ...(JSON.parse(monoState) as State),
        };
        return existingStorage;
    } else {
        const state: State = {} as State;
        keys(defaultState).forEach((k) => {
            const storage = localStorage.getItem(makeName(k));
            if (storage) {
                state[k] = JSON.parse(storage, deserializer);
            } else {
                state[k] = defaultState[k] as any;
            }
        });
        return state;
    }
}

function saveGame(state: State) {
    keys(state).forEach((key) => {
        localStorage.setItem(
            makeName(key),
            JSON.stringify(state[key], serializer),
        );
    });
    if (localStorage.getItem("state")) {
        localStorage.removeItem("state");
    }
}

export function useLocalStorage() {
    const existingStorage = useMemo(loadStorage, []);
    const resetGame = useCallback(() => {
        saveGame(defaultState);
        return defaultState;
    }, []);
    return {
        existingStorage,
        saveGame,
        resetGame,
    };
}
