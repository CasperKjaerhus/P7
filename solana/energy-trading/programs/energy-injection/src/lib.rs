use anchor_lang::prelude::*;
use errors::EnergyInjectionErrors;

mod errors;

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

    pub fn create_energy_token_storage(ctx: Context<CreateEnergyTokenStorage>) -> Result<()> {
        let energy_token_storage: &mut Account<EnergyTokenStorage> = &mut ctx.accounts.energy_token_storage;
        energy_token_storage.no_tokens = 0;
        energy_token_storage.tokens_for_sale = 0;
        energy_token_storage.bump = *ctx.bumps.get("energy_token_storage").unwrap();

        Ok(())
    }

    pub fn send_injection(ctx: Context<InjectPowerToStorage>, amount: u16) -> Result<()> {

        ctx.accounts.smart_power_storage.kwh += amount;
        ctx.accounts.energy_token_storage.no_tokens += amount;
        ctx.accounts.energy_token_storage.tokens_for_sale += amount;

        Ok(())
    }

    pub fn utilize_energy(ctx: Context<UtilizeEnergyContext>, amount: u16) -> Result<()> {
        // Check if user has enough energy tokens
        require!(ctx.accounts.energy_token_storage.no_tokens >= amount, EnergyInjectionErrors::NotEnoughEnergyTokens);

        // Check if smart power storage has enough energy
        require!(ctx.accounts.smart_power_storage.kwh >= amount, EnergyInjectionErrors::SmartPowerStorageEmpty);

        // Subtract Tokens from account and sps
        ctx.accounts.energy_token_storage.no_tokens -= amount;
        ctx.accounts.smart_power_storage.kwh -= amount;

        Ok(())
    }

}

#[account]
pub struct SmartPowerStorage {
    kwh: u16,
    bump: u8,
}

#[account]
pub struct EnergyTokenStorage {
    no_tokens: u16,
    tokens_for_sale: u16,
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
pub struct CreateEnergyTokenStorage<'info> {
    #[account(mut)]
    pub prosumer: Signer<'info>,
    #[account(
        init,
        payer = prosumer,
        space = 8 + 2 + 2 + 1, 
        seeds = [b"energytokenstorage", prosumer.key().as_ref()], bump
    )]
    pub energy_token_storage: Account<'info, EnergyTokenStorage>,
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

    #[account(
        mut, 
        seeds = [b"energytokenstorage", prosumer.key().as_ref()], bump = energy_token_storage.bump
    )]
    pub energy_token_storage: Account<'info, EnergyTokenStorage>,
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
