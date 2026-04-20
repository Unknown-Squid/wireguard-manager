import { Router } from "express";
import { WireGuardService } from "../services/wireguard.service";

const router = Router();

/* ======================================================
   DASHBOARD ROUTE
   - Renders WireGuard status in EJS dashboard
   - Entry point of admin UI
====================================================== */

router.get("/", async (req, res) => {
  try {
    const status = await WireGuardService.getStatus();

    return res.render("dashboard", {
      status,
    });
  } catch (err: any) {
    console.error("[DASHBOARD ERROR]", err);

    return res.render("dashboard", {
      status: "Error loading status",
    });
  }
});

export default router;