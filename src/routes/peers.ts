import { Router } from "express";
import { WireGuardService } from "../services/wireguard.service";
import { listPeers } from "../services/peer.parser";
import { deletePeer } from "../services/peer.service";
import { regenerateConfig } from "../services/reset.service";
import { rebuildConfig } from "../services/config.builder";

const router = Router();

/* ======================================================
   CREATE PEER
====================================================== */

router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Invalid peer name" });
    }

    const peer = await WireGuardService.createPeer(name);

    return res.json(peer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   LIST ALL PEERS
====================================================== */

router.get("/", (req, res) => {
  try {
    const peers = listPeers();
    return res.json(peers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   REGENERATE CONFIG
====================================================== */

router.post("/regenerate", (req, res) => {
  try {
    regenerateConfig();

    return res.json({
      message: "Config regenerated successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/config/:ip", (req, res) => {
  try {
    const ip = decodeURIComponent(req.params.ip);

    const peers = listPeers();
    const peer = peers.find(p => p.ip === ip);

    if (!peer) {
      return res.status(404).send("Peer not found");
    }

    const config = `
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = ${peer.ip}/24
DNS = 1.1.1.1

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = localhost:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${peer.name}.conf`
    );

    res.send(config.trim());
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
});

/* ======================================================
   DELETE PEER
====================================================== */

router.delete("/:ip", (req, res) => {
  try {
    const ip = decodeURIComponent(req.params.ip);

    if (!ip) {
      return res.status(400).json({ error: "IP is required" });
    }

    const updated = deletePeer(ip);

    return res.json({
      message: "Peer deleted successfully",
      peers: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:ip", (req, res) => {
  const { name } = req.body;

  const peers = listPeers();

  const updated = peers.map(p => {
    if (p.ip === req.params.ip) {
      return { ...p, name };
    }
    return p;
  });

  rebuildConfig(updated);

  res.json({ message: "Peer updated" });
});

export default router;