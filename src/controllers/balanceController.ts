import { Request, Response } from "express";
import web3 from "../utils/web3Instance";

export const checkBalanceController = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: "Wallet address is required" });
      return;
    }

    // Check if the address is valid
    if (!web3.utils.isAddress(walletAddress)) {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }

    // Get the balance
    const balanceWei = await web3.eth.getBalance(walletAddress);
    const balanceEther = web3.utils.fromWei(balanceWei, "ether");

    res.status(200).json({ walletAddress, balance: `${balanceEther} ETH` });
  } catch (error) {
    console.error("Error checking wallet balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
