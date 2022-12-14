import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../target/types/energy_market";
import { findBidPDA } from "../tests/helpers"
import { sendTransactions } from "./helpers"
chai.use(chaiAsPromised);


describe('Experiments', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
    
    // PDA's are retrieved during before()
    let smartpowerstoragePDA: anchor.web3.PublicKey;
    let energytokenstoragePDA: anchor.web3.PublicKey;

    const prosumer = anchor.web3.Keypair.generate();
    const consumer = anchor.web3.Keypair.generate();
    await airdropSolToKey(consumer.publicKey, 100);
    await airdropSolToKey(prosumer.publicKey, 100);
    
    const [bid] = await findBidPDA(consumer.publicKey, 1, program.programId);
    const airdropSolToKey = setupAirdropSolToKey(program);

    before(async () => {
        [smartpowerstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );

        [energytokenstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer.publicKey.toBuffer()
            ],
            program.programId
        );
    });

    const sendRates = Array.range(10, 100, 10);
    sendRates.forEach(sendRate => {
        it('TPS @sendRate: ' + data, async () => {
            // Do sendRate transactions/seconds for sendRate/10000 iterations 
            const iterations = sendRate/10000;
            
            const start = Date.now(); 
            for (i = 0; i < iterations; i++) {
                sendTransactions(sendRate, [bid, smartpowerstoragePDA, energytokenstoragePDA], [consumer, prosumer]);
            }
            const totalTime = Date.now() - start;

            const expectedTime = 10000/sendRate;
            expect(totalTime).to.be.lt(expectedTime);
            // Arrange: Create batch of sendRate random Transactions 
            // TODO: Actually random transactions 
            

            // TODO - Act: Send each transaction at random delay/interleaving
            

            // TODO - Assert: Assert transactions were send within sendRate/10000 sec ?!
            // End time right after last send transaction 
        
        })
    })
});


