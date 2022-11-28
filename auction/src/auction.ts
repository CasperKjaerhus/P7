type Buyer = {
    demand: number;
    price: number;
    account: string;
}

type Seller = {
    supply: number;
    account: string;
}

type Transaction = {
    from: string;
    to: string;
    energy: number;
    price: number;
}

class Auction {
    private buyers: Buyer[];

    private sellers: Seller[];
    
    public constructor(sellers: Seller[], buyers: Buyer[]){
      this.sellers = sellers;
      this.buyers = buyers;
    }

    public auction(): void {
        this.buyers.sort((buyer1, buyer2) => buyer2.price - buyer1.price); // Highest bid wins
        sellers.sort((seller1, seller2) => seller2.supply - seller1.supply); // Highest supply gets to sell first (re-sorted after each selling part of supply)

        let transactions: Transaction[] = [];
        
        // Main part of the auction - we iteratively serve the highest bidder
        while (1 < this.buyers.length && 0 < sellers.length) { // Need to handle corner cases
            let bid = this.buyers[0];
            transactions.concat(this._serveWinner(bid, this.buyers[1].price)); //if we have atleast 2 buyers
            if (bid.demand == 0)
                this.buyers.splice(0, 1);
        }

        // Special case - we have excess supply and exactly one buyer to serve.
        if (this.buyers.length == 1 && 0 < sellers.length) {
            transactions.concat(this._serveWinner(this.buyers[0], this.buyers[0].price));
            if (this.buyers[0].demand == 0) // Only remove the last bidder, if their entire demand has been met.
                this.buyers.splice(0,1);
        }
        
        sellers.map((seller) => console.log(seller.account,seller.supply)); // Log sellers with excess supply after the auction
        this.buyers.map((buyer) => console.log(buyer.account, buyer.demand)); // Log bidders with un-met demand


        this._handleTransactions(transactions);
        
        return;
    }

    private _serveWinner(bid: Buyer, winnerPrice: number): Transaction[] {
        let transactions: Transaction[] = [];

        while (bid.demand > 0 && 0 < this.sellers.length) {

            if (bid.demand >= sellers[0].supply) {
                bid.demand -= sellers[0].supply; //Consume entire seller-supply
                transactions.push({ from: sellers[0].account, to: bid.account, energy: sellers[0].supply, price: (winnerPrice+bid.price)/2 }); 

                sellers.splice(0,1); //Remove seller, as no supply left

            } else {
                sellers[0].supply -= bid.demand;  //Bid is met in its entirety
                transactions.push({ from: sellers[0].account, to: bid.account, energy: bid.demand, price: (winnerPrice+bid.price)/2 });
                
                sellers.sort((seller1, seller2) => seller2.supply - seller1.supply); // Sort sellers again, as the supply has changed
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

let bids: Buyer[] = [{ demand: 3, price: 2, account: "speel" }, { demand: 6, price: 3, account: "long john" }, { demand: 20, price: 6, account: "dino" }];
let sellers: Seller[] = [{ supply: 4, account: "cleth" }, { supply: 10, account: "philly" }];
let auction: Auction = new Auction(sellers, bids);
auction.auction()


