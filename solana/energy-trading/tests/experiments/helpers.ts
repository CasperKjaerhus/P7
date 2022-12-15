import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { EnergyMarket } from "../../target/types/energy_market";
import { findBidPDA, setupAirdropSolToKey } from "../helpers"

type accountObject = {
  consumer: anchor.web3.Keypair,
  prosumer: anchor.web3.Keypair,
  bid: anchor.web3.PublicKey,
  sps: anchor.web3.PublicKey,
  ets: anchor.web3.PublicKey,
}

export function delay(ms, func): Promise<anchor.web3.TransactionSignature> {
    return new Promise(resolve => setTimeout(() => {
        resolve(func());
    }, ms));
}

export function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}

export async function createInstruction(instructionNumber: number, {consumer, prosumer, sps, ets, bid}: accountObject, program: Program<EnergyMarket>) {
    switch (instructionNumber) {
        case 1:
            return { 
                transaction: 
                    await program.methods
                        .sendBid(1, 10, 5, 1)
                        .accounts({
                            bid: bid,
                            consumer: consumer.publicKey,
                        })
                        .signers([consumer])
                        .rpc(), 
                instructionNumber
            };
        case 2:
            return {
                transaction: 
                    await program.methods
                        .sendInjection(10)
                        .accounts({
                            prosumer: prosumer.publicKey,
                            smartPowerStorage: sps,
                            energyTokenStorage: ets,
                        })
                        .signers([prosumer])
                        .rpc(), 
                instructionNumber
            };
        default:
            break;
    }
}

export const createProsumer = async (program, airdropSolToKey): Promise<{ prosumer: anchor.web3.Keypair; tokenStorage: anchor.web3.PublicKey; }> => {
    const prosumer = anchor.web3.Keypair.generate();
    await airdropSolToKey(prosumer.publicKey, 100);

    const [tokenStorage] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer.publicKey.toBuffer()
            ],
            program.programId
        );

    await program.methods
        .createEnergyTokenStorage()
        .accounts({
            prosumer: prosumer.publicKey,
            energyTokenStorage: tokenStorage
        })
        .signers([prosumer])
        .rpc();

    return {prosumer, tokenStorage};
}
