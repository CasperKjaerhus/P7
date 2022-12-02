import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { EnergyInjection } from "../target/types/energy_injection";
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe('Inject Energy', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

    let smartpowerstoragePDA: anchor.Address;
    let energytokenstoragePDA: anchor.Address;

    const prosumer = anchor.web3.Keypair.generate();
    
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

        [energytokenstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer.publicKey.toBuffer()
            ],
            program.programId
        );
    })




    it('Create Smart Power Storage', async () => {
        const [smartpowerstoragePDA] = await PublicKey
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
        
        await expect(program.account.smartPowerStorage.fetch(smartpowerstoragePDA))
            .to.eventually.have.property("kwh")
            .to.be.equal(0)
    });

    it('Create Energy Token Storage', async () => {
        
        const [energytokenstoragePDA] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer.publicKey.toBuffer()
            ],
            program.programId
        );

        await airdropSolToKey(prosumer.publicKey, 10);
        
        await program.methods
            .createEnergyTokenStorage()
            .accounts({
                prosumer: prosumer.publicKey,
                energyTokenStorage: energytokenstoragePDA
            })
            .signers([prosumer])
            .rpc();
        
        await expect((program.account.energyTokenStorage.fetch(energytokenstoragePDA)))
            .to.eventually.have.property("noTokens")
            .to.be.equal(0)
    })

    it('Inject Energy', async () => {

        const {kwh: currentKwh} = await program.account.smartPowerStorage.fetch(smartpowerstoragePDA);

        await airdropSolToKey(prosumer.publicKey, 10);
        
        await program.methods
            .sendinjection(10)
            .accounts({
                prosumer: prosumer.publicKey,
                smartPowerStorage: smartpowerstoragePDA,
                energyTokenStorage: energytokenstoragePDA,
            })
            .signers([prosumer])
            .rpc();

        await expect(program.account.smartPowerStorage.fetch(smartpowerstoragePDA))
            .to.eventually.have.property("kwh")
            .to.be.equal(currentKwh+10);

        await expect(program.account.energyTokenStorage.fetch(energytokenstoragePDA))
            .to.eventually.have.property("noTokens")
            .to.be.equal(currentKwh+10);
    })

    it('Fail on negative amount', async () => {
        
        const {kwh: currentKwh} = await program.account.smartPowerStorage.fetch(smartpowerstoragePDA);

        await airdropSolToKey(prosumer.publicKey, 10);
        
        await expect(
            program.methods
                .sendinjection(-5)
                .accounts({
                    prosumer: prosumer.publicKey,
                    smartPowerStorage: smartpowerstoragePDA,
                    energyTokenStorage: energytokenstoragePDA,
                })
                .signers([prosumer])
                .rpc())
            .to.be.rejectedWith(RangeError);
        

        await expect(program.account.smartPowerStorage.fetch(smartpowerstoragePDA))
            .to.eventually.have.property("kwh")
            .to.be.equal(currentKwh);
    });

    it('Surrender currency', async () => {
        const {noTokens} = await program.account.energyTokenStorage.fetch(energytokenstoragePDA);


    })

    it('Surrender should fail if not enough', async () => {

        const prosumer2 = anchor.web3.Keypair.generate();

        const [prosomer2EnergyStorage] = await PublicKey
        .findProgramAddress(
            [
                anchor.utils.bytes.utf8.encode("energytokenstorage"),
                prosumer2.publicKey.toBuffer()
            ],
            program.programId
        );

        await airdropSolToKey(prosumer2.publicKey, 10);
        
        await program.methods
            .createEnergyTokenStorage()
            .accounts({
                prosumer: prosumer2.publicKey,
                energyTokenStorage: prosomer2EnergyStorage
            })
            .signers([prosumer2])
            .rpc();

        await expect(program.account.energyTokenStorage.fetch(prosomer2EnergyStorage)).to.eventually.have.property("noTokens").to.be.eq(0)

        await expect(program.methods
            .surrender(5)
            .accounts({
                consumer: prosumer2.publicKey,
                energyTokenStorage: prosomer2EnergyStorage,
                smartPowerStorage: smartpowerstoragePDA
            })
            .signers([prosumer2])
            .rpc()).to.be.rejectedWith("You do not have enough tokens");
    })
});