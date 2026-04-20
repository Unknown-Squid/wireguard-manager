import fs from "fs";
import path from "path";

/* ======================================================
   CONFIG PATH
====================================================== */

const WG_CONFIG_PATH = path.join(
  __dirname,
  "../../config/wg_confs/wg0.conf"
);

/* ======================================================
   PEER TYPE
====================================================== */

export type Peer = {
  name: string;
  publicKey: string;
  ip: string;
};

/* ======================================================
   LIST PEERS FROM WIREGUARD CONFIG
   - Robust parser for wg0.conf
   - Avoids fragile split logic
====================================================== */

export function listPeers(): Peer[] {
  const config = fs.readFileSync(WG_CONFIG_PATH, "utf8");

  const peers: Peer[] = [];

  /* ======================================================
     MATCH EACH PEER BLOCK SAFELY
     - Captures:
       # name
       PublicKey = ...
       AllowedIPs = ...
  ====================================================== */

  const peerRegex =
    /#\s*(.+)\s*\n\[Peer\][\s\S]*?PublicKey\s*=\s*(.+)\s*[\s\S]*?AllowedIPs\s*=\s*(10\.13\.13\.\d+)/g;

  let match: RegExpExecArray | null;

  while ((match = peerRegex.exec(config)) !== null) {
    const [, name, publicKey, ip] = match;

    if (!name || !publicKey || !ip) continue;

    peers.push({
      name: name.trim(),
      publicKey: publicKey.trim(),
      ip: ip.trim(),
    });
  }

  return peers;
}