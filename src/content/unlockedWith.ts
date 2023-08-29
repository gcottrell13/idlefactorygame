import { Items, partialItems } from "./itemNames";

const unlockedWith: partialItems<Items[]> = {
    "copper-wire": ["research-wire"],
    assembler: ["research-assembler"],

    prospector: ["begin"],
    youwin: ["begin"],

    "small-battery": ["research-small-battery"],
    electricity: ["research-small-battery"],
    "wind-turbine": ["research-small-battery"],
    tree: ["research-woodcutting"],
    lumberjack: ["research-woodcutting"],
    food: ["begin"],
    "research-woodcutting": ["begin"],

    "raw-mana": ["research-wizard-tower"],
    "mystical-catalyst": ["research-wizard-tower"],
    "wizard-orb": ["research-wizard-tower"],

    "gas-extractor": ["research-nitrogen"],
    "coal-node": ["research-steel"],
    "smelter-mk2": ["research-steel"],

    money: ["research-money"],
    bank: ["research-money"],

    "boost-lumberjack": ["lumberjack"],
    "boost-miner-mk1": ["research-miner-mk1"],
    "boost-chemical-plant": ["chemical-plant"],
    "boost-adamantium-drill": ["adamantium-drill"],
    "boost-gas-extractor": ["gas-extractor"],
    "boost-lumberjack-school": ["lumberjack-school"],
    "boost-oil-pump": ["oil-pump"],
    "boost-rock-crusher": ["rock-crusher"],
    "boost-smelter-mk1": ["research-metal"],
    "boost-smelter-mk2": ["research-steel"],
    "boost-assembler": ["assembler"],
    "boost-water-pump": ["water-pump-mk1"],
    "boost-centrifuge": ["centrifuge"],
    "boost-explorer": ["explorer"],
    "boost-greenhouse": ["greenhouse"],
    "boost-manufacturer": ["manufacturer"],
    "boost-constructor": ["constructer"],

    "iron-node": ["research-metal"],
    "copper-node": ["research-metal"],
    "stony-land": ["research-metal"],
    "iron-frame": ["research-frames"],
    gear: ["research-frames"],
    seed: ["research-arbol"],
    "water-filter": ["research-fluids"],
    "water-pump-mk1": ["research-fluids"],
    pipe: ["research-fluids"],
    "wet-land": ["research-fluids"],
    gas: ["research-natural-gas"],
    manufacturer: ["research-manufacturer"],
    explorer: ["research-explorer"],
    "basic-circuit": ["research-basic-circuit"],
    "sandy-land": ["research-basic-circuit"],
    "advanced-circuit": ["research-advanced-circuitry"],

    "gold-node": ["research-advanced-circuitry"],
    gold: ["research-advanced-circuitry"],

    solvent: ["research-studonite"],
    studonite: ["research-studonite"],
    "studonite-node": ["research-studonite"],
    "adamantium-drill": ["research-adamantium-drill"],
    bauxite: ["research-aluminum"],
    "bauxite-node": ["research-aluminum"],

    computer: ["research-computer"],

    "miner-mk1": ["research-miner-mk1"],
    constructer: ["research-constructor"],

    "oil-pump": ["research-oil"],
    "oil-node": ["research-oil"],
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

    "uranium-node": ["research-uranium"],
    "nuclear-reactor": ["research-uranium"],
    centrifuge: ["research-uranium"],
    "rock-crusher": ["research-uranium"],
};

export default {
    unlockedWith,
};
