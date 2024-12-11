import { Request, Response } from "express";
import { createWallet } from "../services/walletService";
import {
  checkFunds,
  getWalletAddress,
  transferFunds,
} from "../services/walletService";

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

export const transferController = async (req: Request, res: Response) => {
  try {
    const {
      senderTelegramID,
      recipientTelegramHandle,
      amount,
      currency,
      hashedPassword,
    } = req.body;

    // Step 1: Validate input
    if (
      !senderTelegramID ||
      !recipientTelegramHandle ||
      !amount ||
      !currency ||
      !hashedPassword
    ) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    // Step 2: Check sender funds
    const hasFunds = await checkFunds(senderTelegramID, amount, currency);
    if (!hasFunds) {
      res.status(400).json({ error: "Insufficient funds" });
      return;
    }

    // Step 3: Get recipient wallet address
    const recipientWalletAddress = await getWalletAddress(
      recipientTelegramHandle
    );
    if (!recipientWalletAddress) {
      res.status(404).json({ error: "Recipient wallet not found" });
      return;
    }

    // Step 4: Transfer funds
    const transferResult = await transferFunds(
      senderTelegramID,
      recipientWalletAddress,
      amount,
      currency,
      hashedPassword
    );

    if (transferResult.success) {
      res.status(200).json({ message: "Transfer successful" });
      return;
    } else {
      res.status(500).json({ error: transferResult.error });
      return;
    }
  } catch (error) {
    console.error("Error in transferController:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
