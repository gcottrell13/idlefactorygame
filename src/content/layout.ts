import { Items } from "./itemNames";

type Sections = {
    Name: string;
    SubSections: {
        Name: string;
        Items: Items[];
    }[];
}[];

const sections: Sections = [
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
                    "lumberjack",
                    "wet-land",
                    "stony-land",
                    "sandy-land",
                ],
            },
            {
                Name: "Resources",
                Items: [
                    "tree",
                    "wood",
                    "food",
                    "iron-node",
                    "copper-node",
                    "coal-node",
                    "gold-node",
                    "oil-node",
                    "bauxite-node",
                    "studonite-node",
                    "uranium-node",
                ],
            },
            {
                Name: "Buildings",
                Items: ["lumberjack-school"],
            },
            {
                Name: "Research",
                Items: ["research-woodcutting"],
            },
        ],
    },
    {
        Name: "Power",
        SubSections: [
            {
                Name: "",
                Items: ["electricity"],
            },
            {
                Name: "Fuel",
                Items: ["coal", "nuclear-fuel"],
            },
            {
                Name: "Buildings",
                Items: ["wind-turbine", "coal-power", "nuclear-reactor"],
            },
            {
                Name: "Storage",
                Items: ["small-battery"],
            },
            {
                Name: "Research",
                Items: ["research-small-battery"],
            },
        ],
    },
    {
        Name: "Upgrades",
        SubSections: [
            {
                Name: "Upgrades",
                Items: [
                    "boost-lumberjack",
                    "boost-constructor",
                    "boost-miner-mk1",
                    "boost-chemical-plant",
                    "boost-adamantium-drill",
                    "boost-gas-extractor",
                    "boost-lumberjack-school",
                    "boost-oil-pump",
                    "boost-rock-crusher",
                    "boost-smelter-mk1",
                    "boost-smelter-mk2",
                    "boost-assembler",
                    "boost-water-pump",
                    "boost-centrifuge",
                    "boost-explorer",
                    "boost-greenhouse",
                    "boost-manufacturer",
                ],
            },
        ],
    },
    {
        Name: "Money",
        SubSections: [
            {
                Name: "Money",
                Items: ["money"],
            },
        ],
    },
    {
        Name: "Iron and Copper",
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
                    "research-metal",
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
        Name: "Basic Circuits",
        SubSections: [
            {
                Name: "Raw Materials",
                Items: ["water", "nitrogen", "oil", "sand"],
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
                Items: ["fertilizer", "seed"],
            },
            {
                Name: "Buildings",
                Items: [
                    "assembler",
                    "water-evaporator",
                    "water-filter",
                    "water-pump-mk1",
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
                    "research-basic-circuit",
                    "research-assembler",
                    "research-nitrogen",
                    "research-fluids",
                    "research-arbol",
                    "research-oil",
                    "research-explorer",
                    "research-science-3",
                ],
            },
        ],
    },
    {
        Name: "Advanced Circuitry",
        SubSections: [
            {
                Name: "Materials",
                Items: [
                    "gas",
                    "sulfur",
                    "sulfuric-acid",
                    "gold",
                    "gold-filament",
                    "advanced-circuit",
                ],
            },
            {
                Name: "Buildings",
                Items: ["manufacturer", "explorer"],
            },
            {
                Name: "Research",
                Items: [
                    "science3",
                    "research-advanced-circuitry",
                    "research-natural-gas",
                    "research-manufacturer",
                    "research-science-4",
                ],
            },
        ],
    },
    {
        Name: "Computing",
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

export default {
    sections,
};
