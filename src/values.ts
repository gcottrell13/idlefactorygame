import { SMap } from "./smap";

type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

type partialItems<T> = { [p in Items]?: T };

export type Items = ''
    // land
    | 'land'
    | 'rocky-land' | 'wet-land' | 'dry-land'
    // raw materials
    | 'iron-ore' | 'gas' | 'stone' | 'oil'
    | 'uranium-ore' | 'copper-ore'
    | 'water' | 'silt'
    | 'coal'
    | 'wood' | 'seed' | 'tree' | 'fertilizer' | 'nitrogen' | 'dirt'
    | 'sand'
    | 'studonite' | 'dust'
    // processed raw
    | 'iron-bar' | 'copper-bar' | 'sulfur'
    | 'steel'
    | 'copper-wire'
    | 'glass'
    | 'clean-water'
    // building materials
    | 'gear'
    | 'pipe'
    // advanced materials
    | 'sulfuric-acid'
    | 'basic-circuit'
    | 'solvent'
    // buildings
    | 'assembler1' | 'assembler2' | 'assembler3'
    | 'gas-extractor'
    | 'chemical-plant'
    | 'smelter-mk1' | 'smelter-mk2'
    | 'miner-mk1'
    | 'oil-pump'
    | 'water-pump-mk1' | 'water-pump-mk2'
    | 'greenhouse' | 'hydroponics'
    | 'water-filter'
    | 'explorer'
    ;

export const recipes: Recipes = {
    '': { '': 0 },

    'land': {},
    'wet-land': {},
    'dry-land': {},
    'rocky-land': {},

    // raw
    'iron-ore': {},
    'gas': {},
    'uranium-ore': { 'sulfuric-acid': 1 },
    'copper-ore': {},
    'oil': {},
    'stone': {},
    'water': {}, 'silt': {},
    'coal': {},
    'wood': { 'tree': 0.25 },
    'seed': {},
    'tree': { 'fertilizer': 5, 'seed': 1, 'clean-water': 5 },
    'fertilizer': { 'dirt': 2, 'nitrogen': 1 },
    'dirt': { 'silt': 20 },
    'nitrogen': {},
    'sand': {},
    'studonite': { 'solvent': 0.1 },
    'dust': {},

    // processed raw
    'iron-bar': { 'iron-ore': 1, 'coal': 0.1 },
    'copper-bar': { 'copper-ore': 1, 'coal': 0.1 },
    'sulfur': { 'gas': 0.5 },
    'steel': { 'iron-bar': 1, 'coal': 1 },

    'copper-wire': { "copper-bar": 0.5 },
    'clean-water': { 'water': 1 },
    'glass': { 'sand': 2 },

    // building materials
    'gear': { 'iron-bar': 0.5 },
    'pipe': { 'iron-bar': 5 },

    // advanced materials
    'sulfuric-acid': { 'sulfur': 1, 'water': 5 },
    'basic-circuit': { 'copper-wire': 2, 'wood': 0.25 },
    'solvent': { 'sulfuric-acid': 2, 'nitrogen': 1 },

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
        'steel': 15,
        'basic-circuit': 10,
    },
    'miner-mk1': {
        'gear': 20,
    },
    'smelter-mk1': {
        'stone': 10
    },
    'smelter-mk2': { 'iron-bar': 10, 'copper-wire': 10, 'stone': 10 },
    'oil-pump': {
        'steel': 10,
        'iron-bar': 5,
        'pipe': 10,
    },
    'water-pump-mk1': { 'iron-bar': 15, 'pipe': 5 },
    'water-pump-mk2': { 'steel': 15, 'pipe': 10 },
    'greenhouse': { 'steel': 10, 'glass': 20 },
    'hydroponics': { 'steel': 50, 'basic-circuit': 20 },
    'water-filter': { 'steel': 5, 'pipe': 5 },

    'explorer': {'steel': 10, 'basic-circuit': 15},
};

export const timePerRecipe: { [p in Items]: number } = {
    '': 0,

    'land': 10,
    'wet-land': 0,
    'dry-land': 0,
    'rocky-land': 0,

    // raw
    "iron-ore": 1,
    "uranium-ore": 5,
    gas: 3,
    'copper-ore': 1,
    oil: 1,
    stone: 1,
    water: 1, silt: 0,
    coal: 1,
    'wood': 2,
    'fertilizer': 1,
    dirt: 4,
    nitrogen: 1,
    seed: 0,
    tree: 10,
    'sand': 1,
    'studonite': 3,
    'dust': 0,
    // processed raw
    "iron-bar": 2,
    sulfur: 3,
    'copper-bar': 1,
    steel: 2,
    'copper-wire': 0.5,
    'glass': 1,
    "clean-water": 1,
    // building materials
    gear: 0.5,
    pipe: 0.5,
    // advanced materials
    "sulfuric-acid": 5,
    'basic-circuit': 1,
    solvent: 4,
    // buildings
    assembler1: 10,
    assembler2: 15,
    assembler3: 25,
    "gas-extractor": 30,
    "chemical-plant": 15,
    'miner-mk1': 10,
    'smelter-mk1': 10,
    'smelter-mk2': 15,
    'oil-pump': 15,
    'water-pump-mk1': 15,
    'water-pump-mk2': 30,
    'water-filter': 10,
    'greenhouse': 10,
    'hydroponics': 20,
    explorer: 20,
};

export const assemblerSpeeds: { [p in Items]?: number } = {
    'assembler1': 0.5,
    'assembler2': 0.75,
    'assembler3': 1.0,
    "chemical-plant": 1.0,
    'gas-extractor': 1.0,
    'smelter-mk1': 0.5,
    'smelter-mk2': 1,
    'oil-pump': 1.0,
    'miner-mk1': 0.75,
    'water-pump-mk1': 1,
    'water-pump-mk2': 5,
    'water-filter': 1,
    'greenhouse': 0.5,
    'hydroponics': 1.5,
    'explorer': 1,
};

export const requiredBuildings: { [p in Items]?: (Items | 'by-hand')[] } = {
    'land': ['by-hand', 'explorer'],
    'wet-land': [],
    'dry-land': [],
    'rocky-land': [],
    // raw
    'gas': ['gas-extractor'],
    'iron-ore': ['miner-mk1', 'by-hand'],
    'copper-ore': ['miner-mk1', 'by-hand'],
    'uranium-ore': ['miner-mk1'],
    'water': ['water-pump-mk1', 'water-pump-mk2'], 'silt': [],
    'oil': ['oil-pump'],
    'coal': ['miner-mk1', 'by-hand'],
    'stone': ['miner-mk1', 'by-hand'],
    'dirt': ['assembler1'],
    'studonite': ['miner-mk1'], dust: [],
    // processed raw
    'iron-bar': ['smelter-mk1'],
    'copper-bar': ['smelter-mk1'],
    'steel': ['smelter-mk2'],
    'sulfur': ['chemical-plant'],
    'glass': ['smelter-mk1'],
    'copper-wire': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
    'clean-water': ['water-filter'],
    'tree': ['greenhouse', 'hydroponics'],
    'wood': ['assembler1', 'assembler2', 'assembler3'],
    'fertilizer': ['assembler1', 'assembler2', 'assembler3'],
    'nitrogen': ['gas-extractor'],
    // building materials
    'gear': ['assembler1', 'assembler2', 'assembler3', 'by-hand'],
    'pipe': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
    // advanced materials
    'sulfuric-acid': ['chemical-plant'],
    'basic-circuit': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
    solvent: ['chemical-plant'],
    // buildings
    'gas-extractor': ['assembler3', 'assembler2'],
    'assembler3': ['assembler2', 'assembler1', 'assembler3'],
    'assembler2': ['assembler1', 'assembler2', 'assembler3'],
    'assembler1': ['assembler1', 'assembler2', 'assembler3', 'by-hand'],
    'chemical-plant': ['assembler2', 'assembler3'],
    'miner-mk1': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
    'water-pump-mk1': ['by-hand', 'assembler1', 'assembler2'],
    'water-pump-mk2': ['assembler2', 'assembler3'],
    'oil-pump': ['assembler2', 'assembler3'],
    'smelter-mk1': ['by-hand', 'assembler1', 'assembler2'],
    'smelter-mk2': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
    'greenhouse': ['assembler1', 'assembler2', 'by-hand'],
    'hydroponics': ['assembler3'],
    'water-filter': ['by-hand', 'assembler1', 'assembler2', 'assembler3'],
};

/**
 * [
 *  [all these are unlocked]
 *  OR [all these are unlocked]
 * ]
 */
export const requiredOtherProducts: { [p in Items]?: Items[][] } = {
    'dust': [
        ['studonite'],
    ],
}

/**
 * instead of producing 1 of the listed item, use these tables to determine what to create instead.
 * each item in the array is guaranteed to produce one of the items
 * determined by their relative values
 */
export const sideProducts: partialItems<partialItems<number>[]> = {
    'land': [
        { 'rocky-land': 2, 'wet-land': 1, 'dry-land': 2 },
    ],
    'water': [
        { 'water': 1 },
        { 'silt': 0.001, 'sand': 0.1 }
    ],
    'clean-water': [{'clean-water': 1}, {'silt': 0.1, 'sand': 0.2 }],
    'wood': [{'wood': 1}, { 'seed': 0.25, 'dust': 0.001 }],
    'studonite': [{'studonite': 1}, { 'dirt': 1, 'dust': 0.1 }],
};

export const byHandVerbs: { [p in Items]?: string } = {
    // default "make"
    'iron-ore': 'gather',
    'copper-ore': 'gather',
    'stone': 'gather',
    'coal': 'gather',
    'seed': 'gather',
    'land': 'explore',
}