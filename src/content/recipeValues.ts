import Big from "../bigmath";
import { Items, itemsMap, partialItems } from "./itemNames";

export type Recipe = {
    [p in Items]?: number | Big;
};

export type Recipes = {
    [p in Items]: Recipe;
};

// do not add zero
type allowedRecipeTimes =
    | 0.5
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 8
    | 10
    | 12
    | 15
    | 20
    | 25
    | 30
    | 45
    | 50
    | 60
    | 75
    | 100
    | 3600
    | 31536000;

const timePerRecipe: itemsMap<allowedRecipeTimes> = {
    youwin: 31536000,
    "": 1,
    "the-spark": 1,

    "mystic-coin": 1,
    "redeem-mc--science5": 1,
    "redeem-mc--assembler": 1,
    "research-minigames": 1,

    begin: 1,

    money: 1,

    prospector: 1,
    lumberjack: 1,
    "lumberjack-school": 1,
    electricity: 1,
    food: 10,
    "wet-land": 1,
    "coal-node": 10,
    "copper-node": 10,
    "iron-node": 10,
    "gold-node": 10,
    "oil-node": 10,
    "sandy-land": 10,
    "stony-land": 10,
    "bauxite-node": 10,
    "studonite-node": 10,
    "uranium-node": 10,
    wood: 2,
    "research-metal": 1,
    "research-woodcutting": 1,

    "coal-power": 10,

    "boost-lumberjack": 10,
    "boost-miner-mk1": 10,
    "boost-chemical-plant": 10,
    "boost-adamantium-drill": 10,
    "boost-gas-extractor": 10,
    "boost-lumberjack-school": 10,
    "boost-oil-pump": 10,
    "boost-rock-crusher": 10,
    "boost-smelter-mk1": 10,
    "boost-smelter-mk2": 10,
    "boost-assembler": 10,
    "boost-water-pump": 10,
    "boost-centrifuge": 10,
    "boost-explorer": 10,
    "boost-greenhouse": 10,
    "boost-manufacturer": 10,
    "boost-constructor": 10,
    "boost-bank": 1,
    "boost-desktop-computer": 1,

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
    "small-battery": 1,

    // research
    "research-science-1": 1,
    "research-frames": 1,
    "research-box": 1,
    "research-small-battery": 1,

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
    "research-constructor": 1,
    "research-miner-mk1": 1,
    "research-wire": 1,
    "research-box2": 1,
    "research-box3": 1,
    "research-box4": 1,
    "research-box5": 1,
    "research-mass-click": 1,
    "research-steel": 1,
    "research-science-2": 1,
    "research-money": 1,

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
    "wind-turbine": 10,

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
    nitrogen: 1,
    gold: 10,
    oil: 1,

    // processed
    "basic-circuit": 1,
    "clean-water": 1,

    fertilizer: 1,
    seed: 1,
    tree: 10,

    plastic: 2,

    // science
    science2: 2,

    // research
    "research-assembler": 1,
    "research-nitrogen": 1,
    "research-fluids": 1,
    "research-arbol": 1,
    "research-basic-circuit": 1,
    "research-oil": 1,
    "research-science-3": 1,

    // buildings
    "oil-pump": 15,
    "smooth-oil": 15,
    assembler: 15,
    "gas-extractor": 30,
    greenhouse: 10,
    "water-filter": 10,

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
    explorer: 20,

    // science
    science3: 3,

    // research
    "research-advanced-circuitry": 1,
    "research-natural-gas": 1,
    "research-manufacturer": 1,
    "research-explorer": 1,
    "research-science-4": 1,

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

    // processed
    solvent: 4,
    adamantium: 5,
    aluminum: 2,

    // materials
    "adamantium-frame": 5,
    computer: 10,

    // containers

    // research
    "research-studonite": 1,
    "research-aluminum": 1,
    "research-adamantium-drill": 1,
    "research-computer": 1,
    "research-science-5": 1,
    "research-satisfy-button": 1,

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
    slag: 1,

    // materials
    "nuclear-fuel": 10,

    // science
    science5: 5,

    // research
    "research-uranium": 1, // science 5
    "research-science-6": 1,

    // buildings
    hydroponics: 20,
    "rock-crusher": 10,
    centrifuge: 10,
    "nuclear-reactor": 100,

    "anti-grav-thruster": 100,
    "arcane-wizard": 5,
    "boost-wizard": 10,
    "car-chassis": 10,
    "car-engine": 10,
    "consume-arcane-wizard": 1,
    "consume-fire-wizard": 1,
    "consume-necro-wizard": 1,
    "consume-wizard-pop": 1,
    "crank-shaft": 5,
    "engine-block": 20,
    "engine-electronics": 10,
    "fire-wizard": 5,
    "lime-juice": 1,
    "necro-wizard": 5,
    "powerful-mana": 1,
    "raw-mana": 1,
    "refined-mana": 1,
    "research-wizard-tower": 1,
    "simple-syrup": 1,
    "spark-plug": 1,
    "steering-wheel": 2,
    "wizard-degree": 1,
    "wizard-essence": 0.5,
    "wizard-orb": 1,
    "wizard-paragon": 100,
    "wizard-pop": 1,
    "wizard-power": 1,
    "research-paragon": 1,
    "research-wizards": 1,
    "research-wizard-power": 1,
    "wizard-hut": 100,
    bank: 1,
    car: 30,
    chair: 10,
    margarita: 1,
    piston: 1,
    telescope: 1,
    tequila: 1,
    "research-the-end": 1,
    "research-car": 3600,
    "research-marg": 1,
    "desk": 1,
    "desktop-computer": 1,
    science6: 1,
};

const recipes: Recipes = {
    youwin: {},
    "the-spark": {},

    "mystic-coin": {},
    "redeem-mc--science5": { "mystic-coin": 4 },
    "redeem-mc--assembler": { "mystic-coin": 2 },
    "research-minigames": { "science0": 100 },

    "research-the-end": { "wizard-power": 100_000_000 },
    "": {},
    begin: {},
    prospector: { food: 2 },
    lumberjack: { food: 2, "iron-bar": 1 },
    "lumberjack-school": { wood: 500, steel: 30 },

    electricity: {}, // attach buildings that consume different kinds of fuel

    "research-small-battery": { "copper-wire": 5, science1: 5 },
    "small-battery": { "copper-wire": 3, "iron-frame": 1 },
    "wind-turbine": { "iron-frame": 2, "copper-wire": 5, "iron-bar": 2 },

    food: {}, // attach buildings that consume different kinds of fuel

    "wet-land": {},
    "sandy-land": {},
    "copper-node": {},
    "iron-node": {},
    "coal-node": {},
    "stony-land": {},
    "oil-node": {},
    "studonite-node": {},
    "bauxite-node": {},
    "uranium-node": {},
    "gold-node": {},

    money: {},

    // raw
    "iron-ore": { "iron-node": 0.01 },
    gas: {},
    gold: { "gold-node": 0.01 },
    "uranium-ore": { "uranium-node": 0.2, "sulfuric-acid": 1 },
    "copper-ore": { "copper-node": 0.01 },
    oil: { "oil-node": 0.01 },
    stone: { "stony-land": 0.01 },
    water: { "wet-land": 0.01 },
    coal: { "coal-node": 0.01 },
    wood: { tree: 0.25 },
    seed: { wood: 1 },
    tree: {},
    fertilizer: { nitrogen: 10, "wet-land": 0.01 },
    nitrogen: {},
    sand: { "sandy-land": 0.01 },
    studonite: { solvent: 0.1, "studonite-node": 0.02 },
    bauxite: { "bauxite-node": 0.01 },
    adamantium: { studonite: 1 },
    aluminum: { bauxite: 1, "clean-water": 1 },
    "crushed-uranium": { "uranium-ore": 1 },
    u235: { "crushed-uranium": 1 },
    u234: {},
    slag: {},

    // processed raw
    "iron-bar": { "iron-ore": 1 },
    "copper-bar": { "copper-ore": 1 },
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
    manufacturer: { assembler: 1, steel: 10, "basic-circuit": 10, "smooth-oil": 3, },
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
    "smooth-oil": { oil: 5 },
    "water-pump-mk1": { "iron-bar": 15, pipe: 5 },
    greenhouse: { steel: 10, glass: 20, seed: 1 },
    hydroponics: { steel: 50, "basic-circuit": 20, "iron-frame": 2 },
    "water-filter": { steel: 5, pipe: 5 },
    "coal-power": { steel: 100 },
    "nuclear-reactor": { computer: 100, adamantium: 500 },

    explorer: { steel: 10, "basic-circuit": 8 },

    "research-car": { "science5": 100 },
    "desk": { "wood": 10, "science5": 1 },
    "desktop-computer": { "desk": 1, "computer": 4, "plastic": 10, "copper-wire": 10 },
    "engine-block": { "money": 10000000 },
    "car-engine": { "engine-block": 1, "engine-electronics": 5, "crank-shaft": 1, "spark-plug": 7, "piston": 7 },
    "car": { "car-chassis": 1, "car-engine": 1, "chair": 2, "steering-wheel": 1, "anti-grav-thruster": 1 },
    "engine-electronics": { "basic-circuit": 10 },
    "crank-shaft": { "money": 10000000 },
    "piston": { "steel": 1 },
    "spark-plug": { "money": 100000 },
    "chair": { "money": 100000000 },
    "steering-wheel": { "money": 100000 },
    "car-chassis": { "adamantium-frame": 5 },
    "anti-grav-thruster": { "powerful-mana": 100, steel: 10, "advanced-circuit": 10 },

    "telescope": { glass: 1, aluminum: 1, "science6": 10 },
    "research-wizard-tower": { telescope: 19 },
    "research-paragon": { "wizard-power": 100000 },
    "research-wizards": { "wizard-essence": 10000 },
    "research-wizard-power": { "wizard-pop": 10000 },
    "fire-wizard": { money: 100 },
    "arcane-wizard": { money: 90 },
    "necro-wizard": { money: 95 },
    "raw-mana": {},
    "refined-mana": { "raw-mana": 2 },
    "powerful-mana": { "refined-mana": 2 },
    "wizard-degree": { "wizard-power": 100 },
    "wizard-power": {},
    "wizard-pop": {},
    "consume-arcane-wizard": { "arcane-wizard": 100 },
    "consume-fire-wizard": { "fire-wizard": 100 },
    "consume-necro-wizard": { "necro-wizard": 100 },
    "consume-wizard-pop": { "wizard-pop": 180 },
    "wizard-essence": {},
    "wizard-orb": { glass: 100 },
    "wizard-paragon": { "wizard-degree": 100 },
    "wizard-hut": { stone: 1000, "refined-mana": 1000 },

    bank: { money: 100 },

    "research-marg": { "greenhouse": 10, "science5": 10 },
    "lime-juice": { fertilizer: 1 },
    "simple-syrup": { fertilizer: 1 },
    tequila: { fertilizer: 1 },
    margarita: { "lime-juice": 2, "simple-syrup": 1, tequila: 3 },

    "adamantium-drill": { "adamantium-frame": 20, computer: 5 },
    "rock-crusher": { aluminum: 10, "advanced-circuit": 5 },
    centrifuge: { "adamantium-frame": 50, "chemical-plant": 2 },
    "nuclear-fuel": { "adamantium-frame": 1, u235: 10 },

    box: { "iron-frame": 1, "iron-bar": 3 },
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
    science6: { science5: 6 },

    // research
    "research-woodcutting": { food: 10 },
    "research-metal": { food: 10, wood: 10 },
    "research-frames": { science0: 5 },
    "research-wire": { science0: 10 },
    "research-steel": { science1: 50 },
    "research-arbol": { science2: 200 },
    "research-basic-circuit": { science2: 50, wood: 100 },
    "research-assembler": { science2: 15, gear: 50 },
    "research-nitrogen": { science2: 50 },
    "research-fluids": { science2: 50 },
    "research-oil": { science2: 100 },
    "research-natural-gas": { science3: 50, nitrogen: 1000 },
    "research-explorer": { science2: 200 },
    "research-manufacturer": { science3: 200 },
    "research-studonite": { science4: 100 },
    "research-aluminum": { science4: 400, adamantium: 100 },
    "research-adamantium-drill": { science4: 200 },
    "research-computer": { science4: 100 },
    "research-uranium": { science5: 500 },
    "research-constructor": { science1: 5 },
    "research-miner-mk1": { science1: 30 },
    "research-advanced-circuitry": { science3: 500 },
    "research-mass-click": { science1: 100 },
    "research-satisfy-button": { science4: 500_000 },
    "research-money": { science2: 10 },

    "research-science-1": { "copper-wire": 10, gear: 10 },
    "research-science-2": { science1: 200, steel: 50 },
    "research-science-3": {
        science2: 3_000,
        plastic: 5_000,
        "basic-circuit": 5_000,
    },
    "research-science-4": {
        science3: 40_000,
        "advanced-circuit": 5_000,
    },
    "research-science-5": {
        science4: 50_000,
        aluminum: 500_000,
        computer: 500_000,
    },
    "research-science-6": {
        science5: 60_000,
        u234: 1_000_000,
        computer: 5_000_000,
    },

    "boost-lumberjack": { money: 100 },
    "boost-miner-mk1": { money: 100 },
    "boost-chemical-plant": { money: 100 },
    "boost-adamantium-drill": { money: 100 },
    "boost-gas-extractor": { money: 100 },
    "boost-lumberjack-school": { money: 100 },
    "boost-oil-pump": { money: 100 },
    "boost-rock-crusher": { money: 100 },
    "boost-smelter-mk1": { money: 100 },
    "boost-smelter-mk2": { money: 100 },
    "boost-assembler": { money: 100 },
    "boost-water-pump": { money: 100 },
    "boost-centrifuge": { money: 100 },
    "boost-explorer": { money: 100 },
    "boost-greenhouse": { money: 100 },
    "boost-manufacturer": { money: 100 },
    "boost-constructor": { money: 100 },
    "boost-wizard": { "wizard-essence": 100 },
    "boost-bank": { "mystic-coin": 1 },
    "boost-desktop-computer": { "copper-wire": 42, "money": 10 },

    "research-box": { science1: 1 },
    "research-box2": { science1: 1, box: new Big(1n, 5n) },
    "research-box3": { science2: 10, box: new Big(1n, 8n) },
    "research-box4": { science3: 100, box: new Big(1n, 11n) },
    "research-box5": { science4: 1000, bauxite: 1000 },
};

const recipeScaleFactor: partialItems<number> = {
    // default 1.0

    "boost-lumberjack": 50,
    "boost-miner-mk1": 50,
    "boost-chemical-plant": 50,
    "boost-adamantium-drill": 50,
    "boost-gas-extractor": 50,
    "boost-lumberjack-school": 50,
    "boost-oil-pump": 50,
    "boost-rock-crusher": 50,
    "boost-smelter-mk1": 50,
    "boost-smelter-mk2": 50,
    "boost-assembler": 50,
    "boost-water-pump": 50,
    "boost-centrifuge": 50,
    "boost-explorer": 50,
    "boost-greenhouse": 50,
    "boost-manufacturer": 50,
    "boost-constructor": 50,
    "boost-bank": 1.3,
    "boost-desktop-computer": 50,
    "boost-wizard": 5,

    "wizard-degree": 1.01,
    "consume-necro-wizard": 1.01,
    "consume-arcane-wizard": 1.01,
    "consume-fire-wizard": 1.01,
};

export default {
    recipeScaleFactor,
    timePerRecipe,
    recipes,
};
