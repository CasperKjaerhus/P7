use anchor_lang::prelude::*;
use crate::data_accounts::*;
use crate::errors::EnergyInjectionErrors;

pub fn utilize_energy(ctx: Context<UtilizeEnergyContext>, amount: u16) -> Result<()> {
    // Check if user has enough energy tokens
    require!(ctx.accounts.energy_token_storage.num_tokens >= amount, EnergyInjectionErrors::NotEnoughEnergyTokens);

    // Check if smart power storage has enough energy
    require!(ctx.accounts.smart_power_storage.kwh >= amount, EnergyInjectionErrors::SmartPowerStorageEmpty);

    // Subtract Tokens from account and sps
    ctx.accounts.energy_token_storage.num_tokens -= amount;
    ctx.accounts.smart_power_storage.kwh -= amount;

    // If for_sale is higher than num_tokens, set for_sale to num_tokens.
    if ctx.accounts.energy_token_storage.tokens_for_sale > ctx.accounts.energy_token_storage.num_tokens {
        ctx.accounts.energy_token_storage.tokens_for_sale = ctx.accounts.energy_token_storage.num_tokens;   
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UtilizeEnergyContext<'info> {
    #[account(mut)]
    pub consumer: Signer<'info>,
    #[account(
        mut, 
        seeds = [b"smartpowerstorage"], bump = smart_power_storage.bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,
    #[account(
        mut, 
        seeds = [b"energytokenstorage", consumer.key().as_ref()], bump = energy_token_storage.bump
    )]
    pub energy_token_storage: Account<'info, EnergyTokenStorage>,
    pub system_program: Program<'info, System>,
}
