data Buyer = Buyer Demand Price Account 
data Seller = Seller Supply Account 
data Transaction = Trans Buyer Seller

newtype Demand = D Float
    deriving Eq
newtype Supply = S Float 
    deriving Eq
newtype Price = P Float
newtype Account = A String 


-- Sellers, Buyers
match :: [Buyer] -> [Seller] -> [Transaction]
match [] _ = []
match _ [] = []
match ((Buyer (D d) p a1):xs) ((Seller (S s) a2):ys) | s > d = Trans (Buyer (D d) p a1) (Seller (S s) a2) : match xs ys 


