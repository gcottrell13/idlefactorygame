import { SMap } from "./smap";

type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

export type Items = 
    'iron-bar' | 'gear'
    | 'iron-ore'
    | 'assembler1'
    | 'assembler2'
    | 'assembler3'
    | 'uranium-ore'
    | 'sulfuric-acid'
    | 'sulfur'
    | 'gas' | 'gas-extractor'
    | 'chemical-plant'
    | 'pipe'
    ;

export const recipes: Recipes = {
    'iron-bar': {
        'iron-ore': 1,
    },
    'gear': {
        'iron-bar': 0.5,
    },
    'pipe': {
        'iron-bar': 5,
    },
    'iron-ore': {},
    'assembler1': {
        'gear': 10,
    },
    'assembler2': {
        'assembler1': 1,
    },
    'assembler3': {
        'assembler2': 1,
    },
    'uranium-ore': {
        'sulfuric-acid': 1,
    },
    'sulfuric-acid': {
        'sulfur': 1,
    },
    'sulfur': {
        'gas': 0.5,
    },
    'gas': {

    },
    'gas-extractor': {
        'gear': 100,
    },
    'chemical-plant': {
        'gear': 50,
    },
};

export const timePerRecipe: {[p in Items]: number} = {
    "iron-bar": 2,
    gear: 0.5,
    pipe: 0.5,
    "iron-ore": 1,
    assembler1: 10,
    assembler2: 15,
    assembler3: 25,
    "gas-extractor": 30,
    "sulfuric-acid": 5,
    "uranium-ore": 5,
    gas: 3,
    sulfur: 3,
    "chemical-plant": 15,
};

export const assemblerSpeeds: {[p in Items]?: number} = {
    'assembler1': 0.5,
    'assembler2': 0.75,
    'assembler3': 1.0,
    "chemical-plant": 1.0,
    'gas-extractor': 1.0,
};

export const requiredBuildings: {[p in Items]?: (Items | 'by-hand')[]} = {
    'gas': ['gas-extractor'],
    'gas-extractor': ['assembler3', 'assembler2'],
    'assembler3': ['assembler2', 'assembler1', 'assembler3'],
    'assembler2': ['assembler1', 'assembler2', 'assembler3'],
    'assembler1': ['assembler1', 'assembler2', 'assembler3'],
    'chemical-plant': ['assembler2', 'assembler3'],
};

export const sideProducts: Partial<Recipes> = {

};