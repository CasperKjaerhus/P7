use anchor_lang::prelude::*;
use instructions::*;

mod instructions;
mod data_accounts;
mod errors;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod energy_market {
    use super::*;

    pub fn initialize_smart_power_storage(ctx: Context<InitializeSmartPowerStorage>) -> Result<()> {
        initialize_smart_power_storage::initialize_smart_power_storage(ctx)
    }

    pub fn create_energy_token_storage(ctx: Context<CreateEnergyTokenStorage>) -> Result<()> {
        create_energy_token_storage::create_energy_token_storage(ctx)
    }

    pub fn send_injection(ctx: Context<InjectPowerToStorage>, amount: u16) -> Result<()> {
        send_injection::send_injection(ctx, amount)
    }

    pub fn utilize_energy(ctx: Context<UtilizeEnergyContext>, amount: u16) -> Result<()> {
        utilize_energy::utilize_energy(ctx, amount)
    }

    pub fn send_bid(ctx: Context<SendBid>, energy_demand: u16, bid_value: u16, auction_id: u16) -> Result<()> {
        send_bid::send_bid(ctx, energy_demand, bid_value, auction_id)
    }

    pub fn release_cash(ctx: Context<ReleaseCash>, amount: u16, price: u16) -> Result<()> {
        release_cash::release_cash(ctx, amount, price)
    }

}

#[derive(Accounts)]
pub struct Initialize {}
