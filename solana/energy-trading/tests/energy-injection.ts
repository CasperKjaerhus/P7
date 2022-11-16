import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { EnergyInjection } from "../target/types/energy_injection";
import { expect } from 'chai';

const program = anchor.workspace.EnergyInjection as Program<EnergyInjection>;

it('Inject Energy --> Recieve Token', async() => {

});

it('Inject Negative Energy', async() => {

});

it('Inject from non-verified account', async() => {

});

