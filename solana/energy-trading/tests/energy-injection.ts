import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { EnergyInjection } from "../target/types/energy_injection";
import { assert, expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe('Inject Energy', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

    let smartpowerstoragePDA;
    
    const airdropSolToKey = async (key: PublicKey, amount: number) => {

        const sig = await program.provider.connection.requestAirdrop(key, amount * anchor.web3.LAMPORTS_PER_SOL);
        const blockhashLatest = await program.provider.connection.getLatestBlockhash();

        return program.provider.connection.confirmTransaction({
            blockhash: blockhashLatest.blockhash,
            lastValidBlockHeight: blockhashLatest.lastValidBlockHeight,
            signature: sig
        });
    }

    before(async () => {
        [smartpowerstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("smartpowerstorage")
            ],
            program.programId
        );
    })

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

        const currentKwh = (await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh;

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

        expect((await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh).to.equal(currentKwh+10);
    })

    it('Fail on negative amount', async () => {
        
        const currentKwh = (await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh;

        const prosumer = anchor.web3.Keypair.generate();
        await airdropSolToKey(prosumer.publicKey, 10);
        
            expect(program.methods
                .sendinjection(-5)
                .accounts({
                    prosumer: prosumer.publicKey,
                    smartPowerStorage: smartpowerstoragePDA
                })
                .signers([prosumer])
                .rpc()).to.be.rejectedWith(RangeError);
        

        expect((await program.account.smartPowerStorage.fetch(smartpowerstoragePDA)).kwh).to.equal(currentKwh);
    })

});