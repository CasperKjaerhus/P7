import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../target/types/energy_market";

chai.use(chaiAsPromised);

describe('Energy bidding', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
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


        const [consumerBefore, targetBefore, bidBefore] = await getBalances(); // Before balances
        const [amount, price] = [10, 5]

        await program.methods
            .sendBid(3, amount, price, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();

        const [consumerInterim, targetInterim, BidInterim] = await getBalances(); // Before balances

        const txn = await program.methods
            .releaseCash(amount,price)
            .accounts({
                bidAccount: bid,
                target: target.publicKey,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .transaction();
        
        txn.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        txn.feePayer = consumer.publicKey;
        const transFee = await txn.getEstimatedFee(provider.connection);
        
        await anchor.web3.sendAndConfirmTransaction(provider.connection, txn, [consumer]);

        const [consumerAfter, targetAfter, bidAfter] = await getBalances(); // Before balances

        // Check that the caller only gets withdrawn the transaction fee
        expect(consumerInterim - consumerAfter).to.be.equal(transFee, "Consumer should only pay exactly the transaction fee");

        // Check that money is recieved on target
        expect(targetAfter - targetBefore).to.be.equal(amount*price, "Money should be recieved on target");

        // Check that money is spent on bid
        expect(BidInterim - bidAfter).to.be.equal(amount*price, "Money should be spent on bid");

        // Check that bid still is exactly rent exempt
        const rentExemption = await provider.connection.getMinimumBalanceForRentExemption(program.account.bid.size)
        expect(bidAfter).to.be.equal(rentExemption, "Bid should only have SOL for rent exemption");
    });

});



