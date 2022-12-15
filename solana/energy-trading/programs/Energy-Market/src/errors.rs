use anchor_lang::prelude::*;

#[error_code]
pub enum EnergyMarketErrors {
    #[msg("You do not have enough tokens")]
    NotEnoughEnergyTokens,
    #[msg("The Smart Power Storage is empty!")]
    SmartPowerStorageEmpty,
    #[msg("There is not enough lamports on account")]
    NotEnoughLamports,
    #[msg("Energy demand has already been met")]
    EnergyDemandAlreadyMet,
    #[msg("Seller Does not have enough energy tokens for sale!")]
    NotEnoughEnergyTokensForSale
}