import { rebuildConfig } from "./config.builder";
import { listPeers } from "./peer.parser";

/* ======================================================
   CONFIG REGENERATION SERVICE
   - Rebuilds WireGuard config from current peer list
   - Source of truth: parsed peers (not file append)
====================================================== */

export function regenerateConfig(): void {
  /* ======================================================
     STEP 1: Load current peers from config parser
  ====================================================== */

  const peers = listPeers();

  /* ======================================================
     STEP 2: Rebuild full WireGuard config file
  ====================================================== */

  rebuildConfig(peers);
}