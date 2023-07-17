import { SMap } from "./smap";

type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

export type Items = 
    'iron-bar'
    | 'iron-ore'
    | 'assembler1'
    | 'assembler2'
    | 'assembler3'
    ;

export const recipes: Recipes = {
    'iron-bar': {
        'iron-ore': 1,
    },
    'iron-ore': {},
    'assembler1': {},
    'assembler2': {},
    'assembler3': {},
};

export const assemblerSpeeds: SMap<number> = {
    'assembler1': 0.5,
    'assembler2': 0.75,
    'assembler3': 1.0,
};

export const sideProducts: Partial<Recipes> = {

};