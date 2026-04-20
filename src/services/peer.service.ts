import { listPeers } from "./peer.parser";
import { rebuildConfig } from "./config.builder";

/* ======================================================
   DELETE PEER SERVICE
   - Removes a peer by IP
   - Rebuilds full WireGuard config after modification
====================================================== */

export function deletePeer(ip: string) {
  /* ======================================================
     STEP 1: Validate input
  ====================================================== */

  if (!ip || typeof ip !== "string") {
    throw new Error("Invalid IP address provided");
  }

  /* ======================================================
     STEP 2: Load current peers
  ====================================================== */

  const peers = listPeers();

  /* ======================================================
     STEP 3: Check if peer exists
  ====================================================== */

  const exists = peers.some((p) => p.ip === ip);

  if (!exists) {
    throw new Error(`Peer with IP ${ip} not found`);
  }

  /* ======================================================
     STEP 4: Filter out target peer
  ====================================================== */

  const updatedPeers = peers.filter((p) => p.ip !== ip);

  /* ======================================================
     STEP 5: Rebuild WireGuard config
  ====================================================== */

  rebuildConfig(updatedPeers);

  /* ======================================================
     RETURN UPDATED STATE
  ====================================================== */

  return updatedPeers;
}