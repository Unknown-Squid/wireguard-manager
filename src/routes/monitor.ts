import { Router } from "express";
import { getPeerStatus } from "../services/wg.monitor";

const router = Router();

/* ======================================================
   GET PEER STATUS
   - Returns WireGuard peer handshake + traffic data
   - Used for real-time dashboard monitoring
====================================================== */

router.get("/status", async (req, res) => {
  try {
    const data = await getPeerStatus();

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Failed to fetch peer status",
    });
  }
});

export default router;