import { random } from "lodash";
import { keys } from "../smap";
import { Picross } from "../components/Picross";
import { useState } from "react";


const MinigamesRegistry = {
    Picross,
};

type Minigames = keyof typeof MinigamesRegistry;


export function useMinigames() {

    const allGames = keys(MinigamesRegistry);

    const [currentMinigame, setCurrentMinigame] = useState<Minigames | null>(null);

    function getMiniGame(minigame?: Minigames) {
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
    };
}