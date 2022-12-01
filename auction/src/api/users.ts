export interface User {
    publicKey: string;
}

export interface ProsumerInj extends User {
    energySupply: number
}

export interface ConsumerBid extends User {
    demand: number
    price: number
}

export interface ConsumerUtil extends User {
    energyTokenStorage: string
}
