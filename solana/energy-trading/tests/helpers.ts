import * as anchor from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { Program } from "@project-serum/anchor";
import { EnergyMarket } from "../target/types/energy_market";

export const setupAirdropSolToKey = (program: Program<EnergyMarket>) => {
    return async (key: PublicKey, amount: number) => {

        const sig = await program.provider.connection.requestAirdrop(key, amount * anchor.web3.LAMPORTS_PER_SOL);
        const blockhashLatest = await program.provider.connection.getLatestBlockhash();
    
        return program.provider.connection.confirmTransaction({
            blockhash: blockhashLatest.blockhash,
            lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
            signature: sig
        });
    }
}