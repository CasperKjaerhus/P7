import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { EnergyInjection } from "../target/types/energy_injection";
import { expect } from 'chai';
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe('Inject Energy', () => {
    // Get the solana configuration (localnet)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

    // PDA's are retrieved during before()
    let smartpowerstoragePDA: anchor.web3.PublicKey;
    let energytokenstoragePDA: anchor.web3.PublicKey;

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
            .sendInjection(10)
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
            .to.be.equal(10);
    })

    it('Fail on negative amount', async () => {
        
        const {kwh: currentKwh} = await program.account.smartPowerStorage.fetch(smartpowerstoragePDA);

        await airdropSolToKey(prosumer.publicKey, 10);
        
        await expect(
            program.methods
                .sendInjection(-5)
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

    it('Utilize energy', async () => {
        const {noTokens, tokensForSale} = await program.account.energyTokenStorage.fetch(energytokenstoragePDA);
        
        await program.methods
            .utilizeEnergy(5)
            .accounts({
                consumer: prosumer.publicKey,
                energyTokenStorage: energytokenstoragePDA,
                smartPowerStorage: smartpowerstoragePDA,
            })
            .signers([prosumer])
            .rpc();
        
        await expect(program.account.energyTokenStorage.fetch(energytokenstoragePDA))
            .to.eventually.have.property("noTokens")
            .to.be.equal(noTokens-5);
        
        await expect(program.account.energyTokenStorage.fetch(energytokenstoragePDA))
            .to.eventually.have.property("tokensForSale")
            .to.be.equal(tokensForSale-5);

    })

    it('Utilize should fail if not enough', async () => {

        const prosumer2 = anchor.web3.Keypair.generate();

        const [prosumer2EnergyStorage] = await PublicKey
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
                energyTokenStorage: prosumer2EnergyStorage
            })
            .signers([prosumer2])
            .rpc();

        await expect(program.account.energyTokenStorage.fetch(prosumer2EnergyStorage)).to.eventually.have.property("noTokens").to.be.eq(0)

        await expect(program.methods
            .utilizeEnergy(5)
            .accounts({
                consumer: prosumer2.publicKey,
                energyTokenStorage: prosumer2EnergyStorage,
                smartPowerStorage: smartpowerstoragePDA
            })
            .signers([prosumer2])
            .rpc()).to.be.rejectedWith("You do not have enough tokens");
    })
});