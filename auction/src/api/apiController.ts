import {
    //  Body,
    Controller,
    //  Get,
    //  Path,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";
//import { initialiseSPS, createEnergyTokenStorage, injectEnergy, bidOnEnergy, utiliseEnergy, startAuction, executeAuction } from "./apiService"
import { EnergyInjection } from "../../../solana/energy-trading/target/types/energy_injection"
import * as anchor from '@project-serum/anchor';
import { AnchorError, Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

const provider = anchor.AnchorProvider.env()
anchor.setProvider(provider);
const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

@Route("api")
export class APIController extends Controller {

    curAuctionID: number = 0;
    smartPowerStoragePDA: any; // anchor.web3.PublicKey;

    private async getSPSPDA() {

        if (this.smartPowerStoragePDA != null) {
            return this.smartPowerStoragePDA;
        }

        [this.smartPowerStoragePDA] = await PublicKey
            .findProgramAddress(
                [
                    anchor.utils.bytes.utf8.encode("smartpowerstorage")
                ],
                program.programId
            );

        return this.smartPowerStoragePDA;
    }

    private errorResponse(e: any) {
        if (e instanceof AnchorError) {
            this.setStatus(400);
            return e.message;
        }

        this.setStatus(500);
        return "Something went wrong";
    }

    private keyPairFromPrivateKey(privateKey: String) {
        //const uint8PrivateKey = Uint8Array.from(privateKey.split("").map(x => x.charCodeAt()))
        //const uint8PrivateKey = Uint8Array.from(privateKey)
        return anchor.web3.Keypair.fromSecretKey(uint8PrivateKey);
    }

    private async findEnergyTokenPDA(publicKey: anchor.web3.PublicKey) {
        return PublicKey
            .findProgramAddress(
                [
                    anchor.utils.bytes.utf8.encode("energytokenstorage"),
                    publicKey.toBuffer()
                ],
                program.programId
            );
    }

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @SuccessResponse("201", "SPS successfully created")
    @Post("initSPS")
    public async initialiseSPS(): Promise<string> {

        this.getSPSPDA();

        try {
            program.methods.initSps().accounts({
                // TODO: Auctioneer skal betale for init
                initializer: provider.wallet.publicKey,
                smartPowerStorage: this.smartPowerStoragePDA
            });
        } catch (e) {
            return this.errorResponse(e);
        }

        this.setStatus(200);
        return "SPS intialised correctly";
    }

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    */
    @Post("createETS")
    public async createEnergyTokenStorage(
        @Query() privateKey: string,
    ): Promise<string> {

        const keyPair = this.keyPairFromPrivateKey(privateKey);
        const [energyTokenStoragePDA] = await this.findEnergyTokenPDA(keyPair.publicKey);

        try {
            let res = await program.methods
                .createEnergyTokenStorage()
                .accounts({
                    prosumer: keyPair.publicKey,
                    energyTokenStorage: energyTokenStoragePDA
                })
                .signers([keyPair])
                .rpc();

            return res;

        } catch (e) {
            return this.errorResponse(e);
        }
    }

    /**
    * Posts an injection of energy to the blockchain.
    * Supply public key of injecter and the amount of energy injected.
    * @param publicKey The public key of the injecting user
    * @param energySupply The amount of energy injected
    * @isInt we would kindly ask you to provide a number here
    */
    @Post("inject")
    public async injectEnergy(
        @Query() privateKey: string,
        @Query() energySupply: number
    ): Promise<string> {

        const keyPair = this.keyPairFromPrivateKey(privateKey);
        const [energyTokenStoragePDA] = await this.findEnergyTokenPDA(keyPair.publicKey);
        this.getSPSPDA();

        try {
            let res = program.methods.sendInjection(energySupply)
                .accounts({
                    prosumer: keyPair.publicKey,
                    smartPowerStorage: this.smartPowerStoragePDA,
                    energyTokenStorage: energyTokenStoragePDA
                })
                .signers([keyPair])
                .rpc();

            return res;
        } catch (e) {
            return this.errorResponse(e);
        }
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
