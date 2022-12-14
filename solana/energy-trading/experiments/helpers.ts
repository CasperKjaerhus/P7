function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}

export function sendTransactions(noTransactions, accounts, signers) {
    let delayInterval = 10000/(sendRate-1);
    let time = 0;
    let randomInstruction;
    let randomDelay;

    for (let i = 0; i < noTransactions; i++) {
        randomDelay = generateRandomInteger(delayInterval);
        randomInstruction = generateRandomInteger(2);
        delay(randomDelay).then(() => { executeInstruction(randomInstruction, accounts, signers) });
        time += (minDelay + randomDelay);
    }
    delay(1000 - time).then(() => {  });
}

function executeInstruction(instructionNumber, accnts, signerAccs) {
    switch (instructionNumber) {
        case 0:
            await program.methods
                .sendBid(1, 10, 5, 1)
                .accounts({
                    bid: accnts[0],
                    consumer: signerAccs[0].publicKey,
                })
                .signers(signerAccs[0])
                .rpc();
            break;
        case 1:
            await program.methods
                .sendInjection(10)
                .accounts({
                    prosumer: signerAccs[1].publicKey,
                    smartPowerStorage: accnts[1],
                    energyTokenStorage: accnts[2],
                })
                .signers(signerAccs[1])
                .rpc();
        default:
            break;
    }
}
