import { db } from "../db";
import bcrypt from "bcrypt";

/* ======================================================
   USER TYPE (optional but recommended)
====================================================== */

type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

/* ======================================================
   LOGIN SERVICE
   - Validates username + password
   - Returns user if valid, otherwise null
====================================================== */

export function login(username: string, password: string): User | null {
  if (!username || !password) {
    return null;
  }

  /* ======================================================
     FETCH USER FROM DATABASE
  ====================================================== */

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as User | undefined;

  if (!user) return null;

  /* ======================================================
     PASSWORD VALIDATION
  ====================================================== */

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) return null;

  /* ======================================================
     SUCCESS
  ====================================================== */

  return user;
}