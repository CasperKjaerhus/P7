import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { EnergyMarket } from "../target/types/energy_market";
import { setupAirdropSolToKey } from "./helpers";
chai.use(chaiAsPromised);

describe('Energy trading', () => {
    // Get the solana configuration (localnet)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyMarket as Program<EnergyMarket>;
    
    const prosumer = anchor.web3.Keypair.generate();
    const consumer = anchor.web3.Keypair.generate();

    let prosumerTokenStorage: PublicKey;
    let consumerTokenStorage: PublicKey;

    const airdropSolToKey = setupAirdropSolToKey(program);

    before(async () => {
        await airdropSolToKey(prosumer.publicKey, 10);
        await airdropSolToKey(consumer.publicKey, 10);

        const [smartpowerstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );

        [prosumerTokenStorage] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer.publicKey.toBuffer()
            ],
            program.programId
        );

        [consumerTokenStorage] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                consumer.publicKey.toBuffer()
            ],
            program.programId
        );

        await program.methods
            .createEnergyTokenStorage()
            .accounts({
                prosumer: prosumer.publicKey,
                energyTokenStorage: prosumerTokenStorage
            })
            .signers([prosumer])
            .rpc();

        await program.methods
            .createEnergyTokenStorage()
            .accounts({
                prosumer: consumer.publicKey,
                energyTokenStorage: consumerTokenStorage
            })
            .signers([consumer])
            .rpc();

        await program.methods
            .sendInjection(10)
            .accounts({
                prosumer: prosumer.publicKey,
                smartPowerStorage: smartpowerstoragePDA,
                energyTokenStorage: prosumerTokenStorage,
            })
            .signers([prosumer])
            .rpc();
    })
    

    it('Execute a trade', async () => {
        const [bid] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("bid"),
                consumer.publicKey.toBuffer(),
                new anchor.BN(3).toBuffer(),
            ],
            program.programId
        );

        const getBalances = () => { // Quick and dirty helper function to get all balances.
            return Promise.all([
                provider.connection.getBalance(consumer.publicKey), 
                provider.connection.getBalance(prosumer.publicKey),
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
                prosumer: prosumer.publicKey,
                consumer: consumer.publicKey,
                consumerEnergyTokenStorage: consumerTokenStorage,
                prosumerEnergyTokenStorage: prosumerTokenStorage
            })
            .signers([])
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
        const auctioneer = anchor.web3.Keypair.generate();

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
                prosumer: prosumer.publicKey,
                consumer: consumer.publicKey,
                consumerEnergyTokenStorage: consumerTokenStorage,
                prosumerEnergyTokenStorage: prosumerTokenStorage
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
