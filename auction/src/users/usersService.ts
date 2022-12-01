import { ProsumerInj, ConsumerBid, ConsumerUtil } from "./user";

export class APIService {
    public injectEnergy(prosumer: ProsumerInj) {

        // Call contract and get keys for Energy tokens in SPS

        // Return the tokens to the calling prosumer

        return prosumer.publicKey;
    }

    public bidOnEnergy(consumer: ConsumerBid) {

        // Determine bid is valid. I.e. it is above the market price and they have the funds.
        // - Do it using an API for energy prices and the web3 lib

        // Call contract and get confirmation/rejection that bid was received
        // Return the confirmation/rejection to the buyer

        return consumer.publicKey;
    }

    public utiliseEnergy(consumer: ConsumerUtil) {

        // Determine via web3 or the contract, that this is the rightful owner
        // Return confirmation/rejetion. Confirmation being burning of the tokens in the SPS

        return consumer.publicKey;
    }
}
