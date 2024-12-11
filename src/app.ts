import express, { Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import walletRoute from "./routes/walletRoute";
import hardhatRoutes from "./routes/hardhatRoutes";

const app: Application = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/v1/wallet", walletRoute);
app.use("/api/v1/hardhat", hardhatRoutes);

app.get("/health", (req, res) => {
  res.send("Welcome to the Key Management System (KMS)");
});

export default app;
