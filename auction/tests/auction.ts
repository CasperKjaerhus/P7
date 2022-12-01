import { Auction, Buyer, Seller, Transaction } from '../src/auction';
import { expect } from 'chai';

describe('Auction tests', () => {
  it('Single Bidder, excess supply', () => {
    const bid: Buyer[] = [{ demand: 3, price: 2, account: "speel" }];
    const sellers: Seller[] = [{ supply: 4, account: "cleth" }];
    const instance: Auction = new Auction(sellers, bid);

    const expectedTransaction: Transaction = {sellerKey: "cleth", buyerKey: "speel", energy: 3, price: 2};
    const result = instance.auction();
    
    expect(result[0]).to.deep.equal(expectedTransaction);
    expect(result.length).to.be.equal(1);
  });

  it('Single Bidder, partially served at low supply', () => {
    const bid: Buyer[] = [{ demand: 3, price: 2, account: "speel" }];
    const sellers: Seller[] = [{ supply: 2, account: "cleth" }];
    const instance: Auction = new Auction(sellers, bid);

    const expectedTransaction: Transaction = {sellerKey: "cleth", buyerKey:"speel", energy: 2, price: 2};
    const result = instance.auction();
  
    expect(result[0]).to.deep.equal(expectedTransaction);
    expect(result.length).to.be.equal(1);
  });

  it('Single Bidder, not served at no supply', () => {
    const bid: Buyer[] = [{ demand: 3, price: 2, account: "speel" }];
    const sellers: Seller[] = [];
    const instance: Auction = new Auction(sellers, bid);

    const expectedTransaction: Transaction[] = [];
    const result = instance.auction();
  
    expect(result).to.deep.equal(expectedTransaction);
    expect(result.length).to.be.equal(0);
  });

  it('Negative bid prices are not allowed', () => {
    const bid: Buyer[] = [{ demand: 3, price: -2, account: "speel" }];
    const sellers: Seller[] = [{ supply: 2, account: "cleth" }];
    const instance: Auction = new Auction(sellers, bid);

    const expectedTransaction: Transaction[] = [];
    const result = instance.auction();

    expect(result).to.deep.equal(expectedTransaction);
    expect(result.length).to.be.equal(0);
  });

  it('Negative energy demand are not allowed', () => { // passes, but not due to explicit input validation
    const bid: Buyer[] = [{ demand: -3, price: 2, account: "speel" }];
    const sellers: Seller[] = [{ supply: 2, account: "cleth" }];
    const instance: Auction = new Auction(sellers, bid);

    const expectedTransaction: Transaction[] = [];
    const result = instance.auction();

    expect(result).to.deep.equal(expectedTransaction);
    expect(result.length).to.be.equal(0);
  });
});

// Sorting
// Multiple bidders: 
  // Bidder pay correct price (avg of top 2 bids)
  // Demand is decreased correctly (in case of partially met demand)
  // Bidder is removed after demand is met


