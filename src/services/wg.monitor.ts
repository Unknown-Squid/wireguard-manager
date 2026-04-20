import { runCommand } from "../utils/exec";

/* ======================================================
   TYPES
====================================================== */

export type PeerStatus = {
  publicKey: string;
  endpoint?: string;
  ip: string;
  lastHandshake: string;
  rx: string;
  tx: string;
  active: boolean;
};

/* ======================================================
   HELPERS
====================================================== */

/**
 * Extract value from wg show block using regex
 */
function match(block: string, regex: RegExp): string | undefined {
  return block.match(regex)?.[1]?.trim();
}

/**
 * Convert WireGuard transfer output safely
 */
function parseTransfer(block: string) {
  const match = block.match(
    /transfer:\s*([\d.]+\s*\w+)\s*received,\s*([\d.]+\s*\w+)\s*sent/i
  );

  return {
    rx: match?.[1]?.trim() || "0",
    tx: match?.[2]?.trim() || "0",
  };
}

/**
 * Determine if peer is active
 * (simple but safer heuristic)
 */
function isActive(lastHandshake: string): boolean {
  if (!lastHandshake || lastHandshake === "never") return false;

  const text = lastHandshake.toLowerCase();

  // clearly dead connections
  if (text.includes("day")) return false;

  // anything with seconds/minutes is considered active
  if (text.includes("second")) return true;
  if (text.includes("minute")) return true;

  return false;
}

/* ======================================================
   MAIN PARSER
====================================================== */

export async function getPeerStatus(): Promise<PeerStatus[]> {
  const output = await runCommand("docker exec wireguard wg show");

  if (!output) return [];

  const blocks = output.split("peer:").slice(1);

  const peers: PeerStatus[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");

    const publicKey = lines[0]?.trim() || "";

    const ip = match(block, /allowed ips:\s*(.+)/i) || "";
    const endpoint = match(block, /endpoint:\s*(.+)/i);
    const lastHandshake = match(block, /latest handshake:\s*(.+)/i) || "never";

    const { rx, tx } = parseTransfer(block);

    peers.push({
      publicKey,
      endpoint,
      ip,
      lastHandshake,
      rx,
      tx,
      active: isActive(lastHandshake),
    });
  }

  return peers;
}