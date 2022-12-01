export interface User {
    publicKey: string;
}

export interface ProsumerInj extends User {
    energySupplyInWatts: number
}

export interface ConsumerBid extends User {
    demandInWatts: number
    price: number
}

export interface ConsumerUtil extends User {
    energyTokens: string[]
}
