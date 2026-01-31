export interface AbilityData{
    name: string,
    reminder: string
}

export interface CardData{
    abilities: Array<AbilityData>,
    name: string,
    cost: string,
    imageURL: string,
    credits: string,
    type: string
}