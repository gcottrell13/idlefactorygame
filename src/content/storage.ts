import _ from "lodash";
import { SCALE_N } from "../bigmath";
import { values, mapValues } from "../smap";
import { Buildings } from "./buildings";
import { Items, partialItems } from "./itemNames";

const MIN_STORAGE = 10n * SCALE_N;

const storageSizes = {
    box: 10n ** 2n,
    "box-box": 10n ** 5n,
    box3: 10n ** 8n,
    box4: 10n ** 11n,
    box5: 10n ** 15n,
    tank: 1500n,
    "adamantium-drill": 10n,
    "chemical-plant": 100n,
    "gas-extractor": 100n,
    "miner-mk1": 5n,
    "oil-pump": 100n,
    "rock-crusher": 10n,
    "smelter-mk1": 5n,
    "smelter-mk2": 5n,
    "water-filter": 0n,
    "water-pump-mk1": 0n,
    assembler: 5n,
    centrifuge: 5n,
    constructer: 5n,
    explorer: 0n,
    greenhouse: 3n,
    hydroponics: 3n,
    manufacturer: 5n,
    prospector: 1n,
    lumberjack: 1n,
    "lumberjack-school": 10n,
    "small-battery": 100n,
    "wind-turbine": 1n,
    "coal-power": 10n,
    "nuclear-reactor": 10n,
    "arcane-wizard": 0n,
    "fire-wizard": 0n,
    "wizard-paragon": 0n,
    "wizard-orb": 1000n,
    "bank": 0n,
    "desktop-computer": 0n,
    "the-spark": 0n,
    "wizard-hut": 100n,
} satisfies partialItems<bigint> & { [p in Buildings]: bigint };

type CONTAINERS = keyof typeof storageSizes;

// these items impose a limit on how much we can have.
// if the array is empty or missing, then it have an infinite amount.
const itemsCanBeStoreIn: partialItems<CONTAINERS[]> = {
    "": [],
    "stony-land": [],
    "wet-land": [],
    food: ["box"],
    explorer: ["box4"],
    sand: ["box"],
    adamantium: ["box"],
    seed: ["box"],
    "rock-crusher": ["box3"],
    centrifuge: ["box3"],
    "gold-filament": ["box"],

    electricity: ["small-battery"],
    "small-battery": ["box3"],
    "wind-turbine": ["box3"],
    "coal-power": ["box3"],
    "nuclear-reactor": ["box4"],

    // raw
    gas: ["tank"],
    "iron-ore": ["box"],
    "copper-ore": ["box"],
    "uranium-ore": ["box"],
    water: ["tank"],
    oil: ["tank"],
    coal: ["box"],
    stone: ["box"],
    studonite: ["box"],
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

    box: ["box"],
    "box-box": ["box3"],
    box3: ["box4"],
    box4: ["box5"],
    box5: ["box5"],

    tank: ["box3"],

    "arcane-wizard": ["wizard-hut"],
    "fire-wizard": ["wizard-hut"],
    "necro-wizard": ["wizard-hut"],
    "wizard-orb": ["box"],
    "wizard-essence": ["wizard-orb"],
    "raw-mana": ["wizard-orb"],
    "refined-mana": ["wizard-orb"],
    "powerful-mana": ["wizard-orb"],
};



const BOXES: CONTAINERS[] = ['box', 'box-box', 'box3', 'box4', 'box5'];
for (let val of values(itemsCanBeStoreIn)) {
    const startIndex = Math.min(...val.map(x => {
        let b = BOXES.indexOf(x);
        if (b === -1) return BOXES.length;
        return b;
    }));
    if (startIndex === BOXES.length) continue;
    for (let i = startIndex; i < BOXES.length; i++) {
        const box = BOXES[i];
        if (val.includes(box) === false)
            val.push(box);
    }
}

export default {
    itemsCanBeStoreIn,
    storageSizes: mapValues(storageSizes, v => v * SCALE_N),
    MIN_STORAGE,
};
