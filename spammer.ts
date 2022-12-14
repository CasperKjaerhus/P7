function runExperiments() {
    experimentTpsPaper();
}

function experimentTpsPaper() {
    let sendRates: number[] = Array.range(10, 100, 10);
    sendRates.map(rate => sendTransactions(1, 100, rate));
    // Save signatures from send transactions
    // for each transaction, confirmtransaction and count +1 if true.
    // calculate percentage of sendrate that was written to the ledger
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomInteger(max) {
    return Math.floor(Math.random() * max) + 1;
}

function sendTransactions(minDelay, maxDelay, noTransactions) {
    let delayInterval = maxDelay - minDelay;
    let time = 0;
    for (let i = 0; i < noTransactions; i++) {
        let randomDelay = generateRandomInteger(delayInterval);
        let randomInstruction = generateRandomInteger(2);
        delay(minDelay + randomDelay).then(() => { executeInstruction(randomInstruction) });
        time += (minDelay + randomDelay);
    }
    delay(1000 - time).then(() => {  });
}

function executeInstruction(instructionNumber) {
    switch (instructionNumber) {
        case 0:
            // sendInjection()
            break;
        case 1:
            // sendBid()
        default:
            break;
    }
}
