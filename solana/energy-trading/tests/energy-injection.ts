import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { EnergyInjection } from "../target/types/energy_injection";
import { expect } from 'chai';



describe('Inject Energy', () => {
    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;
    anchor.setProvider(anchor.AnchorProvider.env());

    const amount = new anchor.BN(123)
    const prosumer = anchor.web3.Keypair.generate();
    const sps = anchor.web3.Keypair.generate();

    it('Recieve Token', async() => {
        await program.methods
            .sendinjection(amount)
            .accounts({
                prosumer: prosumer.publicKey,
                sps: program.account.sps.provider.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            }).signers([
                prosumer,
            ])
            .rpc()
    });

    it('Fail on Negative Energy', async() => {

    });

    it('Fail on non-verified account', async() => {

    });

});