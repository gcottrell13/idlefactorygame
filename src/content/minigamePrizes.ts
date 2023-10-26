import { MinigamesRegistryKeys } from "../hooks/useMinigames";
import { Difficulty } from "../typeDefs/minigame";
import { partialItems } from "./itemNames";



export interface MinigameConfig {
    minigame: MinigamesRegistryKeys;
    difficulty: Difficulty;
    count: string;
}


const minigamePrizes: partialItems<MinigameConfig[]> = {
    'mystic-coin': [
        {
            minigame: 'Picross',
            difficulty: Difficulty.Easy,
            count: '2',
        },
        {
            minigame: 'Memory',
            difficulty: Difficulty.Easy,
            count: '2',
        },
    ],
    "the-spark": [
        {
            minigame: 'Memory',
            difficulty: Difficulty.Hard,
            count: '10',
        },
        {
            minigame: 'Picross',
            difficulty: Difficulty.Easy,
            count: '2',
        },
    ],
};

export default {
    minigamePrizes,
};