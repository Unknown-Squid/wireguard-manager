import express from "express";
import { exec } from "child_process";
import path from "path";
import session from "express-session";

import peersRoute from "../src/routes/peers";
import authRoutes from "./routes/auth";
import monitorRoutes from "./routes/monitor";
import logsRoutes from "./routes/logs";
import { requireAuth } from "./middleware/auth";

const app = express();

/* ======================================================
   MIDDLEWARE SETUP
====================================================== */

// Parse JSON + form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management (for login auth)
app.use(
  session({
    secret: "wireguard-secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* ======================================================
   AUTH ROUTES (PUBLIC)
====================================================== */

app.use(authRoutes);

/* ======================================================
   PROTECTION LAYER (ALL ROUTES BELOW REQUIRE LOGIN)
====================================================== */

app.use(requireAuth);

/* ======================================================
   API ROUTES
====================================================== */

// Monitoring (peer status, handshake, RX/TX)
app.use("/api/peers", monitorRoutes);

// Peer management (create, delete, list, etc.)
app.use("/api/peers", peersRoute);

app.use("/logs", logsRoutes);

/* ======================================================
   VIEW ENGINE SETUP (EJS DASHBOARD)
====================================================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

/* ======================================================
   DASHBOARD ROUTE
====================================================== */

app.get("/", (req, res) => {
  exec("docker exec wireguard wg show", (err, stdout) => {
    if (err) {
      return res.render("dashboard", {
        status: "Error fetching status",
      });
    }

    res.render("dashboard", {
      status: stdout,
    });
  });
});

/* ======================================================
   LOGS PAGE
====================================================== */

app.get("/logs", (req, res) => {
  exec("docker logs wireguard --tail 50", (err, stdout) => {
    if (err) {
      return res.render("logs", {
        logs: "Error fetching logs",
      });
    }

    res.render("logs", {
      logs: stdout,
    });
  });
});

/* ======================================================
   START SERVER
====================================================== */

app.listen(3000, () => {
  console.log("WireGuard dashboard running on http://localhost:3000");
});