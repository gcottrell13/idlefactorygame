import { useCallback, useMemo } from "react";
import { State } from "../typeDefs/State";
import { VERSION } from "../version";
import { keys } from "../smap";
import { NumberFormat } from "../numberFormatter";
import _ from "lodash";
import Big from "../bigmath";

const defaultState: State = {
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
    hideAddButtons: {},
    numberFormatMode: NumberFormat.SUFFIX,
};

function makeName(name: string) {
    return `idlefactory.${name}`;
}

function serializer(this: any, key: string, value: any) {
    if (typeof value === "number") {
        return Math.round(value * 1000) / 1000;
    }
    if (value instanceof Big) {
        return `big=${value.mantissa}x${value.exponent}`;
    }
    return value;
}

function deserializer(this: any, key: string, value: any) {
    if (typeof value === 'string' && value.startsWith('big=')) {
        const [, val] = value.split('=');
        const [mantissa, exponent] = val.split('x');
        return new Big(parseFloat(mantissa), parseInt(exponent));
    }
    return value;
}

function getStorage(): State {
    const monoState = localStorage.getItem("state");
    if (monoState) {
        const existingStorage = {
            ...defaultState,
            ...(JSON.parse(monoState) as State),
        };
        return existingStorage;
    } else {
        const state: State = {...defaultState};
        keys(defaultState).forEach((k) => {
            const storage = localStorage.getItem(makeName(k));
            if (storage) {
                _.set(state, k, JSON.parse(storage, deserializer));
            }
        });
        return state;
    }
}

function loadAndCheckStorage(): State {
    const state = getStorage();
    if (state.version[0] != VERSION()[0]) {
        return defaultState;
    }
    return state;
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
    const existingStorage = useMemo(loadAndCheckStorage, []);
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
