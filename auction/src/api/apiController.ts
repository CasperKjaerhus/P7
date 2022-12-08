import {
    //  Body,
    Controller,
    //  Get,
    //  Path,
    Post,
    Query,
    Route,
    //  SuccessResponse,
} from "tsoa";
import { initialiseSPS, createEnergyTokenStorage, injectEnergy, bidOnEnergy, utiliseEnergy, startAuction, executeAuction } from "./apiService"
import * from "../../../solana/energy-trading/target/types/"


@Route("api")
export class APIController extends Controller {

    curAuctionID: number = 0;

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @Post("initSPS")
    public async initialiseSPS(): Promise<string> {

    }

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @Post("createETS")
    public async createEnergyTokenStorage(
        @Query() publicKey: string,
    ): Promise<string> {

    }

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @Post("inject")
    public async injectEnergy(
        @Query() publicKey: string,
        @Query() energySupply: number
    ): Promise<string> {

    }

    /**
    * Posts a bid to the blockchain.
    * Supply public key of bidder, the energy demand, and the bid price
    * @param publicKey The public key of the bidding user
    * @param demand The energy demand of the user
    * @param price The bid price of the user
    */
    @Post("bid")
    public async bidOnEnergy(
        @Query() publicKey: string,
        @Query() demand: number,
        @Query() price: number
    ): Promise<string> {



    }

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    @Post("util")
    public async utiliseEnergy(
        @Query() publicKey: string,
        @Query() energyTokenStorage: string
    ): Promise<string> {



    }

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    @Post("startAuction")
    public async startAuction(): Promise<void> {

        startAuction();
    }

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    @Post("executeAuction")
    public async executeAuction(): Promise<void> {

        executeAuction();
    }
}
