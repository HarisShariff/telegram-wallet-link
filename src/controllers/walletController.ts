import { Request, Response } from "express";
import { createWallet } from "../services/walletService";

export const createWalletController = async (req: Request, res: Response) => {
  try {
    const { passwordHash, telegramID, telegramHandle, mobile, email } =
      req.body;

    if (!passwordHash || !telegramID || !telegramHandle || !mobile || !email) {
      res.status(400).json({
        error:
          "All fields are required: passwordHash, telegramID, telegramHandle, mobile, email",
      });
      return;
    }

    // Call the service layer to create the wallet
    const walletData = await createWallet({
      passwordHash,
      telegramID,
      telegramHandle,
      mobile,
      email,
    });

    res.status(201).json(walletData);
    return;
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
