import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApiApp } from "../server/_core/index";

const app = createApiApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
