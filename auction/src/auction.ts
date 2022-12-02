export type Buyer = {
    demand: number;
    price: number;
    account: string;
}

export type Seller = {
    supply: number;
    account: string;
}

export type Transaction = {
    sellerKey: string;
    buyerKey: string;
    energy: number;
    price: number;
}

export class Auction {
    private buyers: Buyer[];

    private sellers: Seller[];
    
    public constructor(sellers: Seller[], buyers: Buyer[]){
      if (this._inputValid(sellers, buyers)) {
          this.sellers = sellers;
          this.buyers = buyers;
      } else { 
          this.sellers = [];
          this.buyers = [];
      }

      this.buyers.sort((buyer1, buyer2) => buyer2.price - buyer1.price); // Highest bid wins
      this.sellers.sort((seller1, seller2) => seller2.supply - seller1.supply); // Highest supply gets to sell first (re-sorted after each selling part of supply)
    }

    public auction(): Transaction[] {
        let transactions: Transaction[] = [];
        
        // Main part of the auction - we iteratively serve the highest bidder
        while (1 < this.buyers.length && 0 < this.sellers.length) { // Need to handle corner cases
            let bid = this.buyers[0];
            transactions = transactions.concat(this._serveWinner(bid, this.buyers[1].price)); //if we have atleast 2 buyers
            
            if (bid.demand == 0)
                this.buyers.shift(); // Remove buyer since demand has been met.
        }

        // Special case - we have excess supply and exactly one buyer to serve.
        if (this.buyers.length == 1 && 0 < this.sellers.length) {
            transactions = transactions.concat(this._serveWinner(this.buyers[0], this.buyers[0].price));

            if (this.buyers[0].demand == 0) // Only remove the last bidder, if their entire demand has been met.
                this.buyers.shift();
        }
        
        // this.sellers.map((seller) => console.log(seller.account,seller.supply)); // Log sellers with excess supply after the auction
        // this.buyers.map((buyer) => console.log(buyer.account, buyer.demand)); // Log bidders with un-met demand

        this._handleTransactions(transactions);

        return transactions;
    }
    
    private _inputValid(sellers: Seller[], buyers: Buyer[]): boolean {
        const sellerBool = sellers.every((seller) => seller.supply > 0 && Number.isInteger(seller.supply));
        const buyerBool = buyers.every((buyer) => buyer.demand > 0 && buyer.price > 0 && Number.isInteger(buyer.demand) && Number.isInteger(buyer.price));
        return sellerBool && buyerBool;
    }

    private _serveWinner(bid: Buyer, winnerPrice: number): Transaction[] {
        let transactions: Transaction[] = [];

        while (bid.demand > 0 && 0 < this.sellers.length) {

            if (bid.demand >= this.sellers[0].supply) {
                bid.demand -= this.sellers[0].supply; //Consume entire seller-supply
                transactions.push({ sellerKey: this.sellers[0].account, buyerKey: bid.account, energy: this.sellers[0].supply, price: (winnerPrice+bid.price)/2 }); 

                this.sellers.shift(); //Remove seller, as no supply left

            } else {
                this.sellers[0].supply -= bid.demand;  //Bid is met in its entirety
                transactions.push({ sellerKey: this.sellers[0].account, buyerKey: bid.account, energy: bid.demand, price: (winnerPrice+bid.price)/2 });
                
                this.sellers.sort((seller1, seller2) => seller2.supply - seller1.supply); // Sort sellers again, as the supply has changed
                bid.demand = 0; //To exit while-loop.
            }
        }
        return transactions;
    }

    private _handleTransactions(transactions: Transaction[]): void {
        transactions.map((t) => this._postTransaction(t));
    }

    // Stub for now, should handle posting a single transaction to the blockchain
    private _postTransaction(transaction: Transaction): void {
        console.log(transaction);
    }
}
