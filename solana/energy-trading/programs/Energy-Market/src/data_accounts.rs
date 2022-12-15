use anchor_lang::prelude::*;

#[account]
pub struct SmartPowerStorage {
    pub kwh: u64,
    pub bump: u8,
}

#[account]
pub struct EnergyTokenStorage {
    pub owner: Pubkey,
    pub num_tokens: u16,
    pub tokens_for_sale: u16,
    pub bump: u8,
}

#[account]
pub struct Bid {
    pub consumer: Pubkey, // 32
    pub energy_demand: u16, // 2
    pub bid_value: u16, // 2
    pub auction_id: u16, // 2
    pub bid_id: u8, // 1
    pub bump: u8, // 1
}
