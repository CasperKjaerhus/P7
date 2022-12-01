
use anchor_lang::prelude::*;

#[error_code]
pub enum EnergyInjectionErrors {
    #[msg("You do not have enough tokens")]
    NotEnoughEnergyTokens,
}