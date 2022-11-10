# Instructions

To setup the project, use docker compose. (This can take a while)
```
docker compose up -d --build
```

Once you have the docker container up and running, you can use [Solana Explorer](https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899) to look at statistics and check addresses. It should already be configured to use localhost, but if it is not working you can change the URL in the top right menu.

Now run ``anchor build`` inside the container like so: 
```
docker exec -it solana-smart-contract-solana-1 anchor build
```
Once this is done, we need to extract the key that the smart contract has assigned itself and put it into the rust program. Use `anchor keys list` to list the smart contract keys.
```
docker exec it solana-smart-contract-solana-1 anchor keys list
```
Copy the key associated with the smart contract from that list and paste it into the rust macro at the top of `./solana/energy-trading/programs/<tic-tac-toe>/src/lib.rs`

Once this is done, run `anchor build` again:
```
docker exec -it solana-smart-contract-solana-1 anchor build
```

After, you can deploy the smart contract using `anchor deploy`.
```
docker exec -it solana-smart-contract-solana-1 anchor deploy
```

# Program structure

- The .anchor folder: It includes the most recent program logs and a local ledger that is used for testing

- The app folder: An empty folder that you can use to hold your frontend if you use a monorepo

- The programs folder: This folder contains your programs. It can contain multiple but initially only contains a program with the same name as <new-workspace-name>. This program already contains a lib.rs file with some sample code.

- The tests folder: The folder that contains your E2E tests. It will already include a file that tests the sample code in the programs/<new-workspace-name>.

- The migrations folder: In this folder you can save your deploy and migration scripts for your programs.
- The Anchor.toml file: This file configures workspace wide settings for your programs. Initially, it configures

    - The addresses of your programs on localnet ([programs.localnet])
    - A registry your program can be pushed to ([registry])
    - A provider which can be used in your tests ([provider])
    - Scripts that Anchor executes for you ([scripts]). The test script is run when running anchor test. You can run your own scripts with anchor run <script_name>.


    