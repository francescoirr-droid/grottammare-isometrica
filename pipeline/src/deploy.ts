/**
 * Deploy the built site (web/dist) to Cloudflare Workers on the custom domain SITE_DOMAIN (.env).
 * Outward-facing: run only when you mean to update the live site. `npm run deploy` builds first.
 */
import { spawnSync } from "node:child_process";
import { ROOT } from "./paths.ts";

// a standalone site (SITE_REGIONS) is uploaded to its own host, not deployed as the Isometric World Worker
if (process.env.SITE_REGIONS) throw new Error("SITE_REGIONS is set (standalone site): upload web/dist to your host instead (PUBBLICARE.md)");
const domain = process.env.SITE_DOMAIN;
if (!domain) throw new Error("SITE_DOMAIN is not set: add it to .env (see .env.example)");
const r = spawnSync("npx", ["wrangler", "deploy", "--domain", domain], { cwd: ROOT, stdio: "inherit" });
process.exit(r.status ?? 1);
