import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../target/types/energy_market";
import { setupAirdropSolToKey, findBidPDA } from "./helpers"
chai.use(chaiAsPromised);

describe('Energy bidding', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
    const consumer = anchor.web3.Keypair.generate();
    
    const airdropSolToKey = setupAirdropSolToKey(program);

    it('Send bid', async () => {
        await airdropSolToKey(consumer.publicKey, 10);
        const [bid] = await findBidPDA(consumer.publicKey, 1, program.programId);

        await program.methods
            .sendBid(1, 10, 5, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();
        
        const bidAccount = await program.account.bid.fetch(bid);

        expect(bidAccount.energyDemand).to.equal(10);
        expect(bidAccount.bidValue).to.equal(5);
        expect(bidAccount.auctionId).to.equal(1);
    });

    it('Consumer executes sendBid and pays lamports to Bid account', async () => {
        const bidRentExemption = await provider.connection.getMinimumBalanceForRentExemption(program.account.bid.size)
        const [amount, price] = [10, 5]
        const [bid] = await findBidPDA(consumer.publicKey, 2, program.programId);

        await airdropSolToKey(consumer.publicKey, 100);

        let consumerBefore = await provider.connection.getBalance(consumer.publicKey);

        await program.methods
            .sendBid(2, amount, price, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();
        
        let consumerNow = await provider.connection.getBalance(consumer.publicKey);

        expect(consumerNow).to.equal(consumerBefore - bidRentExemption - amount*price, "Consumer should pay for the rent exemption and the cost of their demand");
    });
});
