import fs from "fs";
import path from "path";
import { runCommand } from "../utils/exec";

/* ======================================================
   CONFIG
====================================================== */

const WG_CONFIG_PATH = path.join(
  __dirname,
  "../../config/wg_confs/wg0.conf"
);

const SERVER_ENDPOINT =
  process.env.WG_ENDPOINT || "192.168.1.10:51820";

/* ======================================================
   HELPERS
====================================================== */

/**
 * Read WireGuard config safely
 */
function readConfig(): string {
  return fs.readFileSync(WG_CONFIG_PATH, "utf8");
}

/**
 * Write WireGuard config safely
 */
function writeConfig(content: string) {
  fs.writeFileSync(WG_CONFIG_PATH, content.trim());
}

/**
 * Append peer block safely
 */
function appendPeerBlock(block: string) {
  fs.appendFileSync(WG_CONFIG_PATH, block);
}

/* ======================================================
   SERVER KEY FETCHER
====================================================== */

async function getServerPublicKey(): Promise<string> {
  const output = await runCommand("docker exec wireguard wg show");

  const match = output.match(/public key:\s*(.+)/i);

  if (!match) {
    throw new Error("Server public key not found");
  }

  return match[1].trim();
}

/* ======================================================
   KEY GENERATION
====================================================== */

async function generateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const privateKey = (await runCommand("wg genkey")).trim();

  const publicKey = (
    await runCommand(`echo "${privateKey}" | wg pubkey`)
  ).trim();

  if (!privateKey || !publicKey) {
    throw new Error("Key generation failed");
  }

  return { privateKey, publicKey };
}

/* ======================================================
   IP MANAGEMENT
====================================================== */

function getNextIP(): string {
  const config = readConfig();

  const matches = [
    ...config.matchAll(/AllowedIPs\s*=\s*10\.13\.13\.(\d+)/g),
  ];

  const used = new Set(
    matches.map((m) => Number(m[1])).filter(Boolean)
  );

  for (let i = 2; i < 255; i++) {
    if (!used.has(i)) return `10.13.13.${i}`;
  }

  throw new Error("No available IPs left in subnet");
}

/* ======================================================
   WIREGUARD SERVICE
====================================================== */

export class WireGuardService {
  /**
   * Create new peer
   */
  static async createPeer(name: string) {
    if (!name?.trim()) {
      throw new Error("Invalid peer name");
    }

    const serverPublicKey = await getServerPublicKey();
    const keys = await generateKeyPair();
    const ip = getNextIP();

    /* ======================================================
       SERVER SIDE PEER BLOCK
    ====================================================== */

    const peerBlock = `
# ${name.trim()}
[Peer]
PublicKey = ${keys.publicKey}
AllowedIPs = ${ip}/32
`;

    try {
      appendPeerBlock(peerBlock);
    } catch (err) {
      throw new Error("Failed to update WireGuard config");
    }

    /**
     * IMPORTANT:
     * Do NOT restart container every time in production
     * (use wg syncconf later for optimization)
     */
    await runCommand("docker restart wireguard");

    /* ======================================================
       CLIENT CONFIG
    ====================================================== */

    const clientConfig = `
[Interface]
PrivateKey = ${keys.privateKey}
Address = ${ip}/24
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${SERVER_ENDPOINT}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`.trim();

    return {
      name: name.trim(),
      ip,
      config: clientConfig,
    };
  }

  /* ======================================================
     RESTART SERVER
  ====================================================== */

  static async restart() {
    return runCommand("docker restart wireguard");
  }

  /* ======================================================
     LIVE STATUS
  ====================================================== */

  static async getStatus() {
    return runCommand("docker exec wireguard wg show");
  }

  /* ======================================================
     CONFIG DEBUG
  ====================================================== */

  static getConfigFile() {
    return readConfig();
  }
}