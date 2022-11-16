import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import { expect } from 'chai';

describe("energy-trading", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EnergyTrading as Program<TicTacToe>;

  it('setup game!', () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = program.provider.publicKey;
    const playerTwo = anchor.web3.Keypair.generate();
    console.log(gameKeypair);
    console.log(playerOne);
    console.log(playerTwo);
  });
});
