import { Router } from "express";

const router = Router();

export const TRANSACTIONS = []; // in-memory transactions

router.get("/", (req, res) => {
  res.json({ transactions: TRANSACTIONS });
});

export default router;
