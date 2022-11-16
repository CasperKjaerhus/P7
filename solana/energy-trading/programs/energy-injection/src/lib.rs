use anchor_lang::prelude::*;

declare_id!("DrReEY58u59wdn223dBCfNMNXGbNcuWzS9o81WEAwnmA");

#[program]
pub mod energy_injection {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
