import { Ingredient } from "./ingredient";
export interface Recipe {
    GSI1PK: string
    PK: string;
    SK: string;
    name: string;
    description: string;
    ingredients: Ingredient[];
    methods: string[];
    cover: string;
}
