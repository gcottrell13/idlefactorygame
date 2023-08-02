import { useCallback, useMemo } from "react";
import { State } from "../typeDefs/State";
import { VERSION } from "../version";

const defaultState = {
    version: VERSION,
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
} satisfies State;

function loadStorage() {
    const ex = localStorage.getItem("state");
    const existingStorage = {
        ...defaultState,
        ...((ex ? JSON.parse(ex) : {}) as State),
    };
    return existingStorage;
}

function saveGame(state: State) {
    localStorage.setItem("state", JSON.stringify(state));
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
