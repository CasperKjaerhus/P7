use anchor_lang::prelude::*;
use anchor_lang::system_program;


declare_id!("7SyW3DnxzW12tD7oKVSzovEoEMbvuWQdR1Tv8nJ4rSBe");

#[program]
pub mod energy_bidding {
    use super::*;

    pub fn send_bid(ctx: Context<SendBid>, energy_demand: u16, bid_value: u16, auction_id: u16) -> Result<()> {
        let bid: &mut Account<Bid> = &mut ctx.accounts.bid;
        bid.energy_demand = energy_demand;
        bid.bid_value = bid_value;
        //bid.consumer = &ctx.accounts.consumer;
        bid.auction_id = auction_id;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(), 
            system_program::Transfer {
                from: ctx.accounts.consumer.to_account_info(),
                to: ctx.accounts.bid.to_account_info(),
            });
        system_program::transfer(cpi_context, (bid_value * energy_demand).into())?;

        Ok(())
    }

    pub fn release_cash(ctx: Context<ReleaseCash>, amount: u16, price: u16) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(), 
            system_program::Transfer {
                from: ctx.accounts.bid_account.to_account_info(),
                to: ctx.accounts.target.to_account_info(),
            });
        system_program::transfer(cpi_context, amount.into())?;

        Ok(())
    }

}


#[account]
pub struct Bid {
    //consumer: Pubkey,
    energy_demand: u16,
    bid_value: u16,
    auction_id: u16,
}

#[derive(Accounts)]
pub struct SendBid<'info> {
    #[account(mut)]
    pub consumer: Signer<'info>,
    #[account(
        init,
        payer = consumer,
        space = 8 + 2 + 2 + 2 + 8,
    )]
    pub bid: Account<'info, Bid>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseCash<'info> {
    #[account(mut)]
    pub bid_account: Account<'info, Bid>,
    #[account(mut)]
    pub target: Signer<'info>,
    pub system_program: Program<'info, System>,
}
