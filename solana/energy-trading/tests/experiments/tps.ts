import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
//import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../../target/types/energy_market";
import { findBidPDA, setupAirdropSolToKey } from "../helpers"
import { generateRandomInteger, createInstruction, delay, createProsumer } from "./helpers"
import { token } from "@project-serum/anchor/dist/cjs/utils";

//chai.use(chaiAsPromised);


describe('Experiments', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
    const airdropSolToKey = setupAirdropSolToKey(program);
    // PDA's are retrieved during before()
    let smartpowerstoragePDA: anchor.web3.PublicKey;
    let energytokenstoragePDAs: anchor.web3.PublicKey[] = [];

    let prosumers: {prosumer: anchor.web3.Keypair, tokenStorage: anchor.web3.PublicKey}[] = [];
    const consumer = anchor.web3.Keypair.generate();

    before(async () => {
        await airdropSolToKey(consumer.publicKey, 100);

        const prosumersCreationArray: Promise<{prosumer: anchor.web3.Keypair, tokenStorage: anchor.web3.PublicKey }>[]  = []
        for (let i = 0; i < 1255; i++){
            prosumersCreationArray.push(
                createProsumer(
                    program,
                    airdropSolToKey
                )
            );
        }

        console.time("Wait for prosumers to be created")
        prosumers = await Promise.all(prosumersCreationArray);
        console.timeEnd("Wait for prosumers to be created");
        [smartpowerstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );

    });

    const tpsToTest = [{
        tps: 120,
        duration: 60
    }];
    tpsToTest.forEach(({tps, duration}) => {
        it('TPS @: ' + tps, async () => {
            console.time(`TPS @: ${tps}`);
            // Do sendRate transactions/seconds for sendRate/10000 iterations 
            const totalTransaction = tps * duration;
            const startTransactionCount = await provider.connection.getTransactionCount();

            const start = Date.now();
            let prmz = [];
            console.time("Transaction Time")
            for(let i = 0; i < totalTransaction; i++){
                let luckyProsumer = generateRandomInteger(1255)-1;
                let prosumer = prosumers[luckyProsumer].prosumer;

                prmz.push(
                    program.methods
                        .sendInjection(generateRandomInteger(30))
                        .accounts({
                            prosumer: prosumer.publicKey,
                            smartPowerStorage: smartpowerstoragePDA,
                            energyTokenStorage: prosumers[luckyProsumer].tokenStorage,
                        })
                        .signers([prosumer])
                        .rpc()
                ); 
            }
            let transactions = await Promise.all(prmz);

            console.timeEnd("Transaction Time");

            const endTransactionCount = await provider.connection.getTransactionCount();
            console.log(endTransactionCount - startTransactionCount);
            let totalTime = Date.now() - start;
            const expectedTime = duration * 1000;
            expect(totalTime).to.be.lessThan(expectedTime + 1000);

            let confirmations = []
            for(let transaction of transactions){
                const blockhashLatest = await program.provider.connection.getLatestBlockhash();
    
                confirmations.push(program.provider.connection.confirmTransaction({
                    blockhash: blockhashLatest.blockhash,
                    lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
                    signature: transaction
                }));
            }

            await Promise.all(confirmations);
            totalTime = Date.now() - start;
            console.timeEnd(`TPS @: ${tps}`);
            console.log(`${totalTransaction} in ${totalTime / 1000}: ${totalTransaction / (totalTime / 1000)}`)
        })
    })

    const tpsToTest = [{
        tps: 25,
        duration: 20
    }];
    tpsToTest.forEach(({tps, duration}) => {
        it('TPS-Scheduled @: ' + tps, async () => {
            console.time(`TPS @: ${tps}`);
            const totalTransaction = tps * duration;
            const startTransactionCount = await provider.connection.getTransactionCount();

            const start = Date.now();
            let prmz = [];
            console.time("Transaction Time")
            for(let i = 0; i < totalTransaction; i++){
                let luckyProsumer = generateRandomInteger(1255)-1;
                let prosumer = prosumers[luckyProsumer].prosumer;

                prmz.push(
                    program.methods
                        .sendInjection(generateRandomInteger(30))
                        .accounts({
                            prosumer: prosumer.publicKey,
                            smartPowerStorage: smartpowerstoragePDA,
                            energyTokenStorage: prosumers[luckyProsumer].tokenStorage,
                        })
                        .signers([prosumer])
                        .rpc()
                ); 
            }

            let transactions = await Promise.all(prmz);

            console.timeEnd("Transaction Time");  

            let schedule = [];
            for (transaction of transactions) {
                schedule.push({transaction, tick: generateRandomInteger(duration*1000)});
            }
            schedule.sort((a, b) => a.tick - b.tick);

            let tick = 0;
            const tickrate = 10;
            while (tick <= duration) {
                tick += tickrate;
                while (schedule[0].tick <= tick) {
                  transaction = schedule.shift();
                  transaction.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
                  transaction.feePayer = prosumer.publicKey;
                  anchor.web3.sendAndConfirmTransaction(provider.connection, transaction, [prosumer]);
                }
            }
        )}
    )}

    after(async () => {
        await program.methods.resetSmartPowerStorage().accounts({
            initializer: prosumers[0].prosumer.publicKey,
            smartPowerStorage: smartpowerstoragePDA
        })
        .signers([prosumers[0].prosumer])
        .rpc();
    })
});

