module agreement::agreement {

    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    // use sui::transfer::{Self, Transfer};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;

    /// Agreement structure
    public struct Agreement has key {
        id: UID,
        freelancer: address,
        recruiter: address,
        balance: Balance<SUI>,
        status: bool,
    }

    /// Create a new Agreement object
    public fun new(
        freelancer: address,
        recruiter: address,
        balance: Balance<SUI>,
        status: bool,
        ctx: &mut TxContext
    ): Agreement {
        Agreement {
            id: object::new(ctx),
            freelancer,
            recruiter,
            balance,
            status,
        }
    }

    public entry fun claim(self: &mut Agreement, freelancer: address){
        self.freelancer = freelancer;
    }

    /// Create a new agreement and convert the coin to Balance<SUI> type
    public entry fun create(
        recruiter: address,
        freelancer: address,
        payment_coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Convert the Coin<SUI> to Balance<SUI>
        let balance = sui::coin::into_balance(payment_coin);

        // Create a new agreement with the balance
        let agreement = new(freelancer, recruiter, balance, false, ctx);

        // Share the agreement object
        sui::transfer::share_object(agreement);
    }

    /// Settle the agreement based on the success flag
    public entry fun settle(
        agreement: Agreement,
        success: bool,
        ctx: &mut TxContext
    ) {
        // Deconstruct the agreement to retrieve the balance
        let Agreement { id, freelancer, recruiter, balance, status} = agreement;
        id.delete();

        // Convert the Balance<SUI> back to Coin<SUI>
        let payment_coin = sui::coin::from_balance(balance, ctx);

        // If the agreement is successful, transfer the payment_coin to the freelancer
        if (success) {
            sui::transfer::public_transfer(payment_coin, freelancer);
        } else {
            // If not successful, return the payment_coin to the recruiter
            sui::transfer::public_transfer(payment_coin, recruiter);
        }
    }
}
