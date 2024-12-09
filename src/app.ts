import express, { Application } from "express";

const app: Application = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Key Management System (KMS)");
});

export default app;
