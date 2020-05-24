"use strict";

const ethers = require('ethers');
const fs = require('fs');



let configFile = process.argv[2];
if (!configFile) throw('need configFile');
let cmd = process.argv[3];
if (!cmd) throw('need cmd');


let config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

if (!config.privKey) throw("no privkey added");


if (cmd === 'deploy') {
    deploy();
} else {
    throw("unrecognized command: " + cmd);
}



async function deploy() {
    let wallet = new ethers.Wallet(config.privKey);
    let provider = new ethers.providers.JsonRpcProvider();
    wallet = wallet.connect(provider);

    let nonce = await provider.getTransactionCount(wallet.address);
    if (nonce !== 0) throw(`nonce for address ${wallet.address} was ${nonce}, not 0`);

    let contracts = loadContracts();

    let factory = new ethers.ContractFactory(contracts.defido2Abi, contracts.defido2Bin, wallet);
    let defido2Contract = await factory.deploy({ gasLimit: 6000000, });
    console.log(defido2Contract.address);
}




/////////

function loadContracts() {
    let contracts = {};

    let defido2Spec = require('./build/Defido2.json');
    contracts.defido2Abi = JSON.parse(defido2Spec.contracts['contracts/Defido2.sol:Defido2'].abi);
    contracts.defido2Bin = defido2Spec.contracts['contracts/Defido2.sol:Defido2'].bin;

    return contracts;
}

function computeContractAddress(addr) {
    // Assumes nonce of address is 0
    let hash = ethers.utils.keccak256(ethers.utils.concat(['0xd694', ethers.utils.padZeros(addr, 20), "0x80"]));
    return ethers.utils.getAddress('0x' + hash.substr(26));
}