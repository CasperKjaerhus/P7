use anchor_lang::prelude::*;

#[account]
pub struct SmartPowerStorage {
    pub kwh: u16,
    pub bump: u8,
}

#[account]
pub struct EnergyTokenStorage {
    pub num_tokens: u16,
    pub tokens_for_sale: u16,
    pub bump: u8,
}

#[account]
pub struct Bid {
    pub consumer: Pubkey,
    pub energy_demand: u16,
    pub bid_value: u16,
    pub auction_id: u16,
    pub bid_id: u8,
}
