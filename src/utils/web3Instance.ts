import Web3 from "web3";

if (!process.env.HARDHAT_RPC_URL) {
  throw new Error("HARDHAT_RPC_URL is not set in the environment");
}

// Initialize Web3 with the provider
const web3 = new Web3(process.env.HARDHAT_RPC_URL);

export default web3;
