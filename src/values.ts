import { SMap } from "./smap";

type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

export type Items = ''
// raw materials
    | 'iron-ore' | 'gas' | 'stone' | 'oil'
    | 'uranium-ore' | 'copper-ore' | 'water'
    | 'coal'
// processed raw
    | 'iron-bar' | 'copper-bar' | 'sulfur'
    | 'steel'
// building materials
    | 'gear'
    | 'pipe'
// advanced materials
    | 'sulfuric-acid'
// buildings
    | 'assembler1' | 'assembler2' | 'assembler3'
    | 'gas-extractor'
    | 'chemical-plant'
    | 'smelter-mk1'
    | 'miner-mk1'
    | 'oil-pump'
    ;

export const recipes: Recipes = {
    '': {'': 0},

    // raw
    'iron-ore': {},
    'gas': {},
    'uranium-ore': {'sulfuric-acid': 1},
    'copper-ore': {},
    'oil': {},
    'stone': {},
    'water': {},
    'coal': {},

    // processed raw
    'iron-bar': {'iron-ore': 1},
    'copper-bar': {'copper-ore': 1},
    'sulfur': {'gas': 0.5},
    'steel': {'iron-ore': 1, 'coal': 1},

    // building materials
    'gear': {'iron-bar': 0.5},
    'pipe': {'iron-bar': 5},

    // advanced materials
    'sulfuric-acid': {'sulfur': 1},

    // buildings
    'assembler1': {
        'gear': 10,
    },
    'assembler2': {
        'assembler1': 1,
        'gear': 30,
    },
    'assembler3': {
        'assembler2': 1,
        'gear': 30,
    },
    'gas-extractor': {
        'gear': 100,
    },
    'chemical-plant': {
        'gear': 50,
    },
    'miner-mk1': {
        'gear': 20,
    },
    'smelter-mk1': {
        'stone': 10
    },
    'oil-pump': {
        'steel': 10,
        'iron-bar': 10,
    },
};

export const timePerRecipe: {[p in Items]: number} = {
    '': 0,

    // raw
    "iron-ore": 1,
    "uranium-ore": 5,
    gas: 3,
    'copper-ore': 1,
    oil: 1,
    stone: 1,
    water: 1,
    coal: 1,
    // processed raw
    "iron-bar": 2,
    sulfur: 3,
    'copper-bar': 1,
    steel: 2,
    // building materials
    gear: 0.5,
    pipe: 0.5,
    // advanced materials
    "sulfuric-acid": 5,
    // buildings
    assembler1: 10,
    assembler2: 15,
    assembler3: 25,
    "gas-extractor": 30,
    "chemical-plant": 15,
    'miner-mk1': 10,
    'smelter-mk1': 10,
    'oil-pump': 15,
};

export const assemblerSpeeds: {[p in Items]?: number} = {
    'assembler1': 0.5,
    'assembler2': 0.75,
    'assembler3': 1.0,
    "chemical-plant": 1.0,
    'gas-extractor': 1.0,
    'smelter-mk1': 0.5,
    'oil-pump': 1.0,
    'miner-mk1': 0.75,
};

export const requiredBuildings: {[p in Items]?: (Items | 'by-hand')[]} = {
    // raw
    'gas': ['gas-extractor'],
    'iron-ore': ['miner-mk1', 'by-hand'],
    'copper-ore': ['miner-mk1', 'by-hand'],
    'uranium-ore': ['miner-mk1'],
    'water': [],
    'oil': [],
    'coal': ['miner-mk1', 'by-hand'],
    'stone': ['miner-mk1', 'by-hand'],
    // processed raw
    'iron-bar': ['smelter-mk1'],
    'copper-bar': ['smelter-mk1'],
    'steel': ['smelter-mk1'],
    // building materials
    'gear': ['assembler1', 'assembler2', 'assembler3', 'by-hand'],
    // advanced materials
    // buildings
    'gas-extractor': ['assembler3', 'assembler2'],
    'assembler3': ['assembler2', 'assembler1', 'assembler3'],
    'assembler2': ['assembler1', 'assembler2', 'assembler3'],
    'assembler1': ['assembler1', 'assembler2', 'assembler3', 'by-hand'],
    'chemical-plant': ['assembler2', 'assembler3'],
};

/**
 * [
 *  [all these are unlocked]
 *  OR [all these are unlocked]
 * ]
 */
export const requiredOtherProducts: {[p in Items]?: Items[][]} = {
    'pipe': [],
}

export const sideProducts: Partial<Recipes> = {

};

export const byHandVerbs: {[p in Items]?: string} = {
    // default "make"
    'iron-ore': 'gather',
    'copper-ore': 'gather',
    'stone': 'gather',
}