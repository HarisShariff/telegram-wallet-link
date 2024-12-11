// src/routes/walletRoutes.ts
import { Router } from "express";
import {
  createWalletController,
  transferController,
} from "../controllers/walletController";
import { checkBalanceController } from "../controllers/balanceController";

const router = Router();

// Define routes
router.post("/create", createWalletController);

router.post("/transfer", transferController);

router.get("/balance", checkBalanceController);

export default router;
