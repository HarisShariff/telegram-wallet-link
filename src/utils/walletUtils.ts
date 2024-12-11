import { Pool } from "pg";
import web3 from "./web3Instance";
import argon2 from "argon2";
import crypto from "crypto";

// Database pool for PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

export const getWalletByTelegramID = async (telegramID: string) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE telegram_id = $1",
      [telegramID]
    );

    // Log the result for debugging
    console.log("Database query result:", JSON.stringify(result.rows, null, 2));

    // Return the first row if it exists
    return result.rows[0];
  } finally {
    client.release();
  }
};

// Fetch wallet by Telegram handle
export const getWalletByTelegramHandle = async (telegramHandle: string) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE telegram_handle = $1",
      [telegramHandle]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const performTransfer = async (
  senderTelegramID: string,
  recipientWalletAddress: string,
  amount: number,
  currency: string,
  hashedPassword: string
) => {
  try {
    // Fetch sender wallet details from DB
    const senderWallet = await getWalletByTelegramID(senderTelegramID);
    if (!senderWallet) {
      throw new Error("Sender wallet not found");
    }

    // Derive the SCK using the hashedPassword and wallet salt
    const sck = await argon2.hash(hashedPassword, {
      type: argon2.argon2id,
      salt: Buffer.from(senderWallet.salt, "hex"),
      memoryCost: 2 ** 16, // 64 MB of memory
      timeCost: 3, // 3 iterations
      parallelism: 1, // Single thread
      hashLength: 32, // 256-bit key
      raw: true, // Return raw buffer instead of encoded string
    });

    console.log(sck);

    // Decrypt sender's private key (this should match your encryption setup)
    const senderPrivateKey = decryptPrivateKey(
      senderWallet.encrypted_private_key,
      sck,
      senderWallet.iv
    );

    // Create a Web3 account instance for the sender
    const senderWalletInstance =
      web3.eth.accounts.privateKeyToAccount(senderPrivateKey);

    // Fetch nonce for the sender's public key
    const nonce = await web3.eth.getTransactionCount(senderWallet.public_key);
    console.log("Nonce for the sender address:", nonce);

    // Build the transaction
    const transaction = {
      to: recipientWalletAddress,
      value: web3.utils.toWei(amount.toString(), "ether"), // Convert to Wei
      gas: 21000, // Standard gas limit for ETH transfers
      gasPrice: web3.utils.toWei("10", "gwei"), // Default gas price for testing
      nonce,
    };

    // Sign the transaction
    const signedTransaction = await senderWalletInstance.signTransaction(
      transaction
    );

    // Send the transaction
    const receipt = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction!
    );

    console.log(`Transaction successful: ${receipt.transactionHash}`);
    return {
      success: true,
      receipt,
    };
  } catch (error) {
    console.error("Error in performTransfer:", error);
    throw new Error("Transfer failed.");
  }
};

// Utility function to decrypt private key
const decryptPrivateKey = (
  encrypted_private_key: string,
  sck: Buffer,
  iv: string
): string => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    sck,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted_private_key, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
