import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Connection, PublicKey } from '@solana/web3.js';
import { assert, expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyBidding } from "../target/types/energy_bidding";
import { EnergyMarket } from "../target/types/energy_market";

chai.use(chaiAsPromised);

describe('Energy bidding', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyBidding as Program<EnergyMarket>;
    const consumer = anchor.web3.Keypair.generate();
    const bid = anchor.web3.Keypair.generate();
    
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
        await airdropSolToKey(consumer.publicKey, 10);

        await program.methods
            .sendBid(10, 5, 1)
            .accounts({
                bid: bid.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([bid, consumer])
            .rpc();
        
        const bidAccount = await program.account.bid.fetch(bid.publicKey);

        expect(bidAccount.energyDemand).to.equal(10);
        expect(bidAccount.bidValue).to.equal(5);
        expect(bidAccount.auctionId).to.equal(1);
    });

    it('Consumer executes sendBid and pays lamports to Bid account', async () => {
        const transactionFee = 1044000;
        const bid = anchor.web3.Keypair.generate();

        await airdropSolToKey(consumer.publicKey, 100);

        let consumerBefore = await provider.connection.getBalance(consumer.publicKey);

        await program.methods
            .sendBid(10, 5, 1)
            .accounts({
                bid: bid.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([bid, consumer])
            .rpc();
        
        let consumerNow = await provider.connection.getBalance(consumer.publicKey);
        let consumerAfter = consumerBefore - (10*5) - transactionFee;

        expect(consumerNow).to.equal(consumerAfter);
    });

    it('Release cash to target user', async () => {
        const target = anchor.web3.Keypair.generate();

        await airdropSolToKey(bid.publicKey, 100);

        await program.methods
            .releaseCash(5,1)
            .accounts({
                bidAccount: bid.publicKey,
                target: target.publicKey,
            })
            .signers([target, bid])
            .rpc();
    });

});