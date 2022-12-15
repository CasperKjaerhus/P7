use anchor_lang::prelude::*;
use crate::data_accounts::*;

pub fn initialize_smart_power_storage(ctx: Context<InitializeSmartPowerStorage>) -> Result<()> {
    let smart_power_storage = &mut ctx.accounts.smart_power_storage;
    smart_power_storage.kwh = 0;
    smart_power_storage.bump = *ctx.bumps.get("smart_power_storage").unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeSmartPowerStorage<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        init,
        payer = initializer,
        space = 8 + 8 + 1, // Anchor Discriminant + u16 + u8
        seeds = [b"smartpowerstorage"], bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,
    pub system_program: Program<'info, System>,
}