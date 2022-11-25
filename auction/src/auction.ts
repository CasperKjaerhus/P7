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

// Make the Buyer and Seller arrays to properties of the class.
class Auction {
    buyers: Buyer[];

    sellers: Seller[];
    
    constructor(sellers: Seller[], buyers: Buyer[]){
      this.sellers = sellers;
      this.buyers = buyers;
    }

    solve(): void {
        this.buyers.sort((buyer1, buyer2) => buyer2.price - buyer1.price);
        this.sellers.sort((seller1, seller2) => seller2.supply - seller1.supply);

        let totalSupply = sellers.reduce((acc, seller) => { return acc + seller.supply }, 0);

        let transactions: Transaction[] = [];
        
        while (1 < this.buyers.length && 0 < this.sellers.length) { // Need to handle corner cases
            let bid = this.buyers[0];
            transactions = this.serveWinner(bid, this.buyers[1].price); //if we have atleast 2 buyers
            this.handleTransactions(transactions);
            if (bid.demand == 0)
                this.buyers.splice(0, 1);
        }


        // cases efter while 
        // 1 buyer præcist og måske noget supply
        // eller supply = 0
        if (this.buyers.length == 1 && 0 < this.sellers.length) {
            transactions = this.serveWinner(this.buyers[0], this.buyers[0].price);
            this.handleTransactions(transactions);
            if (this.buyers[0].demand == 0)
                this.buyers.splice(0,1);
        }
        
        sellers.map((seller) => console.log(seller.account,seller.supply));
        this.buyers.map((buyer) => console.log(buyer.account, buyer.demand));
        
        return;
    }

    serveWinner(bid: Buyer, winnerPrice: number): Transaction[] {
        let transactions: Transaction[] = [];

        while (bid.demand > 0 && 0 < this.sellers.length) {

            if (bid.demand >= sellers[0].supply) {
                bid.demand -= sellers[0].supply;
                let transaction: Transaction = { from: sellers[0].account, to: bid.account, energy: sellers[0].supply, price: (winnerPrice+bid.price)/2 }; //Fix price.

                this.sellers.splice(0,1);
                transactions.push(transaction);

            } else {
                sellers[0].supply -= bid.demand;
                let transaction: Transaction = { from: sellers[0].account, to: bid.account, energy: bid.demand, price: (winnerPrice+bid.price)/2 }; //Fix price.

                bid.demand = 0; //To exit while-loop.
                transactions.push(transaction);
            }
        }
        return transactions;
    }

    handleTransactions(transactions: Transaction[]): void {
        transactions.map((t) => this.postTransaction(t));
    }

    postTransaction(transaction: Transaction): void {
        console.log(transaction);
    }
}

let bids: Buyer[] = [{ demand: 3, price: 2, account: "speel" }, { demand: 6, price: 3, account: "long john" }, { demand: 20, price: 6, account: "dino" }];
let sellers: Seller[] = [{ supply: 4, account: "cleth" }, { supply: 10, account: "philly" }];
let auction: Auction = new Auction(sellers, bids);
auction.solve()


