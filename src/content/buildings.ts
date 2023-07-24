import { Items, partialItems } from "./itemNames";

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
    "water-filter": 1,
    greenhouse: 0.5,
    explorer: 2,
    prospector: 1,
    lumberjack: 4,
    "adamantium-drill": 1,
    "rock-crusher": 1,
    centrifuge: 1,
    "water-evaporator": 1,
    "lumberjack-school": 1,
    "wind-turbine": 2,
} satisfies partialItems<number>;

export type Buildings = keyof typeof assemblerSpeeds;

const buildingPowerRequirementsPerSecond: partialItems<partialItems<number>> = {
    "adamantium-drill": { electricity: 100 },
    "chemical-plant": { electricity: 10 },
    "gas-extractor": { electricity: 15 },
    "lumberjack-school": { electricity: 5 },
    "miner-mk1": { electricity: 2 },
    "oil-pump": { electricity: 10 },
    "rock-crusher": { electricity: 20 },
    "smelter-mk1": { wood: 0.01 },
    "smelter-mk2": { wood: 0.1 },
    "water-evaporator": { electricity: 5 },
    "water-filter": { electricity: 5 },
    "water-pump-mk1": { electricity: 5 },
    assembler: { electricity: 6 },
    centrifuge: { electricity: 10 },
    constructer: { electricity: 1 },
    explorer: { electricity: 10 },
    greenhouse: { electricity: 1, fertilizer: 1, "clean-water": 1 },
    manufacturer: { electricity: 10 },
    prospector: { food: 0.05 },
    lumberjack: { food: 0.05 },
    "wind-turbine": {},
} satisfies {
    [p in Buildings]: partialItems<number>;
};

const requiredBuildings: {
    [p in Items]: (Buildings | "by-hand")[];
} = {
    begin: ["by-hand"],
    prospector: ["by-hand"],
    lumberjack: ["lumberjack-school"],
    "lumberjack-school": ["by-hand", "manufacturer"],
    "research-metal": ["by-hand"],
    "research-small-battery": ["by-hand"],
    "small-battery": ["by-hand", "constructer"],
    electricity: ["wind-turbine"],
    "wind-turbine": ["by-hand", "constructer"],
    food: ["prospector"],

    "adamantium-drill": ["manufacturer"],
    "advanced-circuit": ["assembler"],
    "crushed-uranium": ["rock-crusher"],
    "nuclear-fuel": ["centrifuge"],
    "": [],
    "iron-frame": ["by-hand", "constructer"],
    "rock-crusher": ["by-hand", "assembler"],
    "research-adamantium-drill": ["by-hand"],
    "research-aluminum": ["by-hand"],
    "research-arbol": ["by-hand"],
    "research-assembler": ["by-hand"],
    "research-computer": ["by-hand"],
    "research-explorer": ["by-hand"],
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
    "research-basic-circuit": ["by-hand"],
    "research-woodcutting": ["by-hand"],

    "research-science-1": ["by-hand"],
    "research-science-2": ["by-hand"],
    "research-science-3": ["by-hand"],
    "research-science-4": ["by-hand"],
    "research-science-5": ["by-hand"],

    "research-box2": ["by-hand"],
    "research-box3": ["by-hand"],
    "research-box4": ["by-hand"],
    "research-box5": ["by-hand"],

    "water-evaporator": ["assembler"],
    "evaporate-water": ["water-evaporator"],
    "gold-filament": ["assembler"],
    aluminum: ["smelter-mk2"],
    computer: ["manufacturer"],
    plastic: ["chemical-plant"],
    sand: ["miner-mk1"],
    science0: ["by-hand", "constructer"],
    science1: ["by-hand", "constructer"],
    science2: ["by-hand", "assembler"],
    science3: ["assembler"],
    science4: ["manufacturer"],
    science5: ["manufacturer"],
    seed: ["by-hand"],
    u235: ["centrifuge"],
    centrifuge: ["manufacturer"],
    u234: [],
    slag: [],
    "bauxite-node": ["explorer"],
    "coal-node": ["prospector"],
    "copper-node": ["prospector"],
    "iron-node": ["prospector"],
    "sandy-land": ["prospector"],
    "stony-land": ["prospector"],
    "wet-land": ["prospector"],
    "gold-node": ["explorer"],
    "oil-node": ["explorer"],
    "studonite-node": ["explorer"],
    "uranium-node": ["explorer"],
    // raw
    gold: ["miner-mk1"],
    bauxite: ["adamantium-drill"],
    adamantium: ["chemical-plant"],
    gas: ["gas-extractor"],
    "iron-ore": ["miner-mk1", "by-hand"],
    "copper-ore": ["miner-mk1", "by-hand"],
    "uranium-ore": ["adamantium-drill"],
    water: ["water-pump-mk1"],
    oil: ["oil-pump"],
    coal: ["miner-mk1"],
    stone: ["miner-mk1", "by-hand"],
    studonite: ["miner-mk1"],
    dust: [],
    // processed raw
    "iron-bar": ["smelter-mk1"],
    "copper-bar": ["smelter-mk1"],
    steel: ["smelter-mk2"],
    sulfur: ["chemical-plant"],
    glass: ["smelter-mk1"],
    "copper-wire": ["by-hand", "constructer"],
    "clean-water": ["water-filter"],
    tree: ["prospector"],
    wood: ["lumberjack"],
    fertilizer: ["assembler"],
    nitrogen: ["gas-extractor"],
    // building materials
    gear: ["constructer", "by-hand"],
    pipe: ["constructer"],
    "adamantium-frame": ["assembler"],
    // advanced materials
    "sulfuric-acid": ["chemical-plant"],
    "basic-circuit": ["assembler"],
    solvent: ["chemical-plant"],
    // buildings
    "gas-extractor": ["assembler"],
    manufacturer: ["by-hand", "manufacturer"],
    assembler: ["by-hand", "assembler"],
    constructer: ["constructer", "by-hand"],
    "chemical-plant": ["manufacturer"],
    "miner-mk1": ["constructer"],
    "water-pump-mk1": ["constructer"],
    "oil-pump": ["assembler"],
    "smelter-mk1": ["by-hand", "constructer"],
    "smelter-mk2": ["constructer"],
    greenhouse: ["assembler"],
    hydroponics: ["manufacturer"],
    "water-filter": ["by-hand", "constructer"],

    explorer: ["assembler"],

    box: ["by-hand", "constructer"],
    "box-box": ["by-hand", "constructer"],
    box3: ["constructer"],
    box4: ["constructer"],
    box5: ["constructer"],
    tank: ["by-hand", "assembler"],
};

export default {
    assemblerSpeeds,
    requiredBuildings,
    buildingPowerRequirementsPerSecond,
};