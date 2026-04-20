import { Request, Response, NextFunction } from "express";

/* ======================================================
   AUTH MIDDLEWARE
   - Protects routes that require login
   - Redirects unauthenticated users to /login
====================================================== */

/**
 * Ensures the user is authenticated before accessing routes.
 * If no session user exists, redirects to login page.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  /* ======================================================
     CHECK SESSION AUTH STATE
  ====================================================== */

  if (!(req.session as any).user) {
    return res.redirect("/login");
  }
  /* ======================================================
     USER IS AUTHENTICATED
  ====================================================== */

  next();
}