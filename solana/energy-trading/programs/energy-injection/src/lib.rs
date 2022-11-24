use std::mem::size_of;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("8HAvCmA3sB8f5agvZmBXDepLmEToB8YwnZgt9kcitzbr");

#[program]
pub mod energy_injection {
    use super::*;

    pub fn sendinjection(ctx: Context<SendInjection>, amount: i64, ) -> Result<()> {
        let _prosumer: &Signer = &ctx.accounts.prosumer;

        // TODO: Check if prosumer is even allowed to deposit 

        

        // TODO: Check if amount can be deposited

        ctx.accounts.sps.kwh_in_storage += amount;

        
        // TODO: Make a "hashmap" that controls how many energy tokens a prosumer (pubkey) has.



        Ok(())
    }
}

#[account]
pub struct SPS {
    pub kwh_in_storage: i64,
}




// SendInjection struct is the context that is provided to sendinjection() upon usage
#[derive(Accounts)]
pub struct SendInjection<'info> {
    #[account(mut)]
    pub prosumer: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = prosumer,
        seeds = [b"smartpowerstorage"],
        bump,
        space = size_of::<SPS>() + 8,
    )]
    pub sps: Account<'info, SPS>, 
}
