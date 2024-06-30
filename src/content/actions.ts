import Decimal from "decimal.js";
import { Items } from "./itemNames";

type ACTION<T extends string> = {
    action: T;
}


type ACTION_UNHIDE_ITEM = ACTION<"unhide-item"> & {
    itemName: Items;
};

type ACTION_HIDE_ITEM = ACTION<"hide-item"> & {
    itemName: Items;
};

type ACTION_ADD_BUILDING = ACTION<"add-building"> & {
    recipe: Items;
    building: Items;
    amount: Decimal;
}

type ACTION_REMOVE_BUILDING = ACTION<"remove-building"> & {
    recipe: Items;
    building: Items;
    amount: Decimal;
}

type ACTION_CRAFT_BYHAND = ACTION<"craft-byhand"> & {
    recipe: Items;
    amount: Decimal;
}

type ACTION_ADD_BOX = ACTION<"add-box"> & {
    recipe: Items;
    box: Items;
    amount: Decimal;
}

type ACTION_ACKNOWLEDGE_RECIPE = ACTION<'ack'> & {
    recipe: Items;
}

type ACTION_DISABLE_RECIPE = ACTION<'disable-recipe'> & {
    recipe: Items;
}

type ACTION_ENABLE_RECIPE = ACTION<'enable-recipe'> & {
    recipe: Items;
}

type ACTION_RESET_GAME = ACTION<'reset-game'> & {};

type ACTION_SET_AMOUNT = ACTION<'set-amount'> & {
    item: Items;
    amount: number | Decimal | string;
}

type ACTION_ADD_AMOUNT = ACTION<'add-amount'> & {
    item: Items;
    amount: number | Decimal | string;
}

type ACTION_HIDE_BUILDING_ADD_BUTTON = ACTION<'hide-building-add-button'> & {
    building: Items;
}

type ACTION_UNHIDE_BUILDING_ADD_BUTTON = ACTION<'unhide-building-add-button'> & {
    building: Items;
}

export type ACTIONS =
    | ACTION_DISABLE_RECIPE
    | ACTION_ENABLE_RECIPE
    | ACTION_ACKNOWLEDGE_RECIPE
    | ACTION_ADD_BOX
    | ACTION_ADD_BUILDING
    | ACTION_CRAFT_BYHAND
    | ACTION_HIDE_ITEM
    | ACTION_REMOVE_BUILDING
    | ACTION_UNHIDE_ITEM
    | ACTION_RESET_GAME
    | ACTION_SET_AMOUNT
    | ACTION_ADD_AMOUNT
    | ACTION_HIDE_BUILDING_ADD_BUTTON
    | ACTION_UNHIDE_BUILDING_ADD_BUTTON
    ;

export type dispatch = (action: ACTIONS) => void;