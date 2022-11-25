import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { EnergyInjection } from "../target/types/energy_injection";
import { expect } from 'chai';

describe('Inject Energy', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

    
    const airdropSolToKey = async (key: PublicKey, amount: number) => {

        const sig = await program.provider.connection.requestAirdrop(key, amount * anchor.web3.LAMPORTS_PER_SOL);
        const blockhashLatest = await program.provider.connection.getLatestBlockhash();

        return program.provider.connection.confirmTransaction({
            blockhash: blockhashLatest.blockhash,
            lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
            signature: sig
        });
    }

    it('Create Smart Power Storage', async () => {

        const [smartpowerstoragePDA, _] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );

        await program.methods
            .initSps()
            .accounts({
                initializer: provider.wallet.publicKey,
                smartPowerStorage: smartpowerstoragePDA
            })
            .rpc();
        
        expect(((await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh)).to.equal(0)
    });

    it('Inject Energy', async () => {
        const [smartpowerstoragePDA, _] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );

        const prosumer = anchor.web3.Keypair.generate();
        await airdropSolToKey(prosumer.publicKey, 10);

        await program.methods
            .sendinjection(10)
            .accounts({
                prosumer: prosumer.publicKey,
                smartPowerStorage: smartpowerstoragePDA
            })
            .signers([prosumer])
            .rpc();

        expect((await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh).to.equal(10);

    })
});