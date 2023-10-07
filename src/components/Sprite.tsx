import React from "react";
import { useImages } from "../useImages";
import { Items } from "../content/itemNames";
import "./Sprite.scss";

interface Props {
    name: Items;
}

export function Sprite({ name: spriteName }: Props) {
    let name: string = spriteName;

    if (spriteName.startsWith("research-")) {
        name = "research";
    } else if (spriteName.startsWith("boost-")) {
        name = "boost";
    }

    const spriteContents = useImages()[name];

    return <img className={"sprite"} src={spriteContents} />;
}
