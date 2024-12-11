import { Request, Response } from "express";
import { transferHardhatFunds } from "../services/hardhatTransferService";

export const hardhatTransferController = async (
  req: Request,
  res: Response
) => {
  try {
    const { senderPrivateKey, recipientAddress, amount } = req.body;

    if (!senderPrivateKey || !recipientAddress || !amount) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const transaction = await transferHardhatFunds(
      senderPrivateKey,
      recipientAddress,
      amount
    );

    res.status(200).json({
      message: "Transfer successful",
      transactionHash: transaction.hash,
    });
  } catch (error) {
    console.error("Error in hardhatTransferController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
