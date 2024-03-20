import React from "react";
import { useImages } from "../useImages";
import { Items } from "../content/itemNames";
import "./Sprite.scss";
import { formatNumber, parseFormat } from "../numberFormatter";
import Big from "../bigmath";

interface Props {
    name: Items;
    amount?: Big | string;
}

export function Sprite({ name: spriteName, amount }: Props) {
    let name: string = spriteName;

    if (spriteName.startsWith("research-")) {
        name = "research";
    } else if (spriteName.startsWith("boost-")) {
        name = "boost";
    }
    else if (spriteName.startsWith('redeem-mc--')) {
        name = spriteName.replace('redeem-mc--', '');
    }

    const spriteContents = useImages()[name];
    const alt = spriteContents ? name : undefined;

    const image = <img alt={alt} className={"sprite"} src={spriteContents} />;

    if (amount !== undefined) {
        amount = parseFormat(amount);
        return <span>{formatNumber(amount)}{image}</span>;
    }
    return image;
}
