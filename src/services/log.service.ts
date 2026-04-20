import { runCommand } from "../utils/exec";

/* ======================================================
   LOG SERVICE
   - Fetches WireGuard container logs
   - Used for dashboard debugging and monitoring
====================================================== */

/**
 * Get latest WireGuard Docker logs
 * - Returns last 100 log lines
 * - Used in logs dashboard page
 */
export async function getLogs(): Promise<string> {
  return runCommand("docker logs wireguard --tail 100");
}