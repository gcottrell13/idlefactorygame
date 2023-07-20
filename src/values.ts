import { SMap, keys, mapValues } from "./smap";

const timePerRecipe = {
    '': 0,

    'land': 10,
    'wet-land': 0,
    'dry-land': 0,
    'rocky-land': 0,
    'stony-land': 0,

    //region : tier 0 -----------------------------------------------------------------
    //                           ___   
    //                          / _ \  
    //                         | | | | 
    //                         | | | | 
    //                         | |_| | 
    //                          \___/  
    // raw
    "iron-ore": 1,
    'copper-ore': 1,
    water: 1,
    silt: 0,
    coal: 1,
    stone: 1,
    'sand': 1,

    // processed
    'copper-bar': 2,
    "iron-bar": 2,
    'glass': 1,

    // materials
    gear: 0.5,
    pipe: 0.5,
    'iron-frame': 2,
    'copper-wire': 0.5,

    // research
    'research-wire': 0,
    'research-science-1': 0,
    'research-box2': 0,
    'research-box3': 0,
    'research-box4': 0,
    'research-box5': 0,

    // science
    'science0': 1,
    'science1': 1,

    // buildings
    constructer: 10,
    'water-pump-mk1': 15,
    'smelter-mk1': 10,
    'miner-mk1': 10,

    // containers
    'box': 2,
    'box-box': 2,
    'box3': 2,
    'box4': 2,
    'box5': 2,

    //endregion : tier 0 -----------------------------------------------------------------

    //region : tier 1 -----------------------------------------------------------------
    //                          __
    //                         /_ |    
    //                          | |    
    //                          | |    
    //                          | |    
    //                          |_|   

    // raw
    nitrogen: 1,
    gold: 10,

    // processed
    steel: 2,
    'basic-circuit': 1,
    "clean-water": 1,

    'fertilizer': 1,
    dirt: 4,
    seed: 0,
    tree: 10,
    'wood': 2,

    // science
    'science2': 2,

    // research
    'research-steel': 0, // with science1
    'research-assembler': 0, // science1
    'research-nitrogen': 0, // science2
    'research-water-filter': 0, // science2
    'research-arbol': 0, // science2
    'research-science-2': 0,

    // buildings
    'water-pump-mk2': 30,
    'smelter-mk2': 15,
    assembler: 15,
    "gas-extractor": 30,
    'greenhouse': 10,
    'water-filter': 10,

    // containers
    'tank': 10,

    //endregion : tier 1 -----------------------------------------------------------------

    //region : tier 2 -----------------------------------------------------------------
    //                          ___
    //                         |__ \   
    //                            ) |  
    //                           / /   
    //                          / /_   
    //                         |____|  
    //raw 
    gas: 3,
    oil: 1,

    // processed
    "sulfuric-acid": 5,
    sulfur: 3,
    'plastic': 2,

    // materials
    'advanced-circuit': 1,

    // buildings
    'oil-pump': 15,
    manufacturer: 25,
    "chemical-plant": 15,
    'excavator': 20,
    explorer: 20,

    // science
    'science3': 3,

    // recipes
    'excavate-dirt': 3,

    // research
    'research-science-3': 0,
    'research-oil': 0, // science 2
    'research-natural-gas': 0, // science2
    'research-manufacturer': 0, // science3
    'research-helpers': 0, // science3

    //endregion : tier 2 -----------------------------------------------------------------

    //region : tier 3 -----------------------------------------------------------------
    //                              ____
    //                             |___ \  
    //                               __) | 
    //                              |__ <  
    //                              ___) | 
    //                             |____/  

    // raw
    'bauxite': 1,
    'studonite': 3,
    'dust': 0,

    // processed
    solvent: 4,
    adamantium: 5,
    'aluminum': 2,

    // materials
    'adamantium-frame': 5,
    'computer': 10,

    // containers

    // research
    'research-studonite': 0, // science 3
    'research-aluminum': 0, // science 3
    'research-adamantium-drill': 0, // science 4
    'research-computer': 0, // science 4
    'research-science-4': 0,

    // science 
    'science4': 4,

    // buildings
    'adamantium-drill': 50,


    // endregion : tier 3 -----------------------------------------------------------------

    // region : tier 4 -----------------------------------------------------------------
    //                               __   __
    //                              |  | |  |
    //                              |  \_|  |
    //                               \____  |
    //                                   |  |
    //                                   |__|

    // raw
    "uranium-ore": 5,
    'crushed-uranium': 2,
    'u235': 10,
    'u234': 10,
    'slag': 0,

    // recipes

    // processed raw
    // materials
    // science

    // buildings
    'hydroponics': 20,
    'rock-crusher': 10,
    'centrifuge': 10,


    'science5': 5,
    'science10': 10,

    // research
    'research-science-5': 0,
    'research-uranium': 0, // science 5


} satisfies SMap<number>;

const displayNames: { [p in Items]?: string } = {
    'assembler': 'Assembler',
    'constructer': 'Constructor',
    'miner-mk1': 'Miner Mark I',
    'smelter-mk1': 'Smelter',
    'smelter-mk2': 'Foundry',
    'basic-circuit': 'Basic Circuit',
    'chemical-plant': 'Chemical Plant',
    'excavate-dirt': 'Recipe: Excavate Dirt',
    'manufacturer': 'Manufacturer',
    'rocky-land': 'Rocky Land',
    'clean-water': 'Clean Water',
    'research-wire': 'Tech: Copper Wire',
    'research-steel': 'Tech: Steel',
    'research-arbol': 'Tech: Arbology',
    'box': 'Box',
    'box-box': 'Box of Box',
    'box3': 'Bigger Box',
    'box4': 'Massive Box',
    'box5': 'Biggest Box',
    "": '',
    "adamantium-drill": 'Adamantium Drill',
    "adamantium-frame": 'Adamantium Frame',
    "advanced-circuit": 'Advanced Circuit',
    "copper-bar": 'Copper Bar',
    "copper-ore": 'Copper Ore',
    "copper-wire": 'Copper Wire',
    "crushed-uranium": 'Crushed Uranium',
    "dry-land": 'Dry Land',
    "gas-extractor": 'Gas Extractor',
    "iron-bar": 'Iron Bar',
    "iron-frame": 'Frame',
    "iron-ore": 'Iron Ore',
    "oil-pump": 'Oil Pump',
    "research-adamantium-drill": 'Tech: Adamantium Drill',
    "research-aluminum": 'Tech: Aluminium',
    "research-assembler": 'Tech: Assembler',
    "research-computer": 'Tech: Computers',
    "research-helpers": 'Tech: Excavator and Explorer',
    "research-manufacturer": 'Tech: Manufacturer',
    "research-natural-gas": 'Tech: Natural Gas',
    "research-nitrogen": 'Tech: Nitrogen Extraction',
    "research-studonite": 'Tech: Strange Rock',
    "research-uranium": 'Tech: Glowy Rock That Makes Me Feel Bad',
    "research-water-filter": 'Tech: Water Filter',
    'research-oil': 'Tech: Essential Oils',
    "rock-crusher": 'Rock Crusher',
    'adamantium': 'Adamantium',
    "stony-land": "Stone Land",
    "sulfuric-acid": 'Sulfuric Acid',
    "uranium-ore": 'Uranium Ore',
    "water-filter": 'Water Filter',
    "water-pump-mk1": 'Water Pump',
    "water-pump-mk2": 'Fast Water Pump',
    "wet-land": 'Wet Land',
    'gold': 'Gold!',
    "research-science-1": 'Tech: Science 1',
    "research-science-3": 'Tech: Science 3',
    "research-science-2": 'Tech: Science 2',
    "research-science-4": 'Tech: Science 4',
    "research-science-5": 'Tech: Science 5',
    'research-box2': 'Tech: Box of a Bigger Size 1',
    'research-box3': 'Tech: Box of a Bigger Size 2',
    'research-box4': 'Tech: Box of a Bigger Size 3',
    'research-box5': 'Tech: Box of a Bigger Size 4',
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
    '': {},

    'land': {},
    'wet-land': {},
    'dry-land': {},
    'rocky-land': {},
    'stony-land': {},

    // raw
    'iron-ore': { 'rocky-land': 0.01 },
    'gas': {},
    'gold': {},
    'uranium-ore': { 'rocky-land': 0.2, 'sulfuric-acid': 1 },
    'copper-ore': { 'dry-land': 0.01 },
    'oil': { 'dry-land': 0.01 },
    'stone': { 'stony-land': 0.01 },
    'water': { 'wet-land': 0.01 },
    'silt': {},
    'coal': { 'rocky-land': 0.01 },
    'wood': { 'tree': 0.25 },
    'seed': { 'wet-land': 0.01 },
    'tree': { 'fertilizer': 5, 'seed': 1, 'clean-water': 5 },
    'fertilizer': { 'dirt': 2, 'nitrogen': 1 },
    'dirt': { 'silt': 20 },
    'excavate-dirt': {},
    'nitrogen': {},
    'sand': { 'dry-land': 0.01 },
    'studonite': { 'solvent': 0.1, 'dry-land': 0.02 },
    'dust': {},
    'bauxite': { 'rocky-land': 0.01 },
    'adamantium': { 'studonite': 1 },
    'aluminum': { 'bauxite': 1, 'clean-water': 1 },
    'crushed-uranium': { 'uranium-ore': 1 },
    'u235': { 'crushed-uranium': 1 }, 'u234': {},
    'slag': {},

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
    'iron-frame': { 'iron-bar': 2 },

    // advanced materials
    'sulfuric-acid': { 'sulfur': 1, 'water': 5 },
    'basic-circuit': { 'copper-wire': 2, 'wood': 0.25 },
    'solvent': { 'sulfuric-acid': 2, 'nitrogen': 1 },
    plastic: { 'oil': 1 },
    'advanced-circuit': { 'basic-circuit': 2, 'plastic': 1 },
    'adamantium-frame': { 'adamantium': 2, 'plastic': 1 },
    'computer': { 'advanced-circuit': 5, 'plastic': 1 },

    // buildings
    'constructer': { 'gear': 10, 'iron-frame': 2 },
    'assembler': { 'constructer': 1, 'copper-wire': 15, 'iron-frame': 4 },
    'manufacturer': { 'assembler': 1, 'steel': 10, 'basic-circuit': 10 },
    'gas-extractor': { 'gear': 20, 'steel': 5, 'iron-frame': 15 },
    'chemical-plant': { 'gear': 20, 'iron-frame': 15, 'steel': 15, 'basic-circuit': 10 },
    'miner-mk1': { 'gear': 20, 'copper-wire': 20 },
    'smelter-mk1': { 'stone': 10 },
    'smelter-mk2': { 'iron-bar': 10, 'copper-wire': 10, 'smelter-mk1': 1 },
    'oil-pump': { 'steel': 10, 'pipe': 10, 'iron-frame': 10 },
    'water-pump-mk1': { 'iron-bar': 15, 'pipe': 5 },
    'water-pump-mk2': { 'steel': 15, 'pipe': 10 },
    'greenhouse': { 'steel': 10, 'glass': 20 },
    'hydroponics': { 'steel': 50, 'basic-circuit': 20, 'iron-frame': 2 },
    'water-filter': { 'steel': 5, 'pipe': 5 },

    'explorer': { 'steel': 10, 'basic-circuit': 8 },
    'excavator': { 'steel': 20, 'basic-circuit': 8 },

    'adamantium-drill': { 'adamantium-frame': 20, 'computer': 5 },
    'rock-crusher': { 'aluminum': 10, 'advanced-circuit': 5 },
    'centrifuge': { 'adamantium-frame': 50, 'chemical-plant': 2 },

    'box': { 'iron-bar': 1 },
    'box-box': { 'box': 5 },
    'box3': { 'box-box': 5 },
    'box4': { 'box3': 5 },
    'box5': { 'box4': 5 },
    'tank': { 'steel': 20, 'pipe': 10 },

    'science0': { 'copper-bar': 1, 'iron-bar': 1 },
    'science1': { 'copper-wire': 1, 'gear': 1 },
    'science2': { 'science1': 2, 'steel': 3 },
    'science3': { 'science2': 3, 'plastic': 5 },
    'science4': { 'science3': 4, 'advanced-circuit': 2 },
    'science5': { 'science4': 5, 'aluminum': 5 },
    'science10': {},

    // research
    'research-wire': { 'science0': 10, 'iron-frame': 5 },
    'research-steel': { 'science1': 15, 'coal': 200 },
    'research-arbol': { 'science2': 20 },
    'research-assembler': { 'science1': 30, 'gear': 50 },
    'research-nitrogen': { 'science2': 20 },
    'research-water-filter': { 'science2': 20 },
    'research-natural-gas': { 'science2': 50, 'nitrogen': 20 },
    'research-helpers': { 'science3': 20 },
    'research-manufacturer': { 'science3': 20 },
    'research-studonite': { 'science3': 50 },
    'research-aluminum': { 'science3': 20 },
    'research-adamantium-drill': { 'science4': 20 },
    'research-computer': { 'science4': 50 },
    'research-uranium': { 'science5': 50 },
    'research-oil': { 'science2': 30 },

    "research-science-1": { 'copper-wire': 1, 'gear': 1 },
    'research-science-2': { 'science1': 2, 'steel': 3 },
    'research-science-3': { 'science2': 3, 'plastic': 5 },
    'research-science-4': { 'science3': 4, 'advanced-circuit': 2 },
    'research-science-5': { 'science4': 5, 'aluminum': 5 },

    'research-box2': { 'science1': 1, 'box': 10 },
    'research-box3': { 'science1': 10, 'box': 100 },
    'research-box4': { 'science1': 100, 'box': 1000 },
    'research-box5': { 'science1': 1000, 'box': 10000 },
};

const recipeScaleFactor: partialItems<number> = {
    // default 1.0
    science1: 1.001,
    science2: 1.001,
    science3: 1.001,
    science4: 1.001,
}

const unlockedWith: partialItems<Items[]> = {
    'copper-wire': ['research-wire'],
    'assembler': ['research-assembler'],

    'gas-extractor': ['research-nitrogen'],
    'smelter-mk2': ['research-steel'],

    'seed': ['research-arbol'],
    'water-filter': ['research-water-filter'],
    'gas': ['research-natural-gas'],
    'manufacturer': ['research-manufacturer'],
    'explorer': ['research-helpers'],
    'excavator': ['research-helpers'],

    'solvent': ['research-studonite'],
    'studonite': ['research-studonite'],
    'adamantium-drill': ['research-adamantium-drill'],
    'bauxite': ['research-aluminum'],

    'computer': ['research-computer'],

    'science1': ['research-science-1'],
    'science2': ['research-science-2'],
    'science3': ['research-science-3'],
    'science4': ['research-science-4'],
    'science5': ['research-science-5'],

    'box-box': ['research-box2'],
    'box3': ['research-box3'],
    'box4': ['research-box4'],
    'box5': ['research-box5'],
    'research-box3': ['research-box2'],
    'research-box4': ['research-box3'],
    'research-box5': ['research-box4'],
};

const hideOnBuy: Items[] = [
    ...keys(recipes).filter(x => x.startsWith('research-')),

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
    'adamantium-drill': 1,
    'rock-crusher': 1,
    'centrifuge': 1,
} satisfies { [p in Items]?: number };

const requiredBuildings: { [p in Items]: (keyof typeof assemblerSpeeds | 'by-hand')[] } = {
    "adamantium-drill": ['manufacturer'],
    "advanced-circuit": ['assembler'],
    "crushed-uranium": ['rock-crusher'],
    "": [],
    "iron-frame": ['by-hand', 'constructer'],
    "rock-crusher": ['by-hand', 'assembler'],
    "research-adamantium-drill": ['by-hand'],
    "research-aluminum": ['by-hand'],
    "research-arbol": ['by-hand'],
    "research-assembler": ['by-hand'],
    "research-computer": ['by-hand'],
    "research-helpers": ['by-hand'],
    "research-manufacturer": ['by-hand'],
    "research-natural-gas": ['by-hand'],
    "research-nitrogen": ['by-hand'],
    "research-steel": ['by-hand'],
    "research-studonite": ['by-hand'],
    "research-uranium": ['by-hand'],
    "research-water-filter": ['by-hand'],
    "research-wire": ['by-hand'],
    'research-oil': ['by-hand'],

    "research-science-1": ['by-hand'],
    'research-science-2': ['by-hand'],
    'research-science-3': ['by-hand'],
    'research-science-4': ['by-hand'],
    'research-science-5': ['by-hand'],

    'research-box2': ['by-hand'],
    'research-box3': ['by-hand'],
    'research-box4': ['by-hand'],
    'research-box5': ['by-hand'],
    aluminum: ['smelter-mk2'],
    computer: ['manufacturer'],
    plastic: ['chemical-plant'],
    sand: [],
    science0: ['by-hand', 'constructer'],
    science1: ['by-hand', 'constructer', 'assembler'],
    science2: ['by-hand', 'assembler'],
    science3: ['by-hand', 'assembler'],
    science4: ['by-hand', 'assembler', 'manufacturer'],
    science5: ['by-hand', 'manufacturer'],
    seed: ['by-hand'],
    u235: ['centrifuge'],
    centrifuge: ['by-hand', 'manufacturer'],
    'science10': [],
    'u234': [],
    'slag': [],

    'land': ['by-hand', 'explorer'],
    'wet-land': [],
    'dry-land': [],
    'rocky-land': [],
    'stony-land': [],
    // raw
    'gold': ['miner-mk1'],
    'bauxite': ['adamantium-drill'],
    'adamantium': ['chemical-plant'],
    'gas': ['gas-extractor'],
    'iron-ore': ['miner-mk1', 'by-hand'],
    'copper-ore': ['miner-mk1', 'by-hand'],
    'uranium-ore': ['adamantium-drill'],
    'water': ['water-pump-mk1', 'water-pump-mk2'],
    'silt': [],
    'oil': ['oil-pump'],
    'coal': ['miner-mk1', 'by-hand'],
    'stone': ['miner-mk1', 'by-hand'],
    'dirt': ['constructer'],
    'studonite': ['miner-mk1'],
    dust: [],
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
    'adamantium-frame': ['by-hand', 'assembler'],
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

    'box': ['by-hand', 'constructer'],
    'box-box': ['by-hand', 'constructer'],
    'box3': ['constructer'],
    'box4': ['constructer'],
    'box5': ['constructer'],
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
    'clean-water': [{ 'clean-water': 1 }, { 'silt': 0.1, 'sand': 0.2 }],
    'wood': [{ 'wood': 1 }, { 'seed': 0.25, 'dust': 0.001 }],
    'studonite': [{ 'studonite': 1 }, { 'dirt': 1, 'dust': 0.1 }],
    'excavate-dirt': [{ 'dirt': 1 }],
    'u235': [
        { 'u235': 0.1, 'u234': 0.9 },
        { 'slag': 1 },
    ]
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
    'box-box': 10,
    'box3': 10,
    'box4': 10,
    'box5': 10,
    'tank': 1500,
} satisfies partialItems<number>;

// these items impose a limit on how much we can have. if the array is empty, then it have an infinite amount.
const itemsCanBeStoreIn: { [p in Items]?: (keyof typeof storageSizes)[] | undefined } = {
    "": [],
    "dry-land": [],
    "excavate-dirt": [],
    "rocky-land": [],
    "stony-land": [],
    "wet-land": [],
    excavator: [],
    explorer: [],
    land: [],
    sand: [],
    science0: ['box'],
    science1: ['box'],
    science10: ['box'],
    science2: ['box'],
    science3: ['box'],
    science4: ['box'],
    science5: ['box'],
    adamantium: ['box'],
    seed: ['box'],
    "rock-crusher": ['box3'],
    centrifuge: ['box3'],
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
    'gas-extractor': ['box3'],
    'manufacturer': ['box3'],
    'assembler': ['box3'],
    'constructer': ['box3'],
    'chemical-plant': ['box3'],
    'miner-mk1': ['box3'],
    'water-pump-mk1': ['box3'],
    'water-pump-mk2': ['box3'],
    'oil-pump': ['box3'],
    'smelter-mk1': ['box3'],
    'smelter-mk2': ['box3'],
    'greenhouse': ['box3'],
    'hydroponics': ['box3'],
    'water-filter': ['box3'],
    'slag': ['box'],
    'u234': ['box'],
    'u235': ['box'],
    'computer': ['box'],
    'adamantium-frame': ['box'],
    'adamantium-drill': ['box3'],
    'crushed-uranium': ['box'],
    'aluminum': ['box'],
    'bauxite': ['box'],
    'advanced-circuit': ['box'],
    'plastic': ['box'],
    'gold': ['box'],
    'iron-frame': ['box'],

    'box': ['box-box'],
    'box-box': ['box3'],
    'box3': ['box4'],
    'box4': ['box5'],
    'box5': [],
    'tank': ['box3'],
};

const allItemNames = keys(recipes).sort();
allItemNames.shift();
const unlocks: partialItems<Items[]> = {};
keys(unlockedWith).forEach(l => {
    unlockedWith[l]?.forEach(k => {
        unlocks[k] ??= [];
        unlocks[k]?.push(l);
    })
});

const ex = {
    assemblerSpeeds: (item: Items): number => (assemblerSpeeds as SMap<number>)[item] ?? 0,
    byHandVerbs: (item: Items): string => byHandVerbs[item] ?? 'make',
    displayNames: (item: Items | 'by-hand'): string => item === 'by-hand' ? 'By Hand' : displayNames[item] ?? item,
    hideOnBuy: (item: Items): boolean => hideOnBuy.includes(item),
    itemsCanBeStoreIn: (item: Items): Items[] => itemsCanBeStoreIn[item] ?? [],
    recipeScaleFactor: (item: Items): number => recipeScaleFactor[item] ?? 1.0,
    recipes: (item: Items): Recipe => recipes[item],
    requiredBuildings: (item: Items): (Items | 'by-hand')[] => requiredBuildings[item] ?? ['by-hand'],
    timePerRecipe: (item: Items): number => timePerRecipe[item],
    sideProducts: (item: Items): partialItems<number>[] => sideProducts[item] ?? [],
    storageSizes: (item: Items): number => (storageSizes as SMap<number>)[item] ?? 0,
    unlockedWith: (item: Items): Items[] => unlockedWith[item] ?? [],
    unlocks: (item: Items): Items[] => unlocks[item] ?? [],

    allItemNames: allItemNames,
    allAssemblers: keys(assemblerSpeeds),
    makesAsASideProduct: (item: Items) => makesAsASideProduct[item],
};

const makesAsASideProduct = mapValues(recipes, (_, item) => {
    return keys(sideProducts).filter(mainOutput => mainOutput !== item && ex.sideProducts(mainOutput).some(p => p[item]));
});

export default ex;