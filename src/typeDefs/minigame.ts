

export enum Difficulty {
    Easy,
    Medium,
    Hard,
}

export interface GameProps {
    difficulty: Difficulty;
    onSolve: () => void;
    giftRepr: React.ReactNode;
    onCancel: () => void;
}