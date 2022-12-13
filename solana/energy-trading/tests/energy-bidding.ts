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
        const transactionFee = 1224960;
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
            .sendBid(2, 10, 5, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();
        
        let consumerNow = await provider.connection.getBalance(consumer.publicKey);
        let consumerAfter = consumerBefore - (10*5) - transactionFee;

        expect(consumerNow).to.equal(consumerAfter);
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

        const [amount, price] = [10, 5]
        await program.methods
            .sendBid(3, amount, price, 1)
            .accounts({
                bid: bid,
                consumer: consumer.publicKey,
            })
            .signers([consumer])
            .rpc();

        const consumerBalanceBefore = await provider.connection.getBalance(consumer.publicKey);

        let txn = await program.methods
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

        const consumerBalanceAfter = await provider.connection.getBalance(consumer.publicKey);

        expect(consumerBalanceBefore - consumerBalanceAfter).to.be.equal(transFee); 
    });

});