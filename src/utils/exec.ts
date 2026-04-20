import { exec } from "child_process";

/* ======================================================
   COMMAND EXECUTOR
   - Runs shell commands safely via Promise
   - Used for Docker + WireGuard operations
====================================================== */

export function runCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      /* ======================================================
         ERROR HANDLING
      ====================================================== */

      if (err) {
        return reject(
          stderr?.toString().trim() ||
          err.message ||
          "Command execution failed"
        );
      }

      /* ======================================================
         SUCCESS OUTPUT
      ====================================================== */

      resolve(stdout.toString().trim());
    });
  });
}