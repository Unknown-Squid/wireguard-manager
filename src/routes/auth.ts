import { Router } from "express";
import { login } from "../services/auth.service";

const router = Router();

/* ======================================================
   LOGIN PAGE
   - Simple HTML form (MVP UI)
====================================================== */

router.get("/login", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; padding: 40px;">
        <h2>WireGuard Admin Login</h2>

        <form method="POST" style="display:flex; flex-direction:column; width:200px; gap:10px;">
          <input name="username" placeholder="username" required />
          <input name="password" type="password" placeholder="password" required />
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

/* ======================================================
   LOGIN HANDLER
====================================================== */

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  /* -------------------------------
     Input validation
  ------------------------------- */
  if (!username || !password) {
    return res.status(400).send("Username and password required");
  }

  const user = login(username, password);

  if (!user) {
    return res.status(401).send("Invalid credentials");
  }

  /* -------------------------------
     Save session
  ------------------------------- */
  (req.session as any).user = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return res.redirect("/");
});

/* ======================================================
   LOGOUT
====================================================== */

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }

    res.redirect("/login");
  });
});

export default router;