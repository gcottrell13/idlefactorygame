import { SMap } from "./smap";

function importAll(r: __WebpackModuleApi.RequireContext) {
    let images: SMap<string> = {};
    r.keys().map((item, index) => {
        images[item.replace("./", "").replace(".png", "")] = r(item).default;
    });
    return images;
}

const SPRITES = importAll(
    require.context("./sprites", false, /\.(png|jpe?g|svg)$/),
);

export function useImages(): SMap<string> {
    return SPRITES;
}
