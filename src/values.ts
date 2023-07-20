import { SMap, keys, mapValues } from "./smap";

const timePerRecipe = {
    '': 0,

    'land': 10,
    'wet-land': 0,
    'dry-land': 0,
    'rocky-land': 0,
    'stony-land': 0,

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
    'excavate-dirt': 3,
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
    constructer: 10,
    assembler: 15,
    manufacturer: 25,
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

    'excavator': 20,
    explorer: 20,

    'warehouse': 30,
    'box': 2,
    'tank': 10,
    'science1': 1,
    'science2': 2,
    'science3': 3,
    'science4': 4,
} satisfies SMap<number>;

const displayNames: partialItems<string> = {
    'assembler': 'Assembler',
    'constructer': 'Constructor',
    'miner-mk1': 'Miner Mark I',
    'smelter-mk1': 'Smelter',
    'smelter-mk2': 'Foundry',
};

export type Items = keyof typeof timePerRecipe;

type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

export type partialItems<T> = { [p in Items]?: T };

const recipes: Recipes = {
    '': { '': 0 },

    'land': {},
    'wet-land': {},
    'dry-land': {},
    'rocky-land': {},
    'stony-land': {},

    // raw
    'iron-ore': {'rocky-land': 0.01},
    'gas': {},
    'uranium-ore': {'rocky-land': 0.1, 'sulfuric-acid': 1 },
    'copper-ore': {'dry-land': 0.01},
    'oil': {'dry-land': 0.01},
    'stone': {'stony-land': 0.01},
    'water': {'wet-land': 0.01}, 
    'silt': {},
    'coal': {'stony-land': 0.01},
    'wood': { 'tree': 0.25 },
    'seed': {'wet-land': 0.01},
    'tree': { 'fertilizer': 5, 'seed': 1, 'clean-water': 5 },
    'fertilizer': { 'dirt': 2, 'nitrogen': 1 },
    'dirt': { 'silt': 20 },
    'excavate-dirt': {},
    'nitrogen': {},
    'sand': {'dry-land': 0.01},
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
    'constructer': {
        'gear': 10,
    },
    'assembler': {
        'constructer': 1,
        'gear': 30,
    },
    'manufacturer': {
        'assembler': 1,
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

    'explorer': {'steel': 10, 'basic-circuit': 8},
    'excavator': {'steel': 20, 'basic-circuit': 8},

    'box': {'iron-bar': 1},
    'tank': {'steel': 20},
    'warehouse': {'steel': 200},

    'science1': {},
    'science2': {'science1': 2},
    'science3': {'science2': 3},
    'science4': {'science3': 4},
};

const recipeScaleFactor: partialItems<number> = {
    // default 1.0
    science1: 1.001,
    science2: 1.001,
    science3: 1.001,
    science4: 1.001,
}

const hideOnBuy: Items[] = [

];

const assemblerSpeeds = {
    'constructer': 0.5,
    'assembler': 0.75,
    'manufacturer': 1.0,
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
    'excavator': 1,
} satisfies { [p in Items]?: number };

const requiredBuildings: { [p in Items]?: (keyof typeof assemblerSpeeds | 'by-hand')[] } = {
    'land': ['by-hand', 'explorer'],
    'wet-land': [],
    'dry-land': [],
    'rocky-land': [],
    'stony-land': [],
    // raw
    'gas': ['gas-extractor'],
    'iron-ore': ['miner-mk1', 'by-hand'],
    'copper-ore': ['miner-mk1', 'by-hand'],
    'uranium-ore': ['miner-mk1'],
    'water': ['water-pump-mk1', 'water-pump-mk2'], 'silt': [],
    'oil': ['oil-pump'],
    'coal': ['miner-mk1', 'by-hand'],
    'stone': ['miner-mk1', 'by-hand'],
    'dirt': ['constructer'],
    'studonite': ['miner-mk1'], dust: [],
    'excavate-dirt': ['excavator'],
    // processed raw
    'iron-bar': ['smelter-mk1'],
    'copper-bar': ['smelter-mk1'],
    'steel': ['smelter-mk2'],
    'sulfur': ['chemical-plant'],
    'glass': ['smelter-mk1'],
    'copper-wire': ['by-hand', 'constructer'],
    'clean-water': ['water-filter'],
    'tree': ['greenhouse', 'hydroponics'],
    'wood': ['constructer', 'assembler', 'manufacturer'],
    'fertilizer': ['constructer', 'assembler', 'manufacturer'],
    'nitrogen': ['gas-extractor'],
    // building materials
    'gear': ['constructer', 'by-hand'],
    'pipe': ['by-hand', 'constructer'],
    // advanced materials
    'sulfuric-acid': ['chemical-plant'],
    'basic-circuit': ['by-hand', 'constructer', 'assembler'],
    solvent: ['chemical-plant'],
    // buildings
    'gas-extractor': ['manufacturer', 'assembler'],
    'manufacturer': ['assembler', 'manufacturer'],
    'assembler': ['by-hand', 'assembler', 'manufacturer'],
    'constructer': ['constructer', 'by-hand'],
    'chemical-plant': ['assembler', 'manufacturer'],
    'miner-mk1': ['by-hand', 'constructer'],
    'water-pump-mk1': ['by-hand', 'constructer', 'assembler'],
    'water-pump-mk2': ['assembler', 'manufacturer'],
    'oil-pump': ['assembler', 'manufacturer'],
    'smelter-mk1': ['by-hand', 'constructer', 'assembler'],
    'smelter-mk2': ['by-hand', 'assembler', 'manufacturer'],
    'greenhouse': ['constructer', 'assembler', 'by-hand'],
    'hydroponics': ['manufacturer'],
    'water-filter': ['by-hand', 'constructer', 'assembler'],

    'explorer': ['by-hand', 'assembler'],
    'excavator': ['by-hand', 'assembler'],

    'warehouse': ['manufacturer'],
    'box': ['by-hand'],
    'tank': ['by-hand'],
};

/**
 * instead of producing 1 of the listed item, use these tables to determine what to create instead.
 * each item in the array is guaranteed to produce one of the items
 * determined by their relative values
 */
const sideProducts: partialItems<partialItems<number>[]> = {
    'land': [
        { 'rocky-land': 2, 'wet-land': 1, 'dry-land': 2, 'stony-land': 1 },
    ],
    'water': [
        { 'water': 1 },
        { 'silt': 0.001, 'sand': 0.1 }
    ],
    'clean-water': [{'clean-water': 1}, {'silt': 0.1, 'sand': 0.2 }],
    'wood': [{'wood': 1}, { 'seed': 0.25, 'dust': 0.001 }],
    'studonite': [{'studonite': 1}, { 'dirt': 1, 'dust': 0.1 }],
    'excavate-dirt': [{'dirt': 1}],
};

const byHandVerbs: { [p in Items]?: string } = {
    // default "make"
    'iron-ore': 'gather',
    'copper-ore': 'gather',
    'stone': 'gather',
    'coal': 'gather',
    'seed': 'gather',
    'land': 'explore',
};

const storageSizes = {
    'box': 50,
    'tank': 1500,
    'warehouse': 10,
} satisfies partialItems<number>;

// these items impose a limit on how much we can have. if the item does not have a value, it can have an infinite amount.
// if the array is empty, then it cannot be stored.
const itemsCanBeStoreIn: partialItems<(keyof typeof storageSizes)[]> = {
    // raw
    'gas': ['tank'],
    'iron-ore': ['box'],
    'copper-ore': ['box'],
    'uranium-ore': ['box'],
    'water': ['tank'], 
    'silt': ['box'],
    'oil': ['tank'],
    'coal': ['box'],
    'stone': ['box'],
    'dirt': ['box'],
    'studonite': ['box'], 
    dust: ['box'],
    // processed raw
    'iron-bar': ['box'],
    'copper-bar': ['box'],
    'steel': ['box'],
    'sulfur': ['box'],
    'glass': ['box'],
    'copper-wire': ['box'],
    'clean-water': ['tank'],
    'tree': ['box'],
    'wood': ['box'],
    'fertilizer': ['box'],
    'nitrogen': ['tank'],
    // building materials
    'gear': ['box'],
    'pipe': ['box'],
    // advanced materials
    'sulfuric-acid': ['tank'],
    'basic-circuit': ['box'],
    solvent: ['tank'],
    // buildings
    'gas-extractor': ['warehouse'],
    'manufacturer': ['warehouse'],
    'assembler': ['warehouse'],
    'constructer': ['warehouse'],
    'chemical-plant': ['warehouse'],
    'miner-mk1': ['warehouse'],
    'water-pump-mk1': ['warehouse'],
    'water-pump-mk2': ['warehouse'],
    'oil-pump': ['warehouse'],
    'smelter-mk1': ['warehouse'],
    'smelter-mk2': ['warehouse'],
    'greenhouse': ['warehouse'],
    'hydroponics': ['warehouse'],
    'water-filter': ['warehouse'],

    'box': ['warehouse'],
    'tank': ['warehouse'],
    'warehouse': ['warehouse'],
};

const allItemNames = keys(recipes).sort();
allItemNames.shift();

const ex = {
    assemblerSpeeds: (item: Items): number => (assemblerSpeeds as SMap<number>)[item] ?? 0,
    byHandVerbs: (item: Items): string => byHandVerbs[item] ?? 'make',
    displayNames: (item: Items): string => displayNames[item] ?? item,
    hideOnBuy: (item: Items): boolean => hideOnBuy.includes(item),
    itemsCanBeStoreIn: (item: Items): Items[] => itemsCanBeStoreIn[item] ?? [],
    recipeScaleFactor: (item: Items): number => recipeScaleFactor[item] ?? 1.0,
    recipes: (item: Items): Recipe => recipes[item],
    requiredBuildings: (item: Items): (Items | 'by-hand')[] => requiredBuildings[item] ?? ['by-hand'],
    timePerRecipe: (item: Items): number => timePerRecipe[item],
    sideProducts: (item: Items): partialItems<number>[] => sideProducts[item] ?? [],
    storageSizes: (item: Items): number => (storageSizes as SMap<number>)[item] ?? 0,

    allItemNames: allItemNames,
    allAssemblers: keys(assemblerSpeeds),
    makesAsASideProduct: (item: Items) => makesAsASideProduct[item],
};

const makesAsASideProduct = mapValues(recipes, (_, item) => {
    return keys(sideProducts).filter(mainOutput => ex.sideProducts(mainOutput).some(p => p[item]));
});

export default ex;