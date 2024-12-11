import app from "./app";
import mongoose from "mongoose";
import web3 from "./utils/web3Instance";

const PORT = process.env.PORT || 3000;

// MongoDB connection setup
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/telegram-wallet";

mongoose.connect(mongoUri, {
  connectTimeoutMS: 10000, // Adjust timeout if needed
} as mongoose.ConnectOptions); // Explicitly cast to ConnectOptions to avoid type errors

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost");
});

// Function to verify Web3 connection
const testWeb3Connection = async () => {
  try {
    const clientVersion = await web3.eth.getNodeInfo();
  } catch (error) {
    console.error("Error connecting to blockchain:", error);
    throw new Error(
      "Failed to connect to blockchain. Ensure Ganache or RPC is running."
    );
  }
};

app.listen(PORT, () => {
  testWeb3Connection();
  console.log(`KMS service is running on port ${PORT}`);
});
