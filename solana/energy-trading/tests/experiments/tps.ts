import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
//import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../../target/types/energy_market";
import { findBidPDA, setupAirdropSolToKey } from "../helpers"
import { generateRandomInteger, sendTransaction, createInstruction, delay, createProsumer, confirmTransaction } from "./helpers"
import { token } from "@project-serum/anchor/dist/cjs/utils";

//chai.use(chaiAsPromised);

/*
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
        console.log("hat")
        const prosumersCreationArray: Promise<{prosumer: anchor.web3.Keypair, tokenStorage: anchor.web3.PublicKey }>[]  = []
        for (let i = 0; i < 2500; i++){
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

    let tpsToTest = [];
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
                let luckyProsumer = generateRandomInteger(750)-1;
                let prosumer = prosumers[luckyProsumer].prosumer;

                prmz.push(
                    program.methods
                        .sendInjection(generateRandomInteger(1000))
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

            let confirmations = []
            for (let transaction of transactions) {
                const blockhashLatest = await program.provider.connection.getLatestBlockhash();
    
                confirmations.push(program.provider.connection.confirmTransaction({
                    blockhash: blockhashLatest.blockhash,
                    lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
                    signature: transaction
                }));
            }

            await Promise.all(confirmations);
            const totalTimeEnd = Date.now() - start;
            console.timeEnd(`TPS @: ${tps}`);
            console.log(`${totalTransaction} in ${totalTime / 1000}: ${totalTransaction / (totalTimeEnd / 1000)} TPS`)
            expect(totalTime).to.be.lessThan(expectedTime + 1000);
        })
    })

    tpsToTest = [{
        tps: 120,
        duration: 120
    }];
    tpsToTest.forEach(({tps, duration}) => {
        it('TPS-Scheduled @: ' + tps, async () => {
            console.time(`TPS @: ${tps}`);
            const totalTransaction = tps * duration;

            const startTime = Date.now();
            const prmz: {transaction: Promise<anchor.web3.Transaction>, prosumer: anchor.web3.Keypair}[] = [];
            console.time("Transaction Creation Time")
            for(let i = 0; i < totalTransaction; i++){
                let luckyProsumer = generateRandomInteger(prosumers.length)-1;
                let prosumer = prosumers[luckyProsumer].prosumer;

                prmz.push(
                    {
                        transaction: program.methods
                            .sendInjection(generateRandomInteger(i))
                            .accounts({
                                prosumer: prosumer.publicKey,
                                smartPowerStorage: smartpowerstoragePDA,
                                energyTokenStorage: prosumers[luckyProsumer].tokenStorage,  
                            })
                            .signers([prosumer])
                            .transaction(),
                            prosumer: prosumer
                    }
                ); 
            }

            let transactions: {transaction: anchor.web3.Transaction, prosumer: anchor.web3.Keypair}[] = [];

            transactions = await Promise.all(prmz.map(async (v) => {
                return {transaction: await v.transaction, prosumer: v.prosumer}
            }));

            console.timeEnd("Transaction Creation Time");  
            console.time("Transaction Scheduling");

            let schedules: {transaction: anchor.web3.Transaction, tick: number, prosumer: anchor.web3.Keypair}[] = [];
            let blockhashLatest = await program.provider.connection.getLatestBlockhash();
            for (const transaction of transactions) {
                transaction.transaction.recentBlockhash = blockhashLatest.blockhash;
                schedules.push({transaction: transaction.transaction, tick: generateRandomInteger(duration*1000), prosumer: transaction.prosumer});
            }
            schedules.sort((a, b) => a.tick - b.tick);

            console.timeEnd("Transaction Scheduling");
            console.time("Send it!");
            const startTransactionCount = await provider.connection.getTransactionCount();
            const transIds: Promise<string>[] = []
            let tick = 0;
            const tickrate = 100;
            console.table(schedules);
            while (tick <= duration * 1000) {
                tick += tickrate;
                while (schedules[0] != undefined && schedules[0].tick <= tick) {
                    const schedule = schedules.shift();
                    schedule.transaction.feePayer = schedule.prosumer.publicKey;
                    transIds.push(sendTransaction(schedule.transaction, schedule.prosumer, provider.connection));
                }
                await delay(tickrate);
            }

            const transIdsAwaited = await Promise.all(transIds);
            const endTransactionCount = await provider.connection.getTransactionCount();
            console.timeEnd("Send it!");
            let totalTime = Date.now() - startTime;
            console.log(`${endTransactionCount - startTransactionCount} in ${totalTime / 1000}s @ send-time: ${(endTransactionCount - startTransactionCount) / (totalTime / 1000)} TPS`);
            console.time("Confirm em!");

            let confirmations: Promise<anchor.web3.RpcResponseAndContext<anchor.web3.SignatureResult>>[] = []
            for (let transaction of transIdsAwaited) {
                confirmations.push(confirmTransaction(transaction, provider.connection));
            }
            await Promise.all(confirmations);

            totalTime = Date.now() - startTime;

            console.timeEnd("Confirm em!");

            console.log(`${totalTransaction} in ${totalTime / 1000}s: ${totalTransaction / (totalTime / 1000)} TPS`);
            console.log(`${endTransactionCount - startTransactionCount} in ${totalTime / 1000}s @ confirm-time: ${(endTransactionCount - startTransactionCount) / (totalTime / 1000)} TPS`);
        });
    });

    after(async () => {
        await program.methods.resetSmartPowerStorage().accounts({
            initializer: prosumers[0].prosumer.publicKey,
            smartPowerStorage: smartpowerstoragePDA
        })
        .signers([prosumers[0].prosumer])
        .rpc();
    })
});
*/