
type Recipe = {
    [p in Items]?: number;
}

type Recipes = {
    [p in Items]: Recipe;
}

export type Items = 
    'iron-bar'
    | 'iron-ore'
    | 'assembler'
    ;

export const recipes: Recipes = {
    'iron-bar': {
        'iron-ore': 1,
    },
    'iron-ore': {},
    'assembler': {},
};

type SMap<T extends string, K> = {[p in T]: K};

export const assemblersPerRecipe: Partial<SMap<Items, number>> = {
    'iron-ore': 10,
};

export const amountThatWeHave: Partial<SMap<Items, number>> = {};