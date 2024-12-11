import { Wallet, parseEther, JsonRpcProvider } from "ethers";

if (!process.env.HARDHAT_RPC_URL) {
  throw new Error("HARDHAT_RPC_URL is not set in the environment");
}

console.log("Using HARDHAT_RPC_URL:", process.env.HARDHAT_RPC_URL);

const provider = new JsonRpcProvider(process.env.HARDHAT_RPC_URL);

export const transferHardhatFunds = async (
  senderPrivateKey: string,
  recipientAddress: string,
  amount: number
) => {
  try {
    // Create a wallet for the sender using the private key and provider
    const senderWallet = new Wallet(senderPrivateKey, provider);

    // Build the transaction
    const tx = {
      to: recipientAddress,
      value: parseEther(amount.toString()), // Convert amount to Wei
      gasLimit: 21000, // Standard gas limit for ETH transfers
    };

    // Send the transaction
    const transaction = await senderWallet.sendTransaction(tx);
    await transaction.wait(); // Wait for the transaction to be mined

    console.log("Transaction successful:", transaction);
    return transaction;
  } catch (error) {
    console.error("Error transferring funds on Hardhat blockchain:", error);
    throw error;
  }
};
