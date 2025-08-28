import { Router } from "express";
const router = Router();

export const SERVICES = [
  { id: "1", name: "Music Streaming" },
  { id: "2", name: "Video Streaming" },
  { id: "3", name: "Daily News" }
];

router.get("/", (req, res) => {
  res.json(SERVICES);
});

export default router;
