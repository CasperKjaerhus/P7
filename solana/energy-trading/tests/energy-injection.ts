import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { EnergyInjection } from "../target/types/energy_injection";
import { assert, expect } from 'chai';



describe('Inject Energy', () => {
    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;
    anchor.setProvider(anchor.AnchorProvider.env());

    const amount = new anchor.BN(123)
    const prosumer = anchor.web3.Keypair.generate();

    before(async () => {

        /* Airdrop 100 SOL to prosumer */
        const signature = await program.provider.connection.requestAirdrop(prosumer.publicKey, anchor.web3.LAMPORTS_PER_SOL * 100);
        const latestBlockHash = await program.provider.connection.getLatestBlockhash();

        await program.provider.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
          });

        /* Initialise SPS */
        
        // const [spsPDA, _] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('smartpowerstorage')], program.programId);

        // const tx = await program.methods.initSps().accounts({
        //     payer: prosumer.publicKey,
        //     systemProgram: anchor.web3.SystemProgram.programId,
        //     sps: spsPDA
        // }).signers([
        //     prosumer
        // ]).rpc()

        // const latestBlockHashtx = await program.provider.connection.getLatestBlockhash();
        // await program.provider.connection.confirmTransaction({
        //     blockhash: latestBlockHashtx.blockhash,
        //     lastValidBlockHeight: latestBlockHashtx.lastValidBlockHeight,
        //     signature: tx,
        //   });
      });

    it('Recieve Token', async () => {
        const [spsPDA, _] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('smartpowerstorage')], program.programId);

        const signature = await program.methods
            .sendinjection(amount)
            .accounts({
                prosumer: prosumer.publicKey,
                sps: spsPDA,
                systemProgram: anchor.web3.SystemProgram.programId
            }).signers([
                prosumer
            ])
            .rpc();

        const latestBlockHash = await program.provider.connection.getLatestBlockhash();
        await program.provider.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        });

        const all = await program.account.sps.all();
        console.log(all.length);
        console.table(all);
        const spsAccount = await program.account.sps.fetch(spsPDA);

        assert.equal(spsAccount.kwhInStorage.toNumber(), 123);
    });

    it('Fail on Negative Energy', async() => {

    });

    it('Fail on non-verified account', async() => {

    });

});