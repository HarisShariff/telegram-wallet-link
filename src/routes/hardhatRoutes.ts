// src/routes/walletRoutes.ts
import { Router } from "express";
import { hardhatTransferController } from "../controllers/hardhatTransferController";

const router = Router();

router.post("/hardhat-transfer", hardhatTransferController);

export default router;
