use anchor_lang::prelude::*;
use crate::data_accounts::*;

pub fn reset_smart_power_storage(ctx: Context<ResetSmartPowerStorage>) -> Result<()> {
    let smart_power_storage = &mut ctx.accounts.smart_power_storage;
    smart_power_storage.kwh = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct ResetSmartPowerStorage<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"smartpowerstorage"], bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,
    pub system_program: Program<'info, System>,
}