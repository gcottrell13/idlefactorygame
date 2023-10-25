import _, { random } from "lodash";
import { keys } from "../smap";
import { Picross } from "../components/Picross";
import { Memory } from '../components/MemoryGame';
import { useState } from "react";
import { Items } from "../content/itemNames";
import minigamePrizes from "../content/minigamePrizes";


const MinigamesRegistry = {
    Picross,
    Memory,
};

export type MinigamesRegistryKeys = keyof typeof MinigamesRegistry;


export function useMinigames() {

    const allGames = keys(MinigamesRegistry);

    const [currentMinigame, setCurrentMinigame] = useState<MinigamesRegistryKeys | null>(null);

    function pickMinigameByItem(item: Items) {
        const config = minigamePrizes.minigamePrizes[item];
        if (!config || config.length === 0) return null;
        const r = _.sampleSize(config, 1)[0];
        return r;
    }

    function getMiniGame(minigame: MinigamesRegistryKeys | null | undefined) {
        if (minigame === null || minigame === undefined) return null;
        if (currentMinigame !== null) {
            return MinigamesRegistry[currentMinigame];
        }
        if (minigame === undefined) {
            minigame = allGames[random(0, allGames.length - 1)];
        }
        setCurrentMinigame(minigame);
        return MinigamesRegistry[minigame];
    }

    function resetMinigame() {
        setCurrentMinigame(null);
    }

    return {
        getMiniGame,
        resetMinigame,
        pickMinigameByItem,
    };
}