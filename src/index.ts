import app from "./app";
import mongoose from "mongoose";

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

app.listen(PORT, () => {
  console.log(`KMS service is running on port ${PORT}`);
});
