import Web3 from "web3";
import crypto, { hash } from "crypto";
import argon2 from "argon2";
import { saveToMongoDB, saveToPostgres } from "../utils/databaseUtils";
import {
  getWalletByTelegramID,
  getWalletByTelegramHandle,
  performTransfer,
} from "../utils/walletUtils";
import web3 from "../utils/web3Instance";

const rawKmsPublicKey = process.env.KMS_PUBLIC_KEY || "public_key";
const KMS_PUBLIC_KEY = rawKmsPublicKey.replace(/\\n/g, "\n"); // Replace \n with actual newlines
console.log(KMS_PUBLIC_KEY);

export const createWallet = async ({
  passwordHash,
  telegramID,
  telegramHandle,
  mobile,
  email,
}: {
  passwordHash: string;
  telegramID: string;
  telegramHandle: string;
  mobile: string;
  email: string;
}) => {
  try {
    // Step 1: Generate a unique salt for the user
    const salt = crypto.randomBytes(16);

    // Step 2: Derive SCK using Argon2 with raw output
    const sck = await argon2.hash(passwordHash, {
      type: argon2.argon2id,
      salt,
      memoryCost: 2 ** 16, // 64 MB of memory
      timeCost: 3, // 3 iterations
      parallelism: 1, // Single thread
      hashLength: 32, // 256-bit key
      raw: true, // Return raw buffer instead of encoded string
    });

    // Step 3: Generate a new Ethereum wallet
    const account = web3.eth.accounts.create();

    // Step 4: Encrypt the private key using the derived SCK
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv("aes-256-cbc", sck, iv);
    let encryptedPrivateKey = cipher.update(account.privateKey, "utf8", "hex");
    encryptedPrivateKey += cipher.final("hex");

    // Step 5: Encrypt the SCK with the KMS public key
    const encryptedSCK = crypto
      .publicEncrypt(KMS_PUBLIC_KEY, sck)
      .toString("hex");

    // Step 6: Save encrypted SCK to MongoDB
    await saveToMongoDB({ telegramID, encryptedSCK });

    // Step 7: Save user information to PostgreSQL
    await saveToPostgres({
      telegramID,
      telegramHandle,
      mobile,
      email,
      publicKey: account.address,
      encryptedPrivateKey,
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
    });

    console.log("Data saved successfully to MongoDB and PostgreSQL");

    return {
      address: account.address,
      message: "Wallet created successfully",
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet.");
  }
};

export const checkFunds = async (
  telegramID: string,
  amount: number,
  currency: string
) => {
  // Fetch wallet details from the database to get the public key (address)
  const wallet = await getWalletByTelegramID(telegramID);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const walletAddress = wallet.public_key;

  // Check balance on the blockchain
  const balanceWei = await web3.eth.getBalance(walletAddress);
  const balanceEther = web3.utils.fromWei(balanceWei, "ether");

  console.log(`Balance for ${walletAddress}: ${balanceEther} ${currency}`);

  // Ensure enough balance for the transaction
  return parseFloat(balanceEther) >= amount;
};

export const getWalletAddress = async (telegramHandle: string) => {
  const wallet = await getWalletByTelegramHandle(telegramHandle);
  return wallet ? wallet.public_key : null;
};

export const transferFunds = async (
  senderTelegramID: string,
  recipientWalletAddress: string,
  amount: number,
  currency: string,
  hashedPassword: string
) => {
  try {
    const transferResult = await performTransfer(
      senderTelegramID,
      recipientWalletAddress,
      amount,
      currency,
      hashedPassword
    );
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error transferring funds:", error);
      return { success: false, error: error.message };
    } else {
      return { success: false, error: "server error" };
    }
  }
};
