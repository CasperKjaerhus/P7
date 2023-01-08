use anchor_lang::prelude::*;
use crate::data_accounts::*;

pub fn create_energy_token_storage(ctx: Context<CreateEnergyTokenStorage>) -> Result<()> {
    let energy_token_storage: &mut Account<EnergyTokenStorage> = &mut ctx.accounts.energy_token_storage;
    energy_token_storage.num_tokens = 0;
    energy_token_storage.tokens_for_sale = 0;
    energy_token_storage.bump = *ctx.bumps.get("energy_token_storage").unwrap();
    energy_token_storage.owner = ctx.accounts.prosumer.key();

    Ok(())
}

#[derive(Accounts)]
pub struct CreateEnergyTokenStorage<'info> {
    #[account(mut)]
    pub prosumer: Signer<'info>,
    #[account(
        init,
        payer = prosumer,
        space = 8 + 32 + 2 + 2 + 1, // Anchor Discriminant + Pubkey + u16 + u16 + u8
        seeds = [b"energytokenstorage", prosumer.key().as_ref()], bump
    )]
    pub energy_token_storage: Account<'info, EnergyTokenStorage>,
    pub system_program: Program<'info, System>,
}