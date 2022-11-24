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
    sellers: Seller[];
    buyers: Buyer[];
    
    constructor(sellers: Seller[], buyers: Buyer[]){
      this.sellers = sellers;
      this.buyers = buyers;
    }

    solve(): void {
        buyers.sort((buyer1, buyer2) => buyer2.price - buyer1.price);
        sellers.sort((seller1, seller2) => seller2.supply - seller1.supply);

        let totalSupply = sellers.reduce((acc, seller) => { return acc + seller.supply }, 0);

        let transactions: Transaction[] = [];
        let i = 0;
        while (i < buyers.length+1 || totalSupply != 0) {
            let bid = buyers[i];
            totalSupply = sellers.reduce((acc, seller) => { return acc + seller.supply }, 0);
            transactions = this.serveWinner(bid, buyers[i+1].price);
            this.handleTransactions(transactions);
            buyers.splice(i, 1);
        }
        return;
    }

    serveWinner(bid: Buyer, winnerPrice: number): Transaction[] {
        let transactions: Transaction[] = [];
        let i = 0;
        while (bid.demand > 0) {

            if (bid.demand >= sellers[i].supply) {
                bid.demand -= sellers[i].supply;
                let transaction: Transaction = { from: sellers[i].account, to: bid.account, energy: sellers[i].supply, price: winnerPrice }; //Fix price.

                sellers.splice(i, 1);
                transactions.push(transaction);
                i++;

            } else {
                sellers[i].supply -= bid.demand;
                let transaction: Transaction = { from: sellers[i].account, to: bid.account, energy: bid.demand, price: winnerPrice }; //Fix price.

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

let bids: Buyer[] = [{ demand: 2, price: 2, account: "speel" }, { demand: 2, price: 3, account: "long john" }, { demand: 2, price: 6, account: "dino" }];
let sellers: Seller[] = [{ supply: 3, account: "cleth" }, { supply: 10, account: "philly" }];
let auction = new Auction;
console.log(auction.solve(bids, sellers))

