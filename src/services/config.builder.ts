import fs from "fs";
import path from "path";
import { Peer } from "./peer.parser";

/* ======================================================
   CONFIG PATH
====================================================== */

const WG_CONFIG_PATH = path.join(
  __dirname,
  "../../config/wg_confs/wg0.conf"
);

/* ======================================================
   SERVER CONFIG BLOCK
====================================================== */

const SERVER_BLOCK = `
[Interface]
Address = 10.13.13.1/24
ListenPort = 51820
PrivateKey = SERVER_PRIVATE_KEY
`;

/* ======================================================
   REBUILD WIREGUARD CONFIG
   - Source of truth: Peer[]
   - Fully regenerates wg0.conf
====================================================== */

export function rebuildConfig(peers: Peer[]) {
  let config = SERVER_BLOCK.trim() + "\n\n";

  /* ======================================================
     BUILD PEER BLOCKS
  ====================================================== */

  for (const peer of peers) {
    if (!peer.publicKey || !peer.ip) continue;

    config += `
# ${peer.name}
[Peer]
PublicKey = ${peer.publicKey}
AllowedIPs = ${peer.ip}/32
`.trim() + "\n\n";
  }

  /* ======================================================
     WRITE FINAL CONFIG
  ====================================================== */

  fs.writeFileSync(WG_CONFIG_PATH, config.trim());
}