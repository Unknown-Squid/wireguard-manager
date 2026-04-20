import { Router } from "express";
import { getLogs } from "../services/log.service";

const router = Router();

/* ======================================================
   LOGS PAGE ROUTE
   - Fetches WireGuard Docker logs
   - Renders logs page (EJS)
   - Used for debugging + monitoring
====================================================== */

router.get("/", async (req, res) => {
  try {
    /* ======================================================
       FETCH LOGS FROM SERVICE
    ====================================================== */

    const logs = await getLogs();

    /* ======================================================
       RENDER SUCCESS VIEW
    ====================================================== */

    return res.render("logs", { logs });
  } catch (err: any) {
    /* ======================================================
       ERROR HANDLING
       - Prevents crash
       - Shows fallback message in UI
    ====================================================== */

    console.error("[LOGS ERROR]", err);

    return res.render("logs", {
      logs: "Error loading logs",
    });
  }
});

export default router;