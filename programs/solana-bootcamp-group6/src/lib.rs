use anchor_lang::prelude::*;

declare_id!("4QAYAnQDAYqmV2Nqq2WKmMaCipmZYp1T3xibZoJ9vm8F");

#[program]
pub mod solana_bootcamp_group6 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
