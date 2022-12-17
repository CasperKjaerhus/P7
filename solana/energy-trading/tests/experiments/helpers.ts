import * as anchor from "@project-serum/anchor"
import { AnchorError, Program } from "@project-serum/anchor";
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

export const delay = (ms) => new Promise(r => setTimeout(r, ms));

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


export const sendTransaction = async (transaction: anchor.web3.Transaction, signer: anchor.web3.Keypair, connection: anchor.web3.Connection, failedAlready?: boolean): Promise<string> => {
    const latestBlockhash = await connection.getLatestBlockhash();

    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    transaction.recentBlockhash = latestBlockhash.blockhash;
    // Create a versioned Transaction out of the transaction
    const versionedTransaction = new anchor.web3.VersionedTransaction(transaction.compileMessage())
    versionedTransaction.sign([signer]);
    // 
    try {
        const tx = await connection.sendTransaction(versionedTransaction, {
            maxRetries: 5,
            preflightCommitment: "finalized",
            skipPreflight: true,
        });

        if(failedAlready)
            console.log("Previously failed transaction has been sent");

        return tx;

    }catch(e) {

        if(e instanceof anchor.web3.SendTransactionError){
            if(e.message.includes("Blockhash")){
                console.log("Transaction Failed: " + e.message + " Trying again...")
            }

            if(failedAlready){
                console.log("it just wont work :(")
                return undefined;
            }
                
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            return sendTransaction(transaction, signer, connection, true);
        }
    }
}

export const confirmTransaction = async (transaction: string, connection: anchor.web3.Connection, failedAlready?: boolean): Promise<anchor.web3.RpcResponseAndContext<anchor.web3.SignatureResult>> => {
    const blockhashLatest = await connection.getLatestBlockhash();
    try {
        return await connection.confirmTransaction({
            blockhash: blockhashLatest.blockhash,
            lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
            signature: transaction
        });
    }catch(e){
        console.log("Confirmation failed: " + e);
        return undefined;
    }

} 