import { ProsumerInj, ConsumerBid, ConsumerUtil, User } from "./users";
import * as anchor from "@project-serum/anchor";


export const initialiseSPS = () => {

    // Call and init SPS. Will only be called once, and should any other
    // occur they will be refused by the contract

}

export const createEnergyStorage: boolean = (user: User) => {
    // Before a user can inject energy

    return true;
}

export const injectEnergy: boolean = (prosumer: ProsumerInj) => {

    // Call contract and update token storage to reflect that

}

export const bidOnEnergy: boolean = (consumer: ConsumerBid) => {

    if (consumer.price <= 0)
        return "Invalid price, <= 0"
    if (consumer.demand <= 0)
        return "Invalid demand, <= 0";

    // Determine bid is valid. I.e. it is above the market price and they have the funds.
    // - Do it using an API for energy prices and the web3 lib

    // Call contract and get confirmation/rejection that bid was received
    // Return the confirmation/rejection to the buyer
}

export const utiliseEnergy: boolean = (consumer: ConsumerUtil) => {

    // Determine via web3 or the contract, that this is the rightful owner
    // Return confirmation/rejetion. Confirmation being burning of the tokens in the SPS
}

// Auction
export const startAuction = () => {

    // Should only be callable by internal clock (i.e. every 30-60 min)
    // Should set SPS to 0 and every energy token storage to 0 
    // Increment the current auction id

}

export const executeAuction = () => {

    // Auction skal kalde Energy Trading Contract, som så skal kalde transfer cash

}

