use anchor_lang::prelude::*;
use crate::data_accounts::*;

pub fn release_cash(ctx: Context<ReleaseCash>, amount: u16, price: u16) -> Result<()> {
    let target_account = &mut ctx.accounts.target;
    let bid_account = &mut ctx.accounts.bid_account;

    **target_account.to_account_info().try_borrow_mut_lamports()? -= u64::from(price*amount);
    **bid_account.to_account_info().try_borrow_mut_lamports()? += u64::from(price*amount);

    Ok(())
}


#[derive(Accounts)]
#[instruction(bid_id: u8)]
pub struct ReleaseCash<'info> {
    #[account(mut,
        seeds = [b"bid", target.key().as_ref(), &[bid_id]], bump
    )]
    pub bid_account: Account<'info, Bid>,
    #[account(mut)]
    pub target: Signer<'info>,
    pub system_program: Program<'info, System>,
}
