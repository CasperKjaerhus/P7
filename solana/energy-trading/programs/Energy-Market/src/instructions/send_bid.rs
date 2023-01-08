use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::data_accounts::*;

pub fn send_bid(ctx: Context<SendBid>, bid_id: u8, energy_demand: u16, bid_value: u16, auction_id: u16) -> Result<()> {
    let bid: &mut Account<Bid> = &mut ctx.accounts.bid;
    bid.energy_demand = energy_demand;
    bid.bid_value = bid_value;
    bid.consumer = ctx.accounts.consumer.key();
    bid.auction_id = auction_id;
    bid.bid_id = bid_id;
    bid.bump = *ctx.bumps.get("bid").unwrap();

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(), 
        system_program::Transfer {
            from: ctx.accounts.consumer.to_account_info(),
            to: ctx.accounts.bid.to_account_info(),
        });

    system_program::transfer(cpi_context, (bid_value * energy_demand).into())?;
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(bid_id: u8)]
pub struct SendBid<'info> {
    #[account(mut)]
    pub consumer: Signer<'info>,
    #[account(
        init,
        payer = consumer,
        space = 8 + 32 + 2 + 2 + 2 + 1 + 1,
        seeds = [b"bid", consumer.key().as_ref(), &[bid_id]], bump 
    )]
    pub bid: Account<'info, Bid>,
    pub system_program: Program<'info, System>,
}