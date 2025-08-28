import { Router } from "express";
import jwtAuth from "../middleware/jwtAuth.js";

const router = Router();

// Telco billing providers
const TELCO_PROVIDERS = {
  vodacom: {
    name: "Vodacom",
    billingEndpoint: "https://api.vodacom.co.za/billing/v1/",
    rate: 1.5,
    currency: "ZAR"
  },
  mtn: {
    name: "MTN",
    billingEndpoint: "https://api.mtn.com/billing/",
    rate: 1.4,
    currency: "ZAR"
  },
  airtel: {
    name: "Airtel",
    billingEndpoint: "https://api.airtel.com/billing/",
    rate: 1.3,
    currency: "ZAR"
  }
};

router.post("/bill", jwtAuth, (req, res) => {
  const { serviceId, provider = "vodacom" } = req.body;
  const msisdn = req.user.msisdn;
  
  const telco = TELCO_PROVIDERS[provider];
  if (!telco) {
    return res.status(400).json({ message: "Invalid telco provider" });
  }

  // Simulate billing process
  const billingResult = {
    success: Math.random() > 0.1, // 90% success rate
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: telco.rate,
    currency: telco.currency,
    provider: telco.name,
    msisdn: msisdn,
    timestamp: new Date().toISOString()
  };

  if (billingResult.success) {
    res.json({
      message: "Billing successful",
      ...billingResult
    });
  } else {
    res.status(402).json({
      message: "Billing failed - insufficient funds",
      ...billingResult
    });
  }
});

// Get available telco providers
router.get("/providers", jwtAuth, (req, res) => {
  res.json({
    providers: Object.keys(TELCO_PROVIDERS).map(key => ({
      id: key,
      name: TELCO_PROVIDERS[key].name,
      rate: TELCO_PROVIDERS[key].rate,
      currency: TELCO_PROVIDERS[key].currency
    }))
  });
});

export default router;