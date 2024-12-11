import mongoose from "mongoose";
import { Pool } from "pg";

// MongoDB schema
const mongoSchema = new mongoose.Schema({
  telegramID: { type: String, required: true },
  encryptedSCK: { type: String, required: true },
});
const MongoModel = mongoose.model("UserSCK", mongoSchema);

export const saveToMongoDB = async ({
  telegramID,
  encryptedSCK,
}: {
  telegramID: string;
  encryptedSCK: string;
}) => {
  const document = new MongoModel({ telegramID, encryptedSCK });
  await document.save();
};

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

const createTableIfNotExists = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(255) NOT NULL UNIQUE,
        telegram_handle VARCHAR(255),
        mobile VARCHAR(50),
        email VARCHAR(255),
        public_key TEXT NOT NULL,
        encrypted_private_key TEXT NOT NULL,
        salt TEXT NOT NULL,
        iv TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(query);
    console.log("Users table ensured to exist.");
    client.release();
  } catch (err) {
    console.error("Error ensuring users table exists:", err);
    throw err;
  }
};

createTableIfNotExists();

// Save encrypted SCK to PostgreSQL
export const saveToPostgres = async ({
  telegramID,
  telegramHandle,
  mobile,
  email,
  publicKey,
  encryptedPrivateKey,
  salt,
  iv,
}: {
  telegramID: string;
  telegramHandle: string;
  mobile: string;
  email: string;
  publicKey: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
}) => {
  const client = await pool.connect();

  try {
    // SQL query to insert the data into the PostgreSQL database
    const query = `
        INSERT INTO users (telegram_id, telegram_handle, mobile, email, public_key, encrypted_private_key, salt, iv)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
    const values = [
      telegramID,
      telegramHandle,
      mobile,
      email,
      publicKey,
      encryptedPrivateKey,
      salt,
      iv,
    ];
    await client.query(query, values);

    console.log("Data saved to PostgreSQL successfully");
  } catch (err) {
    console.error("Error saving data to PostgreSQL:", err);
    throw new Error("Failed to save data to PostgreSQL.");
  } finally {
    client.release();
  }
};
