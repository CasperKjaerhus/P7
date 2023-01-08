import { Auction, Buyer, Seller, Transaction } from '../src/auction';
import { expect } from 'chai';
import { describe } from 'mocha';

describe('Single Bids', () => {
  const testCases = [
    {
      title: "Excess supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 4, account: "cleth" }],
      expected: {
        transactions: [{sellerKey: "cleth", buyerKey: "speel", energy: 3, price: 2}],
        length: 1
      }
    }, 
    {
      title: "Excess demand",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [{sellerKey: "cleth", buyerKey: "speel", energy: 2, price: 2}],
        length: 1
      }
    }
  ]

  testCases.forEach((data) => {
    it("Single Bid: " + data.title, () => {
      const instance: Auction = new Auction(data.sellers, data.bid)

      const result = instance.auction();

      expect(result).to.deep.equal(data.expected.transactions);
      expect(result.length).to.be.equal(data.expected.length);
    })
  })
});
  

describe('Multiple Bids', () => {
  const testCases = [
    {
      title: "Single Seller, Excess Demand",
      bid: [
            { demand: 3, price: 2, account: "speel" }, 
            { demand: 6, price: 3, account:"Kleander"}
      ],
      sellers: [{supply: 7, account: "Cleth"}],
      expected: {
        transactions: [
                      {sellerKey: "Cleth", buyerKey: "Kleander", energy: 6, price: 2}, 
                      {sellerKey: "Cleth", buyerKey: "speel", energy: 1, price: 2}
        ],
        length: 2
      }
    },
    {
      title: "Multiple Sellers, Excess Demand",
      bid: [
            { demand: 6, price: 5, account: "speel" }, 
            { demand: 8, price: 8, account: "Kleander"}
      ],
      sellers: [
                {supply: 7, account: "Cleth"},
                {supply: 6, account: "Dion"}
      ],
      expected: {
        transactions: [
                      {sellerKey: "Cleth", buyerKey: "Kleander", energy: 7, price: 5}, 
                      {sellerKey: "Dion", buyerKey: "Kleander", energy: 1, price: 5},
                      {sellerKey: "Dion", buyerKey: "speel", energy: 5, price: 5}
        ],
        length: 3
      }
    },
    {
      title: "Single Seller, Excess Supply",
      bid: [
            { demand: 3, price: 2, account: "speel" }, 
            { demand: 3, price: 3, account:"Kleander"}
      ],
      sellers: [{supply: 7, account: "Cleth"}],
      expected: {
        transactions: [
                      {sellerKey: "Cleth", buyerKey: "Kleander", energy: 3, price: 2}, 
                      {sellerKey: "Cleth", buyerKey: "speel", energy: 3, price: 2}
        ],
        length: 2
      }
    },
    {
      title: "Multiple Sellers, Excess Supply",
      bid: [
            { demand: 6, price: 5, account: "speel" }, 
            { demand: 4, price: 8, account: "Kleander"}
      ],
      sellers: [
                {supply: 7, account: "Cleth"},
                {supply: 6, account: "Dion"}
      ],
      expected: {
        transactions: [
                      {sellerKey: "Cleth", buyerKey: "Kleander", energy: 4, price: 5}, 
                      {sellerKey: "Dion", buyerKey: "speel", energy: 6, price: 5}
        ],
        length: 2
      }
    },
  ]

  testCases.forEach((data) => {
    it("Multiple Bidders: " + data.title, () => {
      const instance: Auction = new Auction(data.sellers, data.bid)

      const result = instance.auction();

      expect(result).to.deep.equal(data.expected.transactions);
      expect(result.length).to.be.equal(data.expected.length);
    })
  })
});

describe('Input Validation', () => {
  const testCases = [
    {
      title: "Negative demand",
      bid: [{ demand: -3, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Negative price", 
      bid: [{ demand: 3, price: -2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Negative supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Decimal demand",
      bid: [{ demand: 3.2, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Decimal price",
      bid: [{ demand: 3, price: 2.3, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Decimal supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 2.6, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Demand = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Price = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Supply = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 0, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "No bid",
      bid: [],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "No seller",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [],
      expected: {
        transactions: [],
        length: 0
      }
    }
  ]
  
  testCases.forEach((data) => {
    it("Invalid Input: " + data.title, () => {
      const instance: Auction = new Auction(data.sellers, data.bid)

      const result = instance.auction();

      expect(result).to.deep.equal(data.expected.transactions);
      expect(result.length).to.be.equal(data.expected.length);
    })
  })
});
