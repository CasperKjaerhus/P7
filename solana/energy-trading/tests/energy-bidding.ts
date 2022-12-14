import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../target/types/energy_market";
import { setupAirdropSolToKey } from "./helpers"
chai.use(chaiAsPromised);

describe('Energy bidding', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
    const consumer = anchor.web3.Keypair.generate();
    
    const airdropSolToKey = setupAirdropSolToKey(program);

    it('Send bid', async () => {
        await airdropSolToKey(consumer.publicKey, 10);
        const [bid] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("bid"),
                consumer.publicKey.toBuffer(),
                new anchor.BN(1).toBuffer(),
            ],
            program.programId
        );

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
        const [bid] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("bid"),
                consumer.publicKey.toBuffer(),
                new anchor.BN(2).toBuffer(),
            ],
            program.programId
        );

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

    it('Release cash to target user', async () => {
        const target = anchor.web3.Keypair.generate();
        await airdropSolToKey(target.publicKey, 100); // We need to airdrop to keep the account rent-exempt, otherwise no money can be sent to or from it.

        const [bid] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("bid"),
                consumer.publicKey.toBuffer(),
                new anchor.BN(3).toBuffer(),
            ],
            program.programId
        );

        const getBalances = async () => { // Quick and dirty helper function to get all balances.
            return Promise.all([
                provider.connection.getBalance(consumer.publicKey), 
                provider.connection.getBalance(target.publicKey),
                provider.connection.getBalance(bid),
            ]);
        }


        const [consumerBefore, targetBefore] = await getBalances(); // Before balances
        const [amount, price] = [10, 5]

        const txnSendBid = await program.methods
            .sendBid(3, amount, price, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .transaction();
        
        txnSendBid.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        txnSendBid.feePayer = consumer.publicKey;
        const transFeeSendBid = await txnSendBid.getEstimatedFee(provider.connection);
        
        await anchor.web3.sendAndConfirmTransaction(provider.connection, txnSendBid, [consumer]);

        const [, , bidInterim] = await getBalances(); // Before balances
        
        // Check that bid exactly rent exempt and have enough for energy payment.
        const rentExemption = await provider.connection.getMinimumBalanceForRentExemption(program.account.bid.size)
        expect(bidInterim).to.be.equal(rentExemption + amount*price, "Bid should have SOL for rent exemption + energy payment");

        // Release Sol to target
        const txnReleaseCash = await program.methods
            .executeTrade(amount, price)
            .accounts({
                bidAccount: bid,
                prosumer: target.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .transaction();
        
        txnReleaseCash.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        txnReleaseCash.feePayer = consumer.publicKey;
        const transFeeReleaseCash = await txnReleaseCash.getEstimatedFee(provider.connection);
        
        await anchor.web3.sendAndConfirmTransaction(provider.connection, txnReleaseCash, [consumer]);

        const [consumerAfter, targetAfter, bidAfter] = await getBalances(); // Before balances

        // Check that the caller only gets withdrawn the transaction fees
        expect(consumerBefore - consumerAfter).to.be.equal(transFeeReleaseCash + transFeeSendBid + amount*price, "Consumer should only pay exactly the transaction fee + price for energy");

        // Check that money is recieved on target
        expect(targetAfter - targetBefore).to.be.equal(amount*price, "Money should be recieved on target");

        // Check that money is spent on bid
        expect(bidAfter).to.be.equal(0, "Money should be spent on bid");
    });

    it("Do not close bid account if demand not met", async () => {
        const bidRentExemption = await provider.connection.getMinimumBalanceForRentExemption(program.account.bid.size)
        const target = anchor.web3.Keypair.generate();
        const auctioneer = anchor.web3.Keypair.generate();

        await airdropSolToKey(target.publicKey, 100); // We need to airdrop to keep the account rent-exempt, otherwise no money can be sent to or from it.
        await airdropSolToKey(auctioneer.publicKey, 100);
        const [bid] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("bid"),
                consumer.publicKey.toBuffer(),
                new anchor.BN(4).toBuffer(),
            ],
            program.programId
        );
        const [amount, price] = [10, 5]

        await program.methods
            .sendBid(4, amount, price, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();

        const bidBalanceBefore = await provider.connection.getBalance(bid);

        let txnReleaseCash = await program.methods
            .executeTrade(amount-1, price)
            .accounts({
                bidAccount: bid,
                prosumer: target.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([])
            .transaction();

        txnReleaseCash.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        txnReleaseCash.feePayer = auctioneer.publicKey;

        await anchor.web3.sendAndConfirmTransaction(provider.connection, txnReleaseCash, [auctioneer]);
        const bidBalanceAfter = await provider.connection.getBalance(bid);

        expect(bidBalanceBefore - bidBalanceAfter).to.be.equal((amount-1)*price, "Should have only spent the correct SOL");
        expect(bidBalanceAfter).to.be.equal(bidRentExemption + (amount-(amount-1))*price, "Should have SOL for rent excemption and remaining energy demand");
    });
});
