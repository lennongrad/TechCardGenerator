export interface AbilityData{
    name: string,
    reminder?: string,
    overrideReminder?: boolean
}

export interface CardData{
    abilities: Array<AbilityData>,
    text: string,
    name: string,
    imageURL: string,
    vp: string,
    pop: number,
    cash: number,
    trouble: number,
    hasPop: boolean,
    hasCash: boolean,
    hasTrouble: boolean,
    star: boolean,
    credits: string,
    type: string,
    textSizeModifier: number
}