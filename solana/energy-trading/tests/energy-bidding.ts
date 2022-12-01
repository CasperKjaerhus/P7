import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { assert, expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyBidding } from "../target/types/energy_bidding";

chai.use(chaiAsPromised);

describe('Energy bidding', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyBidding as Program<EnergyBidding>;
    const consumer = anchor.web3.Keypair.generate();
    
    const airdropSolToKey = async (key: PublicKey, amount: number) => {

        const sig = await program.provider.connection.requestAirdrop(key, amount * anchor.web3.LAMPORTS_PER_SOL);
        const blockhashLatest = await program.provider.connection.getLatestBlockhash();

        return program.provider.connection.confirmTransaction({
            blockhash: blockhashLatest.blockhash,
            lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
            signature: sig
        });
    }

    it('Send bid', async () => {
        const bid = anchor.web3.Keypair.generate();

        await airdropSolToKey(consumer.publicKey, 10);

        await program.methods
            .sendBid(10, 5)
            .accounts({
                bid: bid.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([bid, consumer])
            .rpc();
        
        const bidAccount = await program.account.bid.fetch(bid.publicKey);

        expect(bidAccount.energyDemand).to.equal(10);
        expect(bidAccount.bidValue).to.equal(5);
    });

});