import { Auction, Buyer, Seller, Transaction } from '../src/auction';
import { expect } from 'chai';
import {describe} from 'mocha';

describe('Auction tests', () => {
  const testCases= [
    {
      title: "Single bid, Excess supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 4, account: "cleth" }],
      expected: {
        transactions: [{sellerKey: "cleth", buyerKey: "speel", energy: 3, price: 2}],
        length: 1
      }
    }, 
    {
      title: "Single bid, Excess demand",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [{sellerKey: "cleth", buyerKey: "speel", energy: 2, price: 2}],
        length: 1
      }
    },
    {
      title: "Invalid input, negative demand",
      bid: [{ demand: -3, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, negative price",
      bid: [{ demand: 3, price: -2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, negative supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, decimal demand",
      bid: [{ demand: 3.2, price: 2, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, decimal price",
      bid: [{ demand: 3, price: 2.3, account: "speel" }],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, decimal supply",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 2.6, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, demand = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, price = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: -2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, supply = 0",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [{ supply: 0, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, no bid",
      bid: [],
      sellers: [{ supply: 2, account: "cleth" }],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Invalid input, no seller",
      bid: [{ demand: 3, price: 2, account: "speel" }],
      sellers: [],
      expected: {
        transactions: [],
        length: 0
      }
    },
    {
      title: "Multiple Bidders, Single Seller, Excess Demand",
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
      title: "Multiple Bidders, Multiple Sellers, Excess Demand",
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
      title: "Multiple Bidders, Single Seller, Excess Supply",
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
      title: "Multiple Bidders, Multiple Sellers, Excess Supply",
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
    it(data.title, () => {
      const instance: Auction = new Auction(data.sellers, data.bid)

      const result = instance.auction();

      expect(result).to.deep.equal(data.expected.transactions);
      expect(result.length).to.be.equal(data.expected.length);
    })
  })
});
