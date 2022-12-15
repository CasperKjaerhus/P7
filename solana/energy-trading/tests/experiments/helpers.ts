import * as anchor from "@project-seruem/anchor"
import { EnergyMarket } from "../../target/types/energy_market";
import { Program } from "@project-serum/anchor";

type accountObject = {
  consumer: anchor.web3.Keypair,
  prosumer: anchor.web3.Keypair,
  bid: anchor.web3.PublicKey,
  sps: anchor.web3.PublicKey,
  ets: anchor.web3.PublicKey,
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}

export async function sendTransactions(noTransactions: number, accounts: accountObject, program: Program<EnergyMarket>) {
    let delayInterval = 10000/(noTransactions);
    let time = 0;
    let randomInstruction;
    let randomDelay;

    for (let i = 0; i < noTransactions; i++) {
        randomDelay = generateRandomInteger(delayInterval);
        randomInstruction = generateRandomInteger(2);
        await delay(randomDelay); 
        await executeInstruction(randomInstruction, accounts, program);
        time += (randomDelay);
    }
    delay(1000 - time).then(() => {  });
}

function executeInstruction(instructionNumber: number, {consumer, prosumer, sps, ets, bid}: accountObject, program: Program<EnergyMarket>) {
    switch (instructionNumber) {
        case 0:
            return program.methods
                .sendBid(1, 10, 5, 1)
                .accounts({
                    bid: bid,
                    consumer: consumer.publicKey,
                })
                .signers([consumer])
                .rpc();
            break;
        case 1:
            return program.methods
                .sendInjection(10)
                .accounts({
                    prosumer: prosumer.publicKey,
                    smartPowerStorage: sps,
                    energyTokenStorage: ets,
                })
                .signers([prosumer])
                .rpc();
        default:
            break;
    }
}
