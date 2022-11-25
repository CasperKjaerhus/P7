use anchor_lang::prelude::*;

declare_id!("8HAvCmA3sB8f5agvZmBXDepLmEToB8YwnZgt9kcitzbr");

#[program]
pub mod energy_injection {
    use super::*;

    pub fn init_sps(ctx: Context<InitializeSmartPowerStorage>) -> Result<()> {
        let smart_power_storage = &mut ctx.accounts.smart_power_storage;
        smart_power_storage.kwh = 0;
        smart_power_storage.bump = *ctx.bumps.get("smart_power_storage").unwrap();

        Ok(())
    }

    pub fn sendinjection(ctx: Context<InjectPowerToStorage>, amount: u16) -> Result<()> {
        ctx.accounts.smart_power_storage.kwh += amount;
        Ok(())
    }
}

#[account]
pub struct SmartPowerStorage {
    kwh: u16,
    bump: u8,
}

#[derive(Accounts)]
pub struct InitializeSmartPowerStorage<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        init,
        payer = initializer,
        space = 8 + 2 + 1, 
        seeds = [b"smartpowerstorage"], bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InjectPowerToStorage<'info> {
    pub prosumer: Signer<'info>,
    #[account(
        mut, 
        seeds = [b"smartpowerstorage"], bump = smart_power_storage.bump
    )]
    pub smart_power_storage: Account<'info, SmartPowerStorage>,
}