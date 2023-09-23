import { Items, partialItems } from "./itemNames";

const unlockedWith: partialItems<Items[]> = {
    "copper-wire": ["research-wire"],
    assembler: ["research-assembler"],

    prospector: ["begin"],
    youwin: ["research-the-end"],

    "small-battery": ["research-small-battery"],
    electricity: ["research-small-battery"],
    "wind-turbine": ["research-small-battery"],
    tree: ["research-woodcutting"],
    lumberjack: ["research-woodcutting"],
    food: ["begin"],
    "research-woodcutting": ["begin"],

    "tequila": ["research-marg"],
    "simple-syrup": ["research-marg"],
    "lime-juice": ["research-marg"],

    "raw-mana": ["research-wizard-tower"],
    "wizard-orb": ["research-wizard-tower"],
    "arcane-wizard": ["research-wizard-tower"],
    "fire-wizard": ["research-wizard-tower"],
    "necro-wizard": ["research-wizard-tower"],
    "wizard-essence": ["research-wizard-tower"],

    "gas-extractor": ["research-nitrogen"],
    "coal-node": ["research-steel"],
    "smelter-mk2": ["research-steel"],

    money: ["research-money"],
    bank: ["research-money"],


    "engine-block": ["research-car"],
    "engine-electronics": ["research-car"],
    "crank-shaft": ["research-car"],
    "piston": ["research-car"],
    "chair": ["research-car"],
    "spark-plug": ["research-car"],
    "steering-wheel": ["research-car"],
    "car-chassis": ["research-car"],

    "boost-lumberjack": ["lumberjack", "money"],
    "boost-miner-mk1": ["research-miner-mk1", "money"],
    "boost-chemical-plant": ["chemical-plant", "money"],
    "boost-adamantium-drill": ["adamantium-drill", "money"],
    "boost-gas-extractor": ["gas-extractor", "money"],
    "boost-lumberjack-school": ["lumberjack-school", "money"],
    "boost-oil-pump": ["oil-pump", "money"],
    "boost-rock-crusher": ["rock-crusher", "money"],
    "boost-smelter-mk1": ["research-metal", "money"],
    "boost-smelter-mk2": ["research-steel", "money"],
    "boost-assembler": ["assembler", "money"],
    "boost-water-pump": ["water-pump-mk1", "money"],
    "boost-centrifuge": ["centrifuge", "money"],
    "boost-explorer": ["explorer", "money"],
    "boost-greenhouse": ["greenhouse", "money"],
    "boost-manufacturer": ["manufacturer", "money"],
    "boost-constructor": ["constructer", "money"],
    "boost-desktop-computer": ["desktop-computer"],

    "desk": ["research-science-5"],

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
    science6: ["research-science-6"],

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
