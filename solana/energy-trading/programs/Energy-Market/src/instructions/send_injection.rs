use anchor_lang::prelude::*;
use crate::data_accounts::*;

pub fn send_injection(ctx: Context<InjectPowerToStorage>, amount: u16) -> Result<()> {

    ctx.accounts.smart_power_storage.kwh += amount;
    ctx.accounts.energy_token_storage.num_tokens += amount;
    ctx.accounts.energy_token_storage.tokens_for_sale += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct InjectPowerToStorage<'info> {
    pub prosumer: Signer<'info>,
    #[account(
        mut, 
        seeds = [b"smartpowerstorage"], bump = smart_power_storage.bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,

    #[account(
        mut, 
        seeds = [b"energytokenstorage", prosumer.key().as_ref()], bump = energy_token_storage.bump
    )]
    pub energy_token_storage: Account<'info, EnergyTokenStorage>,
}