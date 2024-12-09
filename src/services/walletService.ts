import Web3 from "web3";
import crypto from "crypto";
import argon2 from "argon2";

const rawKmsPublicKey = process.env.KMS_PUBLIC_KEY || "public_key";
const KMS_PUBLIC_KEY = rawKmsPublicKey.replace(/\\n/g, "\n"); // Replace \n with actual newlines
console.log(KMS_PUBLIC_KEY);

const web3 = new Web3();

export const createWallet = async (password: string) => {
  try {
    // Step 1: Generate a unique salt for the user
    const salt = crypto.randomBytes(16);

    // Step 2: Derive SCK using Argon2 with raw output
    const sck = await argon2.hash(password, {
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

    // Step 6: Simulate saving to database
    console.log("Saving to DB:");
    console.log(`Address: ${account.address}`);
    console.log(`Encrypted Private Key: ${encryptedPrivateKey}`);
    console.log(`Encrypted SCK: ${encryptedSCK}`);
    console.log(`Salt: ${salt.toString("hex")}`);
    console.log(`IV: ${iv.toString("hex")}`);

    return {
      address: account.address,
      message: "Wallet created successfully",
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet.");
  }
};
