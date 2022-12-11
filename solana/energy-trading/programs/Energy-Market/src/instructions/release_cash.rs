use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::data_accounts::*;

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


#[derive(Accounts)]
pub struct ReleaseCash<'info> {
    #[account(mut, signer)]
    pub bid_account: Account<'info, Bid>,
    #[account(mut)]
    pub target: Signer<'info>,
    pub system_program: Program<'info, System>,
}
