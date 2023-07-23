import { keys } from "../smap";
import { Items } from "./itemNames";
import Recipes from "./recipeValues";

const hideOnBuy: Items[] = [
    ...keys(Recipes.recipes).filter((x) => x.startsWith("research-")),
    "begin",
];

export default {
    hideOnBuy,
};
