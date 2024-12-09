// src/routes/walletRoutes.ts
import { Router } from "express";
import { createWalletController } from "../controllers/walletController";

const router = Router();

// Define routes
router.post("/create", createWalletController);

export default router;
