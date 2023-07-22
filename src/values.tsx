import { SMap, keys, mapValues } from "./smap";

const timePerRecipe = {
    "": 0,

    begin: 0,

    prospector: 0,

    land: 10,
    "wet-land": 0,
    "dry-land": 0,
    "rocky-land": 0,
    "stony-land": 0,

    //region : science 0 -----------------------------------------------------------------
    //                           ___
    //                          / _ \
    //                         | | | |
    //                         | | | |
    //                         | |_| |
    //                          \___/
    // raw
    "iron-ore": 1,
    "copper-ore": 1,
    coal: 1,
    stone: 1,
    sand: 1,

    // processed
    "copper-bar": 2,
    "iron-bar": 2,
    glass: 1,

    // materials
    gear: 0.5,
    pipe: 0.5,

    // research
    "research-science-1": 0,
    "research-frames": 0,
    "research-box": 0,

    // science
    science0: 1,

    // buildings
    "smelter-mk1": 10,

    // containers
    box: 2,

    //endregion : science 0 -----------------------------------------------------------------

    //region : science 1 -----------------------------------------------------------------
    //                          __
    //                         /_ |
    //                          | |
    //                          | |
    //                          | |
    //                          |_|

    // processed
    steel: 2,
    "iron-frame": 2,
    "copper-wire": 0.5,

    // research
    "research-constructor": 0,
    "research-miner-mk1": 0,
    "research-wire": 0,
    "research-box2": 0,
    "research-box3": 0,
    "research-box4": 0,
    "research-box5": 0,
    "research-mass-click": 0,
    "research-steel": 0, // with science1
    "research-science-2": 0,

    // science
    science1: 1,

    // containers
    "box-box": 2,
    box3: 2,
    box4: 2,
    box5: 2,

    // buildings
    constructer: 10,
    "smelter-mk2": 15,

    //endregion : science 1 -----------------------------------------------------------------

    //region : science 2 -----------------------------------------------------------------
    //                          ___
    //                         |__ \
    //                            ) |
    //                           / /
    //                          / /_
    //                         |____|

    // raw
    "water-pump-mk1": 15,
    "miner-mk1": 10,
    water: 1,
    silt: 0,
    nitrogen: 1,
    gold: 10,
    oil: 1,

    // processed
    "basic-circuit": 1,
    "clean-water": 1,

    fertilizer: 1,
    dirt: 4,
    seed: 0,
    tree: 10,
    wood: 2,

    plastic: 2,

    // science
    science2: 2,

    // research
    "research-assembler": 0, // science2
    "research-nitrogen": 0, // science2
    "research-fluids": 0, // science2
    "research-arbol": 0, // science2
    "research-oil": 0, // science 2
    "research-science-3": 0,

    // buildings
    "oil-pump": 15,
    "water-pump-mk2": 30,
    assembler: 15,
    "gas-extractor": 30,
    greenhouse: 10,
    "water-filter": 10,
    "water-evaporator": 10,

    "evaporate-water": 1,

    // containers
    tank: 10,

    //endregion : science 2 -----------------------------------------------------------------

    //region : science 3 -----------------------------------------------------------------
    //                              ____
    //                             |___ \
    //                               __) |
    //                              |__ <
    //                              ___) |
    //                             |____/

    //raw
    gas: 3,

    // processed
    "sulfuric-acid": 5,
    sulfur: 3,
    "gold-filament": 3,

    // materials
    "advanced-circuit": 1,

    // buildings
    manufacturer: 25,
    "chemical-plant": 15,
    excavator: 20,
    explorer: 20,

    // science
    science3: 3,

    // recipes
    "excavate-dirt": 3,

    // research
    "research-advanced-circuitry": 0, // science3
    "research-natural-gas": 0, // science3
    "research-manufacturer": 0, // science3
    "research-helpers": 0, // science3
    "research-science-4": 0,

    // endregion : science 3 -----------------------------------------------------------------

    // region : science 4 -----------------------------------------------------------------
    //                               __   __
    //                              |  | |  |
    //                              |  \_|  |
    //                               \____  |
    //                                   |  |
    //                                   |__|

    // raw
    bauxite: 1,
    studonite: 3,
    dust: 0,

    // processed
    solvent: 4,
    adamantium: 5,
    aluminum: 2,

    // materials
    "adamantium-frame": 5,
    computer: 10,

    // containers

    // research
    "research-studonite": 0, // science 4
    "research-aluminum": 0, // science 4
    "research-adamantium-drill": 0, // science 4
    "research-computer": 0, // science 4
    "research-science-5": 0,

    // science
    science4: 4,

    // buildings
    "adamantium-drill": 50,

    // endregion : science 4 -----------------------------------------------------------------

    // region : science 5 -----------------------------------------------------------------
    //                               ________
    //                              |  ______|
    //                              |  |__
    //                              \____  \
    //                              _____|  |
    //                             |_______/

    // raw
    "uranium-ore": 5,

    // recipes

    // processed raw
    "crushed-uranium": 2,
    u235: 10,
    u234: 10,
    slag: 0,

    // materials

    // science
    science5: 5,

    // research
    "research-uranium": 0, // science 5

    // buildings
    hydroponics: 20,
    "rock-crusher": 10,
    centrifuge: 10,
} satisfies SMap<number>;

const displayNames: { [p in Items]?: string } = {
    assembler: "Assembler",
    constructer: "Constructor",
    "miner-mk1": "Miner Mark I",
    "smelter-mk1": "Smelter",
    "smelter-mk2": "Foundry",
    "basic-circuit": "Basic Circuit",
    "chemical-plant": "Chemical Plant",
    "excavate-dirt": "Recipe: Excavate Dirt",
    manufacturer: "Manufacturer",
    "rocky-land": "Rocky Land",
    "clean-water": "Clean Water",
    "research-wire": "Tech: Copper Wire",
    "research-steel": "Tech: Steel",
    "research-arbol": "Tech: Arbology",
    box: "Box",
    "box-box": "Box Box",
    box3: "Big Box",
    box4: "Massive Box",
    box5: "Biggest Box",
    "": "oops!",
    "adamantium-drill": "Adamantium Drill",
    "adamantium-frame": "Adamantium Frame",
    "advanced-circuit": "Advanced Circuit",
    "copper-bar": "Copper Bar",
    "copper-ore": "Copper Ore",
    "copper-wire": "Copper Wire",
    "crushed-uranium": "Crushed Uranium",
    "dry-land": "Dry Land",
    "gas-extractor": "Gas Extractor",
    "iron-bar": "Iron Slab",
    "iron-frame": "Frame",
    "iron-ore": "Iron Ore",
    "oil-pump": "Oil Pump",
    "research-adamantium-drill": "Tech: Adamantium Drill",
    "research-aluminum": "Tech: Aluminium",
    "research-assembler": "Tech: Assembler",
    "research-computer": "Tech: Computers",
    "research-helpers": "Tech: Excavator and Explorer",
    "research-manufacturer": "Tech: Manufacturer",
    "research-natural-gas": "Tech: Natural Gas",
    "research-nitrogen": "Tech: Nitrogen Extraction",
    "research-studonite": "Tech: Strange Rock",
    "research-uranium": "Tech: Glowy Rock That Makes Me Feel Bad",
    "research-fluids": "Tech: Fluids",
    "research-oil": "Tech: Essential Oils",
    "research-frames": "Tech: Applications of Iron",
    "research-box": "Tech: Containerization",
    "research-constructor": "Tech: More Automation",
    "research-miner-mk1": "Tech: Auto Mining",
    "research-advanced-circuitry": "Tech: Advanced Circuits",
    "research-mass-click": "Tech: Mass Click",
    "rock-crusher": "Rock Crusher",
    adamantium: "Adamantium",
    "stony-land": "Stone Land",
    "sulfuric-acid": "Sulfuric Acid",
    "uranium-ore": "Uranium Ore",
    "water-filter": "Water Filter",
    "water-pump-mk1": "Water Pump",
    "water-pump-mk2": "Fast Water Pump",
    "wet-land": "Wet Land",
    gold: "Gold!",
    gear: "Iron Gear",
    "research-science-1": "Tech: Science 1",
    "research-science-3": "Tech: Science 3",
    "research-science-2": "Tech: Science 2",
    "research-science-4": "Tech: Science 4",
    "research-science-5": "Tech: Science 5",
    "research-box2": "Tech: Box of a Bigger Size 1",
    "research-box3": "Tech: Box of a Bigger Size 2",
    "research-box4": "Tech: Box of a Bigger Size 3",
    "research-box5": "Tech: Box of a Bigger Size 4",
    tank: "Fluid Tank",
    prospector: "Prospector",
    land: "Survey Land",
    explorer: "Explorer",
    steel: "Steel Ingot",
    pipe: "Steel Pipe",
    "evaporate-water": "Recipe: Evaporate Water",
    plastic: "Plastic Rod",
    studonite: "Studo-nite",
    bauxite: "Bauxite",
    aluminum: "Aluminium",
    solvent: "Acidic Solvent",
    computer: "Processor Unit",
    stone: "Stone",
    coal: "Coal",
    gas: "Natural Gas",
    "gold-filament": "Gold Filament",

    begin: "Start Here",

    science0: "Basic Finding",
    science1: "Written Note",
    science2: "Documented Event",
    science3: "Intense Study",
    science4: "Research Paper",
    science5: "A.I. Generated Proof",
};

const flavorText: partialItems<React.ReactNode> = {
    "research-mass-click":
        "Lets you place Boxes and Buildings 10 times as fast.",
    begin: <b>The Beginning</b>,
    prospector: <pre>Lets you find some land!</pre>,
    land: <pre>Go Prospect that Land!</pre>,
};

export type Items = keyof typeof timePerRecipe;

type Recipe = {
    [p in Items]?: number;
};

type Recipes = {
    [p in Items]: Recipe;
};

export type partialItems<T> = { [p in Items]?: T };

const recipes: Recipes = {
    "": {},
    begin: {},
    prospector: {},

    land: {},
    "wet-land": {},
    "dry-land": {},
    "rocky-land": {},
    "stony-land": {},

    // raw
    "iron-ore": { "rocky-land": 0.01 },
    gas: {},
    gold: {},
    "uranium-ore": { "rocky-land": 0.2, "sulfuric-acid": 1 },
    "copper-ore": { "dry-land": 0.01 },
    oil: { "dry-land": 0.01 },
    stone: { "stony-land": 0.01 },
    water: { "wet-land": 0.01 },
    silt: {},
    coal: { "rocky-land": 0.01 },
    wood: { tree: 0.25 },
    seed: { "wet-land": 0.01 },
    tree: { fertilizer: 5, seed: 1, "clean-water": 5 },
    fertilizer: { dirt: 2, nitrogen: 1 },
    dirt: { silt: 20 },
    "excavate-dirt": {},
    nitrogen: {},
    sand: { "dry-land": 0.01 },
    studonite: { solvent: 0.1, "dry-land": 0.02 },
    dust: {},
    bauxite: { "rocky-land": 0.01 },
    adamantium: { studonite: 1 },
    aluminum: { bauxite: 1, "clean-water": 1 },
    "crushed-uranium": { "uranium-ore": 1 },
    u235: { "crushed-uranium": 1 },
    u234: {},
    slag: {},

    // processed raw
    "iron-bar": { "iron-ore": 1, coal: 0.1 },
    "copper-bar": { "copper-ore": 1, coal: 0.1 },
    sulfur: { gas: 0.5 },
    steel: { "iron-bar": 1, coal: 1 },

    "copper-wire": { "copper-bar": 0.5 },
    "clean-water": { water: 1 },
    glass: { sand: 2 },

    // building materials
    gear: { "iron-bar": 0.5 },
    pipe: { steel: 2 },
    "iron-frame": { "iron-bar": 2 },

    // advanced materials
    "sulfuric-acid": { sulfur: 1, water: 5 },
    "basic-circuit": { "copper-wire": 2, wood: 0.25 },
    solvent: { "sulfuric-acid": 2, nitrogen: 1 },
    plastic: { oil: 1 },
    "advanced-circuit": {
        "basic-circuit": 1,
        "gold-filament": 1,
        plastic: 0.5,
    },
    "adamantium-frame": { adamantium: 2, plastic: 1 },
    computer: { "advanced-circuit": 5, plastic: 1 },
    "gold-filament": { gold: 1, "sulfuric-acid": 0.5 },

    // buildings
    constructer: { gear: 10, "iron-frame": 2 },
    assembler: { constructer: 1, "copper-wire": 15, "iron-frame": 4 },
    manufacturer: { assembler: 1, steel: 10, "basic-circuit": 10 },
    "gas-extractor": { gear: 20, steel: 5, "iron-frame": 15 },
    "chemical-plant": {
        gear: 20,
        "iron-frame": 15,
        steel: 15,
        "basic-circuit": 10,
    },
    "miner-mk1": { gear: 20, "copper-wire": 20 },
    "smelter-mk1": { stone: 10 },
    "smelter-mk2": { "iron-frame": 10, "copper-wire": 10, "smelter-mk1": 1 },
    "oil-pump": { steel: 10, pipe: 10, "iron-frame": 10 },
    "water-pump-mk1": { "iron-bar": 15, pipe: 5 },
    "water-pump-mk2": { steel: 15, pipe: 10 },
    greenhouse: { steel: 10, glass: 20 },
    hydroponics: { steel: 50, "basic-circuit": 20, "iron-frame": 2 },
    "water-filter": { steel: 5, pipe: 5 },
    "water-evaporator": { steel: 5, pipe: 5 },
    "evaporate-water": { water: 50, "clean-water": 50 },

    explorer: { steel: 10, "basic-circuit": 8 },
    excavator: { steel: 20, "basic-circuit": 8 },

    "adamantium-drill": { "adamantium-frame": 20, computer: 5 },
    "rock-crusher": { aluminum: 10, "advanced-circuit": 5 },
    centrifuge: { "adamantium-frame": 50, "chemical-plant": 2 },

    box: { "iron-bar": 1 },
    "box-box": { box: 5 },
    box3: { "box-box": 5 },
    box4: { box3: 5 },
    box5: { box4: 5 },
    tank: { steel: 20, pipe: 10 },

    science0: { "copper-bar": 1, "iron-bar": 1 },
    science1: { "copper-wire": 1, gear: 1 },
    science2: { science1: 2, steel: 3 },
    science3: { science2: 3, plastic: 5 },
    science4: { science3: 4, "advanced-circuit": 2 },
    science5: { science4: 5, aluminum: 5 },

    // research
    "research-frames": { science0: 5 },
    "research-wire": { science0: 10, "iron-frame": 5 },
    "research-steel": { science1: 50, coal: 200 },
    "research-arbol": { science2: 20 },
    "research-assembler": { science2: 30, gear: 50 },
    "research-nitrogen": { science2: 20 },
    "research-fluids": { science2: 20 },
    "research-natural-gas": { science3: 50, nitrogen: 1000 },
    "research-helpers": { science3: 20 },
    "research-manufacturer": { science3: 20 },
    "research-studonite": { science4: 50 },
    "research-aluminum": { science4: 20 },
    "research-adamantium-drill": { science4: 20 },
    "research-computer": { science4: 50 },
    "research-uranium": { science5: 50 },
    "research-oil": { science2: 30 },
    "research-constructor": { science1: 3 },
    "research-miner-mk1": { science1: 30 },
    "research-advanced-circuitry": { science3: 50 },
    "research-mass-click": { science1: 10 },

    "research-science-1": { "copper-wire": 10, gear: 10 },
    "research-science-2": { science1: 2, steel: 50 },
    "research-science-3": { science2: 3, plastic: 50, "basic-circuit": 50 },
    "research-science-4": { science3: 4, "advanced-circuit": 100 },
    "research-science-5": { science4: 5, aluminum: 500, computer: 50 },

    "research-box": { science1: 1 },
    "research-box2": { science1: 1, box: 10 },
    "research-box3": { science1: 10, box: 100 },
    "research-box4": { science1: 100, box: 1000 },
    "research-box5": { science1: 1000, bauxite: 1000 },
};

const recipeScaleFactor: partialItems<number> = {
    // default 1.0
    science1: 1.001,
    science2: 1.001,
    science3: 1.001,
    science4: 1.001,
};

const unlockedWith: partialItems<Items[]> = {
    "copper-wire": ["research-wire"],
    assembler: ["research-assembler"],

    "gas-extractor": ["research-nitrogen"],
    "smelter-mk2": ["research-steel"],

    "iron-frame": ["research-frames"],
    gear: ["research-frames"],
    seed: ["research-arbol"],
    "water-filter": ["research-fluids"],
    "water-pump-mk1": ["research-fluids"],
    pipe: ["research-fluids"],
    gas: ["research-natural-gas"],
    manufacturer: ["research-manufacturer"],
    explorer: ["research-helpers"],
    excavator: ["research-helpers"],
    "advanced-circuit": ["research-advanced-circuitry"],
    gold: ["research-advanced-circuitry"],

    solvent: ["research-studonite"],
    studonite: ["research-studonite"],
    "adamantium-drill": ["research-adamantium-drill"],
    bauxite: ["research-aluminum"],

    computer: ["research-computer"],

    "miner-mk1": ["research-miner-mk1"],
    constructer: ["research-constructor"],

    "oil-pump": ["research-oil"],
    "research-oil": ["research-fluids"],

    science1: ["research-science-1"],
    science2: ["research-science-2"],
    science3: ["research-science-3"],
    science4: ["research-science-4"],
    science5: ["research-science-5"],

    box: ["research-box"],
    "box-box": ["research-box2"],
    box3: ["research-box3"],
    box4: ["research-box4"],
    box5: ["research-box5"],
    "research-box3": ["research-box2"],
    "research-box4": ["research-box3"],
    "research-box5": ["research-box4"],

    centrifuge: ["research-uranium"],
    "rock-crusher": ["research-uranium"],

    land: ["begin"],
};

const hideOnBuy: Items[] = [
    ...keys(recipes).filter((x) => x.startsWith("research-")),
    "begin",
];

const assemblerSpeeds = {
    constructer: 0.5,
    assembler: 0.75,
    manufacturer: 1.0,
    "chemical-plant": 1.0,
    "gas-extractor": 1.0,
    "smelter-mk1": 0.5,
    "smelter-mk2": 1,
    "oil-pump": 1.0,
    "miner-mk1": 0.75,
    "water-pump-mk1": 1,
    "water-pump-mk2": 5,
    "water-filter": 1,
    greenhouse: 0.5,
    hydroponics: 1.5,
    explorer: 2,
    prospector: 1,
    excavator: 1,
    "adamantium-drill": 1,
    "rock-crusher": 1,
    centrifuge: 1,
    "water-evaporator": 1,
} satisfies { [p in Items]?: number };

const requiredBuildings: {
    [p in Items]: (keyof typeof assemblerSpeeds | "by-hand")[];
} = {
    begin: ["by-hand"],
    prospector: [],
    "adamantium-drill": ["manufacturer"],
    "advanced-circuit": ["assembler"],
    "crushed-uranium": ["rock-crusher"],
    "": [],
    "iron-frame": ["by-hand", "constructer"],
    "rock-crusher": ["by-hand", "assembler"],
    "research-adamantium-drill": ["by-hand"],
    "research-aluminum": ["by-hand"],
    "research-arbol": ["by-hand"],
    "research-assembler": ["by-hand"],
    "research-computer": ["by-hand"],
    "research-helpers": ["by-hand"],
    "research-manufacturer": ["by-hand"],
    "research-natural-gas": ["by-hand"],
    "research-nitrogen": ["by-hand"],
    "research-steel": ["by-hand"],
    "research-studonite": ["by-hand"],
    "research-uranium": ["by-hand"],
    "research-fluids": ["by-hand"],
    "research-wire": ["by-hand"],
    "research-oil": ["by-hand"],
    "research-advanced-circuitry": ["by-hand"],
    "research-box": ["by-hand"],
    "research-constructor": ["by-hand"],
    "research-miner-mk1": ["by-hand"],
    "research-frames": ["by-hand"],
    "research-mass-click": ["by-hand"],

    "research-science-1": ["by-hand"],
    "research-science-2": ["by-hand"],
    "research-science-3": ["by-hand"],
    "research-science-4": ["by-hand"],
    "research-science-5": ["by-hand"],

    "research-box2": ["by-hand"],
    "research-box3": ["by-hand"],
    "research-box4": ["by-hand"],
    "research-box5": ["by-hand"],

    "water-evaporator": ["by-hand", "assembler"],
    "evaporate-water": ["water-evaporator"],
    "gold-filament": ["assembler"],
    aluminum: ["smelter-mk2"],
    computer: ["manufacturer"],
    plastic: ["chemical-plant"],
    sand: ["miner-mk1"],
    science0: ["by-hand", "constructer"],
    science1: ["by-hand", "constructer", "assembler"],
    science2: ["by-hand", "assembler"],
    science3: ["by-hand", "assembler"],
    science4: ["by-hand", "assembler", "manufacturer"],
    science5: ["by-hand", "manufacturer"],
    seed: ["by-hand"],
    u235: ["centrifuge"],
    centrifuge: ["manufacturer"],
    u234: [],
    slag: [],

    land: ["explorer", "prospector"],
    "wet-land": [],
    "dry-land": [],
    "rocky-land": [],
    "stony-land": [],
    // raw
    gold: ["miner-mk1"],
    bauxite: ["adamantium-drill"],
    adamantium: ["chemical-plant"],
    gas: ["gas-extractor"],
    "iron-ore": ["miner-mk1", "by-hand"],
    "copper-ore": ["miner-mk1", "by-hand"],
    "uranium-ore": ["adamantium-drill"],
    water: ["water-pump-mk1", "water-pump-mk2"],
    silt: [],
    oil: ["oil-pump"],
    coal: ["miner-mk1", "by-hand"],
    stone: ["miner-mk1", "by-hand"],
    dirt: ["constructer"],
    studonite: ["miner-mk1"],
    dust: [],
    "excavate-dirt": ["excavator"],
    // processed raw
    "iron-bar": ["smelter-mk1"],
    "copper-bar": ["smelter-mk1"],
    steel: ["smelter-mk2"],
    sulfur: ["chemical-plant"],
    glass: ["smelter-mk1"],
    "copper-wire": ["by-hand", "constructer"],
    "clean-water": ["water-filter"],
    tree: ["greenhouse", "hydroponics"],
    wood: ["constructer", "assembler", "manufacturer"],
    fertilizer: ["constructer", "assembler", "manufacturer"],
    nitrogen: ["gas-extractor"],
    // building materials
    gear: ["constructer", "by-hand"],
    pipe: ["by-hand", "constructer"],
    "adamantium-frame": ["by-hand", "assembler"],
    // advanced materials
    "sulfuric-acid": ["chemical-plant"],
    "basic-circuit": ["by-hand", "constructer", "assembler"],
    solvent: ["chemical-plant"],
    // buildings
    "gas-extractor": ["manufacturer", "assembler"],
    manufacturer: ["assembler", "manufacturer"],
    assembler: ["by-hand", "assembler", "manufacturer"],
    constructer: ["constructer", "by-hand"],
    "chemical-plant": ["assembler", "manufacturer"],
    "miner-mk1": ["by-hand", "constructer"],
    "water-pump-mk1": ["by-hand", "constructer", "assembler"],
    "water-pump-mk2": ["assembler", "manufacturer"],
    "oil-pump": ["assembler", "manufacturer"],
    "smelter-mk1": ["by-hand", "constructer", "assembler"],
    "smelter-mk2": ["by-hand", "assembler", "manufacturer"],
    greenhouse: ["constructer", "assembler", "by-hand"],
    hydroponics: ["manufacturer"],
    "water-filter": ["by-hand", "constructer", "assembler"],

    explorer: ["assembler"],
    excavator: ["assembler"],

    box: ["by-hand", "constructer"],
    "box-box": ["by-hand", "constructer"],
    box3: ["constructer"],
    box4: ["constructer"],
    box5: ["constructer"],
    tank: ["by-hand", "assembler"],
};

/**
 * instead of producing 1 of the listed item, use these tables to determine what to create instead.
 * each item in the array is guaranteed to produce one of the items
 * determined by their relative values
 */
const sideProducts: partialItems<partialItems<number>[]> = {
    land: [
        { "rocky-land": 1 },
        { "stony-land": 1 },
        { "wet-land": 1 },
        { "dry-land": 1 },
    ],
    begin: [{ begin: 1 }, { prospector: 1 }],
    water: [{ water: 1 }, { silt: 0.001, sand: 0.1 }],
    "clean-water": [{ "clean-water": 1 }, { silt: 0.1, sand: 0.2 }],
    wood: [{ wood: 1 }, { seed: 0.25 }],
    "excavate-dirt": [{ dirt: 1 }],
    u235: [{ u235: 0.1, u234: 0.9 }, { slag: 1 }],
    "evaporate-water": [{ "wet-land": 1 }],
};

const byHandVerbs: { [p in Items]?: string } = {
    // default "make"
    "iron-ore": "gather",
    "copper-ore": "gather",
    stone: "gather",
    coal: "gather",
    seed: "gather",
    land: "explore",
    begin: "Begin",
};

const storageSizes = {
    box: 50,
    "box-box": 10,
    box3: 10,
    box4: 10,
    box5: 10,
    tank: 1500,
} satisfies partialItems<number>;

// these items impose a limit on how much we can have. if the array is empty, then it have an infinite amount.
const itemsCanBeStoreIn: {
    [p in Items]?: (keyof typeof storageSizes)[] | undefined;
} = {
    "": [],
    "dry-land": [],
    "excavate-dirt": [],
    "rocky-land": [],
    "stony-land": [],
    "wet-land": [],
    excavator: ["box4"],
    explorer: ["box4"],
    land: [],
    sand: [],
    science0: ["box"],
    science1: ["box"],
    science2: ["box"],
    science3: ["box"],
    science4: ["box"],
    science5: ["box"],
    adamantium: ["box"],
    seed: ["box"],
    "rock-crusher": ["box3"],
    centrifuge: ["box3"],
    "gold-filament": ["box"],

    // raw
    gas: ["tank"],
    "iron-ore": ["box"],
    "copper-ore": ["box"],
    "uranium-ore": ["box"],
    water: ["tank"],
    silt: ["box"],
    oil: ["tank"],
    coal: ["box"],
    stone: ["box"],
    dirt: ["box"],
    studonite: ["box"],
    dust: ["box"],
    // processed raw
    "iron-bar": ["box"],
    "copper-bar": ["box"],
    steel: ["box"],
    sulfur: ["box"],
    glass: ["box"],
    "copper-wire": ["box"],
    "clean-water": ["tank"],
    tree: ["box"],
    wood: ["box"],
    fertilizer: ["box"],
    nitrogen: ["tank"],
    // building materials
    gear: ["box"],
    pipe: ["box"],
    // advanced materials
    "sulfuric-acid": ["tank"],
    "basic-circuit": ["box"],
    solvent: ["tank"],
    // buildings
    "gas-extractor": ["box3"],
    manufacturer: ["box3"],
    assembler: ["box3"],
    constructer: ["box3"],
    "chemical-plant": ["box3"],
    "miner-mk1": ["box3"],
    "water-pump-mk1": ["box3"],
    "water-pump-mk2": ["box3"],
    "oil-pump": ["box3"],
    "smelter-mk1": ["box3"],
    "smelter-mk2": ["box3"],
    greenhouse: ["box3"],
    hydroponics: ["box3"],
    "water-filter": ["box3"],
    slag: ["box"],
    u234: ["box"],
    u235: ["box"],
    computer: ["box"],
    "adamantium-frame": ["box"],
    "adamantium-drill": ["box3"],
    "crushed-uranium": ["box"],
    aluminum: ["box"],
    bauxite: ["box"],
    "advanced-circuit": ["box"],
    plastic: ["box"],
    gold: ["box"],
    "iron-frame": ["box"],

    box: ["box-box"],
    "box-box": ["box3"],
    box3: ["box4"],
    box4: ["box5"],
    box5: ["box5"],
    tank: ["box3"],
};

const sections: {
    Name: string;
    SubSections: {
        Name: string;
        Items: Items[];
    }[];
}[] = [
    {
        Name: "Beginning",
        SubSections: [
            {
                Name: "Start",
                Items: ["begin"],
            },
            {
                Name: "Land",
                Items: [
                    "prospector",
                    "land",
                    "dry-land",
                    "wet-land",
                    "rocky-land",
                    "stony-land",
                ],
            },
        ],
    },
    {
        Name: "Tier 1 - Iron, Copper, Steel",
        SubSections: [
            {
                Name: "Raw Materials",
                Items: ["iron-ore", "copper-ore", "coal", "stone"],
            },
            {
                Name: "Materials",
                Items: [
                    "iron-bar",
                    "copper-bar",
                    "iron-frame",
                    "gear",
                    "copper-wire",
                    "steel",
                ],
            },
            {
                Name: "Buildings",
                Items: [
                    "smelter-mk1",
                    "miner-mk1",
                    "smelter-mk2",
                    "constructer",
                ],
            },
            {
                Name: "Research",
                Items: [
                    "science0",
                    "science1",
                    "research-mass-click",
                    "research-wire",
                    "research-miner-mk1",
                    "research-frames",
                    "research-science-1",
                    "research-science-2",
                    "research-constructor",
                    "research-steel",
                ],
            },
        ],
    },
    {
        Name: "Tier 2 - Circuits",
        SubSections: [
            {
                Name: "Raw Materials",
                Items: ["water", "silt", "nitrogen", "oil", "dirt", "sand"],
            },
            {
                Name: "Processed Materials",
                Items: [
                    "basic-circuit",
                    "glass",
                    "clean-water",
                    "plastic",
                    "evaporate-water",
                    "pipe",
                ],
            },
            {
                Name: "Botanicals",
                Items: ["fertilizer", "seed", "tree", "wood"],
            },
            {
                Name: "Buildings",
                Items: [
                    "assembler",
                    "water-evaporator",
                    "water-filter",
                    "water-pump-mk1",
                    "water-pump-mk2",
                    "greenhouse",
                    "hydroponics",
                    "oil-pump",
                    "chemical-plant",
                    "gas-extractor",
                ],
            },
            {
                Name: "Research",
                Items: [
                    "science2",
                    "research-assembler",
                    "research-nitrogen",
                    "research-fluids",
                    "research-arbol",
                    "research-oil",
                    "research-science-3",
                ],
            },
        ],
    },
    {
        Name: "Tier 3 - Advanced Circuitry",
        SubSections: [
            {
                Name: "Materials",
                Items: [
                    "gas",
                    "sulfur",
                    "sulfuric-acid",
                    "gold",
                    "gold-filament",
                    "excavate-dirt",
                    "advanced-circuit",
                ],
            },
            {
                Name: "Buildings",
                Items: ["manufacturer", "excavator", "explorer"],
            },
            {
                Name: "Research",
                Items: [
                    "science3",
                    "research-advanced-circuitry",
                    "research-natural-gas",
                    "research-manufacturer",
                    "research-helpers",
                    "research-science-4",
                ],
            },
        ],
    },
    {
        Name: "Tier 4 - Computing",
        SubSections: [
            {
                Name: "Materials",
                Items: [
                    "studonite",
                    "solvent",
                    "adamantium",
                    "bauxite",
                    "aluminum",
                ],
            },
            {
                Name: "High-Tech Materials",
                Items: ["adamantium-frame", "computer"],
            },
            {
                Name: "Research",
                Items: [
                    "science4",
                    "research-studonite",
                    "research-aluminum",
                    "research-adamantium-drill",
                    "research-computer",
                    "research-science-5",
                ],
            },
            {
                Name: "Buildings",
                Items: ["adamantium-drill"],
            },
        ],
    },
    {
        Name: "Tier 5",
        SubSections: [
            {
                Name: "Uranium",
                Items: [
                    "uranium-ore",
                    "crushed-uranium",
                    "u234",
                    "u235",
                    "slag",
                ],
            },
            {
                Name: "Buildings",
                Items: ["rock-crusher", "centrifuge"],
            },
            {
                Name: "Research",
                Items: ["science5", "research-uranium"],
            },
        ],
    },
    {
        Name: "Containers",
        SubSections: [
            {
                Name: "Solids",
                Items: ["box", "box-box", "box3", "box4", "box5"],
            },
            {
                Name: "Fluids",
                Items: ["tank"],
            },
            {
                Name: "Research",
                Items: [
                    "research-box",
                    "research-box2",
                    "research-box3",
                    "research-box4",
                    "research-box5",
                ],
            },
        ],
    },
];

const ABSOLUTE_MAX_CRAFT = 1000;
const maxCraftAtATime: partialItems<number> = {
    "copper-ore": 2,
    "iron-ore": 2,
    coal: 2,
    stone: 2,
    begin: 1,
};

const allItemNames = keys(recipes).sort();
allItemNames.shift();
const unlocks: partialItems<Items[]> = {};
keys(unlockedWith).forEach((l) => {
    unlockedWith[l]?.forEach((k) => {
        unlocks[k] ??= [];
        unlocks[k]?.push(l);
    });
});

const ex = {
    sections,
    assemblerSpeeds: (item: Items): number =>
        (assemblerSpeeds as SMap<number>)[item] ?? 0,
    byHandVerbs: (item: Items): string => byHandVerbs[item] ?? "craft",
    displayNames: (item: Items | "by-hand"): string =>
        item === "by-hand" ? "By Hand" : displayNames[item] ?? item,
    hideOnBuy: (item: Items): boolean => hideOnBuy.includes(item),
    itemsCanBeStoreIn: (item: Items): Items[] => itemsCanBeStoreIn[item] ?? [],
    recipeScaleFactor: (item: Items): number => recipeScaleFactor[item] ?? 1.0,
    recipes: (item: Items): Recipe => recipes[item],
    requiredBuildings: (item: Items): (Items | "by-hand")[] =>
        requiredBuildings[item] ?? ["by-hand"],
    timePerRecipe: (item: Items): number => timePerRecipe[item],
    sideProducts: (item: Items): partialItems<number>[] =>
        sideProducts[item] ?? [],
    storageSizes: (item: Items): number =>
        (storageSizes as SMap<number>)[item] ?? 0,
    unlockedWith: (item: Items): Items[] => unlockedWith[item] ?? [],
    unlocks: (item: Items): Items[] => unlocks[item] ?? [],

    allItemNames: allItemNames,
    allAssemblers: keys(assemblerSpeeds),
    makesAsASideProduct: (item: Items) => makesAsASideProduct[item],

    maxCraftAtATime: (item: Items) =>
        maxCraftAtATime[item] ?? ABSOLUTE_MAX_CRAFT,

    flavorText,
};

keys(recipes).forEach((item) => {
    if (item.startsWith("research-")) {
        byHandVerbs[item] = "research";
        maxCraftAtATime[item] = 1;
    }
});

const makesAsASideProduct = mapValues(recipes, (_, item) => {
    return keys(sideProducts).filter(
        (mainOutput) =>
            mainOutput !== item &&
            ex.sideProducts(mainOutput).some((p) => p[item]),
    );
});

export default ex;
