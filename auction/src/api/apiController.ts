import {
    Controller,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";
//import { EnergyInjection } from "../../../solana/energy-trading/target/types/energy_injection"
import idl from '../../../solana/energy-trading/target/idl/energy_injection.json'
import * as anchor from '@project-serum/anchor';
import { Provider, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import * as web3 from '@solana/web3.js';
import { useAnchorWallet } from 'solana-wallets-vue';

//import { Auction } from '../auction'

const clusterUrl = ""
const preflightCommitment = 'processed'
const commitment = 'processed'
const programID = new PublicKey(idl.metadata.address);

//const provider = anchor.AnchorProvider.env()
//anchor.setProvider(provider);
// For development ig...
//const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

const wallet = useAnchorWallet();
const connection = new Connection(clusterUrl, commitment);
const provider = new Provider(connection, wallet.value, { preflightCommitment, commitment });
const program = new Program(idl, programID, provider);
//const programId = new PublicKey(web3.PublicKey);

@Route("api")
export class APIController extends Controller {

    curAuctionID: number = 0;
    smartPowerStoragePDA: any; // anchor.web3.PublicKey;
    //TODO: Auction skal ikke tage contructor param
    // auction: Auction = new Auction();
    connection: any;

    private async getConnection() {
        if (this.connection != null) {
            return this.connection
        }

        this.connection = new web3.Connection(web3.clusterApiUrl("testnet"));
        return this.connection;
    }

    private async getSPSPDA() {
        if (this.smartPowerStoragePDA != null) {
            return this.smartPowerStoragePDA;
        }

        [this.smartPowerStoragePDA] = await PublicKey
            .findProgramAddress(
                [
                    //this.toUint8Array("smartpowerstorage")
                    anchor.utils.bytes.utf8.encode("smartpowerstorage")
                ],
                program.programId
                //programId
            );

        return this.smartPowerStoragePDA;
    }

    private errorResponse(e: any) {
        //if (e instanceof AnchorError) {
        this.setStatus(400);
        return e.message;
        //}

        //this.setStatus(500);
        //return "Something went wrong";
    }

    private keyPairFromPrivateKey(privateKey: String) {
        const uint8PrivateKey = this.toUint8Array(privateKey);
        //const uint8PrivateKey = Uint8Array.from(Array.from(privateKey).map(letter => letter.charCodeAt(0)));
        return web3.Keypair.fromSecretKey(uint8PrivateKey);
    }

    private toUint8Array(input: String) {
        return Uint8Array.from(Array.from(input).map(letter => letter.charCodeAt(0)));
    }

    private async findEnergyTokenPDA(publicKey: web3.PublicKey) {
        return PublicKey
            .findProgramAddress(
                [
                    anchor.utils.bytes.utf8.encode("energytokenstorage"),
                    //this.toUint8Array("energytokenstorage"),
                    publicKey.toBuffer()
                ],
                program.programId
                //programId
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
        this.getConnection();

        try {
            program.methods.initSps().accounts({
                // TODO: Auctioneer skal betale for init, noget omkring provider skal auctioneer så local keys
                //initializer: provider.wallet.publicKey,
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
    /*    @Post("bid")
        public async bidOnEnergy(
            @Query() privateKey: string,
            @Query() demand: number,
            @Query() price: number
        ): Promise<string> {
    
    
    if (consumer.price <= 0)
        return "Invalid price, <= 0"
    if (consumer.demand <= 0)
        return "Invalid demand, <= 0";



            const keyPair = this.keyPairFromPrivateKey(privateKey);
    
            try {
                let res = program.methods.sendBid(demand, price)
                    .accounts({
                        consumer: keyPair.publicKey,
                    })
                    .signers([keyPair])
                    .rpc();
                return res;
    
            } catch (e) {
                return this.errorResponse(e);
            }
        }*/

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    /*   @Post("util")
       public async utiliseEnergy(
           @Query() privateKey: string,
           @Query() energyTokenStorage: string
       ): Promise<string> {
   
           const keyPair = this.keyPairFromPrivateKey(privateKey);
           const [energyTokenStoragePDA] = await this.findEnergyTokenPDA(keyPair.publicKey);
   
           try {
               let res = program.methods.utilizeEnergy()
                   .accounts({
                       consumer: keyPair.publicKey,
                       energyTokenStorage: energyTokenStoragePDA
                   })
                   .signers([keyPair])
                   .rpc();
               return res;
   
           } catch (e) {
               return this.errorResponse(e);
           }
       }*/

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    /*  @Post("startAuction")
      public async startAuction(): Promise<void> {
  
          this.curAuctionID++;
          //TODO: resetSPSandETS();
      }*/

    /**
    * Posts a utilisation to the blockchain.
    * Supply public key of utilising user and PDA to the energy token storage
    * @param publicKey The public key of the utilising user
    * @param energyTokenStorage The PDA key of the users energy token storage
    */
    /*   @Post("executeAuction")
       public async executeAuction(): Promise<void> {
   
   
   
   
           executeAuction();
       }*/
}
