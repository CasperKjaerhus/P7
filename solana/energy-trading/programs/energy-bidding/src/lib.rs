use anchor_lang::prelude::*;

declare_id!("7SyW3DnxzW12tD7oKVSzovEoEMbvuWQdR1Tv8nJ4rSBe");

#[program]
pub mod energy_bidding {
    use super::*;

    pub fn send_bid(ctx: Context<SendBid>, energy_demand: u16, bid_value: u16) -> Result<()> {
        let bid: &mut Account<Bid> = &mut ctx.accounts.bid;
        bid.energy_demand = energy_demand;
        bid.bid_value = bid_value;
        //bid.consumer = &ctx.accounts.bid.consumer;

        let clock: Clock = Clock::get().unwrap();
        let time: u64 = clock.unix_timestamp.try_into().unwrap();
        bid.timestamp = time;

        Ok(())
    }

}


#[account]
pub struct Bid {
    consumer: Pubkey,
    energy_demand: u16,
    bid_value: u16,
    timestamp: u64,
}

#[derive(Accounts)]
pub struct SendBid<'info> {
    #[account(mut)]
    pub consumer: Signer<'info>,
    #[account(
        init,
        payer = consumer,
        space = 8 + 32 + 2 + 2 + 8,
    )]
    pub bid: Account<'info, Bid>,
    pub system_program: Program<'info, System>,
}


