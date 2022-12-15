use anchor_lang::prelude::*;
use crate::data_accounts::*;
use crate::errors::EnergyMarketErrors;

pub fn execute_trade(ctx: Context<ExecuteTrade>, amount: u16, price: u16) -> Result<()> {
    let prosumer_account = &mut ctx.accounts.prosumer;
    let bid_account = &mut ctx.accounts.bid_account;
    let consumer_account = &mut ctx.accounts.consumer;
    let prosumer_token_account = &mut ctx.accounts.prosumer_energy_token_storage;
    let consumer_token_account = &mut ctx.accounts.consumer_energy_token_storage;

    // Require that there is enough money on the bid account.
    require!(**bid_account.to_account_info().try_borrow_lamports()? >= u64::from(price*amount), EnergyMarketErrors::NotEnoughLamports);
    // Require that demand is above or equal to amount transfering
    require!(bid_account.energy_demand >= amount, EnergyMarketErrors::EnergyDemandAlreadyMet);

    // Require that seller actually has energy for sale
    require!(prosumer_token_account.tokens_for_sale >= amount, EnergyMarketErrors::NotEnoughEnergyTokensForSale);

    **bid_account.to_account_info().try_borrow_mut_lamports()? -= u64::from(price*amount);
    **prosumer_account.to_account_info().try_borrow_mut_lamports()? += u64::from(price*amount);

    bid_account.energy_demand -= amount; // Update the demand on the bid

    prosumer_token_account.tokens_for_sale -= amount; // Update tokens for sale
    prosumer_token_account.num_tokens -= amount; // Update prosumers total tokens

    consumer_token_account.num_tokens += amount; // Update consumers total tokens

    if bid_account.energy_demand == 0 {
        let lamports_amount_to_close = bid_account.to_account_info().lamports();

        **bid_account.to_account_info().try_borrow_mut_lamports()? -= lamports_amount_to_close;
        **consumer_account.to_account_info().try_borrow_mut_lamports()? += lamports_amount_to_close;

        // TODO: We should clear the anchor discriminator and other data also.
    }

    Ok(())
}


#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    #[account(
        mut,
        seeds = [b"bid", consumer.key().as_ref(), &[bid_account.bid_id]], bump = bid_account.bump,
        has_one = consumer
    )]
    pub bid_account: Account<'info, Bid>,
    #[account(
        mut,
        seeds = [b"energytokenstorage", consumer.key().as_ref()], bump = consumer_energy_token_storage.bump,
        constraint = consumer_energy_token_storage.owner == consumer.key(),
    )]
    pub consumer_energy_token_storage: Account<'info, EnergyTokenStorage>,
    #[account(
        mut,
        seeds = [b"energytokenstorage", prosumer.key().as_ref()], bump = prosumer_energy_token_storage.bump,
        constraint = prosumer_energy_token_storage.owner == prosumer.key(),
    )]
    pub prosumer_energy_token_storage: Account<'info, EnergyTokenStorage>,
    /// CHECK: We only send SOL to this account and that it owns token storage, therefore we need no verification of this account.
    #[account(mut)]
    pub prosumer: UncheckedAccount<'info>,
    /// CHECK: We only use this as to verify it owns the bid account and token storage, and therefore need no verification of this account.
    #[account(mut)]
    pub consumer: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
