import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { EnergyTrading } from "../target/types/energy_trading";

describe("energy-trading", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EnergyTrading as Program<EnergyTrading>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
