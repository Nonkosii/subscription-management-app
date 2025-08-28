import { Router } from "express";
import jwtAuth from "../middleware/jwtAuth.js";
import { TRANSACTIONS } from "./transactions.js";
import { SERVICES } from "./services.js";

const router = Router();
const userSubscriptions = {};

// Get current subscriptions
router.get("/", jwtAuth, (req, res) => {
  const msisdn = req.user.msisdn;
  const subscriptions = userSubscriptions[msisdn] || [];
  res.json({ subscriptions });
});

// Subscribe with Telco Billing
router.post("/", jwtAuth, async (req, res) => {
  const { serviceId, telcoProvider = "vodacom" } = req.body;
  const msisdn = req.user.msisdn;

  try {
    // Simulate telco billing (90% success rate)
    const billingSuccess = Math.random() > 0.1;
    
    if (!billingSuccess) {
      return res.status(402).json({ 
        message: "Subscription failed: Insufficient funds",
        billing: {
          success: false,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          provider: telcoProvider,
          amount: 1.5,
          currency: "ZAR"
        }
      });
    }

    // If billing successful, proceed with subscription
    if (!userSubscriptions[msisdn]) userSubscriptions[msisdn] = [];
    if (!userSubscriptions[msisdn].includes(serviceId)) {
      userSubscriptions[msisdn].push(serviceId);

      const service = SERVICES.find(s => s.id === serviceId);
      const billingResult = {
        success: true,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: telcoProvider,
        amount: 1.5,
        currency: "ZAR",
        timestamp: new Date().toISOString()
      };

      TRANSACTIONS.push({
        id: Date.now().toString(),
        service: service ? service.name : serviceId,
        type: "subscribe",
        date: new Date().toISOString(),
        user: msisdn,
        billing: billingResult
      });

      const io = req.app.get("io");
      io.emit("subscription-update", { user: msisdn, subscriptions: userSubscriptions[msisdn] });

      res.json({ 
        message: "Subscribed successfully", 
        subscriptions: userSubscriptions[msisdn],
        billing: billingResult
      });
    } else {
      res.status(400).json({ message: "Already subscribed to this service" });
    }

  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Subscription service unavailable" });
  }
});

// Unsubscribe
router.delete("/:serviceId", jwtAuth, (req, res) => {
  const msisdn = req.user.msisdn;
  const { serviceId } = req.params;

  if (userSubscriptions[msisdn]) {
    userSubscriptions[msisdn] = userSubscriptions[msisdn].filter(id => id !== serviceId);

    const service = SERVICES.find(s => s.id === serviceId);
    TRANSACTIONS.push({
      id: Date.now().toString(),
      service: service ? service.name : serviceId,
      type: "unsubscribe",
      date: new Date().toISOString(),
      user: msisdn
    });

    const io = req.app.get("io");
    io.emit("subscription-update", { user: msisdn, subscriptions: userSubscriptions[msisdn] });
  }

  res.json({ message: "Unsubscribed successfully", subscriptions: userSubscriptions[msisdn] || [] });
});

export default router;