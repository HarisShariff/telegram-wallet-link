import { Request, Response } from "express";
import { createWallet } from "../services/walletService";

export const createWalletController = async (req: Request, res: Response) => {
  try {
    const { passwordHash } = req.body;

    if (!passwordHash) {
      res.status(400).json({ error: "Password hash is required" });
      return;
    }

    // Call the service layer to create the wallet
    const walletData = await createWallet(passwordHash);

    res.status(201).json(walletData);
    return;
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
